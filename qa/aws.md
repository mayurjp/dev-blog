---
layout: page
title: "Aws Interview Questions: 24 Real-World Q&A from Production Manifests"
description: "24 interview-ready Aws questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/aws/
---

Bite-sized, standalone interview questions and answers for Aws. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">24</span></strong> questions shown. Filter by keyword or difficulty below.</p>

<div class="qa-toolbar" id="qa-toolbar">
  <input type="text" id="qa-search" placeholder="Filter questions by keyword…" aria-label="Filter questions" />
  <button type="button" id="qa-expand-all" class="qa-expand-btn">Expand all</button>
  <div class="qa-diff-buttons" id="qa-diff-buttons">
    <button type="button" data-diff="all" class="active">All</button>
    <button type="button" data-diff="Beginner">Beginner</button>
    <button type="button" data-diff="Intermediate">Intermediate</button>
    <button type="button" data-diff="Expert">Expert</button>
  </div>
</div>

## Topic: AWS Fundamentals & Global Infrastructure (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does the AWS shared responsibility model differ for EC2 vs Lambda? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
With EC2, the customer is responsible for the guest OS, application, security patches, and network configuration up to the hypervisor layer — AWS secures the physical host, network fabric, and hypervisor. With Lambda, AWS manages everything from the runtime environment down, including OS patches, execution environment isolation, and scaling infrastructure — the customer only secures the function code, IAM permissions, and any VPC configuration. The difference is the depth of the security boundary: EC2 gives the customer host-level control with host-level responsibility; Lambda abstracts the host entirely.
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the difference between a region and an availability zone in terms of failure isolation? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A region is a fully independent geographic area composed of multiple, isolated AZs connected by low-latency redundant fiber — regions are isolated from each other for catastrophic failure. An AZ is a single data center or cluster of data centers within a region with independent power, cooling, and physical security; AZs are separated by meaningful distance (typically a few km) to prevent correlated failures while keeping inter-AZ latency under 2 ms. Two AZs in the same region share a control plane but fail independently.
  </div>
</div>

## Topic: AWS Networking — VPC, Subnets, Security Groups, NAT Gateways, VPC Peering (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does a NAT Gateway differ from a NAT Instance for outbound-only traffic? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A NAT Gateway is a managed AWS service that uses Elastic IPs and scales automatically up to 45 Gbps — it requires no instance management, no patching, and no route table manipulation beyond adding a default route to the gateway ID. A NAT Instance is an EC2 AMI running in a public subnet with Source/Destination Check disabled, requiring manual instance management, patching, and failover. NAT Gateway is highly available within an AZ by design; NAT Instance requires an Auto Scaling group across AZs with a health-check script.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What happens to Security Group stateful filtering when traffic enters through a Network ACL? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Security Groups are stateful — if inbound traffic is allowed, the return traffic is automatically permitted regardless of outbound rules. Network ACLs are stateless — they evaluate every inbound and outbound packet independently against their rule list. When both are applied to the same traffic flow, the SG's stateful tracking handles connection state while the NACL's stateless rules must explicitly allow both directions; a missing outbound NACL allow rule will drop return traffic that the SG already considers valid.
  </div>
</div>

## Topic: AWS Compute — EC2 Instance Types, Placement Groups, EC2 vs ECS vs Lambda (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the placement group strategy that minimizes correlated hardware failures? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Spread placement groups distribute instances across distinct physical racks, each with its own power and network — max 7 instances per AZ per group, guaranteeing no two instances share the same rack. This eliminates correlated failures from rack-level events (power loss, network switch failure), unlike Cluster placement groups which co-locate instances on the same rack for low-latency but create a single point of failure.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does AWS Lambda's execution environment lifecycle turn an invocation? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Lambda maintains a warm pool of Sandbox environments. On invocation, the runtime reuses a warm sandbox if available (the `/init` phase is skipped), applying the function handler directly to the event. If no warm sandbox exists, the control plane creates a new microVM, copies the deployment package, bootstraps the runtime, and runs the handler's initialization code — this cold start adds 200+ ms of latency before the handler executes.
  </div>
</div>

## Topic: AWS Storage — S3 Consistency Model, EBS Volume Types, EFS Lifecycle (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is S3's consistency model for PUTS of new objects vs overwrite PUTS? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
All S3 PUTS of new objects are strongly consistent — after a 200 response, a subsequent GET immediately returns the object. Overwrite PUTS of existing objects are also strongly consistent as of December 2020 — previously they were eventually consistent with a propagation window. DELETE operations are also strongly consistent: after a successful deletion, a subsequent GET returns 404.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does EBS gp3 differ from io2 Block Express at the volume level? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
gp3 provides baseline 3,000 IOPS and 125 MiB/s throughput for any volume size, with burst capability via earned IO credits — performance is independent of volume size up to 16 TiB maximum. io2 Block Express delivers up to 256,000 IOPS and 4,000 MiB/s throughput with 99.999% durability, using a Nitro-based SSD controller that enables sub-millisecond latency regardless of queue depth — designed for the largest SAP HANA, Oracle, and SQL Server workloads.
  </div>
</div>

## Topic: AWS Identity — IAM Policy Evaluation Logic, Explicit Deny, SCPs (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does IAM's explicit deny override all other policy evaluations? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
IAM evaluates all applicable policies (identity-based, resource-based, permissions boundaries, SCPs) in a unified decision pass. If any policy contains an explicit `"Effect": "Deny"` that matches the action and resource, the evaluation short-circuits to deny regardless of any `"Effect": "Allow"` in other policies — there is no order-of-precedence tiebreaker. This is the only outcome that cannot be overridden.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do Service Control Policies (SCPs) differ from IAM permissions boundaries? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
SCPs are applied at the organization, OU, or account level in AWS Organizations and define the maximum permissions for all IAM entities within that scope — they cannot grant permissions, only restrict them, and do not affect service-linked roles or the management account. Permissions boundaries are set on individual IAM roles or users, limiting the maximum permissions that identity-based policies can grant — they are narrower in scope (single principal vs entire account) and can be combined with SCPs for defense-in-depth.
  </div>
</div>

## Topic: AWS Security — KMS Key Hierarchy, Secrets Manager Rotation, WAF Rule Groups (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does the KMS key hierarchy protect envelope encryption? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A customer master key (CMK) in KMS never leaves the HSM — it encrypts data keys locally within the HSM boundary. Each piece of customer data is encrypted with a unique data key (DEK), which is itself encrypted by the CMK (creating a wrapped DEK). The wrapped DEK is stored alongside the ciphertext; on decryption, KMS unwraps it inside the HSM and returns only the plaintext data key to the caller for local use. Compromising the storage does not expose the data without access to the CMK.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does Secrets Manager rotate a secret without application downtime? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Secrets Manager creates a new version of the secret with a staging label (`AWSCURRENT`) and immediately marks the previous version as `AWSPREVIOUS`. For rotation with a Lambda function, Secrets Manager invokes the rotation function which creates a new credential in the database, tests it, and then updates the secret in Secrets Manager — the `AWSCURRENT` label atomically switches to the new version. Applications reading the secret via the SDK automatically get the current value without any code change or restart.
  </div>
</div>

## Topic: AWS EKS — Cluster Provisioning, Node Groups, IRSA, VPC CNI (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does the VPC CNI assign IP addresses to pods without overlay networking? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The VPC CNI plugin (aws-node) creates a warm pool of Elastic Network Interface (ENI) secondary IPs in each node's subnet. When a pod is scheduled, the CNI allocates a secondary IP from the warm pool directly to the pod's network namespace — the pod receives a real VPC IP address with no NAT or encapsulation. Each ENI supports a limited number of secondary IPs based on instance type, which caps pod density per node unless a custom networking overlay (e.g., Calico, Cilium) is used.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does IAM Roles for Service Accounts (IRSA) authenticate to AWS APIs? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
IRSA associates an IAM role with a Kubernetes Service Account via an annotation (`eks.amazonaws.com/role-arn`). The pod's service account token is an OIDC token signed by the EKS cluster's OIDC issuer URL. When the pod calls the AWS SDK, the SDK exchanges this OIDC token for an AWS STS credential via `AssumeRoleWithWebIdentity`, returning temporary credentials scoped to the associated IAM role — no long-lived AWS credentials ever touch the pod.
  </div>
</div>

## Topic: AWS DevOps — CodePipeline Artifacts, CodeBuild Cache, CloudFormation Drift (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does CodePipeline pass artifacts between stages? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Each action in a pipeline can specify `outputArtifacts` that CodePipeline stores in a pipeline-specific S3 bucket. The next stage's action references these artifacts as `inputArtifacts`; CodePipeline downloads them from S3 into the action runner's working directory before execution. Artifacts are versioned per pipeline execution, enabling rollback by replaying a specific execution's artifact set.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does CloudFormation detect drift from the template? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
CloudFormation's drift detection calls each resource provider's `Describe*` API and compares the returned property values against the template's desired configuration. Resources that support drift detection have a `DriftStatus` of `MODIFIED`, `DELETED`, or `NOT_CHECKED`. The comparison is done at the resource property level — a change made outside CloudFormation (via the Console, CLI, or API) is flagged as drift even if it doesn't impact resource operation.
  </div>
</div>

## Topic: AWS Monitoring — CloudWatch Metrics vs Logs, X-Ray Trace Segments, Alarms (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: What is the difference between CloudWatch Metrics and CloudWatch Logs in terms of querying? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
CloudWatch Metrics are time-series data points indexed by dimensions — they support real-time dashboards, anomaly detection, and alarm evaluation with 1-second granularity via high-resolution metrics, but cannot be searched by arbitrary text. CloudWatch Logs store raw text log events with a timestamp, supporting Logs Insights queries using a SQL-like syntax (`fields @timestamp, @message | filter @message like /ERROR/ | stats count() by bin(5m)`) — but cannot drive alarms faster than 60-second evaluation periods.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do X-Ray trace segments and subsegments model a distributed request? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A segment represents the journey of a request through one service (e.g., an API Gateway call) — it records the host, request, response, and any errors. Subsegments break down work within that service (e.g., a DynamoDB query inside the Lambda handler), each with its own timing, metadata, and child subsegments. The trace ID is propagated across service boundaries via the `X-Amzn-Trace-Id` header; the complete trace reconstructs the end-to-end call graph with per-hop latency.
  </div>
</div>

## Topic: AWS Serverless — Lambda Layers, Step Functions, API Gateway Caching (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do Lambda layers share code across functions? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A layer is a ZIP archive containing libraries, custom runtimes, or configuration files that Lambda extracts into `/opt` in the execution environment before running the handler. The function's code can import from `/opt/nodejs/node_modules/`, `/opt/python/lib/`, etc. Layers are versioned and can be added to up to five functions simultaneously — common dependencies are updated in one place without rebuilding individual function deployment packages.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does API Gateway response caching reduce backend load? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
API Gateway caches responses from backend integrations based on the endpoint's cache key (composed from the request parameters, headers, and stage). When a request's cache key matches a cached entry within the TTL, API Gateway returns the cached response without invoking the backend integration — the backend sees zero additional requests. Cache capacity is provisioned in GB (0.5 to 237 GB per stage) and is managed as a dedicated in-memory cluster.
  </div>
</div>

## Topic: AWS Database — DynamoDB Partitioning, Throttling, DAX; RDS Multi-AZ; Aurora (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does DynamoDB partition data and what triggers throttling? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
DynamoDB partitions data by hash of the partition key — each partition can hold up to 10 GB and support 3,000 RCU or 1,000 WCU. When a partition exceeds these limits or total table throughput grows, DynamoDB splits partitions automatically. Throttling (`ProvisionedThroughputExceededException`) occurs when a single partition's read/write activity exceeds its allocated capacity — this typically happens with a hot key whose traffic overwhelms one partition while others remain underutilized.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does RDS Multi-AZ failover work without connection string changes? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
RDS creates a synchronous standby replica in a different AZ with the same DNS name (`*.rds.amazonaws.com`). On failure detection (loss of physical heartbeat, storage failure, or AZ outage), RDS promotes the standby to primary and updates the DNS CNAME to point at the new primary's endpoint — the DNS TTL is set to 30 seconds by default. Clients using the original DNS name reconnect to the new primary without any application configuration change.
  </div>
</div>

## Topic: AWS Messaging — SQS FIFO vs Standard, SNS Filtering, Kinesis Shards (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How does SQS FIFO guarantee exactly-once processing? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
FIFO queues use a content-based deduplication ID (or a caller-supplied `MessageDeduplicationId`) combined with a 5-minute deduplication window — any message with the same deduplication ID within that window is silently dropped. The consumer must also use a receive request with a `ReceiveRequestAttemptId` to ensure retries don't produce duplicates. This eliminates the at-least-once behavior of standard queues where a consumer timeout or failure causes message reappearance.
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false">Q: How do Kinesis shards determine throughput? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Each shard provides 1 MB/s write and 2 MB/s read (or 1,000 records/s write and 5 reads/s per shard, whichever is hit first). Data records within a shard are ordered by sequence number — all records with the same partition key go to the same shard. Total stream throughput scales linearly with shard count: a 10-shard stream supports 10 MB/s writes and 20 MB/s reads. Shards are the only scaling mechanism and must be split or merged via `UpdateShardCount`.
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 24 across Aws

[Back to Q&A Index]({{ '/qa/' | relative_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How does the AWS shared responsibility model differ for EC2 vs Lambda?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "With EC2, the customer is responsible for the guest OS, application, security patches, and network configuration up to the hypervisor layer — AWS secures the physical host, network fabric, and hypervisor. With Lambda, AWS manages everything from the runtime environment down, including OS patches, execution environment isolation, and scaling infrastructure — the customer only secures the function code, IAM permissions, and any VPC configuration. The difference is the depth of the security boundary: EC2 gives the customer host-level control with host-level responsibility; Lambda abstracts the host entirely."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between a region and an availability zone in terms of failure isolation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A region is a fully independent geographic area composed of multiple, isolated AZs connected by low-latency redundant fiber — regions are isolated from each other for catastrophic failure. An AZ is a single data center or cluster of data centers within a region with independent power, cooling, and physical security; AZs are separated by meaningful distance (typically a few km) to prevent correlated failures while keeping inter-AZ latency under 2 ms. Two AZs in the same region share a control plane but fail independently."
      }
    },
    {
      "@type": "Question",
      "name": "How does a NAT Gateway differ from a NAT Instance for outbound-only traffic?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A NAT Gateway is a managed AWS service that uses Elastic IPs and scales automatically up to 45 Gbps — it requires no instance management, no patching, and no route table manipulation beyond adding a default route to the gateway ID. A NAT Instance is an EC2 AMI running in a public subnet with Source/Destination Check disabled, requiring manual instance management, patching, and failover. NAT Gateway is highly available within an AZ by design; NAT Instance requires an Auto Scaling group across AZs with a health-check script."
      }
    },
    {
      "@type": "Question",
      "name": "What happens to Security Group stateful filtering when traffic enters through a Network ACL?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Security Groups are stateful — if inbound traffic is allowed, the return traffic is automatically permitted regardless of outbound rules. Network ACLs are stateless — they evaluate every inbound and outbound packet independently against their rule list. When both are applied to the same traffic flow, the SG's stateful tracking handles connection state while the NACL's stateless rules must explicitly allow both directions; a missing outbound NACL allow rule will drop return traffic that the SG already considers valid."
      }
    },
    {
      "@type": "Question",
      "name": "What is the placement group strategy that minimizes correlated hardware failures?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Spread placement groups distribute instances across distinct physical racks, each with its own power and network — max 7 instances per AZ per group, guaranteeing no two instances share the same rack. This eliminates correlated failures from rack-level events (power loss, network switch failure), unlike Cluster placement groups which co-locate instances on the same rack for low-latency but create a single point of failure."
      }
    },
    {
      "@type": "Question",
      "name": "How does AWS Lambda's execution environment lifecycle turn an invocation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Lambda maintains a warm pool of Sandbox environments. On invocation, the runtime reuses a warm sandbox if available (the `/init` phase is skipped), applying the function handler directly to the event. If no warm sandbox exists, the control plane creates a new microVM, copies the deployment package, bootstraps the runtime, and runs the handler's initialization code — this cold start adds 200+ ms of latency before the handler executes."
      }
    },
    {
      "@type": "Question",
      "name": "What is S3's consistency model for PUTS of new objects vs overwrite PUTS?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "All S3 PUTS of new objects are strongly consistent — after a 200 response, a subsequent GET immediately returns the object. Overwrite PUTS of existing objects are also strongly consistent as of December 2020 — previously they were eventually consistent with a propagation window. DELETE operations are also strongly consistent: after a successful deletion, a subsequent GET returns 404."
      }
    },
    {
      "@type": "Question",
      "name": "How does EBS gp3 differ from io2 Block Express at the volume level?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "gp3 provides baseline 3,000 IOPS and 125 MiB/s throughput for any volume size, with burst capability via earned IO credits — performance is independent of volume size up to 16 TiB maximum. io2 Block Express delivers up to 256,000 IOPS and 4,000 MiB/s throughput with 99.999% durability, using a Nitro-based SSD controller that enables sub-millisecond latency regardless of queue depth — designed for the largest SAP HANA, Oracle, and SQL Server workloads."
      }
    },
    {
      "@type": "Question",
      "name": "How does IAM's explicit deny override all other policy evaluations?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "IAM evaluates all applicable policies (identity-based, resource-based, permissions boundaries, SCPs) in a unified decision pass. If any policy contains an explicit `\"Effect\": \"Deny\"` that matches the action and resource, the evaluation short-circuits to deny regardless of any `\"Effect\": \"Allow\"` in other policies — there is no order-of-precedence tiebreaker. This is the only outcome that cannot be overridden."
      }
    },
    {
      "@type": "Question",
      "name": "How do Service Control Policies (SCPs) differ from IAM permissions boundaries?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "SCPs are applied at the organization, OU, or account level in AWS Organizations and define the maximum permissions for all IAM entities within that scope — they cannot grant permissions, only restrict them, and do not affect service-linked roles or the management account. Permissions boundaries are set on individual IAM roles or users, limiting the maximum permissions that identity-based policies can grant — they are narrower in scope (single principal vs entire account) and can be combined with SCPs for defense-in-depth."
      }
    },
    {
      "@type": "Question",
      "name": "How does the KMS key hierarchy protect envelope encryption?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A customer master key (CMK) in KMS never leaves the HSM — it encrypts data keys locally within the HSM boundary. Each piece of customer data is encrypted with a unique data key (DEK), which is itself encrypted by the CMK (creating a wrapped DEK). The wrapped DEK is stored alongside the ciphertext; on decryption, KMS unwraps it inside the HSM and returns only the plaintext data key to the caller for local use. Compromising the storage does not expose the data without access to the CMK."
      }
    },
    {
      "@type": "Question",
      "name": "How does Secrets Manager rotate a secret without application downtime?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Secrets Manager creates a new version of the secret with a staging label (`AWSCURRENT`) and immediately marks the previous version as `AWSPREVIOUS`. For rotation with a Lambda function, Secrets Manager invokes the rotation function which creates a new credential in the database, tests it, and then updates the secret in Secrets Manager — the `AWSCURRENT` label atomically switches to the new version. Applications reading the secret via the SDK automatically get the current value without any code change or restart."
      }
    },
    {
      "@type": "Question",
      "name": "How does the VPC CNI assign IP addresses to pods without overlay networking?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The VPC CNI plugin (aws-node) creates a warm pool of Elastic Network Interface (ENI) secondary IPs in each node's subnet. When a pod is scheduled, the CNI allocates a secondary IP from the warm pool directly to the pod's network namespace — the pod receives a real VPC IP address with no NAT or encapsulation. Each ENI supports a limited number of secondary IPs based on instance type, which caps pod density per node unless a custom networking overlay (e.g., Calico, Cilium) is used."
      }
    },
    {
      "@type": "Question",
      "name": "How does IAM Roles for Service Accounts (IRSA) authenticate to AWS APIs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "IRSA associates an IAM role with a Kubernetes Service Account via an annotation (`eks.amazonaws.com/role-arn`). The pod's service account token is an OIDC token signed by the EKS cluster's OIDC issuer URL. When the pod calls the AWS SDK, the SDK exchanges this OIDC token for an AWS STS credential via `AssumeRoleWithWebIdentity`, returning temporary credentials scoped to the associated IAM role — no long-lived AWS credentials ever touch the pod."
      }
    },
    {
      "@type": "Question",
      "name": "How does CodePipeline pass artifacts between stages?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Each action in a pipeline can specify `outputArtifacts` that CodePipeline stores in a pipeline-specific S3 bucket. The next stage's action references these artifacts as `inputArtifacts`; CodePipeline downloads them from S3 into the action runner's working directory before execution. Artifacts are versioned per pipeline execution, enabling rollback by replaying a specific execution's artifact set."
      }
    },
    {
      "@type": "Question",
      "name": "How does CloudFormation detect drift from the template?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CloudFormation's drift detection calls each resource provider's `Describe*` API and compares the returned property values against the template's desired configuration. Resources that support drift detection have a `DriftStatus` of `MODIFIED`, `DELETED`, or `NOT_CHECKED`. The comparison is done at the resource property level — a change made outside CloudFormation (via the Console, CLI, or API) is flagged as drift even if it doesn't impact resource operation."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between CloudWatch Metrics and CloudWatch Logs in terms of querying?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "CloudWatch Metrics are time-series data points indexed by dimensions — they support real-time dashboards, anomaly detection, and alarm evaluation with 1-second granularity via high-resolution metrics, but cannot be searched by arbitrary text. CloudWatch Logs store raw text log events with a timestamp, supporting Logs Insights queries using a SQL-like syntax (`fields @timestamp, @message | filter @message like /ERROR/ | stats count() by bin(5m)`) — but cannot drive alarms faster than 60-second evaluation periods."
      }
    },
    {
      "@type": "Question",
      "name": "How do X-Ray trace segments and subsegments model a distributed request?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A segment represents the journey of a request through one service (e.g., an API Gateway call) — it records the host, request, response, and any errors. Subsegments break down work within that service (e.g., a DynamoDB query inside the Lambda handler), each with its own timing, metadata, and child subsegments. The trace ID is propagated across service boundaries via the `X-Amzn-Trace-Id` header; the complete trace reconstructs the end-to-end call graph with per-hop latency."
      }
    },
    {
      "@type": "Question",
      "name": "How do Lambda layers share code across functions?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A layer is a ZIP archive containing libraries, custom runtimes, or configuration files that Lambda extracts into `/opt` in the execution environment before running the handler. The function's code can import from `/opt/nodejs/node_modules/`, `/opt/python/lib/`, etc. Layers are versioned and can be added to up to five functions simultaneously — common dependencies are updated in one place without rebuilding individual function deployment packages."
      }
    },
    {
      "@type": "Question",
      "name": "How does API Gateway response caching reduce backend load?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "API Gateway caches responses from backend integrations based on the endpoint's cache key (composed from the request parameters, headers, and stage). When a request's cache key matches a cached entry within the TTL, API Gateway returns the cached response without invoking the backend integration — the backend sees zero additional requests. Cache capacity is provisioned in GB (0.5 to 237 GB per stage) and is managed as a dedicated in-memory cluster."
      }
    },
    {
      "@type": "Question",
      "name": "How does DynamoDB partition data and what triggers throttling?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DynamoDB partitions data by hash of the partition key — each partition can hold up to 10 GB and support 3,000 RCU or 1,000 WCU. When a partition exceeds these limits or total table throughput grows, DynamoDB splits partitions automatically. Throttling (`ProvisionedThroughputExceededException`) occurs when a single partition's read/write activity exceeds its allocated capacity — this typically happens with a hot key whose traffic overwhelms one partition while others remain underutilized."
      }
    },
    {
      "@type": "Question",
      "name": "How does RDS Multi-AZ failover work without connection string changes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "RDS creates a synchronous standby replica in a different AZ with the same DNS name (`*.rds.amazonaws.com`). On failure detection (loss of physical heartbeat, storage failure, or AZ outage), RDS promotes the standby to primary and updates the DNS CNAME to point at the new primary's endpoint — the DNS TTL is set to 30 seconds by default. Clients using the original DNS name reconnect to the new primary without any application configuration change."
      }
    },
    {
      "@type": "Question",
      "name": "How does SQS FIFO guarantee exactly-once processing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "FIFO queues use a content-based deduplication ID (or a caller-supplied `MessageDeduplicationId`) combined with a 5-minute deduplication window — any message with the same deduplication ID within that window is silently dropped. The consumer must also use a receive request with a `ReceiveRequestAttemptId` to ensure retries don't produce duplicates. This eliminates the at-least-once behavior of standard queues where a consumer timeout or failure causes message reappearance."
      }
    },
    {
      "@type": "Question",
      "name": "How do Kinesis shards determine throughput?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Each shard provides 1 MB/s write and 2 MB/s read (or 1,000 records/s write and 5 reads/s per shard, whichever is hit first). Data records within a shard are ordered by sequence number — all records with the same partition key go to the same shard. Total stream throughput scales linearly with shard count: a 10-shard stream supports 10 MB/s writes and 20 MB/s reads. Shards are the only scaling mechanism and must be split or merged via `UpdateShardCount`."
      }
    }
  ]
}
</script>

<script>
(function () {
  var search = document.getElementById('qa-search');
  var buttons = document.getElementById('qa-diff-buttons');
  if (!search || !buttons) return;
  var activeDiff = 'all';
  function normalize(s){ return (s||'').toLowerCase(); }
  function apply() {
    var q = normalize(search.value).trim();
    var items = document.querySelectorAll('.qa-item');
    var shown = 0;
    items.forEach(function (item) {
      var txt = normalize(item.textContent);
      var diff = item.getAttribute('data-diff') || 'Intermediate';
      var okText = q === '' || txt.indexOf(q) !== -1;
      var okDiff = activeDiff === 'all' || diff === activeDiff;
      var visible = okText && okDiff;
      item.style.display = visible ? '' : 'none';
      if (visible) shown++;
    });
    var count = document.getElementById('qa-shown');
    if (count) count.textContent = shown;
  }
  search.addEventListener('input', apply);
  buttons.addEventListener('click', function (e) {
    var btn = e.target.closest('button');
    if (!btn) return;
    activeDiff = btn.getAttribute('data-diff');
    buttons.querySelectorAll('button').forEach(function (b) { b.classList.remove('active'); });
    btn.classList.add('active');
    apply();
  });

  /* Accordion: click or keypress on question to toggle answer */
  document.addEventListener('click', function (e) {
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    h3.parentElement.classList.toggle('open');
    h3.setAttribute('aria-expanded', h3.parentElement.classList.contains('open'));
  });
  document.addEventListener('keydown', function (e) {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    e.preventDefault();
    h3.click();
  });

  /* Expand all / collapse all */
  var expandBtn = document.getElementById('qa-expand-all');
  if (expandBtn) {
    expandBtn.addEventListener('click', function () {
      var items = document.querySelectorAll('.qa-item');
      var allOpen = Array.prototype.every.call(items, function(i){ return i.classList.contains('open'); });
      items.forEach(function (item) {
        var q = item.querySelector('.qa-q');
        if (allOpen) {
          item.classList.remove('open');
          if (q) q.setAttribute('aria-expanded', 'false');
        } else {
          item.classList.add('open');
          if (q) q.setAttribute('aria-expanded', 'true');
        }
      });
      expandBtn.textContent = allOpen ? 'Expand all' : 'Collapse all';
    });
  }

  apply();
})();
</script>
