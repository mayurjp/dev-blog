---
layout: post
title: "Azure Key Terms: Regions, ARM, and the Platform Vocabulary Behind Every Post"
description: "A standalone glossary of Azure terms used across this blog's cloud posts — regions, resource groups, ARM, RBAC, App Service plans, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: azure
order: 99
tags: [azure, glossary, cloud, fundamentals]
---

**TL;DR:** This is the vocabulary reference for every Azure post on this blog — read it once, then skip back here whenever a term like *ARM*, *NSG*, or *Availability Zone* shows up.

> **In plain English (30 sec):** Code you already write — Map, function, API call, just bigger.

## Organization

### Region
An Azure region is a set of one or more datacenters deployed within a latency-defined perimeter connected through a dedicated regional low-latency network (e.g. East US, West Europe, Southeast Asia). Each region is paired with another region in the same geography for geo-redundancy. Not all services are available in all regions; you must check regional availability before provisioning.

### Availability Zone
An availability zone is a physically separate datacenter within an Azure region, with independent power, cooling, and networking. A region that supports zones has at least three zones. Zonal services (VMs, managed disks, IP addresses) are pinned to one zone and must be deployed in at least two zones for high availability. Zone-redundant services (Load Balancer, App Service on Premium) replicate across zones automatically.

### Resource Group
A resource group is a logical container into which Azure resources are deployed and managed. Every resource belongs to exactly one resource group. Deleting a resource group deletes all resources inside it. Resource group location (e.g. "East US") determines where the metadata about the group is stored, not where the resources run — each resource can have its own location.

### Azure Resource Manager (ARM)
ARM is the control-plane API that handles all provisioning, management, and RBAC enforcement for every Azure service. Every CLI command, every Terraform `azurerm_*` resource, every `PUT` to `management.azure.com` reaches ARM, which validates the request, checks RBAC permissions, and forwards the intent to the target resource provider (e.g. `Microsoft.Compute` for VMs, `Microsoft.Web` for App Service). ARM templates are JSON files that declaratively describe the desired resource state.

### Azure Policy
Azure Policy is a governance system that evaluates ARM requests against a set of rules (e.g. "all SQL servers must have firewall rules restricting public access", "all VMs must use a specific SKU") and can deny, audit, or remediate non-compliant resources. It runs at the ARM level, so it enforces rules at provision time and during periodic compliance scans.

### RBAC (Role-Based Access Control)
RBAC is the authorization system that determines who can perform which operations on which resources. Every ARM request passes the caller's Azure AD identity through a permission check against the role assignments on the target resource's scope (management group → subscription → resource group → resource). Built-in roles include Owner, Contributor, Reader, and service-specific roles (e.g. SQL DB Contributor, Key Vault Secrets Officer).

## Compute

### App Service
Azure App Service is a PaaS offering that runs web apps, REST APIs, and mobile backends on managed Windows or Linux workers. The platform handles OS patches, load balancing, and auto-scaling. Each app runs inside a sandboxed worker and is grouped under an App Service Plan that defines the compute SKU and scaling limits. Deployment slots enable zero-downtime deployments.

### App Service Plan (ASP)
An App Service Plan defines the set of compute resources (CPU, memory, storage) that one or more apps run on. All apps in the same plan share the same worker instances. The plan's pricing tier (F1, B1, S1, P1, etc.) determines the hardware SKU, max instance count for scaling, and features (custom domains, staging slots, private endpoints).

### Azure Functions
Azure Functions is a serverless compute service that runs small pieces of code (functions) in response to triggers (HTTP requests, queue messages, blob uploads, timers). Functions scale from zero to thousands of instances based on demand and charge per execution-second + memory consumption. The Consumption plan scales automatically but has a cold-start penalty; the Premium plan keeps warm instances.

### AKS (Azure Kubernetes Service)
AKS is a managed Kubernetes service that provisions and operates an entire Kubernetes control plane (API server, etcd, scheduler) for you. You provide the worker nodes (VMs) and specify node pools with different VM SKUs. AKS integrates with Azure AD for authentication, Azure Policy for governance, and Azure Monitor for observability.

## Storage

### Blob Storage
Azure Blob Storage is the object storage service for unstructured data (images, videos, logs, backups). Data is stored as blobs in containers. Each blob has a URL and an access tier (hot, cool, archive) that trades storage cost for retrieval latency. Blob is S3-compatible via the Azure Blob Filesystem driver (ABFS) and can be mounted as a virtual filesystem by Data Lake Storage Gen2.

### Azure SQL Database
Azure SQL Database is a fully managed relational database service built on SQL Server. It handles backups (point-in-time restore, geo-redundant), patching, and high availability transparently. The DTU or vCore purchasing model determines compute and storage, and the service tier (Basic, Standard, Premium) determines SLA and DR capabilities.

### Cosmos DB
Azure Cosmos DB is a globally distributed NoSQL database service with multi-master replication and five consistency levels (strong, bounded staleness, session, consistent prefix, eventual). It supports multiple APIs (SQL, MongoDB, Cassandra, Gremlin, Table) and charges per RU/s (Request Units per second), a normalized measure of compute throughput.

## Networking

### Virtual Network (VNet)
A VNet is a private IP address space within Azure (e.g. `10.0.0.0/16`) that isolates Azure resources from each other and from the internet. Subnets carve the VNet into segments; resources in the same VNet can communicate via private IP. VNet peering connects VNets across regions, and VPN Gateway or ExpressRoute connects a VNet to on-premises networks.

### Network Security Group (NSG)
An NSG is a stateful firewall that filters traffic at the subnet or NIC level using inbound and outbound security rules. Each rule specifies priority, source/destination IP range, port, and protocol (TCP/UDP/Any). The default rules allow all outbound and VNet-internal traffic and deny all inbound internet traffic. The most common NSG bug is a missing inbound rule that silently drops legitimate traffic.

### Load Balancer
Azure Load Balancer is a layer-4 (TCP/UDP) load balancer that distributes inbound traffic across a set of backend pool members (VMs, VMSS instances) using a hash-based distribution algorithm. It operates at the VNet level and does not terminate HTTP or TLS. The Standard SKU supports availability-zone-aware load balancing, outbound SNAT, and HA ports.

### Application Gateway
Application Gateway is a layer-7 (HTTP/HTTPS) load balancer that terminates TLS, routes requests based on URL path/hostname, rewrites headers, and functions as a Web Application Firewall (WAF). It is the right choice for routing HTTP traffic to multiple backend services (e.g. `/api/*` → App Service A, `/web/*` → App Service B) behind a single public endpoint.

## Source

- Azure documentation: [learn.microsoft.com/en-us/azure](https://learn.microsoft.com/en-us/azure/)
- Azure architecture center: [learn.microsoft.com/en-us/azure/architecture](https://learn.microsoft.com/en-us/azure/architecture/)




