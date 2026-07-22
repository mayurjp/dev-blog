---
layout: post
title: "AWS Key Terms: Regions, IAM, and the Cloud Vocabulary Behind Every Post"
description: "A standalone glossary of AWS terms used across this blog's cloud posts — regions, AZs, IAM, VPC, S3, EC2, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: aws
order: 99
tags: [aws, glossary, cloud, fundamentals]
---

**TL;DR:** This is the vocabulary reference for every AWS post on this blog — read it once, then skip back here whenever a term like *ARN*, *IAM Policy*, or *Security Group* shows up.

## Organization

### Region
An AWS Region is a cluster of datacenters in a geographic area, completely independent from every other region. Each region has at least three Availability Zones connected by low-latency fiber. Resources in one region are not visible in another unless explicitly replicated. Region names follow the pattern `us-east-1`, `eu-west-2`, `ap-southeast-1`.

### Availability Zone (AZ)
An Availability Zone is one or more discrete datacenters within a region with independent power, cooling, and physical security. AZs are connected to each other through redundant, low-latency links. Deploying across multiple AZs is the standard pattern for high availability — an application that runs in a single AZ has a single point of failure at the datacenter level.

### ARN (Amazon Resource Name)
ARN is the unique identifier for every AWS resource. The format is `arn:partition:service:region:account-id:resource-type/resource-name`. Example: `arn:aws:s3:::my-bucket` or `arn:aws:ec2:us-east-1:123456789012:instance/i-abc123`. ARNs are used in IAM policies, resource-based policies, and API operations to refer to specific resources.

### Shared Responsibility Model
The shared responsibility model defines what AWS secures (the security *of* the cloud — physical datacenters, hardware, network infrastructure) versus what the customer secures (the security *in* the cloud — IAM permissions, network ACLs, data encryption, OS patches on EC2). The boundary shifts by service: RDS abstracts OS patching, Lambda abstracts the entire runtime, and EC2 leaves everything above the hypervisor to you.

## IAM (Identity and Access Management)

### IAM User
An IAM user is a permanent identity that represents a person or application that interacts with AWS. Each user has a name, a set of permissions (attached policies), and optionally console passwords and access keys. IAM users are global (not regional) and are namespaced to your AWS account.

### IAM Policy
An IAM policy is a JSON document that defines permissions as a list of `Effect` (Allow/Deny), `Action` (e.g. `s3:GetObject`), and `Resource` (an ARN pattern). Policies can be attached to users, groups, or roles. AWS evaluates all policies at request time, and an explicit `Deny` always overrides any `Allow`.

### IAM Role
An IAM role is a temporary identity that an entity (AWS service, IAM user, federated user, application) assumes to obtain temporary credentials via Security Token Service (STS). Roles have trust policies (who can assume the role) and permission policies (what the role can do). Roles are the recommended pattern for granting AWS services permission to act on your behalf — e.g. an EC2 instance role that reads from S3.

### Security Token Service (STS)
STS is the service that issues temporary, credentials for IAM roles and federated users. Tokens have a configurable lifetime (15 minutes to 36 hours) and are automatically rotated. `AssumeRole`, `GetFederationToken`, and `AssumeRoleWithWebIdentity` are the three APIs. Temporary credentials are the recommended alternative to long-lived access keys.

## Compute

### EC2 (Elastic Compute Cloud)
EC2 provides resizable virtual machines (instances) that you launch from an Amazon Machine Image (AMI) into a VPC. Each instance type specifies a CPU, memory, storage, and network capacity combination. Instances can be On-Demand (pay per second), Reserved (1- or 3-year commit for discount), Spot (cheap, but can be terminated by AWS), or part of a Savings Plan.

### Security Group
A security group is a stateful virtual firewall that controls traffic at the instance level (ENI). Each security group has inbound and outbound rules specifying protocol, port range, and source/destination (IP CIDR or another security group). Security groups are stateful — if you allow inbound traffic on port 80, the outbound return traffic is automatically allowed regardless of outbound rules. This contrasts with NACLs, which are stateless.

### Elastic Load Balancing (ELB/ALB)
ELB distributes incoming traffic across multiple targets (EC2 instances, Lambda functions, IP addresses) in one or more Availability Zones. Application Load Balancer (ALB) operates at Layer 7 and routes based on HTTP headers, URL paths, and hostnames. Network Load Balancer (NLB) operates at Layer 4 and handles TCP/UDP with ultra-low latency. Both support health checks, SSL termination, and auto-scaling integration.

### Lambda
AWS Lambda is a serverless compute service that runs code in response to triggers (API Gateway, S3 events, SQS messages, DynamoDB streams, timers). Lambda scales from zero to thousands of concurrent executions and charges per millisecond of execution time plus memory allocated. The maximum execution timeout is 15 minutes; long-running workloads should use ECS or EC2 instead.

## Storage

### S3 (Simple Storage Service)
S3 is the object storage service that stores data as objects in buckets. Objects are identified by a key (path-like string) and can be up to 5 TB. S3 provides 99.999999999% durability (11 nines). Objects are stored in a flat namespace; "folders" in the console are actually zero-length objects with key prefixes ending in `/`. Bucket policies and ACLs govern access; S3 Block Public Access provides a safety net against accidental public exposure.

### S3 Storage Classes
S3 offers multiple storage classes that trade cost for access frequency: Standard (frequent, low-latency), Intelligent-Tiering (auto-migrates), Standard-IA (infrequent, retrieval fee), One Zone-IA (cheaper, single AZ), Glacier Instant Retrieval (archive, ms retrieval), Glacier Flexible Retrieval (archive, minutes retrieval), and Glacier Deep Archive (cheapest, 12-hour retrieval).

### RDS (Relational Database Service)
RDS is a managed relational database service supporting MySQL, PostgreSQL, MariaDB, Oracle, SQL Server, and Amazon Aurora. RDS handles backups, patching, replication, and failover. Multi-AZ deployments maintain a standby replica in another AZ for automatic failover (RTO typically under 2 minutes). Read replicas (up to 15 per DB instance) offload read traffic.

### DynamoDB
DynamoDB is a fully managed NoSQL key-value and document database with single-digit-millisecond latency at any scale. Tables are schema-less (only the partition key is required) and support strongly consistent or eventually consistent reads. Capacity is provisioned in read/write capacity units (RCU/WCU) or on-demand (auto-scales). DynamoDB Accelerator (DAX) is an in-memory cache that reduces read latency to microseconds.

## Networking

### VPC (Virtual Private Cloud)
A VPC is a logically isolated virtual network within your AWS account. It has an IP CIDR block (e.g. `10.0.0.0/16`), subnets within each AZ, route tables, and an internet gateway for public internet access. Resources inside a VPC communicate over private IPs; traffic to the internet goes through the internet gateway. VPC peering and Transit Gateway connect VPCs to each other and to on-premises networks.

### Subnet
A subnet is a range of IP addresses within a VPC (e.g. `10.0.1.0/24`) that lives in a single Availability Zone. Public subnets have a route to an internet gateway; private subnets do not. Subnets are the scope where you apply network ACLs (stateless firewalls) and route tables. An instance in a public subnet still needs a public IP and a security group rule to be reachable from the internet.

### CloudFront
CloudFront is the AWS content delivery network (CDN) that caches content at edge locations (globally distributed datacenters) for low-latency delivery. It serves both static content (S3 objects) and dynamic content (custom origins behind ALB). CloudFront integrates with AWS Shield for DDoS protection, Lambda@Edge for custom logic at the edge, and WAF for request filtering.

## Source

- AWS documentation: [docs.aws.amazon.com](https://docs.aws.amazon.com/)
- AWS Well-Architected Framework: [docs.aws.amazon.com/wellarchitected](https://docs.aws.amazon.com/wellarchitected/)




