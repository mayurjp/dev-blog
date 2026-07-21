---
layout: post
title: "GitOps for stateful workloads: why databases and queues can't be reconciled by delete-and-recreate"
description: "StatefulSets, PersistentVolumeClaims, and ordered rollouts let GitOps manage databases and queues without the destructive reconcile that breaks stateful systems."
date: 2026-08-12 09:00:00 +0530
categories: gitops
order: 15
tags: [gitops, statefulset, databases, postgresql, sealed-secrets, persistence, kubernetes]
---

**TL;DR:** How do you GitOps a database when "reconcile by recreating the pod" would wipe your data? Use StatefulSets with stable identities and PersistentVolumeClaims, gate secrets with SealedSecrets, and treat the data volume as something the reconciler must never delete.

> **In plain English (30 sec):** Code you already write — Map, function, API call, just bigger.

**Real repo:** [bitnami-labs/sealed-secrets](https://github.com/bitnami-labs/sealed-secrets) and [bitnami/charts](https://github.com/bitnami/charts) (PostgreSQL StatefulSet).

## 1. The Engineering Problem

Most GitOps demos are stateless: a Deployment, a Service, scale up/down, roll a new image. If the operator drifts from git, it deletes and recreates the pod — who cares, the ReplicaSet makes a new one.

Stateful workloads — PostgreSQL, Kafka, RabbitMQ — break that model:

- The pod *is* the identity that owns a data directory. Recreating it is fine *only if* the volume survives.
- The volume is the source of truth, not the pod. The operator must reconcile the *spec* (replicas, image, resources) but **never** the *data* (PVC contents).
- Secrets (DB passwords) can't live in git as plaintext, but GitOps wants everything in git.

A naive GitOps apply of a StatefulSet that loses its PVC, or a chart bump that triggers a destructive hook, corrupts data. The reconciler needs guardrails that make persistence explicit and secrets safe.

## 2. The Technical Solution

Two mechanisms make stateful GitOps safe:

1. **StatefulSet + `volumeClaimTemplates`** — gives each pod a stable ordinal name (`postgresql-0`) and a dedicated PVC that is *decoupled from pod lifecycle*. Bitnami's PostgreSQL chart does exactly this: the primary is a `StatefulSet` whose data lives in a `volumeClaimTemplates` PVC, so a pod restart re-attaches the same volume.
2. **SealedSecrets** — encrypts a `Secret` into a `SealedSecret` CR that is safe to commit to git. Only the in-cluster controller can decrypt it back into the real `Secret`. This closes the "GitOps needs secrets in git, but secrets can't be in git" loop.

The controller's job is to keep `spec` matched to git while treating the PVC as an external, preserved resource.

```mermaid
sequenceDiagram
  participant Dev as Developer
  participant Git as Git repo
  participant Op as GitOps operator
  participant SS as StatefulSet controller
  participant PVC as PersistentVolumeClaim
  participant SS2 as SealedSecrets controller
  Dev->>Git: commit postgresql values + SealedSecret
  Git->>Op: detect change, sync
  Op->>SS2: apply SealedSecret
  SS2-->>Op: decrypt to Secret
  Op->>SS: apply StatefulSet spec
  SS->>PVC: attach existing volumeClaimTemplate
  PVC-->>SS: data volume preserved
  SS-->>Op: pod ready, data intact
  Note over Op,PVC: operator reconciles SPEC, never DATA
  classDef safe fill:#e9f9ef,stroke:#16a34a,color:#065f2c;
  classDef ctrl fill:#e1f0ff,stroke:#3b82f6,color:#0b3d91;
  class SS2,SS,ctrl ctrl;
  class PVC safe;
```

**Core truths:**

1. The PVC (not the pod) is the source of truth for state — use `volumeClaimTemplates` so the operator can recreate pods without recreating data.
2. `persistentVolumeClaimRetentionPolicy` (whenDeleted/whenScaled) explicitly tells the reconciler *not* to garbage-collect the volume on scale-to-zero or delete.
3. Secrets for stateful workloads must be sealed, not plaintext, or the GitOps repo becomes a credential leak.

## 3. The clean example

A minimal StatefulSet with a dedicated data PVC (the pattern Bitnami's PostgreSQL chart uses, simplified from [bitnami/charts `bitnami/postgresql/templates/primary/statefulset.yaml`](https://github.com/bitnami/charts/blob/main/bitnami/postgresql/templates/primary/statefulset.yaml)):

```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: postgresql-primary
spec:
  replicas: 1
  serviceName: postgresql-headless
  selector:
    matchLabels:
      app.kubernetes.io/component: primary
  template:
    metadata:
      labels:
        app.kubernetes.io/component: primary
    spec:
      containers:
        - name: postgresql
          image: bitnami/postgresql:16
          env:
            - name: POSTGRES_PASSWORD
              valueFrom:
                secretKeyRef:
                  name: postgresql-secret
                  key: password
          volumeMounts:
            - name: data
              mountPath: /bitnami/postgresql
  # PVC is templated per replica ordinal and survives pod recreation
  volumeClaimTemplates:
    - apiVersion: v1
      kind: PersistentVolumeClaim
      metadata:
        name: data
      spec:
        accessModes: ["ReadWriteOnce"]
        resources:
          requests:
            storage: 8Gi
```

Pair it with a SealedSecret so the password is GitOps-safe. From [bitnami-labs/sealed-secrets `README.md`](https://github.com/bitnami-labs/sealed-secrets/blob/main/README.md) — the `SealedSecret` is "a recipe for creating a secret":

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: postgresql-secret
  namespace: default
spec:
  encryptedData:
    password: AgBy3i4OJSWK+PiTySYZZA9rO43cGDEq.....
```

The controller unseals it into a normal `Secret` named `postgresql-secret` — same namespace, same name — which the StatefulSet's `secretKeyRef` reads.

## 4. Production reality

Bitnami's PostgreSQL chart renders its primary as a `StatefulSet` and templates the data PVC at the end of the manifest. Verbatim tail from [bitnami/charts `bitnami/postgresql/templates/primary/statefulset.yaml`](https://github.com/bitnami/charts/blob/main/bitnami/postgresql/templates/primary/statefulset.yaml):

{% raw %}
```yaml
  {{- if and .Values.primary.persistence.enabled .Values.primary.persistence.existingClaim }}
        - name: {{ .Values.primary.persistence.volumeName }}
          persistentVolumeClaim:
            claimName: {{ tpl .Values.primary.persistence.existingClaim $ }}
  {{- else if not .Values.primary.persistence.enabled }}
        - name: {{ .Values.primary.persistence.volumeName }}
          emptyDir: {}
  {{- else }}
  {{- if .Values.primary.persistentVolumeClaimRetentionPolicy.enabled }}
  persistentVolumeClaimRetentionPolicy:
    whenDeleted: {{ .Values.primary.persistentVolumeClaimRetentionPolicy.whenDeleted }}
    whenScaled: {{ .Values.primary.persistentVolumeClaimRetentionPolicy.whenScaled }}
  {{- end }}
  volumeClaimTemplates:
    - apiVersion: v1
      kind: PersistentVolumeClaim
      metadata:
        name: {{ .Values.primary.persistence.volumeName }}
        // ...
      spec:
        accessModes:
        {{- range .Values.primary.persistence.accessModes }}
          - {{ . | quote }}
        {{- end }}
        resources:
          requests:
            storage: {{ .Values.primary.persistence.size | quote }}
        {{- include "common.storage.class" (dict "persistence" .Values.primary.persistence "global" .Values.global) | nindent 8 }}
  {{- end }}
```
{% endraw %}

Note `persistentVolumeClaimRetentionPolicy` — it makes the *operator* behavior explicit so a scale-to-zero or delete doesn't reclaim the data volume.

SealedSecrets makes the secret GitOps-safe. Verbatim from [bitnami-labs/sealed-secrets `README.md`](https://github.com/bitnami-labs/sealed-secrets/blob/main/README.md):

```yaml
apiVersion: bitnami.com/v1alpha1
kind: SealedSecret
metadata:
  name: mysecret
  namespace: mynamespace
spec:
  encryptedData:
    foo: AgBy3i4OJSWK+PiTySYZZA9rO43cGDEq.....
```

> "Once unsealed this will produce a secret equivalent to this: ... This normal kubernetes secret will appear in the cluster after a few seconds."

And the scope rule that prevents secret reuse across namespaces (verbatim):

> "The SealedSecret and Secret must have **the same namespace and name**. This is a feature to prevent other users on the same cluster from re-using your sealed secrets."

**what this teaches:** Bitnami's chart proves the production pattern — StatefulSet + `volumeClaimTemplates` + explicit PVC retention policy. SealedSecrets proves the secret-in-git problem has a clean answer: encrypt the secret, let the controller hold the only private key. The GitOps operator pushes both, and data is never in its blast radius.

**Stale facts:** "GitOps is just CI/CD with extra steps" oversimplifies — it's pull vs push, structural credential change; ApplicationSet bundled in Argo CD core since v2.3 (Mar 2022); auto-sync doesn't skip review gate — the PR is the gate; Kustomize+Helm aren't exclusive — both can layer; helm/charts monorepo is archived.

## 5. Review checklist

- Is the stateful workload a `StatefulSet` (not a `Deployment`) with `volumeClaimTemplates` for its data volume?
- Is `persistentVolumeClaimRetentionPolicy` set so scale-to-zero/delete does not reclaim data?
- Are all credentials `SealedSecret` resources in git, never plaintext `Secret` manifests?
- Does the GitOps sync use `prune`/replace carefully — never `kubectl delete` on the StatefulSet without preserving the PVC?

## 6. FAQ

- **Can Argo CD/Flux manage a StatefulSet safely?** Yes — they reconcile the *spec*. As long as the PVC is templated (or `existingClaim` points to a preserved claim), pod recreation re-attaches the data.
- **What about database schema migrations?** Keep them out of the reconciler. Run migrations as a Job/init-container or an external migration tool; the GitOps operator should not own data-shape changes.
- **Why not just use a Deployment with a PVC?** You can, but you lose stable network identity and ordered rollout — both matter for quorum-based stateful systems (Postgres replication, Kafka).
- **Is SealedSecrets the only secret option?** No — External Secrets Operator pulls from vaults/cloud secret managers. SealedSecrets is the simplest "secret lives in git, safe" option.
- **Does the sealing key compromise leak all secrets?** Yes — if a sealing key leaks, treat all SealedSecrets encrypted with it as compromised and rotate both the key and the underlying secret values (per the README's key-renewal guidance).

## Source

- **Concept:** GitOps-managing stateful workloads without destructive reconcile.
- **Domain:** gitops
- **Repo:** bitnami/charts → [bitnami/postgresql/templates/primary/statefulset.yaml](https://github.com/bitnami/charts/blob/main/bitnami/postgresql/templates/primary/statefulset.yaml) — StatefulSet + volumeClaimTemplates + retention policy.
- **Repo:** bitnami-labs/sealed-secrets → [README.md](https://github.com/bitnami-labs/sealed-secrets/blob/main/README.md) — SealedSecret encryption model and strict namespace/name scope.
- **Repo:** bitnami/charts → [bitnami/postgresql/values.yaml](https://github.com/bitnami/charts/blob/main/bitnami/postgresql/values.yaml) — PostgreSQL chart tunables for persistence/replication.




