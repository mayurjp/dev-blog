---
layout: post
title: "Generative AI Key Terms: Embeddings, RAG, and the LLM-App Vocabulary Behind Every Post"
description: "A standalone glossary of generative-AI terms used across this blog's LLM-application posts — embeddings, RAG, agents, MCP, vector databases, prompt caching, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: genai
order: 99
tags: [genai, glossary, llm, rag, agents]
---

**TL;DR:** This is the vocabulary reference for every GenAI post on this blog — read it once, then skip back here whenever a term like *embedding*, *RAG*, or *MCP* shows up. Each entry is a 2-4 sentence, mechanism-level definition, grouped by theme.

> **In plain English (30 sec):** Code you already write — Map, function, API call, just bigger.

## Foundations

### LLM (Large Language Model)
An LLM is a neural network trained to predict the next token in a sequence given the preceding tokens, learned from a corpus spanning most of the public internet. Its "knowledge" lives entirely in the trained weights, so it reasons only over what it can reconstruct from that probabilistic mapping — not from live access to your data.

### Transformer
The transformer is the architecture underneath modern LLMs, defined by a self-attention mechanism that lets every token weigh its relationship to every other token in the input. Unlike recurrent models, attention is parallelizable and captures long-range dependencies directly, which is what made scaling to billions of parameters practical.

### Token
A token is the atomic unit a model reads and emits — typically a sub-word fragment (roughly 4 characters of English, or ~0.75 words). Text is split into tokens by a trained tokenizer before it enters the model, and billing, context limits, and latency are all measured in tokens rather than characters or words.

### Embedding
An embedding is a fixed-length vector of floats that encodes a piece of text's semantic meaning, produced by a model such as `text-embedding-3-small` or `bge-large`. Texts with similar meaning land near each other in vector space, so distance becomes a proxy for semantic relatedness — this is the foundation of retrieval.

### Inference
Inference is the forward pass that turns a prompt into output tokens using the trained weights, as opposed to training which updates those weights. It is the live, per-request cost center: every API call, every token generated, every millisecond of latency happens here.

### Hallucination
A hallucination is a fluent, confident output that is factually unsupported by the inputs or the model's training data. Because the model only predicts plausible-next-token, it has no built-in notion of truth — grounding via retrieval or tools is what constrains it to real sources.

## Retrieval & RAG

### Vector
In this context a vector is the numeric embedding array (e.g. 1536 floats) representing one chunk of text. Operations on these arrays — not on the raw text — are what make semantic search work.

### Vector database
A vector database (Chroma, Qdrant, Pinecone, pgvector) stores embeddings alongside their source text and supports fast approximate nearest-neighbor lookup at scale. It indexes the high-dimensional space with structures like HNSW so a top-k query doesn't require a brute-force scan of every stored vector.

### Similarity search
Similarity search retrieves the stored vectors closest to a query vector, returning the chunks whose meaning most resembles the question. It is the runtime half of RAG: turn the user's question into an embedding, then find the nearest document chunks.

### Cosine similarity
Cosine similarity measures the angle between two vectors, ignoring magnitude, and returns a score from -1 to 1 (typically 0 to 1 for embeddings) of how aligned their directions are. It is the default distance metric for embeddings because embedding models are trained so that semantic closeness corresponds to small angular separation.

### RAG (Retrieval-Augmented Generation)
RAG is the pattern of fetching relevant context from a knowledge source at query time and injecting it into the prompt so the LLM answers from retrieved facts rather than memory alone. The model never "sees" the whole corpus — only the top-k retrieved chunks — which is what keeps answers grounded and lets you update knowledge without retraining.

### Chunking
Chunking splits source documents into segments small enough to embed and fit in a context window, typically by fixed token size, sentence boundaries, or semantic splitting. Chunk size and overlap directly control retrieval precision: too large and you dilute relevance, too small and you fragment a single idea across pieces.

### Context window
The context window is the maximum number of tokens (prompt plus generated output) a model can attend to in one request — e.g. 128k for many current models. Once retrieved chunks plus instructions exceed it, you must truncate, summarize, or select more aggressively, or the model silently drops earlier content.

## Prompting & serving

### Prompt
A prompt is the full input text handed to the model — your question plus any retrieved context, instructions, and examples. How you arrange it (order, delimiters, explicit constraints) materially changes output quality, since the model conditions on the whole sequence.

### System prompt
The system prompt is a privileged instruction block placed before the user's message that sets the model's role, constraints, and tone. It is the primary lever for behavior control and is where guardrails and output-format requirements are usually enforced.

### Few-shot
Few-shot prompting supplies a handful of worked input/output examples inside the prompt to steer the model toward a format or reasoning pattern without changing weights. It is the cheapest form of "training" — the examples become part of the context the model conditions on.

### Fine-tuning
Fine-tuning updates a model's weights on a labeled dataset so it internalizes a style, task, or domain rather than relying on prompt examples. It is far heavier than prompting (compute, data, eval) and is used when behavior must be consistent and fast at scale, not for injecting fresh facts.

### Temperature
Temperature scales the softmax over the next-token distribution: low values make the model pick the most likely token (deterministic), high values flatten the distribution (more random). It controls creativity vs. reproducibility, not factual accuracy.

### Top-p (nucleus sampling)
Top-p keeps only the smallest set of tokens whose cumulative probability reaches p (e.g. 0.9) and samples from that set, capping the long tail of unlikely tokens. It is an alternative to temperature for controlling output diversity that adapts to how peaked the distribution is.

### Streaming
Streaming returns generated tokens incrementally as they are produced instead of waiting for the full response, cutting perceived latency. The client renders each chunk as it arrives, which is near-mandatory for chat UIs over slow generation.

### Prompt caching
Prompt caching lets a provider reuse the computed attention state for a stable prefix of the prompt (e.g. system instructions, large retrieved context) across requests, cutting latency and cost. You mark a cacheable block and pay less per token when subsequent calls hit the cached prefix.

### Token cost
Token cost is the per-token price of input and output tokens charged by the model provider, usually with output priced higher than input. Because RAG inflates input tokens with retrieved context, retrieval quality and caching directly move the bill.

## Agents & tooling

### Agent
An agent is an LLM-driven loop that plans, calls tools, observes results, and iterates until a goal is met, rather than answering in a single pass. The model decides the next action from observations, so the system's behavior emerges from the loop, not from a fixed script.

### Tool use / function calling
Tool use (function calling) is the model's ability to emit a structured request — a named function plus JSON arguments — that your code executes and returns as an observation. It is the bridge from "text out" to "action in the world": query a database, call an API, run code.

### MCP (Model Context Protocol)
MCP is an open protocol (modelcontextprotocol org) that standardizes how an LLM app connects to external tools, data sources, and prompts through a uniform client/server interface. Instead of writing a custom integration per API, a server exposes resources and tools over MCP and any MCP-aware client can use them.

### Orchestration
Orchestration is the code that wires retrieval, model calls, tool loops, and post-processing into a coherent pipeline — the job of frameworks like LangChain and LlamaIndex. It decides control flow: when to retrieve, when to call a tool, when to stop, and how to assemble the final answer.

### Guardrails
Guardrails are checks placed around model input and output — input validation, output schema enforcement, content filters, and retry-on-failure — to keep responses safe and well-formed. They sit outside the model itself, because the model has no native guarantee of format or safety.

### Evaluation
Evaluation is the systematic measurement of output quality — faithfulness to retrieved context, answer correctness, latency, and cost — usually via scored rubrics, LLM-judges, or held-out datasets. It is how you know a RAG or agent change actually helped rather than shifted the failure mode.

**Closing:** Keep this page bookmarked — every other GenAI post on this blog assumes the terms above, and the [Generative AI 101]({{ '/genai/genai-101/' | relative_url }}) post puts them to work in a real RAG build.




