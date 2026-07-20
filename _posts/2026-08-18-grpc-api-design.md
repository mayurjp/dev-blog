---
layout: post
title: "gRPC API Design: evolving protobuf schemas without breaking wire compatibility"
description: "Why protobuf field numbers are permanent, how the wire format stays backward-compatible, and the rules for safe schema evolution."
date: 2026-08-18 09:00:00 +0530
categories: api-design
order: 5
tags: [api-design, grpc, protobuf, schema-evolution, wire-format]
---

**TL;DR:** How do you change a gRPC/protobuf message without breaking old clients? Never reuse a field number, never change a field's type tag, and treat every field as add/remove-only — the wire format keys on numbers, not names.

**Real repo:** [grpc/grpc-go](https://github.com/grpc/grpc-go) — its `encoding/proto` codec marshals/unmarshals messages via `google.golang.org/protobuf/proto`, the canonical wire-format implementation.

## 1. The Engineering Problem

In JSON APIs, you can rename a field or add one and old clients usually survive (they ignore unknown keys). Protobuf is stricter in a useful way: the on-the-wire encoding is `(field_number << 3 | wire_type)` tag + value. Names exist only in the `.proto` for codegen. That gives you fantastic forward/backward compatibility *if* you follow the rules — and catastrophic breakage if you don't. The central rule: **field numbers are permanent.**

## 2. The Technical Solution

The grpc-go proto codec delegates to the protobuf library for marshaling, relying on the wire format's tolerance for unknown fields:

```mermaid
flowchart LR
  A[proto.Message] --> B[codecV2.Marshal]
  B --> C[proto.Size then Marshal]
  C --> D[Wire bytes: tag+value]
  D --> E[Old client skips unknown tags]
  classDef msg fill:#2d6cdf,stroke:#1b3a8f,color:#fff;
  classDef wire fill:#16a34a,stroke:#0f7a37,color:#fff;
  classDef old fill:#a855f7,stroke:#6b21a8,color:#fff;
  class A msg;
  class B,C,D wire;
  class E old;
```

Core truths:

- Wire identity is the *field number*, not the name — renaming a field is safe; renumbering is not.
- Unknown field numbers are silently skipped by old decoders (forward compat).
- A removed field's number must be reserved, never reused — reusing it reinterprets old bytes.

## 3. The clean example

```go
// encoding/proto/proto.go (grpc-go) — the default gRPC codec
func (c *codecV2) Marshal(v any) (data mem.BufferSlice, err error) {
    vv := messageV2Of(v)
    size := proto.Size(vv)                       // cached size
    marshalOptions := proto.MarshalOptions{UseCachedSize: true}
    // ... writes tag+value wire bytes
}

func (c *codecV2) Unmarshal(data mem.BufferSlice, v any) (err error) {
    return proto.Unmarshal(buf.ReadOnlyData(), vv)  // skips unknown tags
}
```

Safe evolution of a message:

```proto
message Article {
  reserved 2, 3;                 // old fields we deleted — never reuse
  string id    = 1;
  // string title = 2;  // removed -> reserved
  int32 views  = 4;              // newly added: old clients ignore it
}
```

Adding field `4` is safe: old clients skip tag `4`, new clients get a zero value from old servers.

## 4. Production reality

The codec shows that gRPC trusts protobuf's `Marshal`/`Unmarshal` to honor compatibility — the codec itself does no version negotiation:

```go
// grpc-go/encoding/proto/proto.go
const Name = "proto"
func init() { encoding.RegisterCodecV2(&codecV2{}) }  // default codec for gRPC

func (c *codecV2) Unmarshal(data mem.BufferSlice, v any) (err error) {
    // TODO: Upgrade proto.Unmarshal to support mem.BufferSlice...
    return proto.Unmarshal(buf.ReadOnlyData(), vv)    // unknown tags ignored
}
```

What this teaches: compatibility is enforced by the *schema discipline*, not the codec. The codec just serializes; you must reserve numbers and never change a field's wire type.

**Stale fact (API Design):** protobuf field numbers are permanent — reusing them breaks wire compatibility. Unlike JSON, where names are the contract, in protobuf the number is, and old bytes will be misread if you recycle it.

## 5. Review checklist

- Are deleted field numbers listed under `reserved`?
- Did you change a field's type without changing its number (allowed only for compatible wire types)?
- Are new fields added with fresh numbers, not reused ones?
- Do service method signatures avoid removing/reordering request fields?

## 6. FAQ

**Q: Can I rename a field safely?** Yes — names aren't on the wire; only the number matters.

**Q: What if I reuse a field number?** Old clients will parse new data as the old type — silent corruption.

**Q: Are enums safe to evolve?** Add new values freely; unknown values become the zero value on old clients.

**Q: How do I version a service?** Prefer evolving messages in place; add new services (`ArticleV2`) only for breaking method changes.

**Q: Does gRPC do content negotiation?** No — the proto codec is fixed; compatibility comes from schema rules.

## Source

- **Concept:** protobuf schema evolution / field numbering
- **Domain:** api-design
- **Repo:** grpc/grpc-go → [encoding/proto/proto.go](https://github.com/grpc/grpc-go/blob/master/encoding/proto/proto.go) — default protobuf codec marshaling via google.golang.org/protobuf.
