---
layout: page
title: Learn
permalink: /learn/
---

Interactive quiz with spaced repetition. Wrong answers come back more often. All progress saved in your browser — no account needed.

<div class="quiz-app" id="quiz-app">
  <div class="quiz-controls">
    <select id="quiz-domain" aria-label="Filter by domain">
      <option value="all">All domains</option>
    </select>
    <select id="quiz-diff" aria-label="Filter by difficulty">
      <option value="all">All levels</option>
      <option value="Beginner">Beginner</option>
      <option value="Intermediate">Intermediate</option>
      <option value="Expert">Expert</option>
    </select>
    <button type="button" id="quiz-reset" class="quiz-reset-btn">Reset progress</button>
  </div>

  <div class="quiz-stats" id="quiz-stats">
    <span id="quiz-remaining">0</span> remaining
    &middot; <span id="quiz-streak">0</span> streak
    &middot; <span id="quiz-score">0%</span> accuracy
  </div>

  <div class="quiz-card" id="quiz-card">
    <div class="quiz-loading" id="quiz-loading">Loading questions…</div>
    <div class="quiz-question" id="quiz-question" style="display:none">
      <div class="quiz-meta">
        <span class="quiz-domain-tag" id="quiz-domain-tag"></span>
        <span class="quiz-diff-tag" id="quiz-diff-tag"></span>
      </div>
      <h3 id="quiz-q-text"></h3>
      <div class="quiz-answer" id="quiz-answer" style="display:none">
        <p id="quiz-a-text"></p>
        <p class="quiz-post-link" id="quiz-post-link" style="display:none">
          <a id="quiz-post-url" href="#">Full post →</a>
        </p>
      </div>
    </div>
    <div class="quiz-empty" id="quiz-empty" style="display:none">
      <h3>All caught up!</h3>
      <p>No questions due right now. Come back later or adjust your filters.</p>
    </div>
  </div>

  <div class="quiz-actions" id="quiz-actions" style="display:none">
    <button type="button" id="quiz-show" class="quiz-btn quiz-btn-primary">Show Answer</button>
    <div class="quiz-result-btns" id="quiz-result-btns" style="display:none">
      <button type="button" id="quiz-wrong" class="quiz-btn quiz-btn-wrong">Got it wrong</button>
      <button type="button" id="quiz-right" class="quiz-btn quiz-btn-right">Got it right</button>
    </div>
  </div>
</div>

<script src="{{ '/assets/quiz.js' | relative_url }}"></script>
