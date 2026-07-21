---
layout: page
title: "Break This Manifest"
permalink: /challenges/
---

One bug per challenge. Find it, then click to reveal. Good for LinkedIn — one per day.

<div class="challenge-filters">
  <button class="challenge-filter active" onclick="filterChallenges('all')">All</button>
  <button class="challenge-filter" onclick="filterChallenges('kubernetes')">Kubernetes</button>
  <button class="challenge-filter" onclick="filterChallenges('docker')">Docker</button>
  <button class="challenge-filter" onclick="filterChallenges('cicd')">CI/CD</button>
  <button class="challenge-filter" onclick="filterChallenges('security')">Security</button>
  <button class="challenge-filter" onclick="filterChallenges('database')">Database</button>
  <button class="challenge-filter" onclick="filterChallenges('networking')">Networking</button>
</div>

<div class="challenges-list">

<!-- ==================== KUBERNETES ==================== -->

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
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

**Why it matters:** Services silently drop all traffic when selectors don't match. No error, no restart — just silence. Always check `kubectl describe svc frontend` → Endpoints to confirm pods are matched.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
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
**Bug:** No `readinessProbe` or `startupProbe`. The liveness probe starts killing the container before the app finishes initializing. With `initialDelaySeconds: 5`, a JVM that takes 30s to boot gets killed repeatedly.

**Fix:** Add a `startupProbe` with generous `failureThreshold × periodSeconds` (e.g. `failureThreshold: 30, periodSeconds: 10` = 300s to boot) to give the app time to start.

**Why it matters:** This is the #1 cause of CrashLoopBackOff on real clusters. The liveness probe doesn't know the app is still starting — it just sees "not healthy" and kills.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
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

**Fix:** Set `maxSurge: 1` (or at least one of them > 0). `maxUnavailable: 0` with `maxSurge: 1` achieves zero-downtime updates with no capacity dip.

**Why it matters:** This deadlock silently halts every deployment. The rollout stays at 0/3 available and `kubectl rollout status` hangs indefinitely.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
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

**Fix:** Configure etcd encryption at rest (`EncryptionConfiguration` with `aescbc` or `secretbox`), or use an external secret manager (SealedSecrets, External Secrets Operator, Vault).

**Why it matters:** base64 is an encoding, not encryption. `echo 'cGFzc3dvcmQxMjM=' | base64 -d` reveals the plaintext. If your etcd is backed up to S3 without encryption, the backup has your secrets in cleartext.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
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

**Why it matters:** Your monitoring has a blind spot exactly where the most critical components run.etcd, API server, scheduler, controller-manager — none of them get scraped.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
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

**Fix:** Set `resources.requests.cpu` on every container the HPA targets. The request value is the denominator of the utilization formula — no request, no math.

**Why it matters:** Your HPA looks configured correctly but stays at minReplicas forever. Traffic spikes hit a fixed wall of pods while the config says "scale to 10."
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
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

**Why it matters:** Every database that needs peer discovery (Cassandra, Kafka, ZooKeeper, etcd) requires a headless Service. Without it, the cluster forms but no node can find any other node.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
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

**Fix:** Use `nginx.ingress.kubernetes.io/rewrite-target: /$2` with a capture group in the path (e.g. `path: /(/|$)(.*)`), or remove the annotation if the backend expects the original path.

**Why it matters:** The ingress controller happily proxies the rewritten request. Your backend gets `/` for every call, returns 200 on the health endpoint, and you spend hours debugging why "the API works but all routes return empty."
  </div>
</div>

<!-- ==================== KUBERNETES ADVANCED ==================== -->

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #9 — CronJob Runs Twice Every Time</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: batch/v1
kind: CronJob
metadata:
  name: db-backup
spec:
  schedule: "0 2 * * *"
  jobTemplate:
    spec:
      template:
        spec:
          containers:
            - name: backup
              image: backup-tool:latest
          restartPolicy: OnFailure
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** Missing `concurrencyPolicy`. The default is `Allow`, meaning if a previous run hasn't finished by the next schedule, a second Job starts in parallel. For a database backup, two concurrent backups can corrupt the snapshot or exhaust disk.

**Fix:** Set `concurrencyPolicy: Forbid` (skip if the previous run is still active) or `Replace` (kill the old run and start a new one).

**Why it matters:** Backups that take 40 minutes running on a 30-minute schedule silently overlap. Both write to the same destination. The restore you test in an emergency is from neither complete run.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #10 — Pod Evicted Under Memory Pressure</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: cache-worker
spec:
  containers:
    - name: worker
      image: cache-worker:latest
      resources:
        requests:
          memory: "256Mi"
          cpu: "250m"
        limits:
          memory: "512Mi"
          cpu: "500m"
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The container has a memory limit of 512Mi but no `ephemeral-storage` limit. If the app writes logs or temp files to the container's writable layer, it can fill the node's disk. The kubelet evicts pods to reclaim disk — and your pod with plenty of memory headroom gets killed.

**Fix:** Set `resources.limits.ephemeral-storage: "1Gi"` (or whatever your workload needs) and configure a log rotation strategy.

**Why it matters:** You see `Evicted` in `kubectl get pods` with reason `NodePressure`, check memory and CPU — both fine. The actual cause is disk, which Kubernetes treats as an opaque resource you must explicitly request.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #11 — NetworkPolicy Blocks Everything Including DNS</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: default-deny
  namespace: production
spec:
  podSelector: {}
  policyTypes:
    - Ingress
    - Egress
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** This default-deny policy blocks ALL egress — including DNS (port 53 UDP/TCP to kube-dns). Pods can't resolve service names, so `kubectl exec` → `curl api-service` fails with "could not resolve host." Every HTTP call to another service breaks.

**Fix:** Add an egress rule that allows DNS:
```yaml
  egress:
    - to:
        - namespaceSelector: {}
      ports:
        - protocol: UDP
          port: 53
        - protocol: TCP
          port: 53
```

**Why it matters:** Default-deny is the right security posture, but forgetting the DNS exception makes every pod unable to communicate. The pods look healthy but nothing works.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #12 — PV Stuck in Terminating</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: data-postgres-0
  finalizers:
    - kubernetes.io/pvc-protection
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The PVC has a `finalizer` that prevents deletion while a Pod is using it. But the Pod that was using it was already deleted (or is in a namespace that was cleaned up). The PVC is stuck in `Terminating` forever.

**Fix:** Remove the finalizer: `kubectl patch pvc data-postgres-0 -p '{"metadata":{"finalizers":null}}'`. Then investigate why the Pod reference wasn't cleaned up (usually a StatefulSet or operator race condition).

**Why it matters:** Namespace cleanup stalls when a PVC has an orphaned finalizer. The namespace hangs at `Terminating` and you can't create new resources in it.
  </div>
</div>

<!-- ==================== DOCKER ==================== -->

<div class="challenge" data-category="docker" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #13 — Image 2GB That Should Be 50MB</h3>
  <div class="challenge-yaml" markdown="1">
```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm install
EXPOSE 3000
CMD ["node", "server.js"]
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** No multi-stage build. The final image includes the full Node.js runtime, all `node_modules` (including devDependencies), the source code, build tools, and the OS package manager. A 2GB image for a 50MB app.

**Fix:** Use a multi-stage build — build in one stage, copy only `node_modules` and `server.js` to a slim or alpine final image. Add a `.dockerignore` to exclude `node_modules`, `.git`, and test files from the build context.

**Why it matters:** Every pull (CI, production, scaling) downloads the full 2GB. A security scan finds CVEs in packages you don't even use. Cold starts take 10x longer.
  </div>
</div>

<div class="challenge" data-category="docker" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #14 — Secrets in Docker Image Layer</h3>
  <div class="challenge-yaml" markdown="1">
```dockerfile
FROM python:3.12-slim
WORKDIR /app
ENV DATABASE_URL=postgres://admin:password123@db:5432/prod
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** `DATABASE_URL` is baked into the image layer as an `ENV` instruction. Anyone with `docker history` or `docker inspect` can read it. The credential persists in every layer, even if you `unset` it in a later layer.

**Fix:** Pass secrets at runtime via `docker run -e DATABASE_URL=...` or Docker secrets / Kubernetes Secrets. Never hardcode credentials in Dockerfiles. Use `ARG` only for build-time values, never for secrets.

**Why it matters:** The image gets pushed to a registry. Anyone who pulls it can `docker history --no-trunc` and see every secret you baked in. The layer is immutable — you can't "remove" it without rebuilding from scratch.
  </div>
</div>

<div class="challenge" data-category="docker" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #15 — Container Runs as Root</h3>
  <div class="challenge-yaml" markdown="1">
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "app.py"]
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** No `USER` instruction. The container runs as root (UID 0). If an attacker escapes the container, they have root on the host node. Kubernetes `PodSecurityStandards` with `restricted` profile rejects this pod.

**Fix:** Add `RUN adduser --disabled-password --no-create-home appuser` and `USER appuser` before `CMD`. Run as non-root in the image, enforce it in Kubernetes with `securityContext.runAsNonRoot: true`.

**Why it matters:** Running as root inside a container is the same as running as root on the host (no user namespace by default). A container escape gives the attacker root on the node.
  </div>
</div>

<div class="challenge" data-category="docker" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #16 — Every Build Starts From Scratch</h3>
  <div class="challenge-yaml" markdown="1">
```dockerfile
FROM node:20
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** `COPY . .` comes before `RUN npm run build`. Every code change invalidates the `COPY` layer and forces a full rebuild from that point — including `npm ci` (which runs again even though dependencies didn't change). A 10-minute build for a 1-line change.

**Fix:** Reorder to maximize cache hits: copy dependency files first, install, then copy source code, then build. If `package.json` hasn't changed, Docker reuses the `npm ci` layer.

**Why it matters:** Docker's layer cache is invalidated top-down. One `COPY . .` before `npm ci` means every commit rebuilds dependencies. On a large monorepo, this turns a 30-second edit into a 15-minute CI run.
  </div>
</div>

<!-- ==================== CI/CD ==================== -->

<div class="challenge" data-category="cicd" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #17 — GitHub Actions Secret Leaked in Logs</h3>
  <div class="challenge-yaml" markdown="1">
{% raw %}
```yaml
- name: Deploy
  run: |
    echo "Deploying to ${{ secrets.AWS_ACCESS_KEY_ID }}..."
    aws configure set aws_access_key_id ${{ secrets.AWS_ACCESS_KEY_ID }}
    aws configure set aws_secret_access_key ${{ secrets.AWS_SECRET_ACCESS_KEY }}
    aws s3 sync ./dist s3://my-bucket
```
{% endraw %}
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The `echo` statement prints the secret to the GitHub Actions log. Even though GitHub masks secrets in logs, the first `echo` reveals the secret value as part of the log message. Additionally, `aws configure set` writes secrets to `~/.aws/credentials` which may be cached in a subsequent step.

**Fix:** Never echo secrets. Use `env:` to pass secrets as environment variables and reference them in scripts without printing them. For AWS, use `aws configure set` with `--profile` and clean up after:
{% raw %}
```yaml
  env:
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  run: aws s3 sync ./dist s3://my-bucket
```
{% endraw %}

**Why it matters:** Even with GitHub's masking, the log shows `Deploying to ***` — confirming the secret was interpolated. The real risk is `aws configure set` persisting credentials in the runner's filesystem for subsequent jobs.
  </div>
</div>

<div class="challenge" data-category="cicd" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #18 — Self-Hosted Runner Compromised</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
on:
  pull_request:
    types: [opened, synchronize]

jobs:
  test:
    runs-on: self-hosted
    steps:
      - uses: actions/checkout@v4
      - run: npm test
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** Self-hosted runners execute `pull_request` events from forks. A malicious contributor can submit a PR with a modified `package.json` that runs arbitrary code (postinstall scripts, modified test files) on your runner — which has access to your network, credentials, and other job artifacts.

**Fix:** Use GitHub-hosted runners for `pull_request` events, or restrict self-hosted runners to `push` events only on trusted branches. If you must use self-hosted runners for PRs, add `if: github.event.pull_request.head.repo.full_name == github.repository` to restrict to same-repo PRs.

**Why it matters:** Self-hosted runners have your network access, your Docker registry credentials, and potentially your deployment keys. A malicious PR runs arbitrary code on them with those permissions.
  </div>
</div>

<div class="challenge" data-category="cicd" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #19 — Cache Poisoned Across Branches</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
- uses: actions/cache@v4
  with:
    path: ~/.npm
    key: npm-cache
    restore-keys: |
      npm-cache
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The cache key `npm-cache` is the same across all branches. A PR branch can overwrite the cache with a modified `package-lock.json` that installs a malicious package. The next `main` branch build restores that poisoned cache.

**Fix:** Include the branch and lockfile hash in the cache key:
{% raw %}
```yaml
key: npm-${{ runner.os }}-${{ hashFiles('package-lock.json') }}
restore-keys: |
  npm-${{ runner.os }}-
```
{% endraw %}

**Why it matters:** Cache poisoning is a supply-chain attack vector. The poisoned cache is restored silently, the malicious package installs without a fresh download, and your CI passes because the test suite runs against the attacker's code.
  </div>
</div>

<!-- ==================== SECURITY ==================== -->

<div class="challenge" data-category="security" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #20 — JWT Algorithm Confusion</h3>
  <div class="challenge-yaml" markdown="1">
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The server expects RS256 (asymmetric, public/private key pair) but the token says `HS256` (symmetric, shared secret). If the server doesn't validate the algorithm and uses the public key as the HMAC secret, an attacker can forge tokens by signing with the publicly known RSA public key.

**Fix:** Always validate the `alg` header matches the expected algorithm before verification. Never accept algorithm substitution. Use a library that enforces algorithm allowlists:
```python
jwt.decode(token, key, algorithms=["RS256"])
```

**Why it matters:** This is CVE-2015-9235 / the "algorithm confusion" attack. The attacker downloads your public key from `/.well-known/jwks.json`, uses it as the HMAC secret, and signs任意 tokens. Your server validates them because `HS256(publicKey)` succeeds.
  </div>
</div>

<div class="challenge" data-category="security" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #21 — CORS Allows Any Origin</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: api
  annotations:
    nginx.ingress.kubernetes.io/enable-cors: "true"
    nginx.ingress.kubernetes.io/cors-allow-origin: "*"
spec:
  rules:
    - host: api.example.com
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** `cors-allow-origin: *` allows any website to make authenticated requests to your API. If your API uses cookies for auth (session tokens), a malicious site can make cross-origin requests and your browser will automatically attach the cookies.

**Fix:** Set `cors-allow-origin` to your specific frontend domain(s):
```yaml
nginx.ingress.kubernetes.io/cors-allow-origin: "https://app.example.com"
```

**Why it matters:** CORS with `*` + cookie-based auth = CSRF vulnerability on every endpoint. The browser sends the cookie automatically; CORS doesn't block it because the response is just not exposed to JavaScript (but the request was already sent and processed).
  </div>
</div>

<div class="challenge" data-category="security" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #22 — RBAC Allows Cluster-Admin via Aggregation</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: ClusterRole
metadata:
  name: namespace-admin
  labels:
    rbac.authorization.k8s.io/aggregate-to-admin: "true"
rules:
  - apiGroups: ["", "apps", "batch"]
    resources: ["*"]
    verbs: ["*"]
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The label `rbac.authorization.k8s.io/aggregate-to-admin: "true"` aggregates this ClusterRole into the built-in `admin` ClusterRole. Combined with `resources: ["*"]` and `verbs: ["*"]`, any user bound to `admin` in any namespace now has cluster-wide admin access.

**Fix:** Remove the aggregation label if this role is namespace-scoped, or restrict the rules to specific resources. Never use wildcard resources with aggregation labels unless you intentionally want cluster-admin.

**Why it matters:** A developer asked for "admin in my namespace." You created this ClusterRole with the aggregation label to make it look right. Now they can `kubectl delete nodes` and access Secrets in every namespace.
  </div>
</div>

<div class="challenge" data-category="security" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #23 — TLS Certificate Not Verified</h3>
  <div class="challenge-yaml" markdown="1">
```python
import requests

response = requests.get("https://internal-api.example.com/data", verify=False)
data = response.json()
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** `verify=False` disables TLS certificate verification. The client accepts any certificate — including self-signed, expired, or certificates from a MITM attacker. The attacker intercepts the connection, presents their own certificate, and the client trusts it.

**Fix:** Remove `verify=False`. If you're using an internal CA, add it to the system trust store or pass `verify="/path/to/ca-bundle.crt"`. Never disable certificate verification in production.

**Why it matters:** `verify=False` is the most common Python security mistake. It's often added during development ("the self-signed cert is annoying") and accidentally left in. Every API call with credentials goes through the attacker.
  </div>
</div>

<!-- ==================== DATABASE ==================== -->

<div class="challenge" data-category="database" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #24 — N+1 Query Kills API Latency</h3>
  <div class="challenge-yaml" markdown="1">
```csharp
var orders = await db.Orders.ToListAsync();

foreach (var order in orders)
{
    var customer = await db.Customers.FindAsync(order.CustomerId);
    Console.WriteLine($"{customer.Name}: {order.Total}");
}
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The `foreach` loop runs a separate `SELECT` for each order's customer. 100 orders = 101 database queries (1 for orders + 100 for customers). Latency scales linearly with the number of orders.

**Fix:** Use eager loading: `db.Orders.Include(o => o.Customer).ToListAsync()` — generates a single JOIN query. Or batch-load: collect all `CustomerId` values, run one `WHERE id IN (...)` query, and join in memory.

**Why it matters:** An endpoint that returns 10 orders in 50ms takes 5 seconds with 100 orders. The database handles the queries fine individually, but the round-trip overhead (network + connection pool) multiplies.
  </div>
</div>

<div class="challenge" data-category="database" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #25 — Transaction Silently Lost on Commit</h3>
  <div class="challenge-yaml" markdown="1">
```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
-- application crashes here
COMMIT;
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The application crashes between the two `UPDATE` statements. The transaction is never committed, and Postgres rolls it back. The money is deducted from account 1 but never added to account 2 — or rather, neither change persists because the transaction was rolled back. But if the application has retry logic that re-runs the deduction without checking if it already happened, you get double-debiting.

**Fix:** Use idempotency keys. Store a unique transaction ID alongside the operation. Before executing, check if that ID already exists. This way, retries are safe even after crashes.

**Why it matters:** Network timeouts cause the client to retry, but the server actually executed the first request. Without idempotency, you transfer money twice. With idempotency, the second request returns the original result.
  </div>
</div>

<div class="challenge" data-category="database" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #26 — Deadlock on Concurrent Inserts</h3>
  <div class="challenge-yaml" markdown="1">
```sql
-- Transaction 1                    -- Transaction 2
BEGIN;                               BEGIN;
INSERT INTO orders (id, user_id)     INSERT INTO orders (id, user_id)
  VALUES (101, 5);                     VALUES (102, 5);
INSERT INTO audit_log (order_id)     INSERT INTO audit_log (order_id)
  VALUES (101);                        VALUES (102);
COMMIT;                              COMMIT;
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** Both transactions insert into `orders` first, then `audit_log`. Postgres acquires row-level locks in statement order. Transaction 1 locks a row in `orders`, Transaction 2 locks a different row. Then Transaction 1 tries to lock a row in `audit_log` that Transaction 2 already locked (via a unique index or trigger). Both wait for each other = deadlock.

**Fix:** Always insert into child tables in the same order across transactions. Or use `ON CONFLICT DO NOTHING` for the audit log. Or batch inserts to reduce the window. Deadlocks are resolved by Postgres killing one transaction, but the application must retry it.

**Why it matters:** Deadlocks happen under concurrent load. The application sees a "deadlock detected" error, retries, and works — until the retry also deadlocks. The fix is ordering, not retrying.
  </div>
</div>

<!-- ==================== NETWORKING ==================== -->

<div class="challenge" data-category="networking" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #27 — DNS Resolution Timeout in Container</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: api-client
spec:
  containers:
    - name: client
      image: curlimages/curl
      command: ["curl", "http://backend-service:8080/health"]
  dnsConfig:
    options:
      - name: ndots
        value: "5"
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** `ndots: 5` means every DNS query for a name with fewer than 5 dots is treated as a relative name and tried against all search domains first. For `backend-service`, Kubernetes tries `backend-service.production.svc.cluster.local`, then `backend-service.svc.cluster.local`, etc. — 5 failed lookups before the actual query. This adds 5-10 seconds to every HTTP call.

**Fix:** Use the FQDN (`backend-service.production.svc.cluster.local.`) with a trailing dot, or lower `ndots` to 2-3 (which is what most modern Kubernetes versions default to).

**Why it matters:** `ndots: 5` is the Kubernetes default inherited from `/etc/resolv.conf`. It's tuned for general Linux, not for Kubernetes service discovery. Every inter-service call pays the search-domain penalty.
  </div>
</div>

<div class="challenge" data-category="networking" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #28 — Connection Pool Exhausted Under Load</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
data:
  DATABASE_URL: "postgres://db:5432/myapp?connection_limit=5&pool_timeout=30"
  REDIS_URL: "redis://redis:6379?max_connections=10"
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** `connection_limit=5` for Postgres means the entire pod shares 5 connections. If you have 10 concurrent requests, 5 of them queue waiting for a connection. Under load, the queue fills up, `pool_timeout` fires, and requests fail with "pool exhausted." The pod has 4 CPU cores but only 5 database connections.

**Fix:** Right-size the pool: `connection_limit = (core_count * 2) + disk_spindles` is the Postgres rule of thumb. For async frameworks, you may need fewer. Monitor `pg_stat_activity` to see actual connection usage.

**Why it matters:** Connection pools are the silent bottleneck. Your pod looks healthy (CPU 30%, memory 40%), but requests queue for 30 seconds waiting for a database connection. The pool limit is per-pod, and autoscaling adds more pods that each open their own pool — eventually overwhelming the database.
  </div>
</div>

<div class="challenge" data-category="networking" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #29 — Load Balancer Hairpin Problem</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  type: LoadBalancer
  selector:
    app: my-app
  ports:
    - port: 80
      targetPort: 8080
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-app
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: app
          image: my-app:latest
          env:
            - name: SERVICE_URL
              value: "http://my-service:80"
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** A pod in the Deployment calls `my-service:80`, which load-balances across all pods — including itself. The pod sends a request to itself, creating a "hairpin" that wastes a connection and can cause deadlocks if the app holds a lock while waiting for the response.

**Fix:** Use the Downward API or headless services for self-discovery. For intra-Deployment communication, consider using the pod's own IP directly (via Downward API: `status.podIP`) or separate read/write endpoints.

**Why it matters:** Hairpinning wastes ~33% of your capacity (1 in 3 requests hits the sender). Under load, a pod can exhaust its own connection pool with self-requests, causing cascading failures across the Deployment.
  </div>
</div>

<!-- ==================== MORE KUBERNETES ==================== -->

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #30 — ConfigMap Update Not Reflected</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: nginx-config
data:
  nginx.conf: |
    server {
      listen 80;
      location / { return 200 "v1"; }
    }
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx
spec:
  replicas: 3
  template:
    spec:
      containers:
        - name: nginx
          image: nginx:latest
          volumeMounts:
            - name: config
              mountPath: /etc/nginx/conf.d
      volumes:
        - name: config
          configMap:
            name: nginx-config
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** You update the ConfigMap, but nginx still serves `v1`. ConfigMap volume mounts are eventually consistent — kubelet updates the files, but the process inside the container has the old file open. nginx reads its config at startup and caches it.

**Fix:** nginx needs a signal to reload: add a sidecar that watches the ConfigMap file and sends `nginx -s reload`, or use a `postStart` hook with `inotifywait`. Alternatively, use `subPath` with a hash-based approach to force a pod restart.

**Why it matters:** You push a config change, the ConfigMap updates, kubelet updates the volume mount, but nginx keeps serving the old config. You spend 20 minutes wondering if the change was applied. It was — but nginx doesn't re-read it without a reload signal.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #31 — Job Stuck in DeadlineExceeded</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: batch/v1
kind: Job
metadata:
  name: data-migration
spec:
  backoffLimit: 3
  activeDeadlineSeconds: 300
  template:
    spec:
      containers:
        - name: migrate
          image: migrate-tool:latest
      restartPolicy: Never
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** `activeDeadlineSeconds: 300` (5 minutes) is shorter than the migration takes. The Job gets killed at 5 minutes, retries 3 times, then fails permanently. The migration is 80% complete each time but never finishes because the deadline is too aggressive.

**Fix:** Set `activeDeadlineSeconds` to a realistic timeout (e.g. 3600 for 1 hour), or remove it and rely on `backoffLimit` with a longer-running container. Use a database-level lock or idempotent migration so retries don't cause duplicates.

**Why it matters:** `activeDeadlineSeconds` kills the container process with SIGTERM. If the migration isn't idempotent, each partial run leaves the database in an inconsistent state. Three partial migrations are worse than one slow one.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #32 — Pod Stuck in Pending (Scheduling Failure)</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: gpu-inference
spec:
  replicas: 4
  template:
    spec:
      containers:
        - name: inference
          image: nvcr.io/nvidia/pytorch:latest
          resources:
            limits:
              nvidia.com/gpu: 1
      nodeSelector:
        accelerator: nvidia-a100
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** `replicas: 4` but only 2 nodes have `accelerator: nvidia-a100` labels, and each has 1 GPU. Kubernetes tries to schedule 4 pods but only 2 fit. The remaining 2 pods are stuck in `Pending` forever.

**Fix:** Use `topologySpreadConstraints` to distribute across nodes, or use a `nodeAffinity` with `preferredDuringSchedulingIgnoredDuringExecution` to spread across available GPU types. Monitor with `kubectl describe pod` → Events → "Insufficient nvidia.com/gpu."

**Why it matters:** GPU nodes are expensive and scarce. A replica count that exceeds GPU capacity silently produces Pending pods. HPA can't scale up, and you don't notice until inference latency spikes because 2 of 4 replicas are missing.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #33 — Service Connects but App Gets 503</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
        version: v2
    spec:
      containers:
        - name: api
          image: api:v2
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 30
            periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: api
spec:
  selector:
    app: api
  ports:
    - port: 80
      targetPort: 8080
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The `readinessProbe` has `initialDelaySeconds: 30` but the app is ready in 3 seconds. During the 30-second delay, the pod is not in the Service's endpoints. If you roll out v2 while v1 pods are terminating, there's a window where all endpoints are either not-ready (v2) or terminating (v1). Traffic hits empty endpoints = 503.

**Fix:** Set `initialDelaySeconds` to match the app's actual startup time (not a generous guess). Add a `startupProbe` to gate the readiness probe, so readiness checks don't start until the app is actually starting.

**Why it matters:** During rolling updates, the gap between "old pod terminating" and "new pod ready" is where 503s live. A 30-second initialDelay creates a 30-second window where no pod is ready to receive traffic.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #34 — ResourceQuota Blocks New Pods</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: v1
kind: ResourceQuota
metadata:
  name: compute-quota
  namespace: team-a
spec:
  hard:
    requests.cpu: "10"
    requests.memory: "20Gi"
    limits.cpu: "20"
    limits.memory: "40Gi"
    pods: "10"
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The quota counts `requests` AND `limits`. If team-a has 5 pods with `requests.cpu: 2` and `limits.cpu: 4`, the quota sees 10 CPU requested (quota full) and 20 CPU limited (quota full). But the actual usage might be 6 CPU. The quota is exhausted by requests that far exceed actual usage.

**Fix:** Right-size requests to match actual usage (the "guaranteed" amount the pod needs). Set limits 2-3x requests for burst capacity. Use `LimitRange` to set default requests/limits so new pods don't accidentally consume the entire quota.

**Why it matters:** A single misconfigured pod with `requests.cpu: 8` eats 80% of the quota. The team can't deploy anything new until that pod is scaled down. The quota is working as designed — it's just that the requests are wildly oversized.
  </div>
</div>

<div class="challenge" data-category="kubernetes" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #35 — Ephemeral Container Can't Attach</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: debug-target
spec:
  containers:
    - name: app
      image: my-app:latest
      securityContext:
        capabilities:
          drop: ["ALL"]
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The container drops ALL Linux capabilities, including `CAP_SYS_PTRACE`. Without `SYS_PTRACE`, you can't use `kubectl debug` ephemeral containers to attach to the process for debugging (strace, /proc/pid access). The debug container attaches but can't see the target process.

**Fix:** Either add `CAP_SYS_PTRACE` back to the container's capabilities, or use `kubectl debug` with `--target=app` which uses the Linux namespace to share the process namespace without requiring ptrace capabilities.

**Why it matters:** Your production pods have the most restrictive security context, but when something goes wrong at 3am, you can't debug them because you stripped the capability needed for debugging. Security and debuggability are in tension.
  </div>
</div>

<!-- ==================== DOCKER ADVANCED ==================== -->

<div class="challenge" data-category="docker" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #36 — Compose Service Can't Reach Host</h3>
  <div class="challenge-yaml" markdown="1">
```yaml
# docker-compose.yml
version: "3.8"
services:
  app:
    image: my-app:latest
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgres://host.docker.internal:5432/mydb
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** `host.docker.internal` works on Docker Desktop (Mac/Windows) but does NOT work on Linux by default. On a Linux host, the container can't resolve `host.docker.internal` to the host machine. The app fails to connect to Postgres running on the host.

**Fix:** Add `extra_hosts: ["host.docker.internal:host-gateway"]` to the service definition. Or use the host's actual IP. Or run Postgres in a container and use a Docker network.

**Why it matters:** Works on your Mac, breaks on the CI server (Linux). The developer spends an hour debugging Postgres when the real issue is Docker DNS resolution differences between platforms.
  </div>
</div>

<div class="challenge" data-category="docker" onclick="this.classList.toggle('revealed')">
  <h3>Challenge #37 — Container Clock Drift Causes Auth Failures</h3>
  <div class="challenge-yaml" markdown="1">
```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "scheduler.py"]
```
  </div>
  <div class="challenge-reveal" markdown="1">
**Bug:** The container uses the host's clock but doesn't sync time. In a VM-based cluster (not containers), the clock can drift. If the scheduler generates JWT tokens with time-based claims (`exp`, `iat`), tokens from a drifted container are rejected by other services with "token expired" or "token issued in the future."

**Fix:** Mount the host's clock: `volumes: ["/etc/localtime:/etc/localtime:ro"]` in Docker Compose, or ensure NTP is running on the host. For Kubernetes, use `hostPID: true` and a sidecar that syncs time, or rely on the node's time synchronization.

**Why it matters:** Clock drift of even 30 seconds causes JWT validation failures, TLS certificate "not yet valid" errors, and log timestamps that don't match. The container thinks it's 2026 while the rest of the cluster thinks it's 2025.
  </div>
</div>

</div>

<p class="challenges-footnote">
  37 challenges across Kubernetes, Docker, CI/CD, Security, Database, and Networking. New ones added regularly. Each challenge is based on a real production incident pattern.
</p>

<script>
function filterChallenges(category) {
  var challenges = document.querySelectorAll('.challenge');
  var buttons = document.querySelectorAll('.challenge-filter');
  buttons.forEach(function(btn) { btn.classList.remove('active'); });
  event.target.classList.add('active');
  challenges.forEach(function(c) {
    if (category === 'all' || c.getAttribute('data-category') === category) {
      c.style.display = '';
    } else {
      c.style.display = 'none';
    }
  });
}
</script>
