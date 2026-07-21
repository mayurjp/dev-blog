---
layout: page
title: "Break This Manifest"
permalink: /challenges/
---

One bug per challenge. Find it, then click to reveal. Good for LinkedIn — one per day.

<div class="challenges-list">

<div class="challenge" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #1 — Frontend Service, Zero Traffic</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: v1
kind: Service
metadata:
  name: frontend
spec:
  selector:
    app: front-end
  ports:
    - port: 80
      targetPort: 8080
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The Deployment labels are `app: frontend` (no hyphen), but the Service selector is `app: front-end` (with hyphen). Label mismatch = zero endpoints = no traffic.

**Fix:** Make the selector match exactly: `app: frontend`.

**Source:** [Kubernetes Services]({{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }})
  </div>
</div>

<div class="challenge" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #2 — Pod Stuck in CrashLoopBackOff</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: myapp
spec:
  containers:
    - name: myapp
      image: myapp:v2
      livenessProbe:
        httpGet:
          path: /healthz
          port: 8080
        initialDelaySeconds: 5
        periodSeconds: 10
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** No `readinessProbe`. The liveness probe starts killing the container before the app finishes initializing. With `initialDelaySeconds: 5`, a JVM that takes 30s to boot gets killed repeatedly.

**Fix:** Add a `startupProbe` with generous `failureThreshold × periodSeconds` to give the app time to boot, or increase `initialDelaySeconds`.

**Source:** [Probes]({{ '/kubernetes/probes-liveness-readiness-startup/' | relative_url }})
  </div>
</div>

<div class="challenge" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #3 — Deployment Stuck at 0 Available</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 0
      maxSurge: 0
  template:
    spec:
      containers:
        - name: api
          image: api:v2
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** `maxUnavailable: 0` + `maxSurge: 0` = deadlock. No new Pod can be created until an old one is deleted, but no old Pod can be deleted until a new one is ready. The rollout is stuck forever.

**Fix:** Set `maxSurge: 1` (or at least one of them > 0). `maxUnavailable: 0` with `maxSurge: 1` achieves zero-downtime updates.

**Source:** [Deployments]({{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }})
  </div>
</div>

<div class="challenge" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #4 — Secret Visible in etcd</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: db-credentials
type: Opaque
data:
  password: cGFzc3dvcmQxMjM=
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** `data.password` is base64-encoded, NOT encrypted. Unless the cluster admin configured `--encryption-provider-config`, this Secret sits in etcd as plain base64. Anyone with etcd read access sees the password.

**Fix:** Configure etcd encryption at rest (`EncryptionConfiguration` with `aescbc` or `secretbox`), or use an external secret manager (SealedSecrets, External Secrets Operator).

**Source:** [ConfigMaps & Secrets]({{ '/kubernetes/configmaps-secrets-decoupling-config-from-image/' | relative_url }})
  </div>
</div>

<div class="challenge" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #5 — DaemonSet Pod Missing on Control Plane</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-exporter
spec:
  selector:
    matchLabels:
      app: node-exporter
  template:
    metadata:
      labels:
        app: node-exporter
    spec:
      containers:
        - name: node-exporter
          image: prom/node-exporter:v1.6.0
          ports:
            - containerPort: 9100
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** No `tolerations` for control-plane taints. The DaemonSet Pod gets scheduled on worker nodes but skipped on control-plane nodes (which have `node-role.kubernetes.io/control-plane:NoSchedule`). You lose visibility into the control plane.

**Fix:** Add `tolerations: [{operator: Exists, effect: NoSchedule}]` to run on all nodes including control plane.

**Source:** [DaemonSets]({{ '/kubernetes/daemonsets-one-pod-per-node/' | relative_url }})
  </div>
</div>

<div class="challenge" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #6 — HPA Not Scaling</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: api-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: api
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The Deployment's containers have no `resources.requests.cpu`. The HPA computes utilization as `current / request` — without a request, the denominator is zero or undefined, so the HPA never triggers scaling.

**Fix:** Set `resources.requests.cpu` on every container the HPA targets.

**Source:** [HPA]({{ '/kubernetes/hpa-horizontal-pod-autoscaling/' | relative_url }})
  </div>
</div>

<div class="challenge" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #7 — StatefulSet Pod Can't Find Peers</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: cassandra
spec:
  serviceName: cassandra
  replicas: 3
  selector:
    matchLabels:
      app: cassandra
  template:
    metadata:
      labels:
        app: cassandra
    spec:
      containers:
        - name: cassandra
          image: cassandra:4.1
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The headless Service `cassandra` doesn't exist. Without it, StatefulSet Pods don't get stable DNS entries (`pod-0.cassandra.ns.svc.cluster.local`), so Cassandra nodes can't discover peers.

**Fix:** Create a headless Service (`clusterIP: None`) named `cassandra` before or alongside the StatefulSet.

**Source:** [StatefulSets]({{ '/kubernetes/statefulsets-stable-identity-not-just-storage/' | relative_url }})
  </div>
</div>

<div class="challenge" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #8 — Ingress Returns 404</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /
            pathType: Prefix
            backend:
              service:
                name: api-service
                port:
                  number: 80
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The annotation `nginx.ingress.kubernetes.io/rewrite-target: /` rewrites every request path to `/`, so `GET /users/123` becomes `GET /`. The backend sees only `/` for every route.

**Fix:** Use `nginx.ingress.kubernetes.io/rewrite-target: /$2` with a capture group in the path, or remove the annotation if the backend expects the original path.

**Source:** [Ingress]({{ '/kubernetes/ingress-routing-http-without-a-loadbalancer-per-service/' | relative_url }})
  </div>
</div>

</div>

<p style="margin-top: 32px; color: $grey-color; font-size: 14px;">
  New challenges added regularly. Each one links back to the full blog post for deeper context.
</p>
