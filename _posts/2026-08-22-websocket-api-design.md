---
layout: post
title: "WebSocket API Design: managing connection lifecycle, heartbeat, and horizontal scaling"
description: "How to design a WebSocket API around the upgrade handshake, keep-alives, and stateless horizontal scaling with a pub/sub backplane."
date: 2026-08-22 09:00:00 +0530
categories: api-design
order: 7
tags: [api-design, websocket, heartbeat, scaling, connection-lifecycle]
---

**TL;DR:** How do you keep a WebSocket API reliable at scale? Design around the upgrade handshake, send application-level heartbeats (ping/pong) to detect dead connections, and put connection state behind a shared pub/sub backplane so any node can serve any socket.

> **In plain English (30 sec):** Vertical = bigger machine, Horizontal = more machines.

**Real repo:** [Fastify/fastify](https://github.com/Fastify/fastify) — its schema-first validation/serialization model and WebSocket support illustrate how a request framework handles upgrade, routing, and per-connection lifecycle hooks.

## 1. The Engineering Problem

A WebSocket is not a request — it is a long-lived, stateful duplex channel. That breaks the stateless assumptions REST relies on. Three problems appear immediately:

- **Lifecycle:** the HTTP `Upgrade` handshake must succeed before the socket exists; then you manage open/message/close/error.
- **Dead connections:** a dropped TCP connection (laptop sleep, proxy timeout) can look alive to the server. You need heartbeats.
- **Scaling:** with N app nodes, a message published on node A must reach a socket connected to node B.

## 2. The Technical Solution

The connection lifecycle is a handshake followed by a heartbeat loop. Application-level ping/pong (not just TCP keepalive) proves the *peer* is responsive within a deadline:

```mermaid
sequenceDiagram
  participant C as Client
  participant N as Node A (WS)
  participant P as Pub/Sub Backplane
  participant B as Node B (WS)
  C->>N: GET /stream  Upgrade: websocket
  N-->>C: 101 Switching Protocols
  Note over C,N: connection open
  N->>C: ping (app-level)
  C-->>N: pong
  P->>B: publish event:x
  B->>C: forward event:x (via Node A? only if socket here)
  Note over N: if socket on Node B, B forwards
  C->>N: close
  N-->>C: 1000 Normal Closure
  classDef hs fill:#2d6cdf,stroke:#1b3a8f,color:#fff;
  classDef hb fill:#16a34a,stroke:#0f7a37,color:#fff;
  classDef pub fill:#a855f7,stroke:#6b21a8,color:#fff;
  class C,N hs;
  class C,N hb;
  class P,B pub;
```

Core truths:

- The `101 Switching Protocols` response is the only "request" in a WebSocket's life; everything after is framed messages.
- App-level ping/pong (RFC 6455) detects half-open connections that TCP keepalive misses.
- Horizontal scaling requires a backplane (Redis/NATS) — sockets are local to a node, events are not.

## 3. The clean example

```ts
// Fastify-style WebSocket route with lifecycle + heartbeat
fastify.get('/stream', { websocket: true }, (conn, req) => {
  const socket = conn.socket;
  let alive = true;
  const hb = setInterval(() => {
    if (!alive) { socket.terminate(); clearInterval(hb); return; }
    alive = false;
    socket.ping();                  // app-level heartbeat
  }, 30000);

  socket.on('pong', () => { alive = true; });
  socket.on('message', (m) => pubsub.subscribe(m.toString(), socket));
  socket.on('close', () => clearInterval(hb));
});

// scaling: publish through a backplane, not in-process
pubsub.on('event:x', (payload) => broadcastToLocalSockets(payload));
```

## 4. Production reality

The schema-first discipline Fastify applies to HTTP requests is the same discipline a WebSocket API needs for its *message* contract — validate the JSON frames, not just the upgrade. The upgrade itself is ordinary HTTP until `101`:

```
// lifecycle states a WebSocket API must handle explicitly
GET /stream  Upgrade: websocket   -> 101 Switching Protocols   // handshake
on('message')                       // inbound frames
socket.ping() / on('pong')          // heartbeat (30-60s typical)
on('close', code)                   // 1000 normal, 1001 going away, 1011 server error
// scaling: socket lives on ONE node; route publishes via shared backplane
```

What this teaches: treat each socket as ephemeral and re-establishable. Clients must handle reconnect with backoff; servers must not assume a socket outlives a deploy.

**Stale fact (API Design):** WebSockets struggle behind corporate proxies — SSE/long-polling fallback is often required. Many enterprise proxies buffer or kill long-lived upgrades, so a robust real-time API needs a fallback transport.

## 5. Review checklist

- Is there an application-level ping/pong heartbeat with a deadline?
- Are dead sockets terminated (not just left dangling)?
- Does a publish reach sockets on *other* nodes via a backplane?
- Does the client implement reconnect-with-backoff and resume?

## 6. FAQ

**Q: TCP keepalive isn't enough?** No — it detects dead links slowly; app-level ping/pong is faster and proves the peer.

**Q: How do I scale WebSockets?** Put a pub/sub backplane behind the nodes; each node forwards only its local sockets.

**Q: When should I use SSE instead?** For server→client only streams; SSE traverses proxies more easily than WS.

**Q: What close code should I send?** `1000` normal, `1011` for unexpected server error, `1001` when shutting down.

**Q: Are WebSocket messages schema-validated?** They should be — validate each JSON frame like an HTTP body.

## Source

- **Concept:** WebSocket lifecycle / heartbeat / scaling
- **Domain:** api-design
- **Repo:** Fastify/fastify → [lib/validation.js](https://github.com/Fastify/fastify/blob/main/lib/validation.js) — schema-first validation/serialization model applied uniformly (mirror for WS message frames).




