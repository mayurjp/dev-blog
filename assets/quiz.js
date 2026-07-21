(function () {
  'use strict';

  var STORAGE_KEY = 'quiz_progress';
  var FETCH_TIMEOUT = 10000;

  var allQuestions = [];
  var queue = [];
  var current = null;
  var streak = 0;
  var totalAnswered = 0;
  var totalCorrect = 0;
  var loaded = false;

  /* --- DOM refs (populated after DOMContentLoaded) --- */
  var domainSelect, diffSelect, resetBtn, loading, questionEl, emptyEl;
  var qText, aText, answerEl, postLink, postUrl, domainTag, diffTag;
  var showBtn, resultBtns, wrongBtn, rightBtn, actionsEl;
  var remainingEl, streakEl, scoreEl, errorEl, retryBtn;
  var progressRing, progressText, progressMastered;
  var exportBtn, importBtn, importInput, keyboardHint;
  var explanationEl, explanationText;

  function initDom() {
    domainSelect = document.getElementById('quiz-domain');
    diffSelect = document.getElementById('quiz-diff');
    resetBtn = document.getElementById('quiz-reset');
    loading = document.getElementById('quiz-loading');
    questionEl = document.getElementById('quiz-question');
    emptyEl = document.getElementById('quiz-empty');
    qText = document.getElementById('quiz-q-text');
    aText = document.getElementById('quiz-a-text');
    answerEl = document.getElementById('quiz-answer');
    postLink = document.getElementById('quiz-post-link');
    postUrl = document.getElementById('quiz-post-url');
    domainTag = document.getElementById('quiz-domain-tag');
    diffTag = document.getElementById('quiz-diff-tag');
    showBtn = document.getElementById('quiz-show');
    resultBtns = document.getElementById('quiz-result-btns');
    wrongBtn = document.getElementById('quiz-wrong');
    rightBtn = document.getElementById('quiz-right');
    actionsEl = document.getElementById('quiz-actions');
    remainingEl = document.getElementById('quiz-remaining');
    streakEl = document.getElementById('quiz-streak');
    scoreEl = document.getElementById('quiz-score');
    errorEl = document.getElementById('quiz-error');
    retryBtn = document.getElementById('quiz-retry');
    progressRing = document.getElementById('quiz-progress-ring');
    progressText = document.getElementById('quiz-progress-text');
    progressMastered = document.getElementById('quiz-progress-mastered');
    exportBtn = document.getElementById('quiz-export');
    importBtn = document.getElementById('quiz-import');
    importInput = document.getElementById('quiz-import-input');
    keyboardHint = document.getElementById('quiz-keyboard-hint');
    explanationEl = document.getElementById('quiz-explanation');
    explanationText = document.getElementById('quiz-explanation-text');
  }

  /* --- Spaced repetition --- */
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
  }

  function saveProgress(progress) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(progress)); } catch (e) { /* quota exceeded */ }
  }

  function getDueDate(id) {
    var progress = loadProgress();
    var p = progress[id];
    if (!p) return 0;
    return p.next || 0;
  }

  function markResult(id, correct) {
    var progress = loadProgress();
    var p = progress[id] || { count: 0, correct: 0 };
    p.count = (p.count || 0) + 1;
    if (correct) {
      p.correct = (p.correct || 0) + 1;
      var intervals = [600000, 3600000, 14400000, 43200000, 86400000, 259200000, 604800000];
      var idx = Math.min(p.count - 1, intervals.length - 1);
      p.next = Date.now() + intervals[idx];
    } else {
      p.next = Date.now() + 300000;
      p.count = Math.max(0, (p.count || 1) - 1);
    }
    progress[id] = p;
    saveProgress(progress);
  }

  function getMasteredCount() {
    var progress = loadProgress();
    var count = 0;
    allQuestions.forEach(function (q) {
      var p = progress[q.id];
      if (p && p.correct >= 3) count++;
    });
    return count;
  }

  /* --- Load data --- */
  function loadQuestions() {
    var statsEl = document.getElementById('quiz-stats');
    var appEl = document.getElementById('quiz-app');
    var baseUrl = (appEl || {}).getAttribute('data-baseurl') || '';
    var url = baseUrl + '/assets/quiz-data.json';

    loading.textContent = 'Loading questions\u2026';
    loading.style.display = '';
    errorEl.style.display = 'none';
    questionEl.style.display = 'none';
    emptyEl.style.display = 'none';
    actionsEl.style.display = 'none';
    if (statsEl) statsEl.style.display = 'none';

    var timedOut = false;
    var timer = setTimeout(function () {
      timedOut = true;
      loading.style.display = 'none';
      errorEl.style.display = '';
      errorEl.querySelector('.quiz-error-msg').textContent =
        'Request timed out. Check your connection and try again.';
    }, FETCH_TIMEOUT);

    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.onload = function () {
      clearTimeout(timer);
      if (timedOut) return;
      if (xhr.status !== 200) {
        loading.style.display = 'none';
        errorEl.style.display = '';
        errorEl.querySelector('.quiz-error-msg').textContent =
          'Failed to load questions (HTTP ' + xhr.status + ').';
        return;
      }
      try {
        allQuestions = JSON.parse(xhr.responseText);
      } catch (e) {
        loading.style.display = 'none';
        errorEl.style.display = '';
        errorEl.querySelector('.quiz-error-msg').textContent =
          'Failed to parse questions data.';
        return;
      }
      loaded = true;
      populateDomains();
      buildQueue();
      loading.style.display = 'none';
      actionsEl.style.display = '';
      if (statsEl) statsEl.style.display = '';
      updateStats();
      updateProgress();
      nextQuestion();
    };
    xhr.onerror = function () {
      clearTimeout(timer);
      if (timedOut) return;
      loading.style.display = 'none';
      errorEl.style.display = '';
      errorEl.querySelector('.quiz-error-msg').textContent =
        'Network error. Are you offline?';
    };
    xhr.send();
  }

  function populateDomains() {
    var domains = {};
    allQuestions.forEach(function (q) { domains[q.domain] = (domains[q.domain] || 0) + 1; });
    Object.keys(domains).sort().forEach(function (d) {
      var opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d + ' (' + domains[d] + ')';
      domainSelect.appendChild(opt);
    });
  }

  function buildQueue() {
    var domain = domainSelect.value;
    var diff = diffSelect.value;
    var now = Date.now();
    var filtered = allQuestions.filter(function (q) {
      if (domain !== 'all' && q.domain !== domain) return false;
      if (diff !== 'all' && q.diff !== diff) return false;
      return true;
    });
    queue = filtered.slice().sort(function (a, b) {
      var da = getDueDate(a.id);
      var db = getDueDate(b.id);
      if (da === 0 && db === 0) return Math.random() - 0.5;
      if (da === 0) return 1;
      if (db === 0) return -1;
      return da - db;
    });
    queue = queue.filter(function (q) {
      var due = getDueDate(q.id);
      return due === 0 || due <= now;
    });
    streak = 0;
    totalAnswered = 0;
    totalCorrect = 0;
    updateStats();
  }

  /* --- UI --- */
  function nextQuestion() {
    if (queue.length === 0) {
      questionEl.style.display = 'none';
      emptyEl.style.display = '';
      actionsEl.style.display = 'none';
      explanationEl.style.display = 'none';
      updateStats();
      updateProgress();
      return;
    }
    current = queue.shift();
    qText.textContent = current.q;
    aText.textContent = current.a;
    domainTag.textContent = current.domain;
    diffTag.textContent = current.diff;
    diffTag.className = 'quiz-diff-tag quiz-diff-' + current.diff.toLowerCase();
    if (current.post) {
      postLink.style.display = '';
      postUrl.href = current.post;
    } else {
      postLink.style.display = 'none';
    }
    questionEl.style.display = '';
    emptyEl.style.display = 'none';
    answerEl.style.display = 'none';
    explanationEl.style.display = 'none';
    showBtn.style.display = '';
    resultBtns.style.display = 'none';
    actionsEl.style.display = '';
    showBtn.focus();
    updateStats();
  }

  function updateStats() {
    remainingEl.textContent = queue.length;
    streakEl.textContent = streak;
    scoreEl.textContent = totalAnswered > 0
      ? Math.round(totalCorrect / totalAnswered * 100) + '%'
      : '\u2014';
  }

  function updateProgress() {
    if (!allQuestions.length) return;
    var mastered = getMasteredCount();
    var total = allQuestions.length;
    var pct = total > 0 ? mastered / total : 0;
    var circumference = 2 * Math.PI * 42;
    if (progressRing) {
      progressRing.style.strokeDasharray = circumference;
      progressRing.style.strokeDashoffset = circumference * (1 - pct);
    }
    if (progressText) progressText.textContent = mastered + ' / ' + total;
    if (progressMastered) progressMastered.textContent = 'mastered';
  }

  function showExplanation() {
    if (!current) return;
    explanationText.textContent = current.a;
    explanationEl.style.display = '';
  }

  /* --- Export / Import --- */
  function exportProgress() {
    var data = localStorage.getItem(STORAGE_KEY) || '{}';
    var blob = new Blob([data], { type: 'application/json' });
    var url = URL.createObjectURL(blob);
    var a = document.createElement('a');
    a.href = url;
    a.download = 'quiz-progress.json';
    a.click();
    URL.revokeObjectURL(url);
  }

  function importProgress(file) {
    var reader = new FileReader();
    reader.onload = function (e) {
      try {
        var data = JSON.parse(e.target.result);
        if (typeof data !== 'object' || data === null) throw new Error('Invalid format');
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        buildQueue();
        nextQuestion();
        updateProgress();
      } catch (err) {
        alert('Invalid progress file.');
      }
    };
    reader.readAsText(file);
  }

  /* --- Events --- */
  function bindEvents() {
    showBtn.addEventListener('click', function () {
      answerEl.style.display = '';
      showBtn.style.display = 'none';
      resultBtns.style.display = '';
      wrongBtn.focus();
    });

    rightBtn.addEventListener('click', function () {
      totalAnswered++;
      totalCorrect++;
      streak++;
      markResult(current.id, true);
      nextQuestion();
    });

    wrongBtn.addEventListener('click', function () {
      totalAnswered++;
      streak = 0;
      markResult(current.id, false);
      showExplanation();
      queue.unshift(current);
      updateStats();
    });

    domainSelect.addEventListener('change', function () { buildQueue(); nextQuestion(); });
    diffSelect.addEventListener('change', function () { buildQueue(); nextQuestion(); });

    resetBtn.addEventListener('click', function () {
      if (confirm('Reset all quiz progress? This cannot be undone.')) {
        localStorage.removeItem(STORAGE_KEY);
        streak = 0;
        totalAnswered = 0;
        totalCorrect = 0;
        buildQueue();
        nextQuestion();
        updateProgress();
      }
    });

    retryBtn.addEventListener('click', function () { loadQuestions(); });

    if (exportBtn) exportBtn.addEventListener('click', exportProgress);
    if (importBtn) {
      importBtn.addEventListener('click', function () { importInput.click(); });
      importInput.addEventListener('change', function () {
        if (importInput.files.length) importProgress(importInput.files[0]);
        importInput.value = '';
      });
    }

    /* Keyboard shortcuts */
    document.addEventListener('keydown', function (e) {
      if (!loaded || !current) return;
      if (e.target.tagName === 'SELECT' || e.target.tagName === 'INPUT') return;

      if (e.code === 'Space' && showBtn.style.display !== 'none') {
        e.preventDefault();
        showBtn.click();
      } else if (e.key === '1' && resultBtns.style.display !== 'none') {
        e.preventDefault();
        wrongBtn.click();
      } else if (e.key === '2' && resultBtns.style.display !== 'none') {
        e.preventDefault();
        rightBtn.click();
      }
    });
  }

  /* --- Boot --- */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      initDom();
      bindEvents();
      loadQuestions();
    });
  } else {
    initDom();
    bindEvents();
    loadQuestions();
  }
})();
