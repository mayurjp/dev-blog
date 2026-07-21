---
layout: page
title: FAQ
permalink: /faq/
---

# Frequently Asked Questions

<div class="faq-search">
  <input type="text" id="faq-search" placeholder="Search questions…" aria-label="Search FAQ" autocomplete="off" />
</div>

<div class="faq-grid">

## Kubernetes

**What is a Pod?**
A Pod is the smallest deployable unit in Kubernetes — one or more containers sharing a network namespace, IP address, and volumes. Kubernetes schedules Pods, not bare containers. ([Full post →]({{ '/kubernetes/pods-the-atomic-scheduling-unit/' | relative_url }}))

**What does a Deployment do that a Pod doesn't?**
A Deployment manages a ReplicaSet, which ensures a desired number of Pod replicas are running. It handles rolling updates, rollbacks, and self-healing — a bare Pod has none of that. ([Full post →]({{ '/kubernetes/deployments-replicasets-and-the-rollout/' | relative_url }}))

**How do Services discover Pods?**
Services use a label selector to match a set of Pods and maintain an EndpointSlice listing their IPs. kube-proxy programs iptables/IPVS rules so traffic to the Service VIP is load-balanced across matching Pods. ([Full post →]({{ '/kubernetes/services-without-hardcoding-ips/' | relative_url }}))

**What's the difference between liveness and readiness probes?**
Liveness tells kubelet whether to restart a container (it's deadlocked). Readiness tells the Service whether to send traffic (it's not ready yet). Wrong probe choice causes either unnecessary restarts or traffic to broken pods. ([Full post →]({{ '/kubernetes/probes-liveness-readiness-startup/' | relative_url }}))

## Security

**What is the difference between authentication and authorization?**
Authentication answers "who are you?" (JWT, OIDC, mTLS certificates). Authorization answers "what are you allowed to do?" (RBAC roles, policies). They're separate checks — a valid token (authn) can still be denied by a RoleBinding (authz). ([Full post →]({{ '/security/common-authn-authz-vulnerabilities/' | relative_url }}))

**Why is base64 not encryption?**
Base64 is an encoding, not encryption — anyone can decode it. A Kubernetes Secret stored as base64 in etcd is visible to anyone with etcd access unless encryption at rest is configured. ([Full post →]({{ '/kubernetes/configmaps-secrets-decoupling-config-from-image/' | relative_url }}))

## System Design

**What is the CAP theorem?**
In a network partition (P), you must choose between availability (A) — every request gets a response — and consistency (C) — every request sees the same data. You can't have all three. Most systems choose AP or CP depending on the use case. ([Full post →]({{ '/system-design/system-design-101/' | relative_url }}))

**Why use cursor pagination instead of offset?**
Offset pagination skips N rows on every page — at deep offsets this is slow and drifts if rows are inserted. Cursor pagination uses an index seek on the last-seen key, so it's O(1) at any depth and stable under concurrent writes. ([Full post →]({{ '/system-design/api-design-for-scale-versioning-pagination-idempotency/' | relative_url }}))

## Docker

**What is a multi-stage build?**
A multi-stage build uses multiple `FROM` statements to build in one stage and copy only the artifacts to a slimmer final image. This separates build dependencies from the runtime image, reducing size by 10-100x. ([Full post →]({{ '/docker/docker-101/' | relative_url }}))

**What's the difference between a container and a VM?**
A container shares the host OS kernel and uses namespaces/cgroups for isolation — it's a process with boundaries. A VM runs a full OS on a hypervisor. Containers are lighter, faster to start, and use less resources, but share a kernel attack surface.

## Generative AI

**What is RAG?**
Retrieval-Augmented Generation: before answering, the system retrieves relevant documents from a vector store and injects them into the prompt. This grounds the LLM's response in real data, reducing hallucination. ([Full post →]({{ '/genai/rag-fundamentals-retrieval-before-generation/' | relative_url }}))

**Why do embeddings matter?**
Embeddings convert text into numerical vectors that capture semantic meaning. Similar concepts cluster together in vector space, enabling similarity search — the foundation of RAG and semantic caching. ([Full post →]({{ '/genai/embeddings-vector-search-cosine-normalization-hnsw/' | relative_url }}))

## CI/CD

**Why pin GitHub Actions to commit SHAs?**
Tags like `@v4` can be force-pinned by the action maintainer, injecting malicious code into every workflow that uses them. A commit SHA is immutable — you always run the exact same code. Dependabot can still update the SHA automatically. ([Full post →]({{ '/cicd/github-actions-security-hardening-sha-pinning-permissions-pwn-requests/' | relative_url }}))

## .NET

**What is the difference between IOptions and IOptionsMonitor?**
`IOptions<T>` is a singleton snapshot — it reads config once at startup. `IOptionsMonitor<T>` supports live reload — it re-reads `appsettings.json` when the file changes, without restarting the app. ([Full post →]({{ '/dotnet/dotnet-options-pattern-ioptionsmonitor-live-reload/' | relative_url }}))

## Databases

**Why do N+1 queries happen?**
An ORM lazy-loads related entities — `order.Items` triggers a separate `SELECT` for each order's items. The fix is eager loading (`Include()`), which joins the data in one query. ([Full post →]({{ '/databases/orms-n-plus-1-lazy-loading-proxy-interception/' | relative_url }}))

</div>

<script>
(function () {
  var input = document.getElementById('faq-search');
  if (!input) return;
  var items = document.querySelectorAll('.faq-grid h3');
  var sections = document.querySelectorAll('.faq-grid h2');
  input.addEventListener('input', function () {
    var q = this.value.trim().toLowerCase();
    items.forEach(function (h3) {
      var parent = h3.parentElement;
      var text = parent.textContent.toLowerCase();
      parent.style.display = (q.length < 1 || text.indexOf(q) !== -1) ? '' : 'none';
    });
    sections.forEach(function (h2) {
      var next = h2.nextElementSibling;
      var hasVisible = false;
      while (next && next.tagName !== 'H2') {
        if (next.style.display !== 'none' && next.tagName === 'P') hasVisible = true;
        next = next.nextElementSibling;
      }
      h2.style.display = hasVisible || q.length < 1 ? '' : 'none';
    });
  });
})();
</script>
