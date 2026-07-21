---
layout: page
title: "Troubleshooting & Debugging Scenarios"
permalink: /troubleshooting/
---

Real-world debugging scenarios across all domains — each walks through a symptom, root cause analysis, and the fix.

<div class="troubleshooting-grid">
{% for topic in site.data.topics %}
  {% assign posts = site.categories[topic.slug] | where_exp: "post", "post.tags contains 'debugging'" %}
  {% if posts.size > 0 %}
  <details class="troubleshooting-domain">
    <summary class="troubleshooting-domain-title">{{ topic.name }} ({{ posts.size }})</summary>
    <ul class="troubleshooting-list">
      {% for post in posts %}
        {% if post.tags contains 'troubleshooting' or post.tags contains 'debugging' %}
        <li>
          <a href="{{ post.url | relative_url }}">{{ post.title }}</a>
          {% if post.description %}<span class="troubleshooting-desc">{{ post.description }}</span>{% endif %}
        </li>
        {% endif %}
      {% endfor %}
    </ul>
  </details>
  {% endif %}
{% endfor %}
</div>

---

## By Symptom Pattern

### Thread Pool / Async Starvation
- **ASP.NET WebAPI**: [Why Is This Request Timing Out After 30 Seconds?](/aspnet-webapi/webapi-request-timing-out/) — Synchronous EF call blocks thread pool under load
- **Kubernetes**: [Pod Evicted Under Disk Pressure](/challenges/pod-evicted-under-disk-pressure/) — Memory pressure triggers disk pressure eviction

### Authentication / Authorization Failures
- **ASP.NET WebAPI**: [Why Does the Authorized Endpoint Return 401 When the Token Is Valid?](/aspnet-webapi/webapi-auth-failure/) — Middleware order: authentication runs before controller endpoints are registered
- **Azure**: [Managed Identity Token Not Found](/azure/managed-identity-token-not-found/) — IMDS endpoint unreachable from container

### Network / Load Balancer Timeouts
- **AWS**: [ALB Returns 504 When EC2 Instance Is Healthy](/aws/aws-alb-504/) — ALB idle timeout (60s) < server processing time for large uploads
- **Azure**: [App Service Returns 503 Every 10 Minutes](/azure/azure-app-service-503/) — HttpClient socket exhaustion triggers auto-heal recycle

### Database / Storage Performance
- **Azure SQL**: [Why Are My Azure SQL Queries Slow After 1 PM Every Day?](/azure/azure-sql-slow/) — DTU throttling from sustained table scans on unindexed views
- **AWS S3**: [Access Denied Despite Correct IAM Role](/aws/aws-s3-access-denied/) — Bucket policy principal mismatch (user ARN vs role ARN)

### Distributed System Debugging
- **System Design**: [Tracing a Request Across Microservices](/system-design/distributed-tracing-walkthrough/) — Correlation IDs, W3C traceparent, and OpenTelemetry context propagation
- **System Design**: [Debugging Latency Spikes in Event-Driven Architecture](/system-design/event-driven-latency-debug/) — Queue depth, consumer lag, and backpressure signals

---

## Contributing New Scenarios

Each scenario follows the **Symptom → Reproduce → Root Cause → Fix → Prevention** template:

```
## The symptom
> "User-visible error message or behavior"

## Reproduce
Minimal code/config to trigger the issue locally

## The root cause chain
1. Immediate trigger
2. Underlying mechanism
3. Confirming evidence (logs, metrics, counters)

## The fix
Code/config change with explanation

## Deeper checks for production
- Additional monitoring
- Related configs to verify

## Prevention checklist
- [ ] Items to add to code review / CI
```

**Want to add a scenario?** Open a PR with a new post in `_posts/` tagged with both the domain (e.g., `kubernetes`) and `troubleshooting` + `debugging`.