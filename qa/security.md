---
layout: page
title: "Security Interview Questions: 78 Real-World Q&A from Production Manifests"
description: "78 interview-ready Security questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/security/
---

Bite-sized, standalone interview questions and answers for Security. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">78</span></strong> questions shown. Filter by keyword or difficulty below.</p>

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

## Topic: JWKS discovery and key rotation (Order 0)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What problem does JWKS discovery solve that baking keys into verifier config does not? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Baking keys into config creates a rotation nightmare — rotating a compromised or aging signing key means redeploying every independent verifier simultaneously, which is impossible once there are more than a handful. JWKS discovery lets verifiers fetch keys from a well-known endpoint (`/.well-known/jwks.json`) on demand, so the issuer can rotate keys by adding a new one to the published set without touching any verifier's configuration.

<p class="qa-link">[Full post →]({{ '/security/jwks-discovery-and-key-rotation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is JWKS rotation an insert, not a replacement, and what happens if you delete the old key too early? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Hydra's `AddKeySet` only inserts new rows — the old key's public half stays in the published JWKS so tokens signed with the old `kid` still verify. If you delete the old key before every token it signed has expired, those live tokens immediately fail verification even though they're still within their validity window. Rotation is a two-step, time-boxed process: add first, delete later only after all tokens signed by the old key have naturally expired.

<p class="qa-link">[Full post →]({{ '/security/jwks-discovery-and-key-rotation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the RS256→HS256 key-confusion vulnerability, and how does a verifier prevent it? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
An attacker crafts a token with `alg: HS256` in the header, targeting a verifier that expects RS256. If the verifier naively uses whatever `alg` the token claims and reuses its RSA public key as an HMAC secret, the attacker can forge a validly-signed token because public keys are public by definition. Prevention: the verifier must pin the expected algorithm server-side and never trust the token's own `alg` header — only verify using the algorithm the verifier was configured to use.

<p class="qa-link">[Full post →]({{ '/security/jwks-discovery-and-key-rotation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does `hydra delete jwk <set>` destroy more than intended for key rotation cleanup? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The CLI's `hydra delete jwk` command calls `DeleteJsonWebKeySet`, which drops the entire key set including the current signing key — not just the old retired one. This would immediately invalidate every token signed by that set. Pruning a single old `kid` requires the admin REST endpoint (`DELETE /admin/keys/{set}/{kid}`), which the CLI does not expose.

<p class="qa-link">[Full post →]({{ '/security/jwks-discovery-and-key-rotation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does Hydra determine which key signs a new token versus which keys are published for verification? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Signing uses only the newest key — `GetOrGenerateKeys` reads the `ORDER BY created_at DESC` result and picks the first row. Verification publishes every key in the set — `GetKeySet` returns all rows for that `sid`, and the handler flattens them into one JWKS array. A key can be "current signer" and "verification-only" at the same time, and mid-rotation both coexist in the published set simultaneously.

<p class="qa-link">[Full post →]({{ '/security/jwks-discovery-and-key-rotation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why must a verifier match tokens by `kid` rather than assuming a single key at a time? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
During rotation, two or more keys are simultaneously valid — the old key for verifying pre-rotation tokens and the new key for signing post-rotation tokens. A verifier that assumes "one key at a time" breaks the first time it points at a real issuer mid-rotation. The `kid` in the token's header tells the verifier exactly which public key from the JWKS set to use, handling the multi-key reality cleanly.

---

<p class="qa-link">[Full post →]({{ '/security/jwks-discovery-and-key-rotation/' | relative_url }})</p>
  </div>
</div>

## Topic: Password-based auth & credential storage (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is a fast hash like SHA-256 unsafe for password storage but appropriate for API key storage? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A fast cryptographic hash is designed for throughput — a GPU can compute billions of SHA-256 hashes per second, making offline brute-force against a leaked hash table cheap. Passwords are low-entropy human-chosen strings vulnerable to dictionary attacks, so a slow KDF (PBKDF2, Argon2) makes each guess expensive. API keys are machine-generated with full cryptographic randomness, so dictionary attacks don't apply and the performance cost of a slow KDF buys nothing.

<p class="qa-link">[Full post →]({{ '/security/password-hashing-and-credential-storage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the purpose of the salt in password hashing, and why doesn't it need to be secret? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The salt ensures two users with the same password produce completely different stored hashes, making rainbow tables (precomputed hash lookups) useless. It doesn't need to be secret because its job is uniqueness, not secrecy — it's stored right alongside the hash. Even an attacker who knows the salt still has to brute-force each password individually using the expensive per-password KDF.

<p class="qa-link">[Full post →]({{ '/security/password-hashing-and-credential-storage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does `SuccessRehashNeeded` mean in ASP.NET Core's `PasswordHasher`, and when is it returned? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It means the password verified correctly but was hashed with weaker settings than currently configured — a lower iteration count or an older PRF like HMAC-SHA1 instead of SHA512. This is the only point in a password's lifecycle where the server has the plaintext (the user just typed it), so the caller should silently re-hash with current settings on this login. It's an upgrade mechanism, not a failure.

<p class="qa-link">[Full post →]({{ '/security/password-hashing-and-credential-storage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is `CryptographicOperations.FixedTimeEquals` used instead of `==` for hash comparison? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A naive byte-by-byte `==` that returns early on the first mismatch leaks timing information — an attacker can measure response time to guess the hash one byte at a time. `FixedTimeEquals` always compares every byte regardless of where a mismatch occurs, denying the attacker a timing side-channel.

<p class="qa-link">[Full post →]({{ '/security/password-hashing-and-credential-storage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does ASP.NET Core's versioned hash format enable algorithm migration without forced password resets? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The stored hash begins with a version marker byte (`0x00` for V2 with HMAC-SHA1/1000 iterations, `0x01` for V3 with HMAC-SHA512/100000 iterations), followed by the algorithm parameters, salt, and derived key. The `VerifyHashedPassword` method reads the version byte to determine how to re-derive and compare, so a 2019 V3 hash and a 2026 V3 hash with higher iterations can both be verified. `SuccessRehashNeeded` handles the upgrade transparently on the next login.

<p class="qa-link">[Full post →]({{ '/security/password-hashing-and-credential-storage/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is PBKDF2 still in ASP.NET Core despite OWASP now recommending Argon2id? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
ASP.NET Core Identity predates Argon2id's standardization and ships with zero external dependencies via .NET's own cryptography APIs — a deliberate tradeoff of cryptographic modernity for dependency simplicity. PBKDF2 is still safe when tuned correctly (100,000+ iterations with SHA512). The versioned format envelope would let a future migration to Argon2id happen without forced password resets — old hashes verify fine with the old algorithm, new hashes use the new one.

---

<p class="qa-link">[Full post →]({{ '/security/password-hashing-and-credential-storage/' | relative_url }})</p>
  </div>
</div>

## Topic: Session-based authentication (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why can't a client forge identity by editing their own session cookie? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The cookie contains only a randomly generated, unguessable session key — not identity data. The real state (user ID, permissions) lives server-side, indexed by that key. The client can send the key, but it can't forge it to match someone else's session because the key has no relationship to user data; it's just a lookup reference.

<p class="qa-link">[Full post →]({{ '/security/session-based-authentication/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is session fixation and why must `cycle_key()` be called on login? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Session fixation is when an attacker plants a known session ID in the victim's browser (via a link or cookie injection) before the victim logs in. If the server doesn't rotate the session key on authentication, the attacker's known key becomes an authenticated session after the victim logs in. Django's `cycle_key()` generates a brand-new random key and deletes the old one, killing the attacker's known ID at the exact moment trust changes.

<p class="qa-link">[Full post →]({{ '/security/session-based-authentication/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What structural advantage does session-based auth have over stateless JWT tokens for revocation? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Revoking a session is a single row delete — the cookie becomes worthless immediately with no client cooperation needed. A purely stateless JWT carries its own validity and can't be revoked before expiry without server-side state anyway (a denylist or a short-lived token + refresh token pattern). Session auth reintroduces server-side state openly; JWT systems that need revocation reintroduce it quietly.

<p class="qa-link">[Full post →]({{ '/security/session-based-authentication/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does Django's `_get_new_session_key` check `self.exists(session_key)` instead of just returning a random string? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Random strings could theoretically collide — two identical 32-character strings generated by chance. The `exists()` loop ensures the generated key is actually unique across all active sessions before returning it. A session ID that duplicates another user's active session would mean one user could hijack the other's state.

<p class="qa-link">[Full post →]({{ '/security/session-based-authentication/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is the server-side expiry check authoritative rather than the cookie's `Max-Age`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A client's browser might keep sending an old cookie past when the server considers it expired — browsers don't always enforce `Max-Age` perfectly, and a malicious client can ignore it entirely. The server's lookup against `expire_date` is the only authoritative decision point: the session row either exists with `expire_date > now()` or it doesn't.

<p class="qa-link">[Full post →]({{ '/security/session-based-authentication/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Is "session-based auth doesn't scale, use JWTs instead" accurate? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It's incomplete. Server-side sessions do require shared session storage across instances (Redis, database), but the claim ignores that JWT systems needing revocation end up needing server-side state too (a denylist or refresh token store). The real tradeoff is where and how state is tracked, not whether stateless is unconditionally better — session auth does it openly, JWT-based auth often does it quietly.

---

<p class="qa-link">[Full post →]({{ '/security/session-based-authentication/' | relative_url }})</p>
  </div>
</div>

## Topic: Token-based authentication (JWT) (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is the JWT signature computed over both the header and the payload, not just the payload? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Because the header declares the signing algorithm (`alg` field) — an attacker who could modify the header independently of the signature could change the algorithm to something weaker. Covering both header and payload with one signature means any tampering with either part invalidates the token, and the verifier can trust that the declared algorithm matches what was actually used.

<p class="qa-link">[Full post →]({{ '/security/token-based-authentication-jwt-structure/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why can't a JWT payload be kept confidential just by using a JWT? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A JWT is base64url-encoded, not encrypted — anyone who intercepts it can decode the payload in one line of code. The signature provides integrity (tampering is detectable) and authenticity (it was signed by a known key), but not confidentiality. Never put secret values in a JWT payload expecting them to be hidden.

<p class="qa-link">[Full post →]({{ '/security/token-based-authentication-jwt-structure/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the `TimeMargin` in JWT expiry checking, and why is a naive `now >= exp` problematic? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`TimeMargin` is a clock-skew tolerance that absorbs small differences between the issuer's and verifier's clocks. A naive `now >= exp` comparison can falsely reject a perfectly valid token if the verifier's clock is a few seconds ahead of the issuer's. The check `secondsSinceEpoch - TimeMargin >= expValue` gives legitimate clock drift a buffer before declaring the token expired.

<p class="qa-link">[Full post →]({{ '/security/token-based-authentication-jwt-structure/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the key material difference between HMAC-signed and RSA-signed JWTs in terms of trust model? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
HMAC is symmetric — the same key both signs and verifies, so anything holding the key can mint valid tokens, not just check them. RSA/ECDSA is asymmetric — a private key signs, a public key verifies, so the verifier never needs access to key material that could create tokens. A service using HMAC to verify tokens it didn't issue is trusting a shared secret was never exposed anywhere, a materially different risk profile than asymmetric signing.

<p class="qa-link">[Full post →]({{ '/security/token-based-authentication-jwt-structure/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does `header.Add("alg", algorithm.Name)` being inside the signed portion matter for attack defense? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
If the `alg` header were outside the signed portion, an attacker could freely change it without invalidating the signature — swapping RS256 for HS256 and using the public key as an HMAC secret. Because the header is part of `stringToSign`, any modification to the declared algorithm breaks the signature, but the verifier still has to actively *ignore* the received header's `alg` and use its own pinned expectation.

<p class="qa-link">[Full post →]({{ '/security/token-based-authentication-jwt-structure/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What common mistake does WebGoat's broken access control example illustrate, and how does it relate to JWT algorithm confusion? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Both are instances of the same root cause: trusting client-supplied state in place of an explicit server-side trust decision. WebGoat trusts a client-supplied `userId` instead of checking authorization; algorithm confusion trusts the token's own (attacker-editable) `alg` header instead of pinning the algorithm. Identity comparison is not authorization, and token-declared metadata is not a security decision.

---

<p class="qa-link">[Full post →]({{ '/security/common-authn-authz-vulnerabilities/' | relative_url }})</p>
  </div>
</div>

## Topic: OAuth 2.0 authorization code flow (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What problem does PKCE solve that the basic authorization code flow cannot? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A public client (mobile app, SPA) can't hold a `client_secret` — anyone can decompile the app or read its JavaScript. Without a secret, a stolen authorization code mid-flight can be redeemed by anyone. PKCE has the client generate a random `code_verifier` locally, send only its SHA-256 hash (`code_challenge`) upfront, then reveal the full verifier at token exchange so the server can confirm possession of the original secret.

<p class="qa-link">[Full post →]({{ '/security/oauth2-authorization-code-flow-and-pkce/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is SHA-256 used to compute the code_challenge from the code_verifier? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
SHA-256 is one-way — even if the `code_challenge` leaks (it's sent in a URL and potentially logged), no one can reverse it to derive the `code_verifier` needed to redeem the authorization code. The hash makes the challenge safe to transmit publicly while keeping the actual verifier secret until the final token exchange.

<p class="qa-link">[Full post →]({{ '/security/oauth2-authorization-code-flow-and-pkce/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does Ory Hydra enforce a 43-128 character minimum/maximum for the code_verifier? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
RFC 7636 specifies this range to guarantee sufficient entropy — a verifier shorter than 43 characters would make the scheme brute-forceable. The maximum of 128 prevents excessively long values that could cause parsing issues. Hydra enforces these bounds explicitly rather than trusting clients to pick a "reasonably random" value.

<p class="qa-link">[Full post →]({{ '/security/oauth2-authorization-code-flow-and-pkce/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is the `plain` PKCE method considered weaker, and how does Hydra handle it? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
With `plain`, the `code_challenge` IS the `code_verifier` — no one-way transformation, so anyone who intercepts the authorize request has the verifier directly. Hydra requires operators to deliberately opt in via an `EnablePKCEPlainChallengeMethod` config flag rather than defaulting to it, treating the weaker method as an explicit exception.

<p class="qa-link">[Full post →]({{ '/security/oauth2-authorization-code-flow-and-pkce/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why must the code_challenge be stored tied to the authorization code's signature, not just held in memory? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The authorization request and token exchange are separate HTTP requests — potentially seconds or minutes apart. The server has to persist the challenge retrievable specifically by the code that was issued alongside it, since the original request context is gone by the time the token endpoint receives the exchange.

<p class="qa-link">[Full post →]({{ '/security/oauth2-authorization-code-flow-and-pkce/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Is PKCE only for public/mobile clients in current best practices? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
No — current OAuth 2.0 Security BCP recommends PKCE for **all** clients, confidential or not, as defense-in-depth against authorization code interception regardless of client type. The original "public clients only" guidance is outdated; modern OAuth2/OIDC configs increasingly make it mandatory across the board.

---

<p class="qa-link">[Full post →]({{ '/security/oauth2-authorization-code-flow-and-pkce/' | relative_url }})</p>
  </div>
</div>

## Topic: OpenID Connect (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What gap does OIDC fill that raw OAuth2 access tokens leave open? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
An OAuth2 access token proves "this bearer can call this API" — it says nothing about *who* authenticated, *when*, or *how strongly*. OIDC adds a dedicated ID token with standardized identity claims (`sub`, `auth_time`, `acr`/`amr`) and anti-replay mechanisms (`nonce`, `at_hash`), giving the relying party a verified, structured identity assertion rather than just authorization state.

<p class="qa-link">[Full post →]({{ '/security/openid-connect-identity-layer-on-oauth2/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does the `at_hash` claim prevent token splicing? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`at_hash` is computed from the specific access token issued alongside the ID token. A verifier that checks `at_hash` against the access token it actually received can detect an attacker who splices together a genuine ID token from one flow with a different access token from another — without this binding, the two tokens are independently forgeable claims, not one coherent proof.

<p class="qa-link">[Full post →]({{ '/security/openid-connect-identity-layer-on-oauth2/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does OIDC's `nonce` defeat replay attacks but a JWT's `exp` alone does not? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`exp` limits how long a token is valid, but within that window, a captured token can be replayed by anyone who possesses it. `nonce` is generated by the client, sent in the original authorization request, and must be echoed back unchanged in the ID token — an attacker replaying a stolen ID token into a different client session will fail because that session generated its own nonce.

<p class="qa-link">[Full post →]({{ '/security/openid-connect-identity-layer-on-oauth2/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does Hydra's `ToMap()` for ID token claims `delete` empty values rather than serializing them as empty strings? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
OIDC relying parties check claim *presence*, not just content. A client validating `nonce` needs to distinguish "no nonce was requested for this flow" from "a nonce was requested and came back empty" — a sloppily implemented serializer that always includes every field blurs that forgery-relevant distinction.

<p class="qa-link">[Full post →]({{ '/security/openid-connect-identity-layer-on-oauth2/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is `amr` (Authentication Methods References) an array, not a single value? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A real authentication event can involve multiple methods — `["pwd", "otp"]` for password-plus-TOTP. A relying party making step-up authentication decisions (e.g., "require MFA for this sensitive action") needs to inspect the actual list of methods used, not assume a single method was employed.

<p class="qa-link">[Full post →]({{ '/security/openid-connect-identity-layer-on-oauth2/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the danger of using a raw OAuth2 access token as proof of login without an ID token? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Access tokens are opaque by design — their format isn't standardized in the general OAuth2 spec. An app checking "is this a valid access token" to decide whether someone is logged in is reasoning about authorization state as if it were authentication state. It has no reliable user identifier, no record of when/how authentication occurred, and no defense against tokens issued for a completely unrelated purpose.

---

<p class="qa-link">[Full post →]({{ '/security/openid-connect-identity-layer-on-oauth2/' | relative_url }})</p>
  </div>
</div>

## Topic: Refresh tokens & revocation/rotation (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is refresh token rotation, and why is it only half the mechanism without reuse detection? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Rotation means every time a refresh token is redeemed, the server issues a new one and immediately invalidates the old one. But rotation alone does nothing unless the old token is actually *rejected* on a later attempt — that's reuse detection. Without it, an attacker holding a stolen token can keep refreshing indefinitely because nothing checks whether the token was already consumed.

<p class="qa-link">[Full post →]({{ '/security/refresh-tokens-rotation-and-revocation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why must the server revoke the entire token family when reuse is detected, rather than just rejecting the replayed token? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The server cannot distinguish a legitimate client retrying after losing the new token from an attacker replaying a stolen one — both requests look identical. A narrower response (just deny the replay, leave the new token alone) would let an attacker who's already ahead in the rotation chain keep going undetected. Revoking the entire family forces re-authentication either way, choosing safety over availability.

<p class="qa-link">[Full post →]({{ '/security/refresh-tokens-rotation-and-revocation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why do `RotateRefreshToken` and `CreateAccessTokenSession` happen in the same database transaction? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
If the transaction fails partway, neither the old refresh token gets marked consumed nor the new access token gets created — avoiding a dangerous partial state where a refresh token was invalidated but no replacement tokens were successfully issued, or vice versa. Atomicity prevents leaving the client in a state where no valid credentials exist.

<p class="qa-link">[Full post →]({{ '/security/refresh-tokens-rotation-and-revocation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does `handleRefreshTokenReuse` revoking by `req.GetID()` instead of the specific token signature mean? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`req.GetID()` is the original request/grant ID, not the specific token that was replayed. This makes the revocation *family*-wide — every access and refresh token descended from that original grant gets killed, not just the one stale refresh token that triggered detection. This prevents an attacker who's already obtained subsequent tokens from continuing to use them.

<p class="qa-link">[Full post →]({{ '/security/refresh-tokens-rotation-and-revocation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why are refresh tokens arguably higher-value targets than access tokens? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A refresh token is long-lived and can mint many access tokens over its lifetime — a single leaked refresh token compounds into ongoing access until it's detected and revoked. An access token leaks once and expires quickly. The higher leverage justifies password-grade handling: never logged, never sent over anything but the token endpoint, rotated on every use.

<p class="qa-link">[Full post →]({{ '/security/refresh-tokens-rotation-and-revocation/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is `ErrInactiveToken` in Hydra's refresh flow, and how is it different from `ErrInvalidGrant`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`ErrInactiveToken` specifically signals that the refresh token was already consumed — reuse has been detected. It triggers `handleRefreshTokenReuse` to revoke the entire family before returning `ErrInvalidGrant` to the caller. The distinction matters operationally: `ErrInactiveToken` means "this token was valid but is now dead and everything related to it should be revoked," while `ErrInvalidGrant` is the generic "this grant is no longer usable" response the client sees.

---

<p class="qa-link">[Full post →]({{ '/security/refresh-tokens-rotation-and-revocation/' | relative_url }})</p>
  </div>
</div>

## Topic: RBAC vs ABAC (authorization models) (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: When does RBAC break down and ABAC become necessary? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
RBAC works cleanly when permissions map to static roles, but fails when authorization depends on relationships or dynamic facts about the specific resource — "a user can edit a document they own," "a purchase under $500 needs one approver, above $500 needs two." Modeling every document owner or dollar threshold as a new role causes combinatorial explosion. ABAC evaluates an expression over attributes at request time, covering all cases with one rule.

<p class="qa-link">[Full post →]({{ '/security/rbac-vs-abac-authorization-models/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the real integration cost difference between RBAC and ABAC at enforcement time? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
RBAC checks are a static lookup against an enumerable policy table — fast, bounded, and auditable. ABAC requires the enforcement layer to fetch the *resource's own data* at decision time (e.g., fetching a document to check its `Owner` field), which means additional data access calls per authorization decision. This is a genuinely different performance and integration cost that's easy to miss when comparing the models only conceptually.

<p class="qa-link">[Full post →]({{ '/security/rbac-vs-abac-authorization-models/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does Casbin's `g(r.sub, p.sub)` matcher do that a simple string equality check cannot? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`g()` is a role-graph lookup that walks role inheritance — a subject can hold a role transitively (assigned to role A, which inherits the permissions of role B). A simple string equality check would require every possible role-to-role inheritance relationship to be enumerated as separate policy rows, whereas `g()` transparently walks the hierarchy.

<p class="qa-link">[Full post →]({{ '/security/rbac-vs-abac-authorization-models/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does Casbin's ABAC model have no `[role_definition]` section and no policy CSV? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The entire authorization logic is the one-line matcher expression (`r.sub == r.obj.Owner`). There's nothing to enumerate — one rule covers every document and every owner, present or future, without a new policy entry ever being added. Compare this to RBAC's policy CSV which needs a new row every time a new role-to-resource grant is created.

<p class="qa-link">[Full post →]({{ '/security/rbac-vs-abac-authorization-models/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Are RBAC and ABAC mutually exclusive in production? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
No — they're commonly combined. NIST frames RBAC as a special case of ABAC where "role" is one attribute among many. Production systems frequently use coarse-grained role checks for broad access tiers and layer attribute-based rules for resource-specific fine-tuning (ownership checks, dollar thresholds), rather than picking one model exclusively.

<p class="qa-link">[Full post →]({{ '/security/rbac-vs-abac-authorization-models/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does the ABAC matcher `r.sub == r.obj.Owner` assume about the request object that RBAC does not? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It assumes `r.obj` is a structured object with an accessible `Owner` field, not just a string identifier. The enforcement layer needs access to the resource's actual data at decision time (fetching the document to check who owns it), not just an opaque resource name. This is a real difference in how deeply the authorization system must be integrated with the data layer.

---

<p class="qa-link">[Full post →]({{ '/security/rbac-vs-abac-authorization-models/' | relative_url }})</p>
  </div>
</div>

## Topic: API key authentication (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is SHA-256 the right hash choice for API keys but the wrong one for password hashing? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
API keys are machine-generated with full cryptographic randomness — no dictionary or rainbow-table attacks apply, so a fast hash on the hot path of every API call is both sufficient and performant. Passwords are low-entropy human-chosen strings vulnerable to dictionary attacks, so a slow KDF (bcrypt, Argon2) makes each guess expensive. The entropy of the input determines which hash choice is safe, not just "is it hashed."

<p class="qa-link">[Full post →]({{ '/security/api-key-authentication/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is the plaintext API key shown exactly once and never stored? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The server hashes the key immediately with SHA-256 and never persists the plaintext — if a user loses it, there's no recovery flow, only revoke-and-reissue. This is a deliberate design: there's no "recover my key" operation because the server genuinely doesn't have the original string anymore. The stored `start` fragment (first few characters) exists only for UI display.

<p class="qa-link">[Full post →]({{ '/security/api-key-authentication/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is a plain equality lookup (`WHERE k.hash = ?`) safe for API keys but would be dangerous for password hashes? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
An equality lookup against a table of fast hashes is safe only when the input has full cryptographic entropy — brute-forcing a 256-bit random key is infeasible. The same equality lookup against password hashes (low-entropy, human-chosen) would let an attacker hash common passwords and match them cheaply against the database. The safety difference comes from the input's entropy, not the hash function.

<p class="qa-link">[Full post →]({{ '/security/api-key-authentication/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does Unkey use base58 encoding for API keys instead of base64? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Base58 excludes visually ambiguous characters (0/O, l/I) that are easy to confuse when a key is displayed in a UI or copied manually. Base64 includes these characters, which creates real usability problems for human operators who need to visually verify or transcribe a key fragment.

<p class="qa-link">[Full post →]({{ '/security/api-key-authentication/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the purpose of the unhashed `start` field stored alongside the hash? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The `start` field (first few characters of the key, e.g., `sk_8f3k`) lets a dashboard show "sk_8f3k... → Production key" without ever needing to re-display or re-derive the real secret. It's deliberately unhashed and separate from the security-critical hash — safe to display forever because it contains nowhere near enough bits to brute-force back to the full key.

<p class="qa-link">[Full post →]({{ '/security/api-key-authentication/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the common mistake of applying password hashing best practices to API key storage? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Using bcrypt or Argon2 for API keys introduces unnecessary latency on the hot path of every API call. These slow KDFs exist to make dictionary attacks against low-entropy human passwords expensive — a machine-generated 256-bit random key doesn't share that vulnerability. The performance cost buys zero additional security for high-entropy inputs.

---

<p class="qa-link">[Full post →]({{ '/security/api-key-authentication/' | relative_url }})</p>
  </div>
</div>

## Topic: mTLS (certificate-based service auth) (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why doesn't mTLS with SPIFFE/SPIRE use hostname or IP for identity verification? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Service identities in modern infrastructure are unstable — pods restart with new IPs, autoscaling changes hostnames, load balancers obscure the actual workload. SPIFFE IDs (`spiffe://trust-domain/workload`) are cryptographically embedded in the certificate's URI SAN and verified against an explicit authorization rule, completely decoupled from network address. This is why it works correctly behind load balancers and through service mesh sidecars.

<p class="qa-link">[Full post →]({{ '/security/mtls-certificate-based-service-auth/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does `ValidateCSR` reject certificate signing requests with zero or more than one URI SAN? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A workload identity certificate represents exactly one identity. Allowing zero would create an unidentifiable certificate; allowing multiple would create ambiguity about which identity a downstream Authorizer should check. The issuance path closes this ambiguity structurally before a cert is ever signed, rather than relying on downstream verifiers to handle multi-identity certs.

<p class="qa-link">[Full post →]({{ '/security/mtls-certificate-based-service-auth/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the difference between `AuthorizeID` and `AuthorizeMemberOf` in go-spiffe? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
`AuthorizeID` requires an exact match against a specific SPIFFE ID — "only this exact service can connect." `AuthorizeMemberOf` checks trust-domain membership — "anyone in our infrastructure's trust domain can connect." They're different authorization granularities implemented as different functions matching the same `Authorizer` signature, letting callers choose the scope of trust without changing the underlying TLS verification code.

<p class="qa-link">[Full post →]({{ '/security/mtls-certificate-based-service-auth/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is mTLS structurally superior to shared secrets for service-to-service authentication? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A shared secret has to be distributed to every calling service, so a leak anywhere compromises all holders simultaneously, and rotation means coordinating every holder at once. In mTLS, each service holds only its own private key, no shared secret is ever transmitted, and identity is proven cryptographically per-connection with automatic certificate rotation — no coordination required.

<p class="qa-link">[Full post →]({{ '/security/mtls-certificate-based-service-auth/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why must the `Authorizer` function check the peer's identity rather than the network address the connection was made through? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Behind load balancers, across autoscaling, and through service mesh sidecar routing, the network address at the transport layer doesn't map to "which specific workload is this." The SPIFFE ID in the certificate's URI SAN is the only reliable indicator of workload identity, cryptographically bound to the connection via the TLS handshake.

<p class="qa-link">[Full post →]({{ '/security/mtls-certificate-based-service-auth/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What common assumption about traditional TLS verification is wrong in the SPIFFE/SPIRE model? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The traditional mental model — "verification means checking the certificate matches the hostname I dialed" — doesn't apply. SPIFFE-based mTLS explicitly ignores hostname/IP in authorization; only the SPIFFE ID embedded in the cert matters. This is a fundamental departure that trips up people accustomed to browser-style TLS verification.

---

<p class="qa-link">[Full post →]({{ '/security/mtls-certificate-based-service-auth/' | relative_url }})</p>
  </div>
</div>

## Topic: SSO & SAML (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What makes SAML assertion verification harder than JWT verification? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A JWT is a compact string where the signature trivially covers the entire payload. A SAML assertion is XML, and XML signatures can cover a *specific element* within a larger structure — an attacker can relocate a validly-signed assertion into a new XML wrapper (signature-wrapping), tricking a careless verifier into reading forged content while the signature check only confirms the original untouched element is valid. The verifier must independently confirm which element the signature actually covers.

<p class="qa-link">[Full post →]({{ '/security/sso-and-saml-assertion-verification/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does SAML validation have a two-sided time window (NotBefore and NotOnOrAfter) while JWT typically only checks expiry? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
SAML assertions define a bounded validity period — they shouldn't be usable before they were issued (`NotBefore`) or after they expire (`NotOnOrAfter`). JWTs typically only have `exp` because they're designed for short-lived use. Both sides of the SAML window are independently checked with clock-skew tolerance, and both the issuer and verifier apply skew adjustments in opposite directions to account for drift on both machines.

<p class="qa-link">[Full post →]({{ '/security/sso-and-saml-assertion-verification/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is a SAML signature-wrapping attack and how does Keycloak defend against it? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
An attacker takes a validly-signed assertion, wraps it in a new XML document, and places a forged (unsigned) assertion alongside it — hoping the verifier's application logic reads the forged element while the signature check only confirms the original signed element is still valid. Keycloak's `isSignatureValid` calls `getSignature(element)` to locate the specific `Signature` child element before validating, scoping verification to the element being trusted rather than checking "is there a valid signature somewhere in this document."

<p class="qa-link">[Full post →]({{ '/security/sso-and-saml-assertion-verification/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why do both the SAML issuing side and verifying side apply clock-skew adjustments in opposite directions? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The issuer backdates `NotBefore` by the skew amount (accounting for the IdP's clock potentially running ahead), and the verifier widens both bounds by the skew amount (accounting for the SP's clock potentially running differently). This double-application deliberately accounts for clock drift on both machines, not just one — it's a two-sided tolerance for a two-sided problem.

<p class="qa-link">[Full post →]({{ '/security/sso-and-saml-assertion-verification/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is SAML still found in enterprise environments despite OIDC being the modern default? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Enterprise IdPs were built around SAML assertions for decades, and migrating an entire identity infrastructure is a massive undertaking. OIDC's flat, compact JWT-based trust model sidesteps the XML signature complexity entirely, but choosing SAML for a greenfield integration today is almost always driven by an existing enterprise IdP requirement, not a technical preference for XML.

<p class="qa-link">[Full post →]({{ '/security/sso-and-saml-assertion-verification/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why does Keycloak log `assertion.getID()` on expiry failure rather than a generic error message? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Distinguishing "this particular assertion (identifiable by ID) expired" from a generic verification failure makes a production SSO integration's logs actually debuggable when a user reports "I can't log in." A single opaque "authentication failed" message covering every possible rejection reason is operationally useless for diagnosing time-related issues.

---

<p class="qa-link">[Full post →]({{ '/security/sso-and-saml-assertion-verification/' | relative_url }})</p>
  </div>
</div>

## Topic: Multi-factor authentication (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is checking only "is this TOTP code mathematically valid for the current time window" insufficient? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
A code intercepted via phishing or shoulder-surfing is mathematically valid for the entire 30-second window. Without tracking which specific time-step has already been consumed, an attacker can replay the same code within that window after the legitimate user already used it. The server must track step history and reject reuse of an already-consumed step.

<p class="qa-link">[Full post →]({{ '/security/mfa-totp-webauthn-passkeys/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does WebAuthn detect a cloned authenticator without sharing the private key? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Every WebAuthn authenticator increments a signature counter with each use and embeds it in the signed assertion. The server remembers the last counter value it saw for that credential; a new assertion's counter must be strictly greater. A cloned device starting from the original counter's value would produce assertions with lower or equal counters, triggering a `CloneWarning` — the server never needs to access the private key itself.

<p class="qa-link">[Full post →]({{ '/security/mfa-totp-webauthn-passkeys/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is TOTP step history keyed by `step*config.Period` rather than the raw 6-digit code? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Two different secrets could theoretically produce the same 6-digit code at the same time step. The uniqueness that matters is "this user, this time-step," not "this specific digit sequence." Keying by the derived time-step ensures the reuse check is correct regardless of hash collisions in the TOTP output.

<p class="qa-link">[Full post →]({{ '/security/mfa-totp-webauthn-passkeys/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the difference between WebAuthn used as a second factor and a passkey? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
WebAuthn used as a second factor alongside a password is what Authelia implements — the password is the primary credential, WebAuthn provides the additional factor. A passkey is a *discoverable* WebAuthn credential usable for primary, passwordless sign-in — a step beyond second-factor usage. Not every WebAuthn integration is a passkey-based passwordless flow.

<p class="qa-link">[Full post →]({{ '/security/mfa-totp-webauthn-passkeys/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is `CloneWarning` a property Authelia checks rather than computes itself? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The underlying WebAuthn library handles the cryptographic bookkeeping — counter tracking, comparison — and surfaces a boolean. Authelia's role is purely policy: `CloneWarning == true` becomes an authentication failure. This separation of concerns is a common integration pattern — the library handles crypto, the application handles what to do about it.

<p class="qa-link">[Full post →]({{ '/security/mfa-totp-webauthn-passkeys/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the vulnerability of TOTP without step-reuse tracking, and how prevalent is it in real implementations? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
Without step tracking, a phished TOTP code remains fully usable by an attacker for the rest of its 30-second validity window after the legitimate user already consumed it once. Many TOTP implementations and explainers skip this step entirely, making it a real, exploitable gap — not a theoretical concern. Authelia's explicit `DisableReuseSecurityPolicy` opt-out (logged as a warning when active) shows the authors considered this protection important enough to make disabling it auditable.

---

<p class="qa-link">[Full post →]({{ '/security/mfa-totp-webauthn-passkeys/' | relative_url }})</p>
  </div>
</div>

## Topic: Common authN/authZ vulnerabilities (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What is the core difference between an identity check and an authorization decision? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
An identity check answers "who are you" — verifying the caller is authenticated. An authorization decision answers "what are you allowed to do" — whether that specific identity is permitted to act on that specific resource. The vulnerability pattern is implementing the first correctly while using it as a substitute for the second: "is the submitted ID different from mine?" is a branch condition, not a permission check.

<p class="qa-link">[Full post →]({{ '/security/common-authn-authz-vulnerabilities/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why is broken access control resistant to automated security scanning compared to SQL injection or XSS? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
SQL injection and XSS have detectable syntactic signatures — unusual characters, known attack patterns. "Is this authorization check missing" requires understanding the application's own business logic about who should be allowed to do what — a contextual, semantic question that automated tools can't answer by pattern matching alone. This structural reason is why it persists despite decades of tooling improvements.

<p class="qa-link">[Full post →]({{ '/security/common-authn-authz-vulnerabilities/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: How does WebGoat's IDOR example demonstrate privilege escalation beyond data theft? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The vulnerable endpoint lets the caller set the target profile's **ROLE** (`setRole(userSubmittedProfile.getRole())`), not just cosmetic fields. An attacker exploiting this IDOR could potentially elevate another account's role, compounding a missing-authorization-check bug into a full account-takeover-adjacent vulnerability. It's not just "read someone else's data" — it's "write to someone else's privilege level."

<p class="qa-link">[Full post →]({{ '/security/common-authn-authz-vulnerabilities/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What do JWT algorithm confusion, session fixation, and broken access control have in common as root causes? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
All three are instances of trusting client-supplied state in place of an explicit server-side trust decision. JWT algorithm confusion trusts the token's attacker-editable `alg` header; session fixation trusts a pre-existing session ID without rotating it at the moment trust changes; broken access control trusts a client-supplied resource ID for authorization decisions. Identity comparison is not authorization, and token-declared metadata is not a security decision.

<p class="qa-link">[Full post →]({{ '/security/common-authn-authz-vulnerabilities/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: What does the `if` condition in WebGoat's vulnerable code do that it shouldn't? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
The condition `!userSubmittedProfile.getUserId().equals(authUserId)` simultaneously decides "is this a self-edit or an other-edit" AND (incorrectly) acts as the authorization gate for whether the other-edit should be allowed. These are two separate questions: which branch applies, and separately, is the authenticated user permitted to be in that branch at all. The code conflates them.

<p class="qa-link">[Full post →]({{ '/security/common-authn-authz-vulnerabilities/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" onclick="this.parentElement.classList.toggle('open')">Q: Why has broken access control risen to OWASP #1, and what makes it structurally persistent? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle">▸</span></h3>
  <div class="qa-a" markdown="1">
It's the most commonly reported real-world vulnerability because "check who you are" is well-understood infrastructure most frameworks provide, while "check whether THIS identity may act on THIS specific resource" is a second check that must be correctly re-implemented at every single endpoint. Missing it once creates an exploitable gap, and the sheer number of endpoints per application multiplies the opportunities for this mistake.

<p class="qa-link">[Full post →]({{ '/security/common-authn-authz-vulnerabilities/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 78 across Security

[Back to Q&A Index]({{ '/qa/' | relative_url }})

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

  /* Accordion: click question to toggle answer */
  document.addEventListener('click', function (e) {
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    h3.parentElement.classList.toggle('open');
  });

  /* Expand all / collapse all */
  var expandBtn = document.getElementById('qa-expand-all');
  if (expandBtn) {
    expandBtn.addEventListener('click', function () {
      var items = document.querySelectorAll('.qa-item');
      var allOpen = Array.prototype.every.call(items, function(i){ return i.classList.contains('open'); });
      items.forEach(function (item) {
        if (allOpen) item.classList.remove('open');
        else item.classList.add('open');
      });
      expandBtn.textContent = allOpen ? 'Expand all' : 'Collapse all';
    });
  }

  apply();
})();
</script>
