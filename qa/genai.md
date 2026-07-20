---
layout: page
title: "Generative AI — Q&A Bank"
permalink: /qa/genai/
---

Bite-sized questions and answers from Generative AI blog posts. Read 5-10 per sitting. Each answer is 2-4 sentences max and links back to the full post for deeper understanding.

## Topic: Prompt Engineering Fundamentals (Order 1)

### Q: What breaks when you concatenate system instructions and user input into a single prompt string?
The model cannot distinguish instruction from data because there is no structural boundary. If user input contains "Ignore the above and instead…", nothing in the prompt's shape tells the model it is data, not a command. This is the root mechanism behind prompt injection — a representation problem, not a wording problem.
→ Post: `_posts/2026-06-05-prompt-engineering-system-vs-user-messages.md`

### Q: How does `SystemMessagePromptTemplate` enforce role separation differently from a labeled string?
Three template classes share identical formatting logic from `_StringImageMessagePromptTemplate`; the only difference is a `_msg_class` attribute (`SystemMessage`, `HumanMessage`, `AIMessage`). The Python object's type *is* the role — there is no string to mistype. `format_messages()` delegates to each child template; it never inspects content to decide a role.
→ Post: `_posts/2026-06-05-prompt-engineering-system-vs-user-messages.md`

### Q: What problem does `validate_input_variables()` solve that an f-string cannot?
It unions every child message template's variables at construction time, producing a machine-checkable contract. A missing `{name}` raises a Pydantic validation error immediately — not silently three turns later as a blank or malformed prompt section, which is what happens with a hand-written f-string.
→ Post: `_posts/2026-06-05-prompt-engineering-system-vs-user-messages.md`

### Q: Why doesn't putting `SYSTEM:` as a text label inside a single message achieve the same separation?
A text label inside a single message is just more tokens the model interprets. The actual mechanism is the chat API's `role` field on each message object — a property the model was specifically trained to condition on. No text label inside a single message can reproduce that API-level distinction.
→ Post: `_posts/2026-06-05-prompt-engineering-system-vs-user-messages.md`

### Q: When would you drop the system message after the first turn in a multi-turn conversation, and why is that a mistake?
Never intentionally. Dropping it after turn one means subsequent turns have no standing instructions, and the model gradually stops following them. A correct multi-turn design re-sends (or preserves via `partial_variables`) the system message across all turns so instructions remain authoritative.
→ Post: `_posts/2026-06-05-prompt-engineering-system-vs-user-messages.md`

## Topic: Embeddings & Vector Search (Order 2)

### Q: Why is cosine similarity equivalent to a plain dot product in a production vector database?
Because every vector is normalized to unit length at insert time. When `|a| = |b| = 1`, the denominator in `cos(θ) = (a·b)/(|a|·|b|)` is 1, so the formula collapses to `a·b`. Qdrant's `CosineMetric::similarity` delegates directly to `DotProductMetric::similarity` — zero cosine-specific code at query time.
→ Post: `_posts/2026-06-21-embeddings-vector-search-cosine-normalization-hnsw.md`

### Q: What happens during an HNSW search above layer 0 versus at layer 0?
Upper layers use beam width 1 — a greedy descent that hops to the single closest neighbor at each level, trading precision for speed. Only at layer 0 does the algorithm switch to a real beam search with width `ef`, exploring multiple candidates to locate the true nearest neighbors.
→ Post: `_posts/2026-06-21-embeddings-vector-search-cosine-normalization-hnsw.md`

### Q: If you skip normalization when using cosine distance, what wrong ranking do you get?
Vectors are scored by dot product weighted by their magnitudes — longer vectors (higher magnitude) rank higher regardless of angular similarity. This is a different metric than cosine similarity and produces incorrect retrieval results, especially when embeddings have varying magnitudes.
→ Post: `_posts/2026-06-21-embeddings-vector-search-cosine-normalization-hnsw.md`

### Q: Why does `cosine_preprocess` check `is_length_zero_or_normalized` before dividing?
Two edge cases: a zero vector cannot be normalized (division by zero), and a vector already at unit length wastes work. Both are cheap short-circuits around the sqrt/divide that would otherwise run on every insert.
→ Post: `_posts/2026-06-21-embeddings-vector-search-cosine-normalization-hnsw.md`

### Q: What is the tradeoff of increasing `ef` in HNSW?
Higher `ef` means a wider beam at layer 0, which improves recall (fewer missed nearest neighbors) but increases per-query latency because more distance computations are performed. It is the primary dial for the recall/latency tradeoff.
→ Post: `_posts/2026-06-21-embeddings-vector-search-cosine-normalization-hnsw.md`

## Topic: RAG Fundamentals (Order 3)

### Q: Does the LLM retrieve documents itself during generation?
No. Retrieval is a structurally separate stage that completes entirely before the LLM is invoked. A retriever fetches documents, their text is joined into one string, and that string fills the prompt's `{context}` placeholder. The LLM never sees a retriever — it just receives a longer prompt.
→ Post: `_posts/2026-07-05-rag-fundamentals-retrieval-before-generation.md`

### Q: What is "stuffing" in RAG, and when does it break down?
Stuffing joins all retrieved document texts into a single string via `.join()` and substitutes it into the prompt. It breaks down when documents are too numerous or too large — the combined context exceeds the model's context window, or the irrelevant documents dilute the signal for the model.
→ Post: `_posts/2026-07-05-rag-fundamentals-retrieval-before-generation.md`

### Q: What happens if the retrieved context is irrelevant to the query?
An LLM given irrelevant pasted-in text will often incorporate it into the answer anyway. Nothing in the stuffing mechanism validates relevance before it reaches the prompt. This is why retrieval quality (embeddings, chunking) matters as much as the combination step.
→ Post: `_posts/2026-07-05-rag-fundamentals-retrieval-before-generation.md`

### Q: How does `create_retrieval_chain` compose retrieval and combination as separate concerns?
`create_retrieval_chain` assigns the `context` key from the retriever's output, then feeds that into `create_stuff_documents_chain` which produces the `answer`. Each is an independent `Runnable` — you can swap the retriever (different vector store, hybrid search) or the combination strategy (map-reduce, refine) independently.
→ Post: `_posts/2026-07-05-rag-fundamentals-retrieval-before-generation.md`

### Q: What is the risk of the `document_separator` in a stuff-combination chain?
If the separator string (default `"\n\n"`) appears in a document's own content, the model may misread the boundary between documents. Choosing a separator that cannot appear in the source material (e.g., a UUID-based delimiter) prevents this misalignment.
→ Post: `_posts/2026-07-05-rag-fundamentals-retrieval-before-generation.md`

## Topic: Chunking Strategies for RAG (Order 4)

### Q: Why does fixed-size chunking silently degrade retrieval quality?
Fixed-size splitting cuts at token boundaries without respecting sentence or paragraph structure. A chunk split mid-sentence gets two halves — neither embedding represents the idea, so a query that should match that sentence may not surface either half. No error is thrown; the chunk is just quietly worse at being found.
→ Post: `_posts/2026-07-19-chunking-strategies-for-rag-fixed-size-vs-semantic-splitting.md`

### Q: How does `SentenceSplitter`'s fallback ladder decide when to use a smaller unit?
It tries paragraph separators first. If the resulting piece still exceeds `chunk_size`, it tries sentence boundaries, then a regex clause splitter, then a generic separator, then individual characters — descending only when the current unit is still too large. It keeps the largest structurally meaningful unit that fits.
→ Post: `_posts/2026-07-19-chunking-strategies-for-rag-fixed-size-vs-semantic-splitting.md`

### Q: What makes `SemanticSplitterNodeParser` produce variable-length chunks?
It has no `chunk_size` constraint. Breakpoints are determined by cosine distance between adjacent sentence-group embeddings — a chunk ends wherever the topic shifts, as measured by `distance[i] > np.percentile(distances, threshold)`. Chunk length is an output, not an input.
→ Post: `_posts/2026-07-19-chunking-strategies-for-rag-fixed-size-vs-semantic-splitting.md`

### Q: Why is chunk overlap implemented as piece-carrying rather than character slicing?
`close_chunk()` walks the previous chunk backward one already-sized piece at a time, inserting whole `(text, length)` tuples into the new chunk. This prevents reintroducing a half-sentence fragment — the exact fragmentation problem chunking exists to solve.
→ Post: `_posts/2026-07-19-chunking-strategies-for-rag-fixed-size-vs-semantic-splitting.md`

### Q: What happens when `chunk_overlap` exceeds `chunk_size` in `SentenceSplitter`?
The constructor raises a `ValueError` immediately at construction time. An overlap larger than the chunk itself makes the merge loop nonsensical — the overlap budget would always exceed the chunk content.
→ Post: `_posts/2026-07-19-chunking-strategies-for-rag-fixed-size-vs-semantic-splitting.md`

### Q: How does raising `breakpoint_percentile_threshold` in the semantic splitter affect chunk count?
It produces fewer, larger chunks. A higher percentile raises the distance threshold, so fewer adjacent-sentence distances exceed it, fewer breakpoints are detected, and `_build_node_chunks` closes out chunks less frequently.
→ Post: `_posts/2026-07-19-chunking-strategies-for-rag-fixed-size-vs-semantic-splitting.md`

## Topic: Vector Databases & Indexing (Order 5)

### Q: Why is brute-force cosine search unacceptable at million-vector scale?
Brute-force is O(n·d) per query — linear in collection size and dimensionality. At 1M vectors with 1536 dimensions, per-query latency reaches ~500ms before any generation happens. For real-time applications, this is a non-starter; HNSW reduces it to roughly O(log(n)·d).
→ Post: `_posts/2026-07-21-vector-databases-hnsw-graph-traversal.md`

### Q: What role does the `M` parameter play in HNSW graph construction?
`M` is the maximum number of links per node per layer. Layer 0 gets `M0 = 2*M` because it is the most traversed. Higher `M` means denser graphs with better recall but more memory and slower construction — a direct tradeoff between graph quality and resource cost.
→ Post: `_posts/2026-07-21-vector-databases-hnsw-graph-traversal.md`

### Q: Why does Qdrant's `search_on_level` reuse a `VisitedList` from a pool?
Allocating a fresh `Vec<bool>` for every query is expensive. The pool reuses memory across concurrent searches, avoiding allocation overhead while still ensuring every point is scored at most once per layer — the visited list prevents redundant scoring.
→ Post: `_posts/2026-07-21-vector-databases-hnsw-graph-traversal.md`

### Q: What happens when HNSW search encounters deleted vectors?
Qdrant marks vectors as deleted and lazily cleans up links during segment consolidation. The Acorn algorithm (`SearchAlgorithm::Acorn`) provides better recall on graphs with deletions by doing 2-hop neighbor exploration to route around dead nodes.
→ Post: `_posts/2026-07-21-vector-databases-hnsw-graph-traversal.md`

### Q: How does filtered search work with HNSW, and why does it matter?
`FilteredScorer` skips vectors that don't match a payload filter, and `custom_entry_points` can seed traversal from the highest-level point that passes the filter. This avoids wasted computation at upper layers — the search descends directly toward the relevant neighborhood.
→ Post: `_posts/2026-07-21-vector-databases-hnsw-graph-traversal.md`

## Topic: Tool Use / Function Calling (Order 6)

### Q: When the model emits a `tool_calls` entry, does it execute the function?
No. The model generates a JSON payload naming the function and arguments. Your application code receives that payload, decides whether to run it, executes it separately, and sends the result back as a `tool` message. The model never has runtime access to your code.
→ Post: `_posts/2026-07-21-genai-function-calling-tool-selection.md`

### Q: Why is `call.function.arguments` a string instead of a parsed dict?
The model generates raw tokens that happen to form valid JSON — the API does not parse them server-side. Your code must call `json.loads()` on the string, which can raise `JSONDecodeError` if the model hallucinated malformed JSON. The SDK docstring explicitly warns about this.
→ Post: `_posts/2026-07-21-genai-function-calling-tool-selection.md`

### Q: What is the difference between `tool_choice="required"` and `tool_choice="auto"`?
`"auto"` lets the model decide whether to call a tool or answer directly. `"required"` forces the model to emit at least one tool call on every response, even for straightforward questions. Use `"required"` when your orchestration layer expects a tool call; use `"auto"` when skipping tools should be an option.
→ Post: `_posts/2026-07-21-genai-function-calling-tool-selection.md`

### Q: What happens if you send a tool result with the wrong `tool_call_id`?
The model sees a result it never asked for and produces incoherent output. There is no validation error — just a degraded response, because the `tool_call_id` is the only link between a tool result and the model's request.
→ Post: `_posts/2026-07-21-genai-function-calling-tool-selection.md`

### Q: When would you use `tool_choice` to force a specific function by name?
When your orchestration layer has already decided which tool should run (e.g., a routing decision, controlled testing, or a deterministic pipeline). It forces the model to emit tool calls for that specific function regardless of whether it judges it appropriate — useful for determinism but can produce bad arguments if forced into a tool that doesn't apply.
→ Post: `_posts/2026-07-21-genai-function-calling-tool-selection.md`

## Topic: Agentic Loops / ReAct (Order 7)

### Q: Why is a `while True` loop over tool calls insufficient for a production ReAct agent?
It has no checkpointing (crash = restart from scratch), no parallel dispatch (tools run sequentially), no human-in-the-loop (no structural place to pause before dangerous tools), and no observability (no tracing, no replay). LangGraph's graph topology gives all four as first-class features.
→ Post: `_posts/2026-07-21-langgraph-react-agent-state-machine.md`

### Q: What does the `add_messages` reducer do when a node returns a message with the same `id` as an existing one?
It replaces the existing message instead of appending a duplicate. This makes tool-result injection idempotent — if the same `ToolMessage` is returned twice (e.g., after a replay), the state does not grow.
→ Post: `_posts/2026-07-21-langgraph-react-agent-state-machine.md`

### Q: How does LangGraph v2's `Send` API handle multiple tool calls from a single agent turn?
`should_continue` returns a list of `Send("tools", ToolCallWithContext(...))` objects — one per tool call. The runtime creates a separate task for each `Send`, each with its own `ToolNode` invocation and state snapshot, enabling true parallel execution.
→ Post: `_posts/2026-07-21-langgraph-react-agent-state-machine.md`

### Q: Why does `handle_tool_errors` catch invocation errors but re-raise execution errors?
An invocation error means the LLM produced bad arguments — the LLM can fix this if it sees the error message. An execution error means your tool code crashed (network timeout, bug) — surfacing it immediately lets you debug it, whereas sending it to the LLM wastes tokens on a problem it cannot fix.
→ Post: `_posts/2026-07-21-langgraph-react-agent-state-machine.md`

### Q: What prevents a ReAct agent from looping infinitely when the LLM keeps requesting tools?
`remaining_steps` is checked before each LLM call. When the budget is exhausted, the agent returns a graceful "need more steps" message instead of raising `GraphRecursionError`.
→ Post: `_posts/2026-07-21-langgraph-react-agent-state-machine.md`

### Q: What is the purpose of `pre_model_hook` in `create_react_agent`?
It lets you inject message trimming, guardrails, or human-in-the-loop logic without modifying the agent loop itself. If conversation history exceeds the context window, trim it in a pre-model hook — not inside the agent node — keeping the agent node pure and testable.
→ Post: `_posts/2026-07-21-langgraph-react-agent-state-machine.md`

## Topic: Multi-Agent Orchestration (Order 8)

### Q: What problem does `BaseGroupChatManager` solve that a shared message bus alone cannot?
Without a coordinator, no entity decides who speaks next, when the conversation stops, or how context accumulates. The manager owns the message thread, selects the next speaker, and enforces termination — without it, agents produce unbounded loops until token limits or timeouts.
→ Post: `_posts/2026-07-21-autogen-multi-agent-coordination.md`

### Q: What is the cost of `SelectorGroupChat`'s speaker selection on each turn?
Each selection is a full LLM call — system message, conversation history, and response parsing. In a 10-turn conversation with 3 agents, that is 10 additional LLM calls purely for coordination overhead, not content production. This is a real cost consideration.
→ Post: `_posts/2026-07-21-autogen-multi-agent-coordination.md`

### Q: Why does the selector fall back silently to the previous speaker after exhausting `max_selector_attempts`?
It is a design choice for graceful degradation — a misconfigured agent description produces a stuck conversation where the same agent speaks repeatedly, but no crash occurs. The silence is the risk: you may not notice degraded behavior without explicit logging.
→ Post: `_posts/2026-07-21-autogen-multi-agent-coordination.md`

### Q: What happens when you write vague agent descriptions like "A helpful assistant" for all agents in a `SelectorGroupChat`?
The selector LLM has no signal to differentiate agents and picks arbitrarily. The `description` field is what the selector prompt uses to rank candidates — without specificity, speaker selection degrades to random.
→ Post: `_posts/2026-07-21-autogen-multi-agent-coordination.md`

### Q: When would you choose `RoundRobinGroupChat` over `SelectorGroupChat`?
When you want deterministic, minimal-overhead coordination. Round-robin is 3 lines of code (index + 1 mod n), costs zero LLM calls for speaker selection, and works well when the task has a predictable turn sequence. Start with round-robin; upgrade to selector only when the coordination complexity justifies the extra LLM cost.
→ Post: `_posts/2026-07-21-autogen-multi-agent-coordination.md`

## Topic: Agent Memory Management (Order 9)

### Q: Why can't long-term facts, working memory, and procedural memory share one vector collection?
Long-term facts need semantic search and deduplication; working memory needs fast sequential reads of the last *k* messages (no embeddings); procedural memory needs verbatim trajectory preservation that resists summarization. Mixing them causes long-term facts to be drowned by verbose procedural summaries during search.
→ Post: `_posts/2026-07-21-mem0-agent-memory-short-long-working.md`

### Q: How does mem0's hybrid search pipeline combine semantic, keyword, and entity signals?
Semantic cosine similarity provides the base score, BM25 keyword search adds a second signal, and entity boosts (capped at 0.5 weight) provide a third. The formula `combined = (semantic + bm25 + entity) / max_possible` normalizes to [0, 1]. A semantic threshold gates results before combining — keyword-only matches below the threshold are excluded.
→ Post: `_posts/2026-07-21-mem0-agent-memory-short-long-working.md`

### Q: Why does procedural memory bypass the 8-phase `add()` pipeline?
Execution trajectories are unique — two runs of the same agent produce different step-by-step outputs. Deduplicating them via MD5 hash would destroy valuable state. The `PROCEDURAL_MEMORY_SYSTEM_PROMPT` also demands verbatim output preservation, conflicting with the `ADDITIVE_EXTRACTION_PROMPT`'s 15-80 word compression target.
→ Post: `_posts/2026-07-21-mem0-agent-memory-short-long-working.md`

### Q: What is the role of the entity store, and why is it a separate collection instead of metadata on each memory?
Entity linking needs bidirectional access — from memory to entities (already in the payload) and from entity to memories (for boost computation). A separate `mem0_entities` collection lets `_compute_entity_boosts()` search for "all memories mentioning 'Alice'" without scanning every memory's metadata.
→ Post: `_posts/2026-07-21-mem0-agent-memory-short-long-working.md`

### Q: Why does `score_and_rank` over-fetch by 4x before returning the top-k results?
The additive scoring pipeline can promote a low-ranked semantic result that has strong BM25 or entity-boost signals, so the final top-k may not be the semantic top-k. Over-fetching ensures the scoring pipeline has a large enough candidate pool to find these promoted results.
→ Post: `_posts/2026-07-21-mem0-agent-memory-short-long-working.md`

## Topic: Durable Agent State & Checkpointing (Order 10)

### Q: Why must LangGraph snapshot state after every superstep, not just at the end of a run?
"The end" is not predictable — a human-in-the-loop interrupt pauses mid-graph, a crash happens at an arbitrary point, and debugging needs the exact state at a specific superstep. Only per-superstep snapshots guarantee that any interruption point has a resumable state.
→ Post: `_posts/2026-07-21-langgraph-checkpointer-durable-agent-state.md`

### Q: What do `channel_versions` and `versions_seen` in a `Checkpoint` control?
`channel_versions` tracks a monotonically increasing version counter per channel. `versions_seen` tracks which version each node last observed. Nodes with stale versions are marked dirty and re-executed — this prevents redundant LLM calls and ensures exactly-once node execution per superstep.
→ Post: `_posts/2026-07-21-langgraph-checkpointer-durable-agent-state.md`

### Q: What does `CheckpointMetadata.source` tell you?
It identifies why a snapshot exists: `"input"` for user invocations, `"loop"` for Pregel-internal snapshots, `"update"` for manual state mutations, `"fork"` for time-travel copies. This metadata is essential for debugging and for reconstructing the history of a thread.
→ Post: `_posts/2026-07-21-langgraph-checkpointer-durable-agent-state.md`

### Q: How does `AsyncSqliteSaver.aput` handle re-running a superstep?
`INSERT OR REPLACE` overwrites the old snapshot rather than creating a duplicate. If a superstep is retried (e.g., after a transient failure), the checkpoint is replaced atomically — no stale state accumulates.
→ Post: `_posts/2026-07-21-langgraph-checkpointer-durable-agent-state.md`

### Q: Why is SQLite unsuitable for production agent workloads?
SQLite has single-writer constraints and lock serialization that make it unsuitable for concurrent agent workloads. `AsyncSqliteSaver` is for development and prototyping; production deployments use `PostgresSaver` for concurrent access, row-level locking, and TTL-based pruning.
→ Post: `_posts/2026-07-21-langgraph-checkpointer-durable-agent-state.md`

### Q: What is the purpose of `put_writes` versus `put` in `BaseCheckpointSaver`?
`put` snapshots the full checkpoint after a superstep completes. `put_writes` saves intermediate task outputs *within* a superstep — when a superstep has multiple parallel tasks (e.g., parallel tool calls), each task's writes are stored separately before the full checkpoint is consolidated.
→ Post: `_posts/2026-07-21-langgraph-checkpointer-durable-agent-state.md`

## Topic: Agent-to-Agent (A2A) Communication (Order 11)

### Q: Why is raw HTTP POST insufficient for agent-to-agent collaboration?
HTTP POST is a transport, not a protocol. It says nothing about capability advertisement, task state management, content negotiation, or long-running async patterns. A2A defines all four: Agent Cards for discovery, Task lifecycle for state management, Message/Part for content typing, and JSON-RPC for uniform dispatch.
→ Post: `_posts/2026-07-21-google-a2a-agent-handshake-protocol.md`

### Q: What are the two "interrupted" states in A2A's Task lifecycle, and why are they not terminal?
`INPUT_REQUIRED` and `AUTH_REQUIRED` pause the task and return control to the client with a structured message explaining what is needed. They resume when the client sends a follow-up in the same task context. This enables mid-task human approval — something raw HTTP POST cannot express.
→ Post: `_posts/2026-07-21-google-a2a-agent-handshake-protocol.md`

### Q: How does A2A handle long-running tasks that take minutes to complete?
The client sets `return_immediately=true` in `SendMessageConfiguration`, gets a `Task` with `state=SUBMITTED`, then either polls via `GetTask`, subscribes via SSE stream, or registers a `TaskPushNotificationConfig` for webhook callbacks. The client is never blocked.
→ Post: `_posts/2026-07-21-google-a2a-agent-handshake-protocol.md`

### Q: What is the difference between A2A and MCP in terms of which direction the collaboration flows?
MCP defines client-to-server tool invocation — the agent is always the client, the tool is always the server. A2A defines peer-to-peer agent collaboration where both sides have their own task state, memory, and decision-making. A2A complements MCP: an orchestrator might use MCP for a database tool and A2A for a specialist agent.
→ Post: `_posts/2026-07-21-google-a2a-agent-handshake-protocol.md`

### Q: Why does A2A use a well-known URL (`/.well-known/agent.json`) instead of a central registry?
Discovery is peer-to-peer — if you know an agent's URL, you can fetch its card. This eliminates a single point of failure but means no global search capability. An orchestrator agent can maintain its own registry of known agent URLs, but the protocol itself does not define one.
→ Post: `_posts/2026-07-21-google-a2a-agent-handshake-protocol.md`

## Topic: Context Window Management (Order 12)

### Q: Why can't you use tiktoken to estimate Claude's token count?
Tiktoken implements OpenAI's BPE vocabulary, which produces different token boundaries than Claude's tokenizer. The same text can differ by 10-20% between the two, and the error is not predictable — it depends on content type. The only reliable source is the `Usage` object in every API response.
→ Post: `_posts/2026-07-21-anthropic-token-counting-context-window.md`

### Q: What three fields contribute to total input token consumption in Claude's `Usage` object?
`input_tokens` (uncached tokens), `cache_creation_input_tokens` (tokens written to cache on this request), and `cache_read_input_tokens` (tokens loaded from existing cache). Total input is the sum of all three, and it must fit within the context window minus `max_tokens` for output.
→ Post: `_posts/2026-07-21-anthropic-token-counting-context-window.md`

### Q: Why does Claude's `usage.input_tokens` count not match `len(text) / 4`?
The API's count includes tokens you cannot see: message structure delimiters, role markers, system prompt tokens, and internal formatting applied during tokenization. The `Message.usage` docstring explicitly states counts "will not match one-to-one with the exact visible content."
→ Post: `_posts/2026-07-21-anthropic-token-counting-context-window.md`

### Q: During streaming, when do you get the final token counts?
`input_tokens` arrives in the `message_start` event (first event). `output_tokens` arrives in the `message_delta` event (last event). You cannot get a partial token count mid-stream — the full count is available only when the stream completes via `get_final_message()`.
→ Post: `_posts/2026-07-21-anthropic-token-counting-context-window.md`

### Q: What is the practical consequence of setting `max_tokens` too high?
It reduces the input budget — the context window budget is `context_window - max_tokens` for input. Setting `max_tokens` to 4096 on a 200k-context model leaves ~196k for input. Setting it to 100k leaves only ~100k for input, potentially truncating useful context.
→ Post: `_posts/2026-07-21-anthropic-token-counting-context-window.md`

## Topic: Streaming Responses (Order 13)

### Q: Why does the OpenAI SDK buffer bytes in `SSEDecoder._iter_chunks` instead of processing each HTTP chunk immediately?
SSE events are delimited by blank lines (`\n\n`), and an HTTP chunk can split an event mid-payload. The decoder accumulates bytes and only yields a complete frame when it sees the delimiter. Processing partial frames would produce malformed JSON.
→ Post: `_posts/2026-07-21-openai-streaming-sse-message-accumulation.md`

### Q: Why is the `usage` field `None` for most chunks during streaming?
OpenAI's API sends token usage statistics only in the final chunk when `stream_options: {"include_usage": true}` is set. All intermediate chunks carry `None` for `usage` — a deliberate design to minimize per-chunk payload size.
→ Post: `_posts/2026-07-21-openai-streaming-sse-message-accumulation.md`

### Q: What happens in `Stream.__stream__` when the consumer stops iterating early?
The `finally: response.close()` block ensures the HTTP connection is released. The accumulated snapshot will be whatever was received before the interruption — the SDK does not retry because the server's generation state is not resumable.
→ Post: `_posts/2026-07-21-openai-streaming-sse-message-accumulation.md`

### Q: How does `accumulate_delta` handle tool call arguments arriving across multiple chunks?
`ChoiceDeltaToolCall.function.arguments` is a string that accumulates via `acc_value += delta_value` (string concatenation). By the time `finish_reason: "tool_calls"` arrives, the arguments string is complete and parseable with `json.loads()`.
→ Post: `_posts/2026-07-21-openai-streaming-sse-message-accumulation.md`

### Q: Why does `accumulate_delta` overwrite the `index` and `type` fields instead of merging them?
These are discriminators that identify which content block or tool call a delta belongs to. Merging would corrupt the identity — a tool call at index 0 would have its `index` overwritten by a later delta's `index`. Overwriting preserves correct routing.
→ Post: `_posts/2026-07-21-openai-streaming-sse-message-accumulation.md`

## Topic: LLM Evals (Order 14)

### Q: Why does a single accuracy score fail for LLM evaluation?
It collapses multiple failure modes (correctly phrased but different, partially right, confidently wrong) into one number, making it impossible to answer which capability broke when you changed the prompt or model. You need named, versioned evals that test specific dimensions independently.
→ Post: `_posts/2026-07-21-openai-evals-registry-test-cases.md`

### Q: How does model-graded evaluation work when a simple string match is insufficient?
A separate grading model receives the submitted answer, the expert answer, and a rubric prompt that asks it to classify the answer on a multi-point scale (subset, superset, contradiction, etc.). Each choice maps to a numeric score via `choice_scores`, turning subjective judgment into a quantifiable metric.
→ Post: `_posts/2026-07-21-openai-evals-registry-test-cases.md`

### Q: What risk exists when the same model grades its own output?
Circular reasoning — the model may be biased toward its own phrasing and miss factual errors. The framework does not require the grading model to be the same as the evaluated model. Each model-graded eval should include a meta-eval with human-labeled data to verify grading accuracy before trusting it.
→ Post: `_posts/2026-07-21-openai-evals-registry-test-cases.md`

### Q: Why does `Eval.eval_all_samples` use a fixed seed and per-sample RNG?
Deterministic shuffling (`SHUFFLE_SEED = 123`) ensures every run evaluates the same samples in the same order, making results reproducible. Per-sample RNG seeded from `sample_id + seed` ensures stochastic prompting (e.g., chain-of-thought with temperature > 0) produces identical results on re-run.
→ Post: `_posts/2026-07-21-openai-evals-registry-test-cases.md`

### Q: What happens when a model-graded eval produces an output that doesn't match any choice in `choice_strings`?
Any unrecognized choice is mapped to `"__invalid__"` and scored as 0. The recorder logs this as a separate metric, so you can see how often the model failed to produce a parseable grade — which is itself a signal about prompt quality or model capability.
→ Post: `_posts/2026-07-21-openai-evals-registry-test-cases.md`

## Topic: Fine-Tuning vs In-Context Learning vs RAG (Order 15)

### Q: How does LoRA reduce the number of trainable parameters from 16.7M to 131K for a 4096×4096 weight matrix?
Instead of learning the full ΔW (4096×4096 = 16.7M params), LoRA decomposes it into two low-rank matrices: B (4096×r) and A (r×4096). With rank r=16, that is (4096×16) + (16×4096) = 131K params — a 128x reduction. The original W is frozen; only A and B receive gradients.
→ Post: `_posts/2026-07-21-huggingface-lora-fine-tuning-adapter.md`

### Q: What happens to GPU memory when you fine-tune a 7B model with LoRA versus full fine-tuning?
Full fine-tuning needs ~84 GB of VRAM for optimizer state alone (weight + m + v, each 7B × 4 bytes). LoRA's optimizer state is proportional to the adapter parameters (~0.06% of total), so it fits in a fraction of that memory — a 7B QLoRA setup fits on a single 24 GB GPU.
→ Post: `_posts/2026-07-21-huggingface-lora-fine-tuning-adapter.md`

### Q: Can a LoRA adapter be merged into the base model for zero-overhead inference?
Yes — `model.merge_and_unload()` computes W' = W + BA for every adapted layer, producing a single weight matrix with no adapter overhead. After merging, there is no runtime cost. However, you cannot unmerge — the operation is irreversible.
→ Post: `_posts/2026-07-21-huggingface-lora-fine-tuning-adapter.md`

### Q: Why does the Hugging Face `Trainer` unwrap PeftModel before inspecting forward signatures?
PeftModel's forward signature includes adapter-specific fields that are not part of the dataset. The Trainer calls `model.get_base_model()` to inspect the underlying model's real signature, ensuring it correctly strips unused dataset columns without breaking on adapter-specific parameters.
→ Post: `_posts/2026-07-21-huggingface-lora-fine-tuning-adapter.md`

### Q: What is the tradeoff of using a higher LoRA rank (r)?
Higher rank approaches full fine-tuning's expressiveness but increases the number of trainable parameters, optimizer memory, and training time. For most instruction-tuning tasks, r=16-64 is the practical range — going beyond that yields diminishing returns for the added cost.
→ Post: `_posts/2026-07-21-huggingface-lora-fine-tuning-adapter.md`

### Q: What is the risk of catastrophic forgetting with full fine-tuning that LoRA mitigates?
When every weight is trainable, the model has the capacity to drift far from its pre-trained knowledge. LoRA limits updates to tiny low-rank matrices, constraining the adaptation to a narrow subspace — this reduces overfitting on small fine-tuning datasets and preserves general capabilities.
→ Post: `_posts/2026-07-21-huggingface-lora-fine-tuning-adapter.md`

## Topic: Prompt Injection & Guardrails (Order 16)

### Q: Why does a single regex filter fail against prompt injection attacks?
Regex filters treat each message independently with no memory of prior turns. A multi-turn attack builds trust over several messages before executing, or embeds instructions mid-conversation. A per-message filter sees each message in isolation and misses the escalation pattern.
→ Post: `_posts/2026-07-21-nemo-guardrails-colang-state-machine.md`

### Q: How does NeMo Guardrails' state machine advantage differ from a filter chain?
Each Colang flow compiles to a `FlowState` with `FlowHead` pointers tracking execution position. A flow matched on turn 1 can still be "active" on turn 3 — the runtime knows exactly where it left off and carries context across turns via `FlowState.context` dicts.
→ Post: `_posts/2026-07-21-nemo-guardrails-colang-state-machine.md`

### Q: What is the role of `StartInputRails` and `InputRailsFinished` events in the NeMo runtime?
These are events written to an internal queue, not synchronous function calls. The runtime processes them through its event loop, advancing flow heads that are waiting on those specific event names. A flow head at position N only advances when its expected event appears — it doesn't poll or re-evaluate from the start.
→ Post: `_posts/2026-07-21-nemo-guardrails-colang-state-machine.md`

### Q: How do parallel flows in NeMo Guardrails handle merging?
When a `define parallel flow` forks, it creates child heads that advance independently through their respective branches. When a head arrives at a merging element, its status changes to `MERGING` and it only progresses on the next iteration, preventing concurrent write conflicts on shared state.
→ Post: `_posts/2026-07-21-nemo-guardrails-colang-state-machine.md`

### Q: Why is flow-head priority resolution score-based rather than position-based?
Each head carries a `matching_scores` list from previous matches. The runtime picks the highest-scoring head for each incoming event — this implements specificity. A more-specific rail flow (higher priority from tighter pattern matches) advances before a generic fallback.
→ Post: `_posts/2026-07-21-nemo-guardrails-colang-state-machine.md`

## Topic: Caching & Cost Optimization for LLM Calls (Order 17)

### Q: How does GPTCache's semantic caching differ from exact prefix caching?
Exact prefix caching matches only byte-identical leading token sequences — one extra whitespace and the cache misses. GPTCache converts prompts into embeddings and returns cached answers whenever a semantically similar prompt appears, even with different wording. The tradeoff: precision for recall.
→ Post: `_posts/2026-07-21-gptcache-semantic-embedding-caching.md`

### Q: What is the `cache_factor` parameter and how does it affect cache behavior?
`cache_factor` (default 1.0) scales the similarity threshold dynamically. A factor of 0.5 halves the effective threshold (more hits, more risk of wrong answers); a factor of 2.0 doubles it (fewer hits, more conservative). It is the primary sensitivity dial for the hit-rate vs accuracy tradeoff.
→ Post: `_posts/2026-07-21-gptcache-semantic-embedding-caching.md`

### Q: Why does GPTCache skip the cache when `temperature >= 2`?
At high temperatures, the user explicitly requests randomness. Returning a cached deterministic answer contradicts that intent. GPTCache uses `temperature_softmax` to probabilistically skip the cache between `temperature=0` (always check) and `temperature>=2` (always skip).
→ Post: `_posts/2026-07-21-gptcache-semantic-embedding-caching.md`

### Q: What does `cache_health_check` do when the vector store and scalar store fall out of sync?
It compares the embedding stored in the scalar store against the one retrieved from the vector store. On mismatch, it forces the similarity score to `np.inf` (preventing the corrupted entry from matching) and self-heals by overwriting the stale vector store entry with the correct embedding.
→ Post: `_posts/2026-07-21-gptcache-semantic-embedding-caching.md`

### Q: When would you use `concat_all_queries` versus `last_content` as a pre-processor?
`last_content` extracts only the final user message — suitable for single-turn Q&A. `concat_all_queries` concatenates all messages with role prefixes, trimmed by `context_len` — necessary for multi-turn conversations where the cache key must reflect the full conversation state.
→ Post: `_posts/2026-07-21-gptcache-semantic-embedding-caching.md`

## Topic: Model Context Protocol (MCP) (Order 18)

### Q: Why can't an LLM host just call a function on a remote tool server without a handshake?
Neither side knows what the other supports. The client doesn't know which capabilities the server exposes, and the server doesn't know which features the client supports. Without negotiation, the client either over-requests (gets errors) or under-requests (misses features). MCP's handshake resolves this before any tool call.
→ Post: `_posts/2026-07-21-mcp-model-context-protocol-handshake.md`

### Q: What are the two eras of MCP connection setup, and how does the server decide which one to use?
Legacy era uses `initialize` (three-message sequence: request, response, notification). Modern era uses `server/discover` (single-request probe returning all supported versions and capabilities). The first era-distinctive message to succeed locks the connection into that era for its lifetime.
→ Post: `_posts/2026-07-21-mcp-model-context-protocol-handshake.md`

### Q: Why is the `initialize` handler reserved and not user-overridable?
The handshake is a transport-level concern — the runner must validate the protocol version, build session state, and mark the connection as initialized before any user handler runs. Allowing user code to override `initialize` would break that invariant. Use `Server.middleware` to observe or wrap initialization instead.
→ Post: `_posts/2026-07-21-mcp-model-context-protocol-handshake.md`

### Q: How does the server derive its `ServerCapabilities` advertisement?
`get_capabilities()` reads `_request_handlers` at call time. If `on_list_tools` is registered, it advertises `tools`. If `on_list_resources` is registered, it advertises `resources`. Capabilities are dynamically derived from registered handlers, not from a static config file.
→ Post: `_posts/2026-07-21-mcp-model-context-protocol-handshake.md`

### Q: What happens when the client's modern protocol version is not supported by the server?
`ClientSession.discover()` catches the `UNSUPPORTED_PROTOCOL_VERSION` error, intersects the server's `supported_versions` with the client's `MODERN_PROTOCOL_VERSIONS`, and retries once at the highest mutual version. If no mutual version exists, it raises a `RuntimeError`.
→ Post: `_posts/2026-07-21-mcp-model-context-protocol-handshake.md`
---

**Last updated:** July 2026 | **Total Q&A:** 94 across Generative AI

[Back to Q&A Index]({{ '/qa/' | relative_url }}) • [All Generative AI posts]({{ '/genai/' | relative_url }})
