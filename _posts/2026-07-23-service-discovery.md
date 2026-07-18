---
layout: post
title: "How does a caller find a service instance whose IP changes every restart?"
date: 2026-07-23 09:00:00 +0530
categories: microservices
tags: [microservices, service-discovery, eureka, spring-cloud, kubernetes]
---

## 1. The Engineering Problem

A config file with `customers-service: 10.0.4.12:8081` works exactly until
that instance restarts, crashes, or gets replaced by autoscaling — at which
point it comes back with a different IP, or a different port, or three
copies of itself spread across three hosts. Hardcoded addresses (or a
manually-updated DNS entry) go stale the moment anything about deployment
becomes dynamic, and at real scale, deploys happen dozens of times a day.

The pain is sharper than "IPs change." Some real systems don't even try to
hold a fixed port per instance — Spring PetClinic's microservices are
configured with `server.port: 0`, which asks the OS for a random free port
on every boot, specifically so multiple instances of the same service can
run on one host without a port collision. That's a deliberate design choice
that makes hardcoding an address not just fragile, but structurally
impossible: there is no fixed address to write down in the first place.

So the real question isn't "how do we keep the config file updated" — it's
"who is tracking which instances of a service are alive, right now, and how
does a caller ask that question at request time instead of deploy time?"

## 2. The Technical Solution: a live registry, not a static list

A **service registry** turns discovery into a heartbeat protocol: every
instance registers itself on startup and keeps re-announcing "I'm still
here" on an interval; callers ask the registry for the current instance
list instead of reading it from a config file.

```
   ┌──────────────┐   register + heartbeat    ┌────────────────┐
   │ customers-svc │ ─────────────────────────▶│ discovery-server│
   │ (random port) │◀───────────────────────── │  (registry)     │
   └──────────────┘   evict if heartbeat stops └────────────────┘
                                                       ▲
                                              query: "where is       │
                                              customers-service?"    │
                                                       │
                                                ┌──────────────┐
                                                │  api-gateway  │
                                                │ (caller, does │
                                                │ client-side   │
                                                │ load balancing│
                                                └──────────────┘
```

Core truths to hold:

- **Registration is a heartbeat contract, not a one-time event.** If an
  instance stops heartbeating, the registry evicts it after a timeout —
  discovery is a liveness protocol, not a lookup table someone edits.
- **Client-side vs platform-side is an architectural fork.** Client-side
  discovery (Eureka + a load-balancing client) puts the instance list and
  the balancing decision in the *caller's* process. Platform-native
  discovery (Kubernetes Services + DNS) puts both in the platform, and the
  caller just resolves a stable name.
- **The registry is itself just another service** — it needs its own
  address findable at a fixed, well-known location, because it's the one
  thing that can't discover itself via discovery.

**Correcting a stale fact:** Netflix Eureka is the component every
microservices tutorial reaches for, and it's still maintained (Netflix
shipped a v2.0.6 release as recently as this year) — but if your target
platform is Kubernetes, you typically don't need a self-hosted registry at
all. A Kubernetes `Service` plus CoreDNS already provides registration
(kubelet reports pod readiness) and discovery (a stable DNS name resolving
to healthy pods) for free. Eureka-style registries earn their cost mainly
when you're *not* on a platform that already does this — bare VMs, or a
PaaS without built-in discovery — or when you specifically want the
balancing decision made client-side.

## 3. The clean example (concept in isolation)

The two pieces stripped to their essentials: a registry, and a client that
registers with it.

```yaml
# discovery-server application.yml — the registry itself
spring:
  application:
    name: discovery-server
server:
  port: 8761
```

```java
// DiscoveryServerApplication.java — one annotation turns a Spring Boot app into a registry
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServerApplication {
    public static void main(String[] args) {
        SpringApplication.run(DiscoveryServerApplication.class, args);
    }
}
```

```yaml
# any-service application.yml — the client side: register with the registry above
spring:
  application:
    name: any-service
eureka:
  client:
    serviceUrl:
      defaultZone: http://discovery-server:8761/eureka/
```

That's the whole mechanism in isolation: one app declares itself a
registry, every other app points at it and announces its own name.

## 4. Production reality (from the real repo)

[spring-petclinic-microservices](https://github.com/spring-petclinic/spring-petclinic-microservices)
runs a dedicated `spring-petclinic-discovery-server` module, and its entire
application logic is this:

```java
// spring-petclinic-discovery-server/src/main/java/.../DiscoveryServerApplication.java
@SpringBootApplication
@EnableEurekaServer
public class DiscoveryServerApplication {

	public static void main(String[] args) {
		SpringApplication.run(DiscoveryServerApplication.class, args);
	}
}
```

```yaml
# spring-petclinic-discovery-server/src/main/resources/application.yml
spring:
  application:
    name: discovery-server
  config:
    import: optional:configserver:${CONFIG_SERVER_URL:http://localhost:8888/}

# Avoid some debugging logs at startup
logging:
  level:
    org:
      springframework:
        boot: INFO
        web: INFO
```

The eureka client settings for every *other* service don't live in that
service's own module at all — they're pulled at runtime from a separate
git repo,
[spring-petclinic-microservices-config](https://github.com/spring-petclinic/spring-petclinic-microservices-config),
via Spring Cloud Config:

```yaml
# spring-petclinic-microservices-config/application.yml — settings SHARED by every service
server:
  port: 0            # random free port — the reason a fixed address can't be hardcoded
  shutdown: graceful

eureka:
  instance:
    # Register IP address instead of hostname to avoid resolution failures on Windows
    prefer-ip-address: true
```

```yaml
# spring-petclinic-microservices-config/customers-service.yml
spring:
  config:
    activate:
      on-profile: default
eureka:
  instance:
    # enable to register multiple app instances with a random server port
    instance-id: ${spring.application.name}:${random.uuid}

---
spring:
  config:
    activate:
      on-profile: docker
server:
  port: 8081
eureka:
  client:
    serviceUrl:
      defaultZone: http://discovery-server:8761/eureka/
```

What this teaches that a hello-world can't:

- **`@EnableEurekaServer` really is almost the whole app.** The actual
  registry state machine — the heartbeat map, eviction timers, lease
  renewal — lives entirely inside the `spring-cloud-starter-netflix-eureka-server`
  dependency; PetClinic's own code contributes nothing but the annotation
  and a `main()`.
- **`server.port: 0` and `instance-id: ${spring.application.name}:${random.uuid}`
  work together deliberately.** Eureka doesn't require unique ports across
  instances, only unique instance IDs — that's *how* multiple copies of
  `customers-service` can share a host, each on an OS-assigned random port,
  while still being individually addressable in the registry.
- **`eureka.instance.prefer-ip-address: true` exists because of a specific,
  named failure mode** — the comment says so directly: hostname resolution
  breaks in Docker/Windows dev setups, so this config overrides Eureka's
  default (register-by-hostname) with register-by-IP. It's a real
  production correction to a documented default, not a stylistic choice.
- **None of this configuration lives in `customers-service`'s own resources
  folder.** It's fetched at boot from a separate repo. Discovery
  configuration is itself externalized — which registry to talk to, and
  under what profile, can change without rebuilding the service that
  depends on it. (This mechanism — Spring Cloud Config itself — is the
  next lesson in this series.)
- **The registry URL differs by Spring profile** (`docker` activates a
  container-network hostname, `defaultZone: http://discovery-server:8761/eureka/`)
  while the *default* profile only randomizes the instance ID and says
  nothing about where the registry lives — because outside the `docker`
  profile, PetClinic expects `localhost:8761`, Eureka's conventional
  default port.

---

## Source

- **Concept:** Service discovery
- **Domain:** microservices
- **Repo:** [spring-petclinic/spring-petclinic-microservices](https://github.com/spring-petclinic/spring-petclinic-microservices) → [`spring-petclinic-discovery-server/src/main/java/org/springframework/samples/petclinic/discovery/DiscoveryServerApplication.java`](https://github.com/spring-petclinic/spring-petclinic-microservices/blob/main/spring-petclinic-discovery-server/src/main/java/org/springframework/samples/petclinic/discovery/DiscoveryServerApplication.java) and [spring-petclinic/spring-petclinic-microservices-config](https://github.com/spring-petclinic/spring-petclinic-microservices-config) → [`application.yml`](https://github.com/spring-petclinic/spring-petclinic-microservices-config/blob/main/application.yml), [`customers-service.yml`](https://github.com/spring-petclinic/spring-petclinic-microservices-config/blob/main/customers-service.yml) — Spring Cloud reference microservices architecture
