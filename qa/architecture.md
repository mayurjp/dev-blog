---
layout: page
title: "Software Architecture Interview Questions: 76 Real-World Q&A from Production Manifests"
description: "76 interview-ready Software Architecture questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/architecture/
---

Bite-sized, standalone interview questions and answers for Software Architecture. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

<p class="qa-shown-line"><strong><span id="qa-shown">76</span></strong> questions shown. Filter by keyword or difficulty below.</p>

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

## Topic: Layered (N-tier) architecture (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is dependency inversion in a layered architecture? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Domain defines an interface like `IOrderRepository`, and Infrastructure implements it. The compile-time reference points inward (Infrastructure → Domain) even though the runtime call flows outward (Domain → persistence), decoupling business logic from infrastructure technology.

<p class="qa-link">[Full post →]({{ '/architecture/layered-n-tier-architecture-and-its-limits/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does a real layered codebase differ from the textbook N-tier diagram? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The textbook diagram shows every layer depending strictly on the layer below it. In reality, Domain depends on nothing — it declares interfaces — and Infrastructure depends inward on Domain. The compiled dependency direction is opposite to the conceptual layer ordering at the Domain/Infrastructure seam.

<p class="qa-link">[Full post →]({{ '/architecture/layered-n-tier-architecture-and-its-limits/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if Domain gets a compile-time reference to Infrastructure? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The whole point of layering collapses: business logic becomes coupled to Entity Framework or RabbitMQ, making it impossible to unit-test without a real database and impossible to swap persistence technology without touching core logic.

<p class="qa-link">[Full post →]({{ '/architecture/layered-n-tier-architecture-and-its-limits/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Where does the repository interface live, and why does that matter? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The interface lives in the Domain project (the consumer of the capability), not Infrastructure (the provider). This placement is what forces the compiled dependency arrow to point inward — Infrastructure must reference Domain to implement the contract, not the reverse.

<p class="qa-link">[Full post →]({{ '/architecture/layered-n-tier-architecture-and-its-limits/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake with "clean" layered architectures? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Treating "layered" as meaning every layer's compiled reference points physically downward. The real rule is that the core defines the contracts it needs; infrastructure implements them. Strict downward references break the moment Domain needs a capability only the edge can provide.

<p class="qa-link">[Full post →]({{ '/architecture/layered-n-tier-architecture-and-its-limits/' | relative_url }})</p>
  </div>
</div>

## Topic: Hexagonal architecture (ports & adapters) (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the difference between a port and an adapter in hexagonal architecture? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A port is an interface declared inside the domain project — the domain's own vocabulary for a capability it needs (e.g., `IOrderRepository`). An adapter is the infrastructure-layer implementation that satisfies a port using a specific technology (e.g., EF Core + Postgres).

<p class="qa-link">[Full post →]({{ '/architecture/hexagonal-architecture-ports-adapters-compiler-enforced/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does hexagonal architecture enforce the boundary differently from just "using interfaces"? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An interface alone doesn't prevent a domain project from also referencing the database package. The real enforcement is project-level: the domain's `.csproj` has zero package or project references to EF Core or the infrastructure project, so `using Microsoft.EntityFrameworkCore;` fails to compile.

<p class="qa-link">[Full post →]({{ '/architecture/hexagonal-architecture-ports-adapters-compiler-enforced/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if someone adds `using Microsoft.EntityFrameworkCore` inside the Domain class? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The build fails immediately — the assembly isn't referenced from that project at all. This is the core enforcement mechanism: the violation is impossible to compile, not merely easy to spot in review.

<p class="qa-link">[Full post →]({{ '/architecture/hexagonal-architecture-ports-adapters-compiler-enforced/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is hexagonal architecture's isolation valuable for testing? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A test project referencing only Domain inherits that project's restricted reference list. Tests can construct domain objects and call methods with no database, no EF Core, and no infrastructure reference — the project graph makes touching the database structurally impossible.

<p class="qa-link">[Full post →]({{ '/architecture/hexagonal-architecture-ports-adapters-compiler-enforced/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's a common gotcha with claiming hexagonal architecture is satisfied? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
People treat "the domain depends on an interface, not a concrete class" as sufficient. But an interface can live in a project that also references infrastructure packages — a future edit could import infrastructure types directly into domain code. The stronger version requires a genuine assembly boundary with a restricted reference list.

<p class="qa-link">[Full post →]({{ '/architecture/hexagonal-architecture-ports-adapters-compiler-enforced/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When would you choose hexagonal architecture over a simpler layered approach? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When you need to swap database providers or test domain logic without any infrastructure spinning up — and you want the compiler to enforce that boundary, not rely on discipline or code review.

<p class="qa-link">[Full post →]({{ '/architecture/hexagonal-architecture-ports-adapters-compiler-enforced/' | relative_url }})</p>
  </div>
</div>

## Topic: Clean architecture (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does the Application layer reference the base EF Core package if Infrastructure owns the database? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Application needs `DbSet<T>` to describe a provider-agnostic persistence shape inside its own `IApplicationDbContext` interface. The base EF Core package provides that abstraction; the actual database provider packages (Npgsql, SQLite) are referenced only from Infrastructure.

<p class="qa-link">[Full post →]({{ '/architecture/clean-architecture-use-case-folders-and-abstraction-vs-provider/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does clean architecture organize code differently from traditional layered folders? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Instead of horizontal folders (`Commands/`, `Handlers/`, `Validators/`) shared by every use case, clean architecture uses vertical slices — each use case (e.g., `CreateTodoItem`) gets its own folder containing its command, handler, and validator together.

<p class="qa-link">[Full post →]({{ '/architecture/clean-architecture-use-case-folders-and-abstraction-vs-provider/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the precise line the dependency rule draws in this codebase? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No specific database engine package (Npgsql, SQLite, SQL Server) exists outside Infrastructure. Application carries a narrow ORM-shaped dependency (base EF Core for `DbSet<T>`), but zero provider packages. Swapping PostgreSQL for SQL Server touches only Infrastructure's `.csproj` and its concrete `DbContext`.

<p class="qa-link">[Full post →]({{ '/architecture/clean-architecture-use-case-folders-and-abstraction-vs-provider/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the tradeoff of exposing `DbSet<T>` in the Application interface? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
You accept a narrow, ORM-shaped dependency in Application to avoid reimplementing query composition that EF Core already provides. The alternative — a fully custom repository interface — removes even that reference at the cost of duplicating querying capabilities.

<p class="qa-link">[Full post →]({{ '/architecture/clean-architecture-use-case-folders-and-abstraction-vs-provider/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does clean architecture differ from hexagonal architecture in practice? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
They're the same dependency-inversion idea with different vocabulary. The mechanism — inward-pointing project references, compiler-enforced boundaries — is identical. What differs is how strictly the boundary is drawn: Clean Architecture here tolerates a base ORM package that a stricter Hexagonal reading might exclude.

<p class="qa-link">[Full post →]({{ '/architecture/clean-architecture-use-case-folders-and-abstraction-vs-provider/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when grouping code in a clean architecture codebase? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Splitting code into horizontal folders (`Commands/`, `Handlers/`, `Validators/`) shared across all use cases, so understanding one complete use case means tracing references across three or four separate folders mixed with dozens of unrelated ones.

<p class="qa-link">[Full post →]({{ '/architecture/clean-architecture-use-case-folders-and-abstraction-vs-provider/' | relative_url }})</p>
  </div>
</div>

## Topic: Modular monolith vs microservices (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What would actually change to split a modular monolith into microservices? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Only the concrete class wired to `IEventsBus` — modules already communicate solely through published integration-event contracts and an event-bus interface. Swapping `InMemoryEventBusClient` for a real network client (RabbitMQ, Kafka) is a composition-root-only change with no module's business logic touched.

<p class="qa-link">[Full post →]({{ '/architecture/modular-monolith-vs-microservices-swappable-event-bus/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the modular monolith enforce boundaries between modules? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Each module exposes a small, public `IntegrationEvents` contracts project. Other modules reference only this contracts project — never the originating module's Domain, Application, or Infrastructure. This is enforceable from `.csproj` reference lists, like a domain/infrastructure boundary applied between peer modules.

<p class="qa-link">[Full post →]({{ '/architecture/modular-monolith-vs-microservices-swappable-event-bus/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens when `InMemoryEventBusClient` is used — is there a real network call? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
No — `InMemoryEventBusClient.Publish` calls `InMemoryEventBus.Instance.Publish()`, a static, in-process singleton. Every cross-module communication is mechanically just a method call within the same .NET process. The event-driven shape is identical to a distributed system; only the transport differs.

<p class="qa-link">[Full post →]({{ '/architecture/modular-monolith-vs-microservices-swappable-event-bus/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is splitting into microservices too early expensive? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Real network calls between services introduce real failure modes — timeouts, partial failures, retries, eventual consistency — that don't exist when two pieces of code are objects calling each other in the same process. Getting boundaries wrong across a network is far more expensive to fix than getting them wrong within one process.

<p class="qa-link">[Full post →]({{ '/architecture/modular-monolith-vs-microservices-swappable-event-bus/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the composition root seam that enables an eventual split? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`EventsBusStartup.SubscribeToIntegrationEvents` resolves `IEventsBus` from the DI container rather than constructing the concrete type directly. Changing which class gets registered against that interface is a composition-root-only change — no module's code needs modification.

<p class="qa-link">[Full post →]({{ '/architecture/modular-monolith-vs-microservices-swappable-event-bus/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's a gotcha with the "monolith vs microservices" framing? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
They're often presented as a binary choice, with modular monolith as a compromise. In reality, strict module isolation, published-contract-only communication, and a swappable transport are exactly the disciplines that make microservices safe to adopt later — a team with all of that has already solved the hard boundary-design problem.

<p class="qa-link">[Full post →]({{ '/architecture/modular-monolith-vs-microservices-swappable-event-bus/' | relative_url }})</p>
  </div>
</div>

## Topic: Serverless architecture (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What problem does AWS Lambda SnapStart solve? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Expensive one-time initialization (opening DB connections, loading config) hurts every cold start. SnapStart snapshots an already-initialized environment and restores copies instantly, skipping re-running that initialization for new execution environments.

<p class="qa-link">[Full post →]({{ '/architecture/serverless-snapstart-restore-hooks-per-environment-state/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What breaks when you clone an already-initialized serverless function? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Anything meant to be unique per environment — a random identifier, a fresh network handle — gets shared across every restored copy because they're all restored from the same frozen snapshot state.

<p class="qa-link">[Full post →]({{ '/architecture/serverless-snapstart-restore-hooks-per-environment-state/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the AfterRestore hook fix the shared-state problem? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It runs specifically when a new execution environment is materialized from a snapshot — not during original initialization, not on warm reuse. Application code regenerates per-environment state (e.g., a new `Guid`) at that exact moment, giving each restored environment its own fresh value.

<p class="qa-link">[Full post →]({{ '/architecture/serverless-snapstart-restore-hooks-per-environment-state/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is the constructor's initial GUID assignment not dead code? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It ensures correctness when SnapStart is not active — local testing or deployments with the feature disabled — where the AfterRestore callback simply never fires. The class must behave correctly both with and without the snapshot mechanism.

<p class="qa-link">[Full post →]({{ '/architecture/serverless-snapstart-restore-hooks-per-environment-state/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the tradeoff of using SnapStart? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
You eliminate cold-start latency but introduce a new correctness requirement: application code must explicitly distinguish state safe to reuse across unbounded restored environments from state that must be regenerated freshly. Forgetting to register an AfterRestore hook silently shares state.

<p class="qa-link">[Full post →]({{ '/architecture/serverless-snapstart-restore-hooks-per-environment-state/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How do the two hook registries differ in execution order? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`_beforeSnapshotRegistry` is a `ConcurrentStack` (LIFO — hooks run in reverse-registration order, like unwinding teardown logic), while `_afterRestoreRegistry` is a `ConcurrentQueue` (FIFO — hooks run in original registration order, matching initialization order).

<p class="qa-link">[Full post →]({{ '/architecture/serverless-snapstart-restore-hooks-per-environment-state/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake with mental models of serverless initialization? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Assuming "the code runs once at cold start" is always true. Under SnapStart, constructor code runs once per snapshot taken but is silently reused across an unbounded number of independently restored environments — a distinction with zero equivalent in a traditional long-running server process.

<p class="qa-link">[Full post →]({{ '/architecture/serverless-snapstart-restore-hooks-per-environment-state/' | relative_url }})</p>
  </div>
</div>

## Topic: Space-based architecture (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the core mechanism of space-based architecture? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Data is partitioned across a cluster of nodes' RAM using a deterministic affinity function. Computation is routed to whichever node already holds the relevant data, so most work becomes a local in-memory read instead of a network call.

<p class="qa-link">[Full post →]({{ '/architecture/space-based-architecture-affinity-collocated-compute/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does grouping keys by partition reduce network round trips? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Without grouping, N keys require N individual network calls. By calling `affinityFunc.partition(k)` for every key locally first, you group them into as few partitions as possible — then send one task per partition. Each task computes locally via `cache.localPeek()`, and only small partial results cross the network.

<p class="qa-link">[Full post →]({{ '/architecture/space-based-architecture-affinity-collocated-compute/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is `cache.localPeek()` only safe inside an affinity-routed task? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`localPeek` reads from local memory, guaranteed to be a local read only because `compute.affinityCall` already routed the task to the node that owns the relevant partition. Calling `localPeek` from a node that doesn't own the data returns null or stale data.

<p class="qa-link">[Full post →]({{ '/architecture/space-based-architecture-affinity-collocated-compute/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does space-based architecture differ from a read-through cache? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A read-through cache still funnels computation through one central place — every request does its work wherever the application code runs. Space-based architecture routes the computation itself out to wherever the data lives, so most work never leaves the owning node.

<p class="qa-link">[Full post →]({{ '/architecture/space-based-architecture-affinity-collocated-compute/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When would you use space-based architecture over traditional database scaling? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When you have a huge in-memory working set and extreme request volume where even scaling the app tier doesn't help because they all compete for the same database connection pool and disk I/O — the shared database becomes the ceiling.

<p class="qa-link">[Full post →]({{ '/architecture/space-based-architecture-affinity-collocated-compute/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake with space-based architecture? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Treating it as equivalent to "put a cache in front of the database." A cache speeds up reads but computation still runs centrally. The defining trait is sending the computation to the data, not pulling data to the compute — a fundamentally different programming model.

<p class="qa-link">[Full post →]({{ '/architecture/space-based-architecture-affinity-collocated-compute/' | relative_url }})</p>
  </div>
</div>

## Topic: Plugin/micro-kernel architecture (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What problem does the Terraform plugin architecture solve? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Terraform Core needs hundreds of independently developed, independently versioned cloud providers without bundling them into one binary, allowing one provider's bug to crash the whole process, or letting an unrelated program invoke a provider binary as if it were a plugin.

<p class="qa-link">[Full post →]({{ '/architecture/plugin-microkernel-architecture-terraform-provider-handshake/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the TF_PLUGIN_MAGIC_COOKIE handshake for? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It proves a provider binary was launched specifically as a Terraform plugin by Terraform, on purpose. The binary checks for the exact hardcoded value in an environment variable; if missing or wrong, it refuses to serve. This prevents accidental invocation or a malicious substitute impersonating a real provider.

<p class="qa-link">[Full post →]({{ '/architecture/plugin-microkernel-architecture-terraform-provider-handshake/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does Terraform use separate OS processes for plugins instead of loading shared libraries? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A provider that panics terminates its own process — Core observes a broken connection and reports a clean error. A shared-library plugin crash could corrupt Core's memory space. The IPC overhead per call is the explicit tradeoff for genuine fault isolation.

<p class="qa-link">[Full post →]({{ '/architecture/plugin-microkernel-architecture-terraform-provider-handshake/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Terraform Core handle multiple plugin protocol versions simultaneously? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`VersionedPlugins` is keyed by protocol version (5 and 6), and Core registers plugin sets for both. This lets Core negotiate down to whichever version a given provider supports — older providers built against protocol 5 keep working with newer Core, without every provider needing to rebuild in lockstep.

<p class="qa-link">[Full post →]({{ '/architecture/plugin-microkernel-architecture-terraform-provider-handshake/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What are the downsides of the microkernel approach? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Every provider call incurs IPC serialization overhead across a process boundary, which is more expensive than an in-process function call. You also need to manage the lifecycle of many separate processes and negotiate protocol versions.

<p class="qa-link">[Full post →]({{ '/architecture/plugin-microkernel-architecture-terraform-provider-handshake/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is the magic cookie value not a secret even though it's checked? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Its only purpose is proving the process was launched as a Terraform plugin, not that the launcher is trustworthy. It's visible in the plugin's own source code, checked in plaintext — a cheap, effective guard against accidental invocation, not a security credential.

<p class="qa-link">[Full post →]({{ '/architecture/plugin-microkernel-architecture-terraform-provider-handshake/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the gotcha with assuming plugin/microkernel means shared-library loading? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Many assume plugins are loaded as `.so`/`.dll` shared libraries into the host process. Terraform deliberately does the opposite — each provider is a separate OS process communicating over gRPC. The tradeoff is higher per-call cost for real crash containment that a shared-library model structurally cannot provide.

<p class="qa-link">[Full post →]({{ '/architecture/plugin-microkernel-architecture-terraform-provider-handshake/' | relative_url }})</p>
  </div>
</div>

## Topic: Pipe-and-filter/pipeline architecture (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Envoy's filter chain handle an async operation like token validation? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A filter returns `StopIteration`, which halts the chain at that filter's position. When the async call completes, the filter calls `continueDecoding()` from outside the original synchronous flow, and the chain resumes from where it paused.

<p class="qa-link">[Full post →]({{ '/architecture/pipe-and-filter-architecture-envoy-filter-status/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the difference between `StopIteration` and `StopAllIterationAndBuffer`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`StopIteration` halts the chain at the current filter's position; the filter resumes later at that same spot. `StopAllIterationAndBuffer` halts the entire chain and retains all buffered data so far, rather than discarding it — used when a filter needs the full remaining request body before proceeding.

<p class="qa-link">[Full post →]({{ '/architecture/pipe-and-filter-architecture-envoy-filter-status/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why can't a filter in a pipe-and-filter system just block the thread during an async call? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Blocking the thread would stall the entire proxy process — all other requests and filters would freeze. The `StopIteration` + later `continueDecoding()` pattern lets one filter pause its own position in the chain without blocking the event loop serving other requests.

<p class="qa-link">[Full post →]({{ '/architecture/pipe-and-filter-architecture-envoy-filter-status/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the pipe-and-filter pattern differ from Unix shell pipes? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Unix shell pipes are synchronous and always flow straight through. Real production pipe-and-filter systems like Envoy need richer flow control: any filter can halt the pipeline for an arbitrary time (async call, rate-limit check, WAF inspection), optionally buffer data while halted, and resume later from unrelated code.

<p class="qa-link">[Full post →]({{ '/architecture/pipe-and-filter-architecture-envoy-filter-status/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if a filter's return status is not handled in the switch statement? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Envoy uses `PANIC_DUE_TO_CORRUPT_ENUM` for unhandled filter status cases. For a proxy processing untrusted network traffic, silently falling through an unhandled status would be a dangerous runtime inconsistency — explicit exhaustive handling turns "forgot a case" into a loud compile-time or test-time failure.

<p class="qa-link">[Full post →]({{ '/architecture/pipe-and-filter-architecture-envoy-filter-status/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the tradeoff of adding more filters to a request chain? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Each filter adds processing overhead per request, and a filter that returns `StopAllIterationAndBuffer` forces the proxy to retain buffered data in memory for the entire chain's duration. The composability benefit is real, but filter ordering and buffer consumption are performance-critical concerns.

<p class="qa-link">[Full post →]({{ '/architecture/pipe-and-filter-architecture-envoy-filter-status/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When would you use pipe-and-filter over a simpler middleware pattern? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When you need independently addable, removable, and reorderable processing steps with complex async flow control — and when different steps need different buffering behaviors, not just "process and pass along."

<p class="qa-link">[Full post →]({{ '/architecture/pipe-and-filter-architecture-envoy-filter-status/' | relative_url }})</p>
  </div>
</div>

## Topic: Architecture Decision Records (ADRs) (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is an Architecture Decision Record? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A small, dated, immutable document per architectural decision with a fixed structure: Title (imperative sentence), Status (Proposed/Accepted/Rejected/Superseded/Deprecated), Context (the situation), Decision (what was chosen), and Consequences (what becomes easier or harder).

<p class="qa-link">[Full post →]({{ '/architecture/architecture-decision-records-immutable-history/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What makes an ADR different from a design wiki page? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An ADR is never edited in place after acceptance. A changed decision produces a new, separately dated ADR that references and supersedes the old one. The old one's content stays intact — preserving the actual history of reasoning instead of collapsing it into whatever the current page says.

<p class="qa-link">[Full post →]({{ '/architecture/architecture-decision-records-immutable-history/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is the Context section important even if the Decision section answers "what"? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Context explains the operational scenario that motivated the change — the background a future reader needs to understand *why* the decision was made. Without it, six months later a reader sees only the current rule with no trace of what problem it was solving or what alternatives were considered.

<p class="qa-link">[Full post →]({{ '/architecture/architecture-decision-records-immutable-history/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if a team rewrites an ADR in place instead of writing a new one? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The history of reasoning collapses — a reader has no way to know what the original decision was, what alternatives were considered, or why the current version differs from the original. The whole value of an ADR is the traceable sequence, not the individual document.

<p class="qa-link">[Full post →]({{ '/architecture/architecture-decision-records-immutable-history/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does an ADR handle a decision being reversed months later? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A new ADR is written with Status `Accepted`, referencing and superseding the old one. The old ADR's Status is updated to `Superseded` but its content stays unchanged. A reader sees both decisions and the full reasoning trail.

<p class="qa-link">[Full post →]({{ '/architecture/architecture-decision-records-immutable-history/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake with ADR adoption? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Treating them as a bureaucratic checkbox — writing one once and then ignoring them, or confusing ADRs with general design documents that get updated in place. The discipline that makes them useful is specifically that they don't get rewritten, preserving the chronological sequence of reasoning.

<p class="qa-link">[Full post →]({{ '/architecture/architecture-decision-records-immutable-history/' | relative_url }})</p>
  </div>
</div>

## Topic: Non-functional requirements & quality attribute tradeoffs (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does Redis's `appendfsync` setting control? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It controls when the OS is told to flush write-ahead-log data to disk: `no` lets the OS decide (fastest, least durable), `always` fsyncs after every write (slowest, safest), and `everysec` fsyncs once per second (the documented compromise and default).

<p class="qa-link">[Full post →]({{ '/architecture/nfr-quality-attribute-tradeoffs-redis-fsync/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How do quality-attribute tradeoffs compound in Redis? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`no-appendfsync-on-rewrite yes` temporarily suspends fsync entirely during a BGSAVE or AOF rewrite. So the effective durability at any moment depends on both `appendfsync`'s value AND whether a background save is running — neither setting alone describes the full picture.

<p class="qa-link">[Full post →]({{ '/architecture/nfr-quality-attribute-tradeoffs-redis-fsync/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is `everysec` the default instead of the safest option? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Because defaulting to an extreme optimizes for one quality attribute at the total expense of the other. `everysec` is a named, deliberate middle ground — fast enough for most use cases, durable enough to lose at most one second of writes on crash.

<p class="qa-link">[Full post →]({{ '/architecture/nfr-quality-attribute-tradeoffs-redis-fsync/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens to durability when a background save runs with `no-appendfsync-on-rewrite yes`? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The effective durability drops to the same level as `appendfsync no` — up to ~30 seconds of writes could be lost on crash during that window, because fsync is suspended entirely to avoid disk I/O contention from hurting foreground write latency.

<p class="qa-link">[Full post →]({{ '/architecture/nfr-quality-attribute-tradeoffs-redis-fsync/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is "always fsync" not the universally safe default? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's very slow — every single write incurs a disk fsync call. A session cache can tolerate losing the last second of writes after a crash; forcing `always` on it pays a massive latency cost for durability the application doesn't need.

<p class="qa-link">[Full post →]({{ '/architecture/nfr-quality-attribute-tradeoffs-redis-fsync/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's a common mistake when reasoning about NFR tradeoffs? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Treating it as a single, one-time global decision — "we prioritize durability." Real systems have multiple interacting settings and operational states (is a background save running now?) that change the effective posture at runtime. The real guarantee depends on how settings compound and what the system is doing.

<p class="qa-link">[Full post →]({{ '/architecture/nfr-quality-attribute-tradeoffs-redis-fsync/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the value of naming consequences directly in configuration comments? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It makes the tradeoff legible at the point of decision — an operator reading `redis.conf` sees "Faster," "Slow, Safest," "Compromise" next to each option, without needing external documentation. The default is documented as a compromise, not silently set to whichever extreme is easiest.

<p class="qa-link">[Full post →]({{ '/architecture/nfr-quality-attribute-tradeoffs-redis-fsync/' | relative_url }})</p>
  </div>
</div>

## Topic: C4 model & architecture diagramming (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What problem does the C4 model solve for architecture diagrams? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Hand-drawn diagrams at different zoom levels inevitably drift apart. C4 defines the system once as a model, then generates multiple diagram views from that single source of truth — a change to one element reflects in every view that includes it.

<p class="qa-link">[Full post →]({{ '/architecture/c4-model-one-source-multiple-diagrams/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Structurizr prevent two diagrams from drifting out of sync? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Diagrams are declared as views *of* a single model, not drawn independently. A `systemContext` view and a `container` view are different filters and zoom levels applied to the same underlying data — changing an element once in the model updates every view that includes it automatically.

<p class="qa-link">[Full post →]({{ '/architecture/c4-model-one-source-multiple-diagrams/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does `include *` mean in a Structurizr view? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It's a filter expression saying "show everything relevant to this view's scope from the model" at whichever zoom level the view is declared at. It doesn't redefine elements — it selects from the already-defined model.

<p class="qa-link">[Full post →]({{ '/architecture/c4-model-one-source-multiple-diagrams/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does hierarchical addressing (`ss.wa`) make multi-view diagramming work? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Containers are addressed as children of their software system, mirroring C4's zoom-level hierarchy (context → containers → components). This nesting in the model is what makes "define once, filter into multiple views" structurally possible.

<p class="qa-link">[Full post →]({{ '/architecture/c4-model-one-source-multiple-diagrams/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When would you use C4 over general-purpose diagramming tools (slides, whiteboards)? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When you need multiple diagrams at different zoom levels that must stay consistent with each other and with the actual system. C4 treats diagrams as generated projections of a model, not independent artifacts that must be manually kept in sync.

<p class="qa-link">[Full post →]({{ '/architecture/c4-model-one-source-multiple-diagrams/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the gotcha with treating architecture diagrams as documentation artifacts? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A picture exported once and pasted into a wiki is expected to be manually kept up to date. C4 generates views from a source-of-truth model — closer to a compiler generating outputs from one source file than a designer maintaining separate image files. The generated views structurally cannot drift apart the way hand-maintained diagrams do.

<p class="qa-link">[Full post →]({{ '/architecture/c4-model-one-source-multiple-diagrams/' | relative_url }})</p>
  </div>
</div>

## Topic: Evolutionary/fitness-function-driven architecture (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is an architecture fitness function? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An architecture rule expressed as an executable test that runs automatically on every build. It fails exactly like any other failing test when the rule is violated — no separate review process to remember to run.

<p class="qa-link">[Full post →]({{ '/architecture/evolutionary-architecture-fitness-functions-archunit/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does ArchUnit verify architecture rules at the bytecode level? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It analyzes compiled class dependencies, not just source text or naming conventions. A class that dynamically references another via reflection or looks compliant in file path while bytecode dependencies violate the rule is still caught.

<p class="qa-link">[Full post →]({{ '/architecture/evolutionary-architecture-fitness-functions-archunit/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens when an architecture rule is enforced only by human vigilance? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A new engineer adds a convenient import that crosses the forbidden boundary; code review misses it, especially in a large diff. The rule silently stops being true, with no mechanism to signal the violation happened.

<p class="qa-link">[Full post →]({{ '/architecture/evolutionary-architecture-fitness-functions-archunit/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does ArchUnit dogfood its own architecture enforcement? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The project's own codebase defines its six-layer structure (`Root`, `Base`, `Core`, `Lang`, `Library`, `JUnit`) as ArchUnit rules and runs them on every build of ArchUnit itself — the tool enforces its own architecture constraints using its own library.

<p class="qa-link">[Full post →]({{ '/architecture/evolutionary-architecture-fitness-functions-archunit/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the downside of not having automated architecture checks? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
You have no way to know *when* an architecture rule stopped being true — only, eventually, that it no longer is, discovered whenever someone happens to notice. A codebase changes on every commit; a rule verified on day one has no guarantee of staying true on day two without an automated check.

<p class="qa-link">[Full post →]({{ '/architecture/evolutionary-architecture-fitness-functions-archunit/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When would you use ArchUnit over simply documenting architecture rules in an ADR? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Always — ADRs capture *why* a decision was made, but they can't prevent the next commit from violating it. Fitness functions close the gap by making the check as continuous as the change itself, catching violations on every build rather than whenever someone remembers to look.

<p class="qa-link">[Full post →]({{ '/architecture/evolutionary-architecture-fitness-functions-archunit/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's a common mistake with evolutionary architecture? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Treating architecture as a static, one-time analysis — a diagram drawn once, an ADR accepted once, both assumed to remain true indefinitely. Evolutionary architecture specifically names the gap: without an automated check running on every commit, architecture rules decay silently.

<p class="qa-link">[Full post →]({{ '/architecture/evolutionary-architecture-fitness-functions-archunit/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 76 across Software Architecture

[Back to Q&A Index]({{ '/qa/' | relative_url }})

<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is dependency inversion in a layered architecture?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Domain defines an interface like `IOrderRepository`, and Infrastructure implements it. The compile-time reference points inward (Infrastructure → Domain) even though the runtime call flows outward (Domain → persistence), decoupling business logic from infrastructure technology."
      }
    },
    {
      "@type": "Question",
      "name": "How does a real layered codebase differ from the textbook N-tier diagram?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The textbook diagram shows every layer depending strictly on the layer below it. In reality, Domain depends on nothing — it declares interfaces — and Infrastructure depends inward on Domain. The compiled dependency direction is opposite to the conceptual layer ordering at the Domain/Infrastructure seam."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if Domain gets a compile-time reference to Infrastructure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The whole point of layering collapses: business logic becomes coupled to Entity Framework or RabbitMQ, making it impossible to unit-test without a real database and impossible to swap persistence technology without touching core logic."
      }
    },
    {
      "@type": "Question",
      "name": "Where does the repository interface live, and why does that matter?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The interface lives in the Domain project (the consumer of the capability), not Infrastructure (the provider). This placement is what forces the compiled dependency arrow to point inward — Infrastructure must reference Domain to implement the contract, not the reverse."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake with \"clean\" layered architectures?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Treating \"layered\" as meaning every layer's compiled reference points physically downward. The real rule is that the core defines the contracts it needs; infrastructure implements them. Strict downward references break the moment Domain needs a capability only the edge can provide."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between a port and an adapter in hexagonal architecture?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A port is an interface declared inside the domain project — the domain's own vocabulary for a capability it needs (e.g., `IOrderRepository`). An adapter is the infrastructure-layer implementation that satisfies a port using a specific technology (e.g., EF Core + Postgres)."
      }
    },
    {
      "@type": "Question",
      "name": "How does hexagonal architecture enforce the boundary differently from just \"using interfaces\"?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An interface alone doesn't prevent a domain project from also referencing the database package. The real enforcement is project-level: the domain's `.csproj` has zero package or project references to EF Core or the infrastructure project, so `using Microsoft.EntityFrameworkCore;` fails to compile."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if someone adds `using Microsoft.EntityFrameworkCore` inside the Domain class?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The build fails immediately — the assembly isn't referenced from that project at all. This is the core enforcement mechanism: the violation is impossible to compile, not merely easy to spot in review."
      }
    },
    {
      "@type": "Question",
      "name": "Why is hexagonal architecture's isolation valuable for testing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A test project referencing only Domain inherits that project's restricted reference list. Tests can construct domain objects and call methods with no database, no EF Core, and no infrastructure reference — the project graph makes touching the database structurally impossible."
      }
    },
    {
      "@type": "Question",
      "name": "What's a common gotcha with claiming hexagonal architecture is satisfied?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "People treat \"the domain depends on an interface, not a concrete class\" as sufficient. But an interface can live in a project that also references infrastructure packages — a future edit could import infrastructure types directly into domain code. The stronger version requires a genuine assembly boundary with a restricted reference list."
      }
    },
    {
      "@type": "Question",
      "name": "When would you choose hexagonal architecture over a simpler layered approach?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When you need to swap database providers or test domain logic without any infrastructure spinning up — and you want the compiler to enforce that boundary, not rely on discipline or code review."
      }
    },
    {
      "@type": "Question",
      "name": "Why does the Application layer reference the base EF Core package if Infrastructure owns the database?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Application needs `DbSet<T>` to describe a provider-agnostic persistence shape inside its own `IApplicationDbContext` interface. The base EF Core package provides that abstraction; the actual database provider packages (Npgsql, SQLite) are referenced only from Infrastructure."
      }
    },
    {
      "@type": "Question",
      "name": "How does clean architecture organize code differently from traditional layered folders?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Instead of horizontal folders (`Commands/`, `Handlers/`, `Validators/`) shared by every use case, clean architecture uses vertical slices — each use case (e.g., `CreateTodoItem`) gets its own folder containing its command, handler, and validator together."
      }
    },
    {
      "@type": "Question",
      "name": "What is the precise line the dependency rule draws in this codebase?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No specific database engine package (Npgsql, SQLite, SQL Server) exists outside Infrastructure. Application carries a narrow ORM-shaped dependency (base EF Core for `DbSet<T>`), but zero provider packages. Swapping PostgreSQL for SQL Server touches only Infrastructure's `.csproj` and its concrete `DbContext`."
      }
    },
    {
      "@type": "Question",
      "name": "What is the tradeoff of exposing `DbSet<T>` in the Application interface?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You accept a narrow, ORM-shaped dependency in Application to avoid reimplementing query composition that EF Core already provides. The alternative — a fully custom repository interface — removes even that reference at the cost of duplicating querying capabilities."
      }
    },
    {
      "@type": "Question",
      "name": "How does clean architecture differ from hexagonal architecture in practice?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "They're the same dependency-inversion idea with different vocabulary. The mechanism — inward-pointing project references, compiler-enforced boundaries — is identical. What differs is how strictly the boundary is drawn: Clean Architecture here tolerates a base ORM package that a stricter Hexagonal reading might exclude."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake when grouping code in a clean architecture codebase?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Splitting code into horizontal folders (`Commands/`, `Handlers/`, `Validators/`) shared across all use cases, so understanding one complete use case means tracing references across three or four separate folders mixed with dozens of unrelated ones."
      }
    },
    {
      "@type": "Question",
      "name": "What would actually change to split a modular monolith into microservices?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Only the concrete class wired to `IEventsBus` — modules already communicate solely through published integration-event contracts and an event-bus interface. Swapping `InMemoryEventBusClient` for a real network client (RabbitMQ, Kafka) is a composition-root-only change with no module's business logic touched."
      }
    },
    {
      "@type": "Question",
      "name": "How does the modular monolith enforce boundaries between modules?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Each module exposes a small, public `IntegrationEvents` contracts project. Other modules reference only this contracts project — never the originating module's Domain, Application, or Infrastructure. This is enforceable from `.csproj` reference lists, like a domain/infrastructure boundary applied between peer modules."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when `InMemoryEventBusClient` is used — is there a real network call?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No — `InMemoryEventBusClient.Publish` calls `InMemoryEventBus.Instance.Publish()`, a static, in-process singleton. Every cross-module communication is mechanically just a method call within the same .NET process. The event-driven shape is identical to a distributed system; only the transport differs."
      }
    },
    {
      "@type": "Question",
      "name": "Why is splitting into microservices too early expensive?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Real network calls between services introduce real failure modes — timeouts, partial failures, retries, eventual consistency — that don't exist when two pieces of code are objects calling each other in the same process. Getting boundaries wrong across a network is far more expensive to fix than getting them wrong within one process."
      }
    },
    {
      "@type": "Question",
      "name": "What is the composition root seam that enables an eventual split?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`EventsBusStartup.SubscribeToIntegrationEvents` resolves `IEventsBus` from the DI container rather than constructing the concrete type directly. Changing which class gets registered against that interface is a composition-root-only change — no module's code needs modification."
      }
    },
    {
      "@type": "Question",
      "name": "What's a gotcha with the \"monolith vs microservices\" framing?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "They're often presented as a binary choice, with modular monolith as a compromise. In reality, strict module isolation, published-contract-only communication, and a swappable transport are exactly the disciplines that make microservices safe to adopt later — a team with all of that has already solved the hard boundary-design problem."
      }
    },
    {
      "@type": "Question",
      "name": "What problem does AWS Lambda SnapStart solve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Expensive one-time initialization (opening DB connections, loading config) hurts every cold start. SnapStart snapshots an already-initialized environment and restores copies instantly, skipping re-running that initialization for new execution environments."
      }
    },
    {
      "@type": "Question",
      "name": "What breaks when you clone an already-initialized serverless function?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Anything meant to be unique per environment — a random identifier, a fresh network handle — gets shared across every restored copy because they're all restored from the same frozen snapshot state."
      }
    },
    {
      "@type": "Question",
      "name": "How does the AfterRestore hook fix the shared-state problem?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It runs specifically when a new execution environment is materialized from a snapshot — not during original initialization, not on warm reuse. Application code regenerates per-environment state (e.g., a new `Guid`) at that exact moment, giving each restored environment its own fresh value."
      }
    },
    {
      "@type": "Question",
      "name": "Why is the constructor's initial GUID assignment not dead code?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It ensures correctness when SnapStart is not active — local testing or deployments with the feature disabled — where the AfterRestore callback simply never fires. The class must behave correctly both with and without the snapshot mechanism."
      }
    },
    {
      "@type": "Question",
      "name": "What is the tradeoff of using SnapStart?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You eliminate cold-start latency but introduce a new correctness requirement: application code must explicitly distinguish state safe to reuse across unbounded restored environments from state that must be regenerated freshly. Forgetting to register an AfterRestore hook silently shares state."
      }
    },
    {
      "@type": "Question",
      "name": "How do the two hook registries differ in execution order?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`_beforeSnapshotRegistry` is a `ConcurrentStack` (LIFO — hooks run in reverse-registration order, like unwinding teardown logic), while `_afterRestoreRegistry` is a `ConcurrentQueue` (FIFO — hooks run in original registration order, matching initialization order)."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake with mental models of serverless initialization?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Assuming \"the code runs once at cold start\" is always true. Under SnapStart, constructor code runs once per snapshot taken but is silently reused across an unbounded number of independently restored environments — a distinction with zero equivalent in a traditional long-running server process."
      }
    },
    {
      "@type": "Question",
      "name": "What is the core mechanism of space-based architecture?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Data is partitioned across a cluster of nodes' RAM using a deterministic affinity function. Computation is routed to whichever node already holds the relevant data, so most work becomes a local in-memory read instead of a network call."
      }
    },
    {
      "@type": "Question",
      "name": "How does grouping keys by partition reduce network round trips?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Without grouping, N keys require N individual network calls. By calling `affinityFunc.partition(k)` for every key locally first, you group them into as few partitions as possible — then send one task per partition. Each task computes locally via `cache.localPeek()`, and only small partial results cross the network."
      }
    },
    {
      "@type": "Question",
      "name": "Why is `cache.localPeek()` only safe inside an affinity-routed task?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`localPeek` reads from local memory, guaranteed to be a local read only because `compute.affinityCall` already routed the task to the node that owns the relevant partition. Calling `localPeek` from a node that doesn't own the data returns null or stale data."
      }
    },
    {
      "@type": "Question",
      "name": "How does space-based architecture differ from a read-through cache?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A read-through cache still funnels computation through one central place — every request does its work wherever the application code runs. Space-based architecture routes the computation itself out to wherever the data lives, so most work never leaves the owning node."
      }
    },
    {
      "@type": "Question",
      "name": "When would you use space-based architecture over traditional database scaling?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When you have a huge in-memory working set and extreme request volume where even scaling the app tier doesn't help because they all compete for the same database connection pool and disk I/O — the shared database becomes the ceiling."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake with space-based architecture?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Treating it as equivalent to \"put a cache in front of the database.\" A cache speeds up reads but computation still runs centrally. The defining trait is sending the computation to the data, not pulling data to the compute — a fundamentally different programming model."
      }
    },
    {
      "@type": "Question",
      "name": "What problem does the Terraform plugin architecture solve?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Terraform Core needs hundreds of independently developed, independently versioned cloud providers without bundling them into one binary, allowing one provider's bug to crash the whole process, or letting an unrelated program invoke a provider binary as if it were a plugin."
      }
    },
    {
      "@type": "Question",
      "name": "What is the TF_PLUGIN_MAGIC_COOKIE handshake for?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It proves a provider binary was launched specifically as a Terraform plugin by Terraform, on purpose. The binary checks for the exact hardcoded value in an environment variable; if missing or wrong, it refuses to serve. This prevents accidental invocation or a malicious substitute impersonating a real provider."
      }
    },
    {
      "@type": "Question",
      "name": "Why does Terraform use separate OS processes for plugins instead of loading shared libraries?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A provider that panics terminates its own process — Core observes a broken connection and reports a clean error. A shared-library plugin crash could corrupt Core's memory space. The IPC overhead per call is the explicit tradeoff for genuine fault isolation."
      }
    },
    {
      "@type": "Question",
      "name": "How does Terraform Core handle multiple plugin protocol versions simultaneously?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`VersionedPlugins` is keyed by protocol version (5 and 6), and Core registers plugin sets for both. This lets Core negotiate down to whichever version a given provider supports — older providers built against protocol 5 keep working with newer Core, without every provider needing to rebuild in lockstep."
      }
    },
    {
      "@type": "Question",
      "name": "What are the downsides of the microkernel approach?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Every provider call incurs IPC serialization overhead across a process boundary, which is more expensive than an in-process function call. You also need to manage the lifecycle of many separate processes and negotiate protocol versions."
      }
    },
    {
      "@type": "Question",
      "name": "Why is the magic cookie value not a secret even though it's checked?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Its only purpose is proving the process was launched as a Terraform plugin, not that the launcher is trustworthy. It's visible in the plugin's own source code, checked in plaintext — a cheap, effective guard against accidental invocation, not a security credential."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha with assuming plugin/microkernel means shared-library loading?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Many assume plugins are loaded as `.so`/`.dll` shared libraries into the host process. Terraform deliberately does the opposite — each provider is a separate OS process communicating over gRPC. The tradeoff is higher per-call cost for real crash containment that a shared-library model structurally cannot provide."
      }
    },
    {
      "@type": "Question",
      "name": "How does Envoy's filter chain handle an async operation like token validation?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A filter returns `StopIteration`, which halts the chain at that filter's position. When the async call completes, the filter calls `continueDecoding()` from outside the original synchronous flow, and the chain resumes from where it paused."
      }
    },
    {
      "@type": "Question",
      "name": "What is the difference between `StopIteration` and `StopAllIterationAndBuffer`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`StopIteration` halts the chain at the current filter's position; the filter resumes later at that same spot. `StopAllIterationAndBuffer` halts the entire chain and retains all buffered data so far, rather than discarding it — used when a filter needs the full remaining request body before proceeding."
      }
    },
    {
      "@type": "Question",
      "name": "Why can't a filter in a pipe-and-filter system just block the thread during an async call?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Blocking the thread would stall the entire proxy process — all other requests and filters would freeze. The `StopIteration` + later `continueDecoding()` pattern lets one filter pause its own position in the chain without blocking the event loop serving other requests."
      }
    },
    {
      "@type": "Question",
      "name": "How does the pipe-and-filter pattern differ from Unix shell pipes?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Unix shell pipes are synchronous and always flow straight through. Real production pipe-and-filter systems like Envoy need richer flow control: any filter can halt the pipeline for an arbitrary time (async call, rate-limit check, WAF inspection), optionally buffer data while halted, and resume later from unrelated code."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a filter's return status is not handled in the switch statement?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Envoy uses `PANIC_DUE_TO_CORRUPT_ENUM` for unhandled filter status cases. For a proxy processing untrusted network traffic, silently falling through an unhandled status would be a dangerous runtime inconsistency — explicit exhaustive handling turns \"forgot a case\" into a loud compile-time or test-time failure."
      }
    },
    {
      "@type": "Question",
      "name": "What's the tradeoff of adding more filters to a request chain?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Each filter adds processing overhead per request, and a filter that returns `StopAllIterationAndBuffer` forces the proxy to retain buffered data in memory for the entire chain's duration. The composability benefit is real, but filter ordering and buffer consumption are performance-critical concerns."
      }
    },
    {
      "@type": "Question",
      "name": "When would you use pipe-and-filter over a simpler middleware pattern?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When you need independently addable, removable, and reorderable processing steps with complex async flow control — and when different steps need different buffering behaviors, not just \"process and pass along.\""
      }
    },
    {
      "@type": "Question",
      "name": "What is an Architecture Decision Record?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A small, dated, immutable document per architectural decision with a fixed structure: Title (imperative sentence), Status (Proposed/Accepted/Rejected/Superseded/Deprecated), Context (the situation), Decision (what was chosen), and Consequences (what becomes easier or harder)."
      }
    },
    {
      "@type": "Question",
      "name": "What makes an ADR different from a design wiki page?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An ADR is never edited in place after acceptance. A changed decision produces a new, separately dated ADR that references and supersedes the old one. The old one's content stays intact — preserving the actual history of reasoning instead of collapsing it into whatever the current page says."
      }
    },
    {
      "@type": "Question",
      "name": "Why is the Context section important even if the Decision section answers \"what\"?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Context explains the operational scenario that motivated the change — the background a future reader needs to understand *why* the decision was made. Without it, six months later a reader sees only the current rule with no trace of what problem it was solving or what alternatives were considered."
      }
    },
    {
      "@type": "Question",
      "name": "What happens if a team rewrites an ADR in place instead of writing a new one?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The history of reasoning collapses — a reader has no way to know what the original decision was, what alternatives were considered, or why the current version differs from the original. The whole value of an ADR is the traceable sequence, not the individual document."
      }
    },
    {
      "@type": "Question",
      "name": "How does an ADR handle a decision being reversed months later?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A new ADR is written with Status `Accepted`, referencing and superseding the old one. The old ADR's Status is updated to `Superseded` but its content stays unchanged. A reader sees both decisions and the full reasoning trail."
      }
    },
    {
      "@type": "Question",
      "name": "What's the common mistake with ADR adoption?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Treating them as a bureaucratic checkbox — writing one once and then ignoring them, or confusing ADRs with general design documents that get updated in place. The discipline that makes them useful is specifically that they don't get rewritten, preserving the chronological sequence of reasoning."
      }
    },
    {
      "@type": "Question",
      "name": "What does Redis's `appendfsync` setting control?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It controls when the OS is told to flush write-ahead-log data to disk: `no` lets the OS decide (fastest, least durable), `always` fsyncs after every write (slowest, safest), and `everysec` fsyncs once per second (the documented compromise and default)."
      }
    },
    {
      "@type": "Question",
      "name": "How do quality-attribute tradeoffs compound in Redis?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "`no-appendfsync-on-rewrite yes` temporarily suspends fsync entirely during a BGSAVE or AOF rewrite. So the effective durability at any moment depends on both `appendfsync`'s value AND whether a background save is running — neither setting alone describes the full picture."
      }
    },
    {
      "@type": "Question",
      "name": "Why is `everysec` the default instead of the safest option?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Because defaulting to an extreme optimizes for one quality attribute at the total expense of the other. `everysec` is a named, deliberate middle ground — fast enough for most use cases, durable enough to lose at most one second of writes on crash."
      }
    },
    {
      "@type": "Question",
      "name": "What happens to durability when a background save runs with `no-appendfsync-on-rewrite yes`?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The effective durability drops to the same level as `appendfsync no` — up to ~30 seconds of writes could be lost on crash during that window, because fsync is suspended entirely to avoid disk I/O contention from hurting foreground write latency."
      }
    },
    {
      "@type": "Question",
      "name": "Why is \"always fsync\" not the universally safe default?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's very slow — every single write incurs a disk fsync call. A session cache can tolerate losing the last second of writes after a crash; forcing `always` on it pays a massive latency cost for durability the application doesn't need."
      }
    },
    {
      "@type": "Question",
      "name": "What's a common mistake when reasoning about NFR tradeoffs?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Treating it as a single, one-time global decision — \"we prioritize durability.\" Real systems have multiple interacting settings and operational states (is a background save running now?) that change the effective posture at runtime. The real guarantee depends on how settings compound and what the system is doing."
      }
    },
    {
      "@type": "Question",
      "name": "What's the value of naming consequences directly in configuration comments?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It makes the tradeoff legible at the point of decision — an operator reading `redis.conf` sees \"Faster,\" \"Slow, Safest,\" \"Compromise\" next to each option, without needing external documentation. The default is documented as a compromise, not silently set to whichever extreme is easiest."
      }
    },
    {
      "@type": "Question",
      "name": "What problem does the C4 model solve for architecture diagrams?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Hand-drawn diagrams at different zoom levels inevitably drift apart. C4 defines the system once as a model, then generates multiple diagram views from that single source of truth — a change to one element reflects in every view that includes it."
      }
    },
    {
      "@type": "Question",
      "name": "How does Structurizr prevent two diagrams from drifting out of sync?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Diagrams are declared as views *of* a single model, not drawn independently. A `systemContext` view and a `container` view are different filters and zoom levels applied to the same underlying data — changing an element once in the model updates every view that includes it automatically."
      }
    },
    {
      "@type": "Question",
      "name": "What does `include *` mean in a Structurizr view?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It's a filter expression saying \"show everything relevant to this view's scope from the model\" at whichever zoom level the view is declared at. It doesn't redefine elements — it selects from the already-defined model."
      }
    },
    {
      "@type": "Question",
      "name": "How does hierarchical addressing (`ss.wa`) make multi-view diagramming work?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Containers are addressed as children of their software system, mirroring C4's zoom-level hierarchy (context → containers → components). This nesting in the model is what makes \"define once, filter into multiple views\" structurally possible."
      }
    },
    {
      "@type": "Question",
      "name": "When would you use C4 over general-purpose diagramming tools (slides, whiteboards)?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "When you need multiple diagrams at different zoom levels that must stay consistent with each other and with the actual system. C4 treats diagrams as generated projections of a model, not independent artifacts that must be manually kept in sync."
      }
    },
    {
      "@type": "Question",
      "name": "What's the gotcha with treating architecture diagrams as documentation artifacts?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A picture exported once and pasted into a wiki is expected to be manually kept up to date. C4 generates views from a source-of-truth model — closer to a compiler generating outputs from one source file than a designer maintaining separate image files. The generated views structurally cannot drift apart the way hand-maintained diagrams do."
      }
    },
    {
      "@type": "Question",
      "name": "What is an architecture fitness function?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "An architecture rule expressed as an executable test that runs automatically on every build. It fails exactly like any other failing test when the rule is violated — no separate review process to remember to run."
      }
    },
    {
      "@type": "Question",
      "name": "How does ArchUnit verify architecture rules at the bytecode level?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "It analyzes compiled class dependencies, not just source text or naming conventions. A class that dynamically references another via reflection or looks compliant in file path while bytecode dependencies violate the rule is still caught."
      }
    },
    {
      "@type": "Question",
      "name": "What happens when an architecture rule is enforced only by human vigilance?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "A new engineer adds a convenient import that crosses the forbidden boundary; code review misses it, especially in a large diff. The rule silently stops being true, with no mechanism to signal the violation happened."
      }
    },
    {
      "@type": "Question",
      "name": "How does ArchUnit dogfood its own architecture enforcement?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The project's own codebase defines its six-layer structure (`Root`, `Base`, `Core`, `Lang`, `Library`, `JUnit`) as ArchUnit rules and runs them on every build of ArchUnit itself — the tool enforces its own architecture constraints using its own library."
      }
    },
    {
      "@type": "Question",
      "name": "What is the downside of not having automated architecture checks?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You have no way to know *when* an architecture rule stopped being true — only, eventually, that it no longer is, discovered whenever someone happens to notice. A codebase changes on every commit; a rule verified on day one has no guarantee of staying true on day two without an automated check."
      }
    },
    {
      "@type": "Question",
      "name": "When would you use ArchUnit over simply documenting architecture rules in an ADR?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Always — ADRs capture *why* a decision was made, but they can't prevent the next commit from violating it. Fitness functions close the gap by making the check as continuous as the change itself, catching violations on every build rather than whenever someone remembers to look."
      }
    },
    {
      "@type": "Question",
      "name": "What's a common mistake with evolutionary architecture?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Treating architecture as a static, one-time analysis — a diagram drawn once, an ADR accepted once, both assumed to remain true indefinitely. Evolutionary architecture specifically names the gap: without an automated check running on every commit, architecture rules decay silently."
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

  /* Accordion: click question to toggle answer */
  document.addEventListener('click', function (e) {
    var h3 = e.target.closest('.qa-q');
    if (!h3) return;
    h3.parentElement.classList.toggle('open');
    h3.setAttribute('aria-expanded', h3.parentElement.classList.contains('open'));
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
