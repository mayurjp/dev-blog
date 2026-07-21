---
layout: page
title: "CKA / CKAD Roadmap"
permalink: /roadmap/
---

Certification prep mapped to real blog posts and Q&A. No hello-world examples — every link teaches from production manifests.

<div class="roadmap-tabs">
  <button type="button" class="roadmap-tab active" data-target="cka">CKA — Admin</button>
  <button type="button" class="roadmap-tab" data-target="ckad">CKAD — Developer</button>
</div>

<div class="roadmap-content" id="cka">
  <h2>CKA Exam Domains</h2>

  <div class="roadmap-domain">
    <h3>Cluster Architecture, Installation & Configuration — 25%</h3>
    <div class="roadmap-items">
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Control plane bootstrap</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/kubernetes-control-plane-bootstrap-static-pods/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>RBAC roles, bindings, and aggregation</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/rbac-roles-bindings-and-aggregation/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>ResourceQuota and LimitRange</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/resourcequota-limitrange-sharing-a-cluster-safely/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>SealedSecrets and External Secrets</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/secret-management-gitops-sealed-secrets-external-secrets/' | relative_url }}">Post</a>
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class="roadmap-domain">
    <h3>Workloads & Scheduling — 15%</h3>
    <div class="roadmap-items">
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Pods: scheduling, pause container, shared namespace</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/pods-the-atomic-scheduling-unit/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Deployments: rolling updates, maxUnavailable, maxSurge</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>DaemonSets: one pod per node, tolerations</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/daemonsets-one-pod-per-node/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>StatefulSets: stable identity, headless Services</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/statefulsets-stable-identity-not-just-storage/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Jobs and CronJobs</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/jobs-cronjobs-run-to-completion-not-keep-alive/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>HPA: formula, CPU requests, stabilization</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/hpa-horizontal-pod-autoscaling/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class="roadmap-domain">
    <h3>Services & Networking — 20%</h3>
    <div class="roadmap-items">
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Services: ClusterIP, headless, EndpointSlices</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Ingress: TLS termination, pathType, ingressClassName</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/ingress-routing-http-without-a-loadbalancer-per-service/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>NetworkPolicy: default-deny, additive rules</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/networkpolicy-default-deny-and-allow-lists/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class="roadmap-domain">
    <h3>Storage — 10%</h3>
    <div class="roadmap-items">
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>PV/PVC: reclaimPolicy, access modes, dynamic provisioning</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/volumes-pv-pvc-surviving-a-pod-restart/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class="roadmap-domain">
    <h3>Observability — 10%</h3>
    <div class="roadmap-items">
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Probes: liveness, readiness, startup</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/probes-liveness-readiness-startup/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class="roadmap-domain">
    <h3>Security — 20%</h3>
    <div class="roadmap-items">
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Pod Security Standards and admission controllers</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/pod-security-standards-admission-controllers/' | relative_url }}">Post</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>NetworkPolicy as security enforcement</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/networkpolicy-default-deny-and-allow-lists/' | relative_url }}">Post</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="roadmap-content" id="ckad" style="display:none">
  <h2>CKAD Exam Domains</h2>

  <div class="roadmap-domain">
    <h3>Application Design & Build — 20%</h3>
    <div class="roadmap-items">
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Containers: images, layers, multi-stage builds</strong>
          <span class="roadmap-links">
            <a href="{{ '/docker/docker-image-layers-and-build-cache/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/docker/multi-stage-builds-shrinking-the-final-image/' | relative_url }}">Post</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>ConfigMaps and Secrets</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/configmaps-secrets-decoupling-config-from-image/' | relative_url }}">Post</a>
            &middot; <a href="{{ '/qa/kubernetes/' | relative_url }}">Q&A</a>
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class="roadmap-domain">
    <h3>Application Deployment — 20%</h3>
    <div class="roadmap-items">
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Deployments and rolling updates</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }}">Post</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Rollback and revision history</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }}">Post</a>
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class="roadmap-domain">
    <h3>Application Security — 15%</h3>
    <div class="roadmap-items">
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>ServiceAccount, SecurityContext, capabilities</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/pods-the-atomic-scheduling-unit/' | relative_url }}">Post</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>NetworkPolicy for pod-level security</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/networkpolicy-default-deny-and-allow-lists/' | relative_url }}">Post</a>
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class="roadmap-domain">
    <h3>Application Troubleshooting — 20%</h3>
    <div class="roadmap-items">
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Probes: liveness, readiness, startup</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/probes-liveness-readiness-startup/' | relative_url }}">Post</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Service connectivity debugging (selector mismatch, ndots)</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }}">Post</a>
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class="roadmap-domain">
    <h3>Application Resource Management — 15%</h3>
    <div class="roadmap-items">
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Resource requests, limits, LimitRange, ResourceQuota</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/resourcequota-limitrange-sharing-a-cluster-safely/' | relative_url }}">Post</a>
          </span>
        </div>
      </div>
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>HPA scaling</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/hpa-horizontal-pod-autoscaling/' | relative_url }}">Post</a>
          </span>
        </div>
      </div>
    </div>
  </div>

  <div class="roadmap-domain">
    <h3>Application Observability & Maintenance — 10%</h3>
    <div class="roadmap-items">
      <div class="roadmap-item done">
        <span class="roadmap-check">&#10003;</span>
        <div>
          <strong>Probes, readiness gates, and Pod lifecycle</strong>
          <span class="roadmap-links">
            <a href="{{ '/kubernetes/probes-liveness-readiness-startup/' | relative_url }}">Post</a>
          </span>
        </div>
      </div>
    </div>
  </div>
</div>

<script>
(function () {
  var tabs = document.querySelectorAll('.roadmap-tab');
  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      tabs.forEach(function (t) { t.classList.remove('active'); });
      tab.classList.add('active');
      document.querySelectorAll('.roadmap-content').forEach(function (c) {
        c.style.display = c.id === tab.getAttribute('data-target') ? '' : 'none';
      });
    });
  });
})();
</script>
