---
layout: page
title: "Interactive Quiz"
description: "Test your knowledge with 1,600+ spaced-repetition quiz questions across Kubernetes, Docker, Security, Microservices, and 18 more domains. Wrong answers come back more often."
permalink: /learn/
---

Interactive quiz with spaced repetition. Wrong answers come back more often. All progress saved in your browser — no account needed.

<noscript>
<h2>Quiz Questions</h2>
<p>This quiz requires JavaScript to run. Below is a sample of questions from the bank.</p>
<details>
<summary>Kubernetes: What happens when a NetworkPolicy blocks all egress?</summary>
<p>Pods can't resolve DNS (port 53), so all inter-service communication breaks. Fix: add an egress rule allowing UDP/TCP port 53 to kube-dns.</p>
</details>
<details>
<summary>Docker: Why does <code>COPY . .</code> before <code>npm ci</code> break layer caching?</summary>
<p>Every code change invalidates the COPY layer and forces a full reinstall. Copy package.json first, install, then copy source.</p>
</details>
<details>
<summary>Security: What does <code>verify=False</code> in Python requests do?</summary>
<p>Disables TLS certificate verification. The client accepts any certificate including from MITM attackers. Never use in production.</p>
</details>
<p><strong>Enable JavaScript to access the full quiz with 1,600+ questions, spaced repetition, and progress tracking.</strong></p>
</noscript>

<div class="quiz-app" id="quiz-app" data-baseurl="{{ site.baseurl }}">

  <div class="quiz-srs-note">
    Wrong = seen again in 10 min &middot; Correct = 1d, 4h, 12h, 1d, 3d, 7d. Saved in localStorage.
    <button type="button" class="quiz-srs-toggle" onclick="this.nextElementSibling.classList.toggle('quiz-srs-detail-show')" aria-label="More about spaced repetition">?</button>
    <div class="quiz-srs-detail">
      <strong>Spaced repetition schedule:</strong>
      <ul>
        <li>Wrong answer: reappears in 10 minutes, mastery level resets</li>
        <li>1st correct: 10 minutes &rarr; 2nd: 4 hours &rarr; 3rd: 12 hours</li>
        <li>4th correct: 1 day &rarr; 5th: 3 days &rarr; 6th+: 7 days</li>
        <li>3+ correct in a row = <strong>mastered</strong></li>
      </ul>
      <p>Progress lives in this browser. <strong>Export</strong> if you switch devices.</p>
    </div>
  </div>

  <div class="quiz-progress-container">
    <svg class="quiz-progress-svg" viewBox="0 0 100 100">
      <circle class="quiz-progress-bg" cx="50" cy="50" r="42" />
      <circle class="quiz-progress-ring" id="quiz-progress-ring" cx="50" cy="50" r="42"
        transform="rotate(-90 50 50)" />
    </svg>
    <div class="quiz-progress-label">
      <span class="quiz-progress-num" id="quiz-progress-text">0 / 0</span>
      <span class="quiz-progress-sub" id="quiz-progress-mastered">mastered</span>
    </div>
  </div>

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
    <button type="button" id="quiz-reset" class="quiz-control-btn">Reset</button>
    <button type="button" id="quiz-export" class="quiz-control-btn">Export</button>
    <button type="button" id="quiz-import" class="quiz-control-btn">Import</button>
    <input type="file" id="quiz-import-input" accept=".json" style="display:none">
  </div>

  <div class="quiz-stats" id="quiz-stats" style="display:none">
    <span id="quiz-remaining">0</span> remaining
    &middot; <span id="quiz-streak">0</span> streak
    &middot; <span id="quiz-score">&mdash;</span> accuracy
  </div>

  <div class="quiz-card" id="quiz-card">
    <div class="quiz-loading" id="quiz-loading">Loading questions&hellip;</div>

    <div class="quiz-error" id="quiz-error" style="display:none">
      <p class="quiz-error-msg"></p>
      <button type="button" id="quiz-retry" class="quiz-btn quiz-btn-primary">Retry</button>
    </div>

    <div class="quiz-question" id="quiz-question" style="display:none">
      <div class="quiz-meta">
        <span class="quiz-domain-tag" id="quiz-domain-tag"></span>
        <span class="quiz-diff-tag" id="quiz-diff-tag"></span>
      </div>
      <h3 id="quiz-q-text"></h3>
      <div class="quiz-answer" id="quiz-answer" style="display:none">
        <p id="quiz-a-text"></p>
        <p class="quiz-post-link" id="quiz-post-link" style="display:none">
          <a id="quiz-post-url" href="#">Full post &rarr;</a>
        </p>
      </div>
      <div class="quiz-explanation" id="quiz-explanation" style="display:none">
        <p class="quiz-explanation-label">Why it matters:</p>
        <p id="quiz-explanation-text"></p>
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
      <button type="button" id="quiz-wrong" class="quiz-btn quiz-btn-wrong">Wrong</button>
      <button type="button" id="quiz-right" class="quiz-btn quiz-btn-right">Correct</button>
    </div>
  </div>

  <div class="quiz-keyboard-hint" id="quiz-keyboard-hint">
    <kbd>Space</kbd> reveal &middot; <kbd>1</kbd> wrong &middot; <kbd>2</kbd> correct
  </div>
</div>

<script src="{{ '/assets/quiz.js' | relative_url }}"></script>
