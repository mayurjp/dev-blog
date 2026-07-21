---
layout: post
title: "Networking Key Terms: TCP, DNS, TLS, and the Protocol Vocabulary Behind Every Post"
description: "A standalone glossary of the networking terms used across this blog's infrastructure, protocol, and performance posts — TCP/IP, DNS, TLS, load balancers, CDNs, QUIC, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: networking
order: 99
tags: [networking, glossary, tcp-ip, dns, tls]
---

**TL;DR:** This is the reference page for the networking vocabulary used throughout this blog's protocol, infrastructure, and performance posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it deeper.

The posts in this domain assume you already know what a TCP handshake or a DNS resolver is. If a term lands cold, find it here first. The list is grouped by theme, not alphabetically, because these concepts build on each other.

## Transport & addressing

### TCP (Transmission Control Protocol)
The reliable transport protocol underneath HTTP, SMTP, and most internet traffic. It guarantees in-order, lossless delivery by sequencing packets, acknowledging receipt, and retransmitting lost segments — at the cost of latency from round-trip overhead.

### Three-way handshake
The TCP connection setup: client sends `SYN`, server replies `SYN-ACK`, client finishes with `ACK`. This establishes sequence numbers for both sides before any data flows. The handshake costs one full round-trip before the first byte of HTTP can be sent.

### UDP (User Datagram Protocol)
A connectionless transport that sends datagrams without delivery guarantees. DNS uses UDP for queries (fast, stateless), while TCP is used for zone transfers (reliable, stateful). QUIC builds reliability on top of UDP to avoid TCP's head-of-line blocking.

### IP address (IPv4 / IPv6)
The network-layer address that identifies a host on the internet. IPv4 uses 32-bit addresses (4.3 billion total), exhausted in 2011; IPv6 uses 128-bit addresses. NAT (Network Address Translation) extended IPv4's life by mapping many private IPs to one public IP.

### CIDR notation
The format `192.168.1.0/24` where the `/24` means "the first 24 bits are the network prefix." CIDR replaced classful addressing and allows flexible subnet sizing. A `/24` has 256 addresses; a `/16` has 65,536.

### MTU (Maximum Transmission Unit)
The largest packet size a network link can transmit without fragmentation. Ethernet's standard MTU is 1500 bytes; Jumbo Frames in data centers use 9000 bytes. Packets exceeding the MTU are fragmented (or dropped if the Don't Fragment bit is set).

## DNS

### DNS resolution
The process of translating a domain name to an IP address. The client asks a recursive resolver, which walks the hierarchy: root → TLD → authoritative server. Results are cached at every level to avoid repeated lookups.

### DNS TTL (Time To Live)
The number of seconds a DNS record should be cached before re-querying. A TTL of 300 means resolvers cache the answer for 5 minutes. Lower TTLs enable faster DNS changes but increase query load; higher TTLs reduce load but slow propagation.

### DNS record types
**A** maps a name to an IPv4 address; **AAAA** to IPv6; **CNAME** aliases one name to another; **MX** directs email; **TXT** carries arbitrary text (used for SPF, DKIM, domain verification). Choosing the wrong type (e.g., CNAME at the zone apex) causes failures.

### Recursive vs authoritative DNS
A recursive resolver (e.g., 8.8.8.8) queries the DNS hierarchy on behalf of the client and caches results. An authoritative server (e.g., your DNS provider) holds the actual records for a domain. Misconfiguring either causes resolution failures that are hard to diagnose because the error manifests as "site unreachable."

## TLS & encryption

### TLS (Transport Layer Security)
The encryption protocol that secures HTTPS. It provides confidentiality (encrypted data), integrity (tamper detection), and authentication (server identity via certificates). TLS 1.3 is the current standard, removing insecure cipher suites and reducing the handshake to one round-trip.

### Certificate chain
A server's certificate is signed by an intermediate CA, which is signed by a root CA. Clients verify the entire chain up to a trusted root. If the server omits the intermediate certificate, some clients will reject the connection — even though the server has a "valid" certificate.

### Let's Encrypt / ACME
Let's Encrypt provides free TLS certificates via the ACME protocol, which automates domain validation and certificate issuance. Certificates expire after 90 days, so auto-renewal (cert-manager, acme.sh) is mandatory. Manual renewal is a guaranteed outage waiting to happen.

### Certificate pinning
Hardcoding the expected certificate or public key in the client so it rejects connections even if a CA is compromised. HPKP (HTTP Public Key Pinning) was the browser standard but is now deprecated in favor of Expect-CT and CT (Certificate Transparency) logs.

### Perfect Forward Secrecy (PFS)
A property where each TLS session uses a unique ephemeral key pair, so compromising one session's key doesn't compromise past or future sessions. ECDHE (Elliptic Curve Diffie-Hellman Ephemeral) provides PFS; RSA key exchange does not. Modern TLS configs require ECDHE.

## Load balancing & routing

### Load balancer
A device or service that distributes incoming traffic across multiple backend servers. L4 load balancers (TCP/UDP level) are faster; L7 load balancers (HTTP level) can route by path, header, or cookie. Health checks ensure traffic only goes to healthy backends.

### Round-robin vs least connections
Round-robin cycles through servers sequentially — simple but ignores server load. Least connections sends traffic to the server with fewest active connections — better for uneven workloads but requires the load balancer to track connection state.

### Consistent hashing
A hashing technique that maps keys to servers with minimal redistribution when servers are added or removed. Used for sticky sessions (same client → same backend) and distributed caches (same key → same cache node). Consistent hashing avoids the thundering herd when a node joins or leaves.

### SSL termination
Handling the TLS handshake at the load balancer and forwarding decrypted traffic to backends. This concentrates certificate management and reduces backend CPU cost. The tradeoff: traffic between the load balancer and backends is unencrypted unless you add a second TLS layer (mTLS).

### Health checks
Active probes (HTTP 200 on `/healthz`) or passive observations (connection failures) that tell the load balancer which backends are healthy. A backend that fails health checks is removed from the pool until it recovers. Without health checks, the load balancer sends traffic to dead servers.

## CDN & caching

### CDN (Content Delivery Network)
A distributed network of edge servers that cache and serve static assets (images, CSS, JS) from locations geographically close to users. Reduces latency (Tokyo user → Tokyo edge, not US origin) and offloads bandwidth from the origin server.

### Cache invalidation
The process of removing stale content from CDN edge servers when the origin changes. Purge APIs, cache-busting query strings (`?v=2`), and content-hashed filenames (`app.a1b2c3.js`) are common patterns. "There are two hard things in computer science: cache invalidation and naming things."

### Edge caching vs origin caching
Edge caching (CDN) stores content at distributed edge locations; origin caching (Redis, Varnish) stores content at the application server. A well-configured CDN hits the edge 95%+ of the time, and the origin cache catches the remaining 5%. Without both layers, your origin handles every request.

## Advanced protocols

### HTTP/2
The binary, multiplexed successor to HTTP/1.1. Multiple requests share a single TCP connection (no head-of-line blocking at the HTTP layer), headers are compressed (HPACK), and servers can push responses proactively. Browser support is universal since 2016.

### HTTP/3 / QUIC
HTTP/3 runs over QUIC (built on UDP) instead of TCP. QUIC provides built-in encryption (TLS 1.3 is mandatory), 0-RTT connection establishment, and eliminates TCP's head-of-line blocking (one lost packet doesn't block unrelated streams). Google serves 30%+ of traffic over HTTP/3.

### WebSocket
A protocol that upgrades an HTTP connection to a full-duplex, persistent TCP connection. Used for real-time features (chat, live feeds, gaming) where the overhead of repeated HTTP requests or Server-Sent Events is too high. The upgrade handshake starts as a normal HTTP request with `Upgrade: websocket`.

### gRPC
A high-performance RPC framework built on HTTP/2 and Protocol Buffers. It provides strongly-typed service definitions, bidirectional streaming, and code generation. gRPC is faster than JSON-over-HTTP for internal service communication but harder to debug (binary protocol, no browser-native support without grpc-web).

## Source

Terms verified against the TCP specification (RFC 793), TLS 1.3 (RFC 8446), DNS (RFC 1035/1034), HTTP/2 (RFC 7540), HTTP/3 (RFC 9114), and real infrastructure patterns from nginx, HAProxy, Cloudflare, and Let's Encrypt documentation.
