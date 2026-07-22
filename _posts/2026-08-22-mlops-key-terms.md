---
layout: post
title: "MLOps Key Terms: Models, Features, and the Production ML Vocabulary Behind Every Post"
description: "A standalone glossary of MLOps terms used across this blog's ML-in-production posts — feature stores, model registries, drift, training/serving skew, CI/CD for ML, and more — each explained in 2-4 mechanism-level sentences."
date: 2026-08-22 09:00:00 +0530
categories: mlops
order: 99
tags: [mlops, glossary, machine-learning, production]
---

**TL;DR:** This is the shared vocabulary for every MLOps post on this blog — a model is a learned function, a feature is the input you feed it, and the rest of the terms describe how you train, store, serve, and keep that function honest in production. Bookmark it; the 101 and the deeper posts link back here.
> **In plain English (30 sec):** Think of this like concepts you already use, but in a production system at scale.


## Training

### Model
A model is a parametric function learned from data — its weights or tree structure encode a mapping from inputs to predictions. In production it is a serialized artifact (a pickle, ONNX graph, or SavedModel) that a serving runtime loads and calls, not the notebook that produced it.

### Training
Training is the process of fitting a model's parameters to a dataset by minimizing a loss function with an optimizer (SGD, Adam, or a tree-building objective). The output is a versioned artifact plus the metrics and hyperparameters that produced it, which must be recorded so the run is reproducible.

### Label
A label is the ground-truth target a supervised model learns to predict — the `price`, `churn`, or `fraud` column in the training table. Labels are what the loss function compares predictions against during training, and their quality bounds the ceiling of what the model can learn.

### Ground truth
Ground truth is the verified correct answer for an input, used both as the training label and later as the reference when you measure how wrong a served model is. In production it often arrives late (a user's actual click, a confirmed fraud charge), which is why monitoring must tolerate delayed labels.

### Hyperparameter
A hyperparameter is a configuration value set before training — learning rate, tree depth, batch size — that controls how the model fits rather than being learned from data. Tuning them is a search over the training process itself, and the chosen values are part of the model's reproducible identity.

## Serving

### Inference / serving
Inference (or serving) is running a trained model on new inputs to produce predictions at request time. The model is loaded into a runtime that exposes it as an endpoint, a batch job, or an embedded library call, and its latency and throughput — not its accuracy — become the engineering constraints.

### Batch vs online inference
Batch inference scores a large set of records on a schedule (nightly churn scoring written to a table), while online inference scores one request at a time with low latency (a fraud check inside a checkout call). The split decides your infrastructure: batch is a job on a warehouse, online is a low-latency service behind a load balancer.

### KServe
KServe is a Kubernetes-native serving layer that wraps a model in an `InferenceService` custom resource, giving you autoscaling (including scale-to-zero), canary rollouts, and a standardized predict protocol. It abstracts the runtime (Triton, sklearn, TorchServe) behind one API so the same deploy manifest works across model frameworks.

## Data & features

### Feature
A feature is a single engineered input column fed to the model — a normalized `age`, a rolling `purchase_count_30d`, or an embedding vector. Its definition must be identical at training and serving time, or the model silently receives different data than it learned on.

### Feature store
A feature store is a system (Feast, Tecton) that computes, stores, and serves feature values through two APIs: an offline store for training (point-in-time-correct historical joins) and an online store (a low-latency key-value cache) for serving. It exists to guarantee that training and serving read the same feature logic, eliminating a major class of skew.

### Feature drift
Feature drift is a change in the distribution of input features over time — `income` shifts after a recession, or a sensor's calibration drifts. The model's weights are unchanged, but the data it sees no longer matches what it was trained on, so predictions degrade even though the world's underlying relationship may be stable.

### Data drift
Data drift is the broader term for any shift in the input data distribution feeding a model, encompassing feature drift and changes in feature correlations. Detection compares live input statistics against a training-time baseline using tests like population stability index or KL divergence, and crossing a threshold triggers retraining or alerting.

### Concept drift
Concept drift is a change in the relationship between inputs and the target — the mapping the model learned no longer holds (user behavior after a pandemic, fraud patterns after a rule change). Unlike feature drift, the inputs may look normal while the correct prediction for them moves, so it is caught by watching prediction-vs-ground-truth error, not input distributions.

### Model drift
Model drift is the observable symptom that a model's predictive quality is decaying in production, most often caused by feature drift, concept drift, or both. It is what you measure (rising error, shifting score distribution) rather than a distinct root cause, and it is the trigger for the retrain-and-redeploy loop.

### Training / serving skew
Training/serving skew is the bug where features are computed differently at training time than at serving time, so the model is trained on data it never actually sees in production. It comes from duplicated feature logic (notebook vs service code), different library versions, or missing values handled inconsistently, and it produces a model that looks great offline and fails live.

## Lifecycle & CI/CD

### Model registry
A model registry is a versioned store of trained models with their metadata, metrics, and stage transitions (staging, production, archived). MLflow's registry, for example, lets you register a run's artifact, tag it with metrics, and promote version 3 to production only after sign-off.

### Model versioning
Model versioning assigns each trained artifact a unique identifier and keeps prior versions retrievable, so a bad deploy can be rolled back to a known-good model. It is distinct from code versioning: the model binary, its training data hash, and its hyperparameters are versioned together as one immutable unit.

### Experiment tracking
Experiment tracking records every training run — parameters, metrics, code commit, data version, and output artifact — so runs are comparable and reproducible. MLflow Tracking is the common implementation: each run is a row you can sort by metric, and the best run's artifact is what gets registered.

### MLflow
MLflow is an open-source platform with four components — Tracking (log params/metrics/artifacts), Models (a packaging format), Model Registry (versioning and stage transitions), and Projects (reproducible run entrypoints). It is the glue that turns ad-hoc training scripts into auditable, registrable, deployable model artifacts.

### Kubeflow
Kubeflow is a Kubernetes-native toolkit for the full ML lifecycle — Pipelines for orchestrating training as DAGs of containerized steps, and KServe (via the KServe component) for serving. It lets you run the same pipeline on a laptop or a cluster and track each step's artifacts through the MLflow integration.

### Pipeline
A pipeline is a directed graph of steps — ingest, validate, train, evaluate, register — where each step is a container with declared inputs and outputs. Kubeflow Pipelines compiles this into Kubernetes jobs so training is reproducible and each stage's data artifact is cached and inspectable.

### CI/CD for ML
CI/CD for ML extends ordinary pipeline automation to models: CI tests data quality and training code, and CD promotes a registered model through staging to production with automated evaluation gates. Unlike app CI/CD, the "build artifact" is a model whose correctness depends on data, so the gates check data drift and metric thresholds, not just a green test suite.

### Reproducibility
Reproducibility is the property that re-running a training pipeline with the same code, data, and config yields the same model (or a statistically equivalent one). It requires pinning the data version, library versions, and random seeds, and recording them in experiment tracking so any production model can be rebuilt and audited.

### Model card
A model card is a structured document describing a model's intended use, training data, evaluation metrics, limitations, and ethical considerations. It is the human-readable contract attached to a registry entry so reviewers and downstream teams know what the model is and isn't safe to do.

## Deployment & monitoring

### Shadow deployment
A shadow deployment sends live production traffic to a new model in the background without returning its predictions to users, so you can compare its scores against the incumbent on real inputs. It catches training/serving skew and drift risk safely because the shadow model's output is observed but never acts on the user.

### Canary for models
A canary release routes a small percentage of live traffic (1%, then 5%, then 100%) to the new model while the rest hits the old one, watching error and latency before full cutover. KServe supports this through its canary traffic-splitting on the `InferenceService`, so a bad model affects only a sliver of users.

### A/B test
An A/B test compares two models (or a model vs a heuristic) by randomly assigning users to each and measuring a business metric, not just model accuracy. It is the final arbiter of whether a new model actually improves outcomes, since offline metrics often don't predict real-world impact.

### Rollback
Rollback switches serving back to the previous known-good model version when the new one shows degraded metrics or errors. Because model versions are immutable and registered, rollback is a traffic re-point (or a registry stage revert) rather than a rebuild, which is why versioning is non-negotiable.

### Monitoring
Monitoring for ML watches three layers at once: infrastructure (latency, error rate, saturation of the serving pod), data (feature and prediction distributions for drift), and quality (prediction accuracy against delayed ground truth). It is broader than app monitoring because a model can be healthy on every system metric and still be silently wrong.

That's the vocabulary. The [MLOps 101]({{ '/mlops/mlops-101/' | relative_url }}) post puts these terms into one worked example, and the deeper posts reference this glossary directly.




