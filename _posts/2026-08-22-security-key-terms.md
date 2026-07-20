---
layout: post
title: "Security Key Terms: JWT, JWKS, mTLS and the Auth Vocabulary Behind Every Post"
description: "A standalone glossary of the security terms used across this blog's authentication, identity, and API-security posts — JWT, JWKS, OAuth2, OIDC, SAML, mTLS, RBAC/ABAC, Zero Trust, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: security
order: 99
tags: [security, glossary, authentication, authorization, identity]
---

**TL;DR:** This is the reference page for the security vocabulary used throughout this blog's auth, identity, and API-security posts. Every term below is defined standalone — no prior post required — and each points to the post that takes it deeper.

The posts in this domain assume you already know what a JWT or an OAuth2 scope is. If a term lands cold, find it here first. The list is grouped by theme, not alphabetically, because these concepts build on each other.

## Authentication & tokens

### Password hashing
Storing a password means storing a slow, salted, one-way digest (bcrypt, Argon2id, or PBKDF2), never the plaintext. The "string" in the database carries the algorithm, per-password salt, and cost parameters so the same password hashes differently every time and verification needs the original password, not a reversed hash.

### Session-based authentication
The server creates a session after login and hands the browser a cookie holding an opaque session key, not your identity. The key maps to server-side session state; logging out or theft of the key is contained by server-side revocation, unlike a stateless token.

### JWT (JSON Web Token)
A compact, URL-safe token with three base64url parts — header, payload, claims, and a signature. The signature (HMAC with a shared secret, or RSA/ECDSA with a private key) is what lets a verifier trust the payload without calling the issuer on every request.

### JWT claims
Standard fields inside the payload: `sub` (who), `iss` (who issued it), `aud` (who it's for), `exp` (expiry), `iat` (issued-at). A verifier must check all of them — an expired or wrong-`aud` token is rejected even if the signature is valid.

### JWS (JSON Web Signature)
The signing structure behind a JWT — a protected header declaring the algorithm (`HS256`, `RS256`, `ES256`), the payload, and the signature. The algorithm field is exactly why "alg-confusion" attacks work if a verifier trusts a token's own `alg` header instead of pinning an expected algorithm.

### JWKS (JSON Web Key Set)
A published set of public keys (one `JWK` each) at a well-known `/.well-known/jwks.json` endpoint, used so a verifier can check a token's signature without sharing a secret. Each key carries a `kid` (key ID) that the token's header references, which is what makes key rotation possible without breaking already-issued tokens.

### JWKS key rotation
Because tokens are verified against the `kid` in the header, an issuer can publish a new key in its JWKS while old tokens still validate against the old `kid`. A verifier caches the JWKS and matches `kid` → public key; rotation only breaks if the old key is deleted before its tokens expire.

## Federation & SSO

### OAuth2
A delegation framework where a user authorizes a *client* (app) to act on their behalf at a *resource server*, mediated by an *authorization server*. The core grant here is the authorization-code flow, which returns a short-lived access token plus a refresh token.

### PKCE (Proof Key for Code Exchange)
A extension for public clients (SPAs, mobile) that can't keep a secret. The client sends a `code_challenge` (hash of a random `code_verifier`) with the auth request and must present the original `code_verifier` at token exchange — so an intercepted authorization code is useless without the verifier.

### Authorization server / resource server / client / scope
The four OAuth2 roles: the authorization server issues tokens, the resource server accepts them, the client is the app acting for the user, and a *scope* bounds what the token can access (e.g. `read:profile`). Over-broad scopes are the usual cause of token abuse.

### OpenID Connect (OIDC)
An identity layer on top of OAuth2 that adds an `id_token` (a JWT) carrying the user's identity claims, plus a `userinfo` endpoint. OAuth2 alone tells you "this token is valid"; OIDC tells you "this is *who* logged in" — which is why OIDC, not raw OAuth2, is used for login.

### Refresh tokens & rotation
A refresh token is a long-lived credential exchanged for new access tokens. Rotation issues a new refresh token on each use and revokes the old one; if a stolen token is ever reused, the reuse is detected and the whole chain is invalidated.

### SAML (Security Assertion Markup Language)
An XML-based SSO standard where an Identity Provider (IdP) sends a signed `<saml:Assertion>` to a Service Provider (SP) proving the user's identity. Verifying it is harder than a JWT because it relies on XML signature validation, which has a long history of wrapping and comment attacks.

### MFA / TOTP / WebAuthn / passkeys
Multi-factor auth combines something you know (password) with something you have. TOTP is a time-based code from a shared secret; WebAuthn/passkeys use a hardware-backed keypair where the private key never leaves the device and a "cloned" key fails because signing requires the original authenticator.

## Authorization

### RBAC (Role-Based Access Control)
Permissions are attached to *roles*, and users get roles — so "can delete" is decided by whether your role includes that permission. It scales by grouping, but can't express "only if the resource belongs to you."

### ABAC (Attribute-Based Access Control)
Decisions use attributes of the user, resource, and environment (department, time, sensitivity) evaluated against a policy. It handles "owner-only" and "business-hours-only" rules that RBAC can't, at the cost of a policy engine.

### Broken access control / BOLA / BFLA / IDOR
The OWASP #1 class of bugs. BOLA (Broken Object Level Authorization) is accessing another user's object by guessing its ID; BFLA (Function Level) is reaching an admin endpoint; IDOR (Insecure Direct Object Reference) is the same flaw by another name. All are authorization checks missing or trusting client-supplied IDs.

### OWASP API Top 10
The API-specific risk list (BOLA, broken auth, excessive data exposure, unrestricted resource consumption, etc.). Its #1 is BOLA because APIs expose object IDs directly and the server often forgets to check ownership.

### API keys
A long-lived shared secret identifying the *caller*, not the *user*. Shown once at creation, stored hashed (like a password), and scoped — but they're not proof of a human, so they belong at the service-to-service or quota layer, not as user auth.

## Transport, identity & supply chain

### mTLS (mutual TLS)
Both client and server present X.509 certificates and verify each other, so a service proves its identity cryptographically without a shared password. The certificate (not an IP or token) becomes the identity — the foundation for service-mesh and zero-trust networking.

### X.509 certificate / CA
The certificate binds a public key to an identity, signed by a Certificate Authority (CA) the verifier trusts. Rotation replaces the cert/key pair; the CA's trust anchor is what makes the whole chain valid.

### Zero Trust / Identity-Aware Proxy / BeyondCorp
The model that drops the "internal network = trusted" assumption. An Identity-Aware Proxy re-checks the user's identity and device posture on *every* request rather than once at the perimeter, so network location no longer grants access.

### Supply-chain signing / Cosign / keyless / Rekor / Fulcio / SBOM
Proving an artifact (container image) wasn't tampered with. Cosign signs images; keyless signing uses a short-lived Fulcio cert issued from an OIDC identity (no long-lived private key to steal); Rekor is the transparency log that records every signature; an SBOM lists the software ingredients for vulnerability matching.

### Pod Security Standards / Admission Controller
PSS defines three policies — Privileged, Baseline, Restricted — for what a Kubernetes pod may do. An admission controller is the webhook that intercepts pod creation and rejects ones violating the policy, closing the gap between "recommended" and "enforced."

### Container hardening: non-root, capabilities, seccomp
A container should drop Linux *capabilities* (privileged subsets of root) to the minimum, run as a non-root UID, and apply a *seccomp* profile that blocks syscalls the app doesn't need — shrinking the kernel surface a container escape could exploit.

### Network security fundamentals
The base layer: segmentation, firewall rules, and least-exposure design that keeps trust boundaries explicit. Everything above (mTLS, Zero Trust) assumes you've thought about which traffic is even allowed to flow.

### VPC Service Controls / Org Policy
GCP's perimeter that restricts which networks and identities can reach a service (e.g. Cloud Storage, BigQuery), enforced at the platform layer rather than per-request. It limits data exfiltration even if credentials leak.

### CI/CD security: SHA pinning, least permission, pwn-requests
Hardening pipelines so a compromised dependency or workflow can't escalate. SHA-pinning pins action versions to a commit hash (not a mutable tag), `permissions:` grants least privilege, and "pwn-requests" (pull-request approval) stops untrusted forks from running secrets.

## Threat modeling

### Threat modeling / STRIDE / DREAD / attack trees
The practice of finding what can go wrong *before* building. STRIDE categorizes threats by element type (Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation) — the category depends on the diagram element, not a fixed checklist; DREAD and attack trees are alternative scoring/structuring methods.

---

This page is a reference, not a lesson — each term above links to the post that takes it from definition to mechanism. If you read a post and hit an unfamiliar word, it should now resolve here.
