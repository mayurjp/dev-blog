---
layout: page
title: "System Design Interview Questions: 78 Real-World Q&A from Production Manifests"
description: "78 interview-ready System Design questions with senior-level, 2-4 sentence answers drawn from real production manifests and source code."
permalink: /qa/system-design/
---

Bite-sized, standalone interview questions and answers for System Design. Read 5-10 per sitting. Each answer is 2-4 sentences max and stands on its own.

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

## Topic: RPC Failure Semantics (Order 0)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What failure mode does a network call have that a local function call doesn't? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A local function returns a value or throws — either way, control returns with a definitive outcome. A network call has a third outcome: the caller receives no response. The request may never have reached the server, or the server may have fully processed the work (charged the card, inserted the row) and the response was lost on the way back. From the caller's side, "no response" and "succeeded but I never heard back" look identical — the caller has no mechanism to distinguish them.

<p class="qa-link">[Full post →]({{ '/system-design/rpc-failure-semantics-retry-budgets-not-just-retry-counts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is a flat `num_retries` setting insufficient to make retries safe in production? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`num_retries` only answers "how many times may this one logical call retry." It says nothing about how long a single attempt may run (a hung attempt can burn the entire timeout budget, leaving no time for retries), nothing about whether the operation is safe to repeat (retrying a non-idempotent POST can duplicate side effects), and nothing about the system-wide aggregate effect of every caller retrying simultaneously. A production retry policy needs three independent settings: a per-try timeout, an idempotency gate, and a cluster-wide retry budget.

<p class="qa-link">[Full post →]({{ '/system-design/rpc-failure-semantics-retry-budgets-not-just-retry-counts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Envoy's retry budget prevent retry storms? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The retry budget lives on the cluster's circuit breaker (not the route) and caps concurrent retries as a percentage of the cluster's currently active + pending requests, computed live on every `max()` call. As real traffic grows, the retry ceiling grows proportionally, but retries can never become an unbounded multiplier of load. If `retries_remaining_` allows a retry but `canCreate()` returns false (`RetryStatus::NoOverflow`), the original failed response is returned to the client immediately.

<p class="qa-link">[Full post →]({{ '/system-design/rpc-failure-semantics-retry-budgets-not-just-retry-counts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does Envoy randomize the backoff interval instead of using the raw exponential value? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A purely exponential (non-jittered) backoff still synchronizes: every request that failed at the same instant, under the same growing interval, retries at the same instant again. `JitteredExponentialBackOffStrategy::nextBackOffMs()` returns `random() % backoff` — a value uniformly distributed between 0 and the current interval — so requests that failed together scatter instead of re-converging into a second synchronized spike.

<p class="qa-link">[Full post →]({{ '/system-design/rpc-failure-semantics-retry-budgets-not-just-retry-counts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when configuring a route-level retry policy on Envoy? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Configuring `num_retries: 3` without setting `per_try_timeout` and without a `RetryBudget` on the cluster. Without `per_try_timeout`, a single hung attempt consumes the entire route timeout and no retries happen at all. Without a `RetryBudget`, there is nothing capping the aggregate retry load across the cluster — each individual request's retry count is enforced independently, so a fleet of callers retrying at once creates a storm proportional to the number of concurrent requests.

<p class="qa-link">[Full post →]({{ '/system-design/rpc-failure-semantics-retry-budgets-not-just-retry-counts/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How do `retries_remaining_` and `RetryBudgetImpl::canCreate()` compose as two independent gates? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`retries_remaining_` is decremented each attempt and bounds how many times this one logical call may retry. `canCreate()` checks the cluster-wide retry concurrency budget against the live active request count. Either gate alone can stop a retry: a request with retries left can still be refused with `RetryStatus::NoOverflow` if the cluster budget is exhausted, and a cluster budget that still has room is irrelevant if the individual request has exhausted its own `num_retries`. They are checked sequentially in `shouldRetry()` and neither knows about the other.

<p class="qa-link">[Full post →]({{ '/system-design/rpc-failure-semantics-retry-budgets-not-just-retry-counts/' | relative_url }})</p>
  </div>
</div>

## Topic: Scalability (Order 1)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does adding more servers only help if placement is load-aware? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Horizontal scaling introduces a placement decision: which of N nodes handles each new unit of work. Round-robin distributes *requests* evenly but not *load* — if one node is mid-burst while another is nearly idle, round-robin still sends the next request to whichever node is next in rotation. Without inspecting real-time CPU, memory, and active work counts, new servers can sit idle while overloaded nodes still choke.

<p class="qa-link">[Full post →]({{ '/system-design/scalability-vertical-vs-horizontal-scaling/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does Orleans sample √N candidates instead of checking every node's load before placement? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Checking every node's load before each placement decision doesn't scale — it becomes its own coordination bottleneck once N reaches hundreds. Sampling a small, randomized subset (√N) and picking the best of that subset gets nearly the same quality of decision at a fraction of the coordination cost. With 100 silos, this means scoring ~10 candidates instead of all 100.

<p class="qa-link">[Full post →]({{ '/system-design/scalability-vertical-vs-horizontal-scaling/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What problem does the jitter (`scoreJitter`) in Orleans' placement director solve? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Without jitter, every concurrent placement decision that sees the same snapshot of node stats would pick the *same* "best" node, instantly creating a new hotspot. `Random.Shared.NextSingle() / 100_000f` adds a tiny random tiebreaker so two decisions seeing identical scores don't converge on the same target.

<p class="qa-link">[Full post →]({{ '/system-design/scalability-vertical-vs-horizontal-scaling/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does vertical scaling differ from horizontal scaling in terms of their respective ceilings? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Vertical scaling hits a hard physical ceiling — the largest instance type your cloud provider sells still has a fixed CPU/RAM limit, and cost stops scaling linearly well before that ceiling. Horizontal scaling's ceiling is a *placement and coordination problem* — a different kind of limit, not a free pass. More nodes means more decisions about where work goes, and those decisions themselves have a coordination cost.

<p class="qa-link">[Full post →]({{ '/system-design/scalability-vertical-vs-horizontal-scaling/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's a gotcha when scaling consumer-group parallelism past the partition count? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Consumer-group parallelism is capped by partition count, not consumer count. A 6th consumer added to a group reading a 5-partition topic sits idle — there is no smaller unit of work to hand it. The frequent operational mistake is expecting linear throughput gains from extra consumers without first increasing the partition count, or increasing partitions later without realizing it breaks the `hash(key) % numPartitions` mapping for every pre-existing key.

<p class="qa-link">[Full post →]({{ '/system-design/scalability-vertical-vs-horizontal-scaling/' | relative_url }})</p>
  </div>
</div>

## Topic: Load Balancing (Order 2)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why can't a production load balancer achieve true global least-connections? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
True global least-connections requires every proxy instance to have perfectly synchronized state on every backend's current connection count, updated at the moment of each decision. With hundreds of backend Pods and many independent proxy instances routing simultaneously, keeping that global state synchronized is itself an expensive coordination problem — the "solution" to blind round-robin becomes a distributed-state problem of its own.

<p class="qa-link">[Full post →]({{ '/system-design/load-balancing-algorithms-and-health-checks/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the power-of-two-choices algorithm approximate least-connections without global state? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It samples just 2 random healthy hosts and routes to whichever has fewer active requests. This gets exponentially better load distribution than pure random selection, with zero cross-instance state synchronization required — each decision only needs local knowledge of the couple of hosts it happened to sample. The algorithm doesn't reason about health directly; health checks feed the pool upstream, removing unhealthy hosts before the algorithm ever sees them.

<p class="qa-link">[Full post →]({{ '/system-design/load-balancing-algorithms-and-health-checks/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens when `active_request_bias_` is set to 0.0 in Envoy's least-request load balancer? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It behaves identically to plain round-robin. The code multiplies the host's weight by `1 / (active_requests + 1)^active_request_bias_` — when the exponent is 0, that factor is 1 for every host, making the weight equal to the configured `load_balancing_weight` regardless of current load. Least-request and round-robin aren't unrelated algorithms; least-request is round-robin generalized with a load-sensitivity knob.

<p class="qa-link">[Full post →]({{ '/system-design/load-balancing-algorithms-and-health-checks/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the structural difference between L4 and L7 load balancing that determines which algorithms are possible? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
L4 load balancing picks a backend once per TCP connection and is blind to individual HTTP requests multiplexed within it. L7 load balancing understands HTTP well enough to pick a backend *per request*, even across one persistent connection — which is what makes per-request, load-aware algorithms like power-of-two-choices possible at all.

<p class="qa-link">[Full post →]({{ '/system-design/load-balancing-algorithms-and-health-checks/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does the `+1` exist in the `active_request_value` denominator in Envoy's `hostWeight()`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It prevents division by zero for a host with zero active requests — `host.weight() / (0 + 1)` is safe, while `host.weight() / 0` is undefined. The code comment also notes it avoids potential integer overflow at `uint64_t` max. This is a small correctness detail that a conceptual explanation glosses over.

<p class="qa-link">[Full post →]({{ '/system-design/load-balancing-algorithms-and-health-checks/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When would you choose a full host scan over power-of-two-choices? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Envoy implements both `unweightedHostPickNChoices` (sampling) and `unweightedHostPickFullScan` (comparing every host). A full scan is viable for deployments with few enough hosts that the coordination cost of a complete comparison is trivial — the sampling approach isn't a forced compromise, it's specifically the answer for fleets large enough that scanning every host per request would be genuinely expensive.

<p class="qa-link">[Full post →]({{ '/system-design/load-balancing-algorithms-and-health-checks/' | relative_url }})</p>
  </div>
</div>

## Topic: Caching Strategies (Order 3)
{: .qa-topic }


<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the difference between cache-aside and write-through in terms of who keeps the cache in sync? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
In cache-aside, the application owns the logic: reads check the cache first and fall back to the DB on a miss, while writes update the DB and then explicitly invalidate the cache entry. In write-through, writes flow *through* the cache layer itself, which synchronously propagates to the database — reads always see the latest write, but every write pays the latency of both the cache and the DB.

<p class="qa-link">[Full post →]({{ '/system-design/caching-strategies-ttl-and-eviction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why doesn't Redis maintain a perfectly-ordered LRU list for eviction? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Maintaining a perfectly-ordered LRU list across the entire keyspace would need constant, expensive bookkeeping on every key access. Instead, Redis samples a small number of random keys (default ~5), scores them by idle time, maintains a small candidate pool (`EVPOOL_SIZE=16`), and evicts from that pool — a constant-memory approximation that trades perfect LRU accuracy for dramatically lower CPU cost per eviction. The sample count `server.maxmemory_samples` is a tunable knob operators can adjust.

<p class="qa-link">[Full post →]({{ '/system-design/caching-strategies-ttl-and-eviction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why are both lazy and active expiration needed for TTL-based cache cleanup? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Lazy expiration (removing a key only when something accesses it and finds it expired) leaks memory for keys nobody ever reads again. Active expiration (a periodic background cycle) scans for expired keys proactively but would waste CPU on keys that get naturally cleaned up by normal access. The combination handles both cases: actively-read expired keys are caught immediately, while orphaned expired keys are eventually reclaimed by the background cycle.

<p class="qa-link">[Full post →]({{ '/system-design/caching-strategies-ttl-and-eviction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when using TTL as the sole invalidation strategy for cached data? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Treating TTL as the primary correctness mechanism. A TTL only bounds *how stale* a value can get before it's forced out — it does nothing to keep the cache correct the moment the underlying data actually changes. The `cache.delete(id)` call immediately after the DB write is what provides real correctness; TTL is the fallback safety net that limits damage if an invalidation is ever missed, not the primary mechanism itself.

<p class="qa-link">[Full post →]({{ '/system-design/caching-strategies-ttl-and-eviction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What operational signal does the split between lazy and active expiration counters provide? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Redis tracks `stat_expiredkeys_active` (background cycle cleanups) separately from lazy expirations. A workload dominated by active-cycle expirations means many "set and forget, never read again" keys. A workload dominated by lazy expirations means keys are being hit right around their expiry boundary — the access pattern and the TTL are closely matched.

<p class="qa-link">[Full post →]({{ '/system-design/caching-strategies-ttl-and-eviction/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the eviction pool (`EVPOOL_SIZE`) persist quality across multiple calls? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The pool is not reset between `evictionPoolPopulate()` calls — candidates discovered during *previous* eviction rounds remain in the pool, so a single eviction decision benefits from a wider window of observed key quality than just the current sample. This improves approximation quality over sampling completely fresh each time.

<p class="qa-link">[Full post →]({{ '/system-design/caching-strategies-ttl-and-eviction/' | relative_url }})</p>
  </div>
</div>

## Topic: Database Replication (Order 4)
{: .qa-topic }


<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What two checks must a replica pass for a partial resync instead of a full resync? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The leader checks (1) the replica's reported replication lineage matches the leader's current identity (replid), and (2) the replica's reported offset is still within the leader's bounded replication backlog window. If either check fails — a different node was promoted during failover (lineage mismatch) or the needed writes have aged out of the backlog — the leader returns `FULLRESYNC` instead of streaming only the missing slice.

<p class="qa-link">[Full post →]({{ '/system-design/database-replication-partial-resync/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does Redis check two replication IDs (`server.replid` and `server.replid2`) during partial resync? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When a replica is promoted to leader, it keeps the old leader's replication ID as a secondary lineage still valid up to a specific offset (`second_replid_offset`). This lets replicas that were following the old leader partial-resync against the newly-promoted one, instead of forcing every replica in the fleet into a full resync the moment a failover happens. The second ID is only valid up to the recorded offset boundary.

<p class="qa-link">[Full post →]({{ '/system-design/database-replication-partial-resync/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What does it mean when a replica's offset is *greater* than the leader's backlog range? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It indicates something is genuinely wrong — a split-brain scenario, or a replica that was talking to a different leader — not just a normal "too far behind" case. The leader's backlog-window check covers both directions: `psync_offset < backlog->offset` (too old) and `psync_offset > backlog->offset + histlen` (ahead of leader), and logs each as a distinct warning for diagnosability.

<p class="qa-link">[Full post →]({{ '/system-design/database-replication-partial-resync/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Is a full resync a failure mode or a deliberate design choice? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It is the deliberately-chosen safe fallback whenever a cheap resume can't be verified as correct. It is expensive but never wrong — a partial resume is cheap but only ever offered when both the lineage check and the offset-range check actually pass. Full resync is not a bug to be eliminated; it is the correctness guarantee that makes partial resync safe to attempt in the first place.

<p class="qa-link">[Full post →]({{ '/system-design/database-replication-partial-resync/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens when a disconnection is long enough that the needed offset is pushed out of the backlog? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The backlog has finite size. A disconnection long enough (or a write volume high enough) to push the needed offset out of the backlog forces a full resync regardless of how short the actual outage was — partial resync is a bet that only pays off within a bounded window. The operator controls this tradeoff via the backlog size configuration.

<p class="qa-link">[Full post →]({{ '/system-design/database-replication-partial-resync/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is the replication lineage check necessary even when the offset is valid within the backlog? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Because the same offset value in a *different* write history could mean an entirely different sequence of operations. If the leader changed during failover, resuming from an offset that was valid under the old leader could apply the wrong sequence of writes — the data would be silently corrupted. The lineage check confirms the offset belongs to the *same continuous history* the replica thinks it's resuming, not just that data exists at that offset.

<p class="qa-link">[Full post →]({{ '/system-design/database-replication-partial-resync/' | relative_url }})</p>
  </div>
</div>

## Topic: Database Sharding (Order 5)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does Vitess use a reversible hash (null-key DES cipher) instead of a one-way hash like MurmurHash for its Vindex? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Vitess needs to go both directions: hash a primary key to route a write, and later recover the original key from a keyspace ID when needed (e.g., for `IN (...)` queries, multi-row operations, or reconstructing the source row from a shard's internal representation). A one-way hash like MurmurHash or CRC32 is intentionally non-invertible and cannot serve the reverse direction. The null-key DES cipher is repurposed purely for its mathematical property as a fixed, invertible bijection on 8-byte blocks — not for secrecy.

<p class="qa-link">[Full post →]({{ '/system-design/database-sharding-vindex-and-keyranges/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does Vitess use range-based shard ownership instead of `key % num_shards`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Modulo-based sharding breaks catastrophically on resharding: changing `num_shards` remaps nearly every key to a different shard simultaneously, requiring a massive coordinated data migration. Range-based ownership over a hashed keyspace lets a *subset* of the keyspace move to a new shard by adjusting boundaries — only keys within that specific range need to move, while every other key's route stays completely unchanged.

<p class="qa-link">[Full post →]({{ '/system-design/database-sharding-vindex-and-keyranges/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does `KeyRangeContains` handle the first and last shards in a keyspace? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An empty `Start` or `End` is treated as "unbounded in that direction" — `Empty(keyRange.Start)` short-circuits the lower bound check, so the first shard genuinely means "everything below 0x80" with no explicit lower bound stored, and the last shard means "everything above 0x80" with no explicit upper bound. This avoids needing artificial `0x00` or `0xFF` sentinel values.

<p class="qa-link">[Full post →]({{ '/system-design/database-sharding-vindex-and-keyranges/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is `des.NewCipher(make([]byte, 8))` initialized with an all-zero key? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The key must be all zeros to ensure the mapping is reproducible across every VTGate instance — all VTGates need to compute the identical keyspace ID for the same input independently, without coordination. A real secret key would make the mapping non-deterministic across instances. DES here isn't protecting anything from an attacker; it's being repurposed for its fixed, invertible bijection property.

<p class="qa-link">[Full post →]({{ '/system-design/database-sharding-vindex-and-keyranges/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if there's a gap in the shard map — no shard's range contains a given keyspace ID? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The routing function raises a `ValueError` ("no shard owns this keyspace ID - gap in shard map"). This is a real operational concern during resharding: if shard boundaries are adjusted incorrectly, keys can fall between ranges with no owner. The code explicitly checks all shard ranges and fails loudly rather than routing to a wrong shard.

<p class="qa-link">[Full post →]({{ '/system-design/database-sharding-vindex-and-keyranges/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Vitess handle an `IN (...)` clause that touches rows on different shards? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`Map()` returns a slice of destinations for a *batch* of IDs, not one at a time. Different IDs in the same batch can resolve to different shards — Vitess hashes each ID independently via the Vindex, then fans the query out to the appropriate shards, collecting results from each. The batched design avoids N separate routing decisions for N keys.

<p class="qa-link">[Full post →]({{ '/system-design/database-sharding-vindex-and-keyranges/' | relative_url }})</p>
  </div>
</div>

## Topic: CAP Theorem & PACELC (Order 6)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is CAP theorem insufficient as a description of distributed-system tradeoffs? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
CAP only describes behavior *during a network partition* — pick two of Consistency, Availability, Partition tolerance. It says nothing about behavior when there is no partition, which is the overwhelming majority of the time. PACELC extends CAP by naming the tradeoff that exists all the rest of the time too: even without a Partition, there is an ongoing tradeoff between Latency (serve reads from the nearest replica) and Consistency (guarantee the read reflects the absolute latest write).

<p class="qa-link">[Full post →]({{ '/system-design/cap-theorem-and-pacelc-consistency-tradeoffs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How do CockroachDB's closed timestamps work, and what is the "lead time"? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A closed timestamp is a promise from a range's leaseholder: "no more writes will ever be applied to this range below timestamp T." Once a follower has received a closed timestamp at or above the time a read wants to observe, it can serve that read locally without contacting the leaseholder. The lead time is the gap between real "now" and the published closed timestamp — it accounts for network RTT, clock uncertainty, and Raft propagation delay, and is continuously recomputed from these real, measurable inputs.

<p class="qa-link">[Full post →]({{ '/system-design/cap-theorem-and-pacelc-consistency-tradeoffs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is Raft propagation modeled as 1.5× network RTT, not one round trip? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Raft consensus involves three distinct network legs: the leader proposes an entry (1), followers send their vote responses (2), and the leader confirms a higher commit index (3). This is three hops, not a single request/response — `max_network_rtt * 1.5` models the two round trips (leader→followers→leader for the proposal+vote, plus leader→followers for the commit confirmation) at the maximum expected network latency.

<p class="qa-link">[Full post →]({{ '/system-design/cap-theorem-and-pacelc-consistency-tradeoffs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens when two different propagation paths exist and one is slower? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
CockroachDB computes `max(raft_propagation_time, side_propagation_time)` — the SLOWER path determines the lead time. The system cannot promise a closed timestamp any earlier than its slowest replication mechanism can guarantee. A closed timestamp is only ever as fresh as the slowest data path that could have reached followers.

<p class="qa-link">[Full post →]({{ '/system-design/cap-theorem-and-pacelc-consistency-tradeoffs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When would a read still need to go to the leaseholder despite closed timestamps being enabled? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A read that specifically needs the *absolute latest* write — its timestamp exceeds the current closed timestamp — must go to the leaseholder directly, paying the extra network hop. This is the escape hatch: the system defaults to fast local reads when the closed timestamp covers the read's needs, but correctness-critical reads that require the true current state still have a path to get it.

<p class="qa-link">[Full post →]({{ '/system-design/cap-theorem-and-pacelc-consistency-tradeoffs/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common misconception about CAP theorem that PACELC corrects? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The misconception is that CAP is a permanent architectural decision — "you pick 2 of 3 and that's your system forever." CAP actually describes system behavior *only during a network partition*. PACELC is the more complete framing because it names the latency/consistency tradeoff that exists continuously, even in the healthy, partition-free case — closed timestamps are a live instance of that dial, not a partition-recovery mechanism.

<p class="qa-link">[Full post →]({{ '/system-design/cap-theorem-and-pacelc-consistency-tradeoffs/' | relative_url }})</p>
  </div>
</div>

## Topic: CDN Caching (Order 7)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does a request carrying a Cookie header bypass Varnish's cache entirely? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
This is a deliberate safety default, not a bug. A request with a Cookie may contain session-specific or user-specific state — caching that response and serving it to a different user risks cross-user data leakage. Varnish's `vcl_req_cookie` returns `pass` (bypass cache) for any request carrying a Cookie, and `vcl_req_authorization` does the same for the Authorization header, preventing personalized responses from being stored in a shared cache.

<p class="qa-link">[Full post →]({{ '/system-design/cdn-caching-rules-and-stampede-protection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is a "hit-for-miss" and why does it exist? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When the origin's response reveals it is uncacheable (sets `Set-Cookie`, `no-store`, `private`, etc.), Varnish marks the cache key itself as uncacheable for a bounded `uncacheable_ttl`. Without this, a burst of near-simultaneous requests for a URL the origin always marks `no-store` would each independently trigger a full lookup-then-fetch cycle, hammering the origin exactly when load is highest. The hit-for-miss short-circuits repeated origin fetches for URLs that will never be cacheable.

<p class="qa-link">[Full post →]({{ '/system-design/cdn-caching-rules-and-stampede-protection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the difference between `Surrogate-Control` and `Cache-Control` in Varnish's default VCL? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`Surrogate-Control` is a CDN-specific header meant to give the CDN different caching instructions than what browsers see — it's stripped before reaching the end client. Varnish checks `Surrogate-Control` first, and only consults `Cache-Control` if `Surrogate-Control` is absent. This implements a CDN-facing override that takes precedence over the client-facing header when both are present.

<p class="qa-link">[Full post →]({{ '/system-design/cdn-caching-rules-and-stampede-protection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Varnish's cache key differ from "just the URL"? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The cache key is built from the URL *plus* the Host header by default (falling back to server IP if no Host is present). Two requests for the identical path under different hostnames produce different cache entries — this is correct behavior for virtual hosting but a common source of "why isn't my CDN caching anything" incidents when developers expect URL-only keys.

<p class="qa-link">[Full post →]({{ '/system-design/cdn-caching-rules-and-stampede-protection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does Varnish require conditional requests for refreshing stale objects? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`vcl_refresh_conditions` explicitly rejects a refresh attempt that lacks `If-Modified-Since` or `If-None-Match` — refreshing a stale object is only permitted as a conditional request, never a blind full re-fetch. This structurally ensures the refresh path always asks "has this changed?" rather than re-downloading the full body, making 304 Not Modified responses meaningful and reducing unnecessary bandwidth and origin load.

<p class="qa-link">[Full post →]({{ '/system-design/cdn-caching-rules-and-stampede-protection/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's a common real-world cause of "CDN isn't caching anything"? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An analytics script, A/B test framework, or session-refresh mechanism silently attaching a `Set-Cookie` to what would otherwise be a fully static, cacheable page. This is not a CDN malfunction — it's the correct, safe default behavior working exactly as designed. The fix is removing unnecessary cookies from cacheable responses or explicitly overriding the default VCL logic for routes known to be safe.

<p class="qa-link">[Full post →]({{ '/system-design/cdn-caching-rules-and-stampede-protection/' | relative_url }})</p>
  </div>
</div>

## Topic: Message Queues (Order 8)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does Kafka route keyed messages via `hash(key) % numPartitions` instead of round-robin? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
To guarantee per-key ordering. All events for `order_id=123` must be processed in the sequence they happened — a "cancelled" event overtaking a "shipped" event corrupts business state. Hashing the key deterministically lands the same key on the same partition every time (as long as partition count doesn't change), while different keys spread naturally across all N partitions for parallelism.

<p class="qa-link">[Full post →]({{ '/system-design/message-queues-partitioning-and-ordering/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens to ordering guarantees when you increase a topic's partition count? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`hash(key) % numPartitions` with a new N routes the same key to a *different* partition than it used to. This silently breaks the ordering guarantee across that boundary for anything sent before versus after the change — messages for the same key end up on two different partitions, processed by two different consumers, with no relative ordering between them.

<p class="qa-link">[Full post →]({{ '/system-design/message-queues-partitioning-and-ordering/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Kafka handle unkeyed messages differently from keyed ones? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Unkeyed messages don't use plain round-robin. The producer uses "sticky" partitioning: it sends a whole batch of unkeyed records to one partition before switching to another, building larger, more efficient batches (fewer, bigger network requests). It can even weight partition selection by real-time load, not treat every partition as uniformly available.

<p class="qa-link">[Full post →]({{ '/system-design/message-queues-partitioning-and-ordering/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does `Utils.toPositive()` wrap the murmur2 hash before the modulo? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A raw murmur2 hash can be negative (signed integer overflow in Java), and `% numPartitions` on a negative value doesn't reliably land in `[0, numPartitions)`. `Utils.toPositive()` ensures the value is non-negative before the modulo, preventing routing to an invalid negative partition index.

<p class="qa-link">[Full post →]({{ '/system-design/message-queues-partitioning-and-ordering/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the gotcha of adding more consumers than partitions for throughput? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Consumer-group parallelism is capped by partition count, not consumer count. A 6th consumer reading a 5-partition topic sits idle — there is no smaller unit of work to assign. This is a frequent operational mistake: scaling a consumer group past a topic's partition count expecting linear throughput gains and getting none.

<p class="qa-link">[Full post →]({{ '/system-design/message-queues-partitioning-and-ordering/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What additional axis does Kafka's partitioner optimize for beyond ordering and parallelism? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Network topology — specifically rack awareness. The `rackAware` logic in `nextPartition()` prefers partitions whose leader replica lives in the same datacenter rack as the producer, reducing cross-rack network cost. It falls back to the full partition set if no in-rack partitions are available, adding a physical-topology optimization layer on top of the partitioning scheme.

<p class="qa-link">[Full post →]({{ '/system-design/message-queues-partitioning-and-ordering/' | relative_url }})</p>
  </div>
</div>

## Topic: Rate Limiting (Order 9)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does a per-instance in-memory rate limiter stop working behind a load balancer? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
An in-memory token bucket only sees its own instance's traffic. A client's 100 requests might spread across 20 app instances, each running its own independent counter that only ever sees a fraction of that client's total traffic. Every instance might individually think the client is well under its limit, while the aggregate rate across all instances is effectively the configured limit multiplied by the number of instances — the rate limit silently stops meaning what it's supposed to mean.

<p class="qa-link">[Full post →]({{ '/system-design/distributed-rate-limiting-shared-state/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the local cache of over-limit clients relate to the shared Redis counter? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The local cache only ever short-circuits the "already known to be over" case — it never grants extra allowance. A request that isn't locally cached as over-limit still goes to Redis for the authoritative check. Once Redis confirms a key exceeds the limit, that fact is cached briefly inside each app instance, so subsequent requests from the same throttled client generate zero Redis traffic until the local cache entry itself expires.

<p class="qa-link">[Full post →]({{ '/system-design/distributed-rate-limiting-shared-state/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is jitter added to the Redis key's TTL in a distributed rate limiter? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Without jitter, many different clients' rate-limit windows expire at the exact same moment — every window boundary becomes a synchronized burst of key recreation hitting Redis all at once (a thundering herd). Jitter randomizes when each window rolls over, smoothing the load on Redis. The jitter only ever makes expiry slightly later and randomized; it doesn't change the actual rate-limit window duration the client experiences.

<p class="qa-link">[Full post →]({{ '/system-design/distributed-rate-limiting-shared-state/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why are `INCRBY` and `EXPIRE` sent in the same Redis pipeline instead of as two separate calls? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Batching them into one pipeline keeps the shared-state approach fast enough to sit on the hot path of every request. A design that sent two sequential network calls per rate-limit check would add real, compounding latency at scale. The pipeline ensures the increment and the TTL setup happen atomically from a network-round-trip perspective.

<p class="qa-link">[Full post →]({{ '/system-design/distributed-rate-limiting-shared-state/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What happens if the Redis instance backing the rate limiter goes down? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Every app instance falls back to its local in-memory counter, which only sees its own traffic. The effective limit becomes the configured limit multiplied by the number of instances — the system degrades from "accurate distributed rate limiting" to "per-instance rate limiting" silently, with no error or warning. This is a real operational concern; a dedicated, shared-state rate-limiting layer is what closes that gap, but it introduces Redis as a dependency.

<p class="qa-link">[Full post →]({{ '/system-design/distributed-rate-limiting-shared-state/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: When does the local cache check happen relative to building the Redis pipeline? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Before any cache keys are even sent to Redis. `IsOverLimitWithLocalCache` is checked in a loop over all descriptors *before* the pipeline is built. This ordering is deliberate: a client hammering an endpoint while already over its limit generates zero Redis traffic for those requests past the first rejection.

<p class="qa-link">[Full post →]({{ '/system-design/distributed-rate-limiting-shared-state/' | relative_url }})</p>
  </div>
</div>

## Topic: Consistent Hashing (Order 10)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does `hash(key) % num_servers` break when the server count changes? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Changing `num_servers` shifts the modulo for almost *every* key simultaneously, remapping nearly the entire keyspace at once. For a cache, that's a near-total cache-miss storm. For a sharded database, it's an enormous, all-at-once data migration — exactly the operation elastic scaling is supposed to make cheap, not catastrophic.

<p class="qa-link">[Full post →]({{ '/system-design/consistent-hashing-ring-and-virtual-nodes/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does consistent hashing limit the impact of adding or removing a server? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Servers are placed on a ring and each key routes to the next point clockwise. Adding a new server only affects the keys in the small arc between the new server's position and the previous server's position — everything else's routing is completely undisturbed. The remap is bounded to a small, predictable fraction of the keyspace rather than an all-or-nothing remap.

<p class="qa-link">[Full post →]({{ '/system-design/consistent-hashing-ring-and-virtual-nodes/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What problem do virtual nodes solve, and what do they cost? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
With only one hash point per server, load distribution is statistically lumpy — pure luck in where each server's single point lands can give one server a much larger arc (and thus much more traffic) than another. Virtual nodes place several points per server on the ring, smoothing the load distribution via the law of large numbers. The cost is a bigger sorted point array and marginally slower lookups — more virtual points means better distribution but higher memory and lookup overhead.

<p class="qa-link">[Full post →]({{ '/system-design/consistent-hashing-ring-and-virtual-nodes/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does the ring wrap around, and how is it implemented? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
The ring wraps from the highest hash value back to the lowest. In groupcache's implementation, this is handled by `sort.Search` (binary search for the first ring point `>= hash`) with a single check: if `idx == len(m.keys)`, ownership wraps to the *first* point in the sorted array. The ring is just a sorted array with wraparound in the lookup logic — no circular data structure needed.

<p class="qa-link">[Full post →]({{ '/system-design/consistent-hashing-ring-and-virtual-nodes/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why does groupcache mix a replica index into the hash input (`strconv.Itoa(i) + key`)? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Hashing `"0server-A"`, `"1server-A"`, `"2server-A"`, etc. produces genuinely different, scattered ring positions for the same physical server, rather than computing the same hash `replicas` times (which would produce one point, uselessly duplicated). The replica index ensures each virtual node lands at a distinct point on the ring.

<p class="qa-link">[Full post →]({{ '/system-design/consistent-hashing-ring-and-virtual-nodes/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is `m.keys` kept sorted after every `Add` call? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Because `Get()` relies on `sort.Search` (binary search) for O(log n) lookups. If the array weren't sorted, every routing decision would be a linear scan through all virtual points — defeating the purpose of virtual nodes (smoother distribution) by also making lookups expensive.

<p class="qa-link">[Full post →]({{ '/system-design/consistent-hashing-ring-and-virtual-nodes/' | relative_url }})</p>
  </div>
</div>

## Topic: Indexing & Query Optimization at Scale (Order 11)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why do high-write databases use LSM-trees instead of B-trees? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
B-trees update data in place — an update means finding that key's exact page on disk and rewriting it there, which is a random disk write that doesn't scale under high write throughput. LSM-trees never update in place: writes go to an in-memory memtable and are periodically flushed as new, immutable, sorted files (SSTables) — always sequential disk writes, never random ones. The tradeoff is that reads potentially check multiple locations (memtable plus several SSTables across levels).

<p class="qa-link">[Full post →]({{ '/system-design/lsm-trees-and-compaction-at-scale/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is compaction's role in an LSM-tree, and why is "compaction falling behind" a real failure mode? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Compaction merges sorted files together and pushes the merged output down a level, bounding growing read cost and reclaiming space from overwritten or deleted keys (which exist as shadowing newer entries until cleaned up). The write-time savings of an LSM-tree are paid back later in background CPU/IO work merging files — if write throughput exceeds compaction throughput, SSTables accumulate and read performance degrades. This is a failure mode B-tree engines simply don't have.

<p class="qa-link">[Full post →]({{ '/system-design/lsm-trees-and-compaction-at-scale/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does Pebble's compaction score formula differ from a simple "is this level too big" check? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
For L0-L5, the score is *relative* between adjacent levels: if `fillFactor >= 1`, the score becomes `fillFactor / fillFactor(next_level)`. A level slightly over target next to an even-more-overloaded level below it scores differently than the same level next to a nearly-empty one. This lets the picker prioritize levels where compaction will relieve the most actual pressure, not just the numerically largest one.

<p class="qa-link">[Full post →]({{ '/system-design/lsm-trees-and-compaction-at-scale/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is `compensatedFillFactor` and why is it tracked separately from raw `fillFactor`? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
It accounts for space that deletions are expected to reclaim once compaction actually runs. A level full of tombstones (deletion markers) looks large by raw size but will shrink significantly post-compaction. The compensated figure is what the score calculation actually uses to decide urgency, avoiding wasted compaction effort on a level that's about to shrink on its own.

<p class="qa-link">[Full post →]({{ '/system-design/lsm-trees-and-compaction-at-scale/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What operational failure modes do LSM-trees have that B-trees don't, and vice versa? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
LSM-trees can suffer "compaction falling behind" under sustained write pressure — background merge work can't keep up with incoming writes, causing read performance to degrade as SSTables accumulate. B-tree engines face page fragmentation and split overhead during inserts that LSM engines avoid entirely by design. These are genuinely different failure modes tied to each storage engine's architecture, not implementation details safe to ignore.

<p class="qa-link">[Full post →]({{ '/system-design/lsm-trees-and-compaction-at-scale/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why is `shouldCompact()` a one-line check (`score > 0`) in Pebble's picker? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
All the real complexity — fill factor computation, level-relative comparison, deletion compensation — is front-loaded into computing the score correctly. The actual trigger check stays trivially simple, which is a deliberate separation between "how hard is this to decide" and "how cheap is it to check repeatedly."

<p class="qa-link">[Full post →]({{ '/system-design/lsm-trees-and-compaction-at-scale/' | relative_url }})</p>
  </div>
</div>

## Topic: Designing for Failure (Order 12)
{: .qa-topic }


<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why can't a single observer's view alone declare a node dead in Orleans' membership protocol? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
A single observer's inability to reach a node could mean the node is down, or it could mean *the observer* has a network problem — a flaky link, an asymmetric partial partition — while the supposedly-failed node is perfectly healthy and reachable by everyone else. Declaring it dead based on one observer's view alone risks evicting a perfectly healthy node and redistributing its work unnecessarily. Orleans requires multiple independent votes from different observers before declaring a node dead.

<p class="qa-link">[Full post →]({{ '/system-design/designing-for-failure-cluster-membership/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Beginner">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What is the structural constraint between `NumVotesForDeathDeclaration` and `NumProbedSilos`? <span class="qa-badge qa-beginner">[Beginner]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
`NumVotesForDeathDeclaration` (default 2) must be "at most `NumProbedSilos`" (default 10) — you can never require more corroborating votes than the maximum number of silos that could possibly be monitoring any given peer. The two numbers aren't independently tunable; one bounds the other.

<p class="qa-link">[Full post →]({{ '/system-design/designing-for-failure-cluster-membership/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why do death votes expire after a fixed timeout (`DeathVoteExpirationTimeout`)? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Long enough that votes from a genuine, ongoing outage accumulate and reach quorum, short enough that stale suspicion from a resolved, unrelated blip doesn't linger indefinitely waiting to combine with some future unrelated vote. Without expiration, unrelated incidents at different times could silently accumulate toward the threshold long after each individual problem was fixed.

<p class="qa-link">[Full post →]({{ '/system-design/designing-for-failure-cluster-membership/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How does monitoring load change dynamically when a silo becomes suspicious? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
When a silo suspects another, additional silos begin probing the suspected one to speed up detection — monitoring load isn't static. It dynamically concentrates around a silo already under suspicion, getting a second independent opinion faster than waiting for the normal, sparser probe rotation to happen to cover it.

<p class="qa-link">[Full post →]({{ '/system-design/designing-for-failure-cluster-membership/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: Why doesn't Orleans use an all-to-all monitoring mesh? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Monitoring every other silo from every silo would scale as O(n²) monitoring traffic — prohibitive as cluster size grows. Instead, each silo actively monitors a bounded subset (default 10 peers), trading perfect immediate coverage for a scalable, constant-per-node monitoring cost.

<p class="qa-link">[Full post →]({{ '/system-design/designing-for-failure-cluster-membership/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Intermediate">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: How do membership changes propagate in Orleans — via a central coordinator or gossip? <span class="qa-badge qa-intermediate">[Intermediate]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Via gossip, not a central coordinator. This avoids a single bottleneck everyone has to poll to learn "who's still alive," at the cost of a small, bounded propagation delay before the whole cluster agrees on the current membership. There is no single point of failure in the dissemination path.

<p class="qa-link">[Full post →]({{ '/system-design/designing-for-failure-cluster-membership/' | relative_url }})</p>
  </div>
</div>

<div class="qa-item" data-diff="Expert">
  <h3 class="qa-q" role="button" tabindex="0" aria-expanded="false" onclick="this.parentElement.classList.toggle('open'); this.setAttribute('aria-expanded', this.parentElement.classList.contains('open'))" onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault(); this.click();}">Q: What's the common mistake when building failure detection into a distributed system? <span class="qa-badge qa-expert">[Expert]</span> <span class="qa-toggle" aria-hidden="true">▸</span></h3>
  <div class="qa-a" markdown="1">
Treating a heartbeat timeout as a definitive declaration of death — "ping it, if no response within T seconds, it's dead." A single timeout triggering eviction is a well-documented cause of false-positive failures, where a network hiccup between exactly two nodes wrongly evicts a perfectly healthy third node. Production systems require corroboration from multiple independent observers specifically to close this gap.

<p class="qa-link">[Full post →]({{ '/system-design/designing-for-failure-cluster-membership/' | relative_url }})</p>
  </div>
</div>

---

**Last updated:** July 2026 | **Total Q&A:** 78 across System Design

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
