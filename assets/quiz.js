(function () {
  var BASE_URL = (document.getElementById('quiz-app') || {}).getAttribute('data-baseurl') || '';
  var STORAGE_KEY = 'quiz_progress';

  var allQuestions = [];
  var queue = [];
  var current = null;
  var streak = 0;
  var totalAnswered = 0;
  var totalCorrect = 0;

  /* --- DOM refs --- */
  var domainSelect = document.getElementById('quiz-domain');
  var diffSelect = document.getElementById('quiz-diff');
  var resetBtn = document.getElementById('quiz-reset');
  var loading = document.getElementById('quiz-loading');
  var questionEl = document.getElementById('quiz-question');
  var emptyEl = document.getElementById('quiz-empty');
  var qText = document.getElementById('quiz-q-text');
  var aText = document.getElementById('quiz-a-text');
  var answerEl = document.getElementById('quiz-answer');
  var postLink = document.getElementById('quiz-post-link');
  var postUrl = document.getElementById('quiz-post-url');
  var domainTag = document.getElementById('quiz-domain-tag');
  var diffTag = document.getElementById('quiz-diff-tag');
  var showBtn = document.getElementById('quiz-show');
  var resultBtns = document.getElementById('quiz-result-btns');
  var wrongBtn = document.getElementById('quiz-wrong');
  var rightBtn = document.getElementById('quiz-right');
  var actionsEl = document.getElementById('quiz-actions');
  var remainingEl = document.getElementById('quiz-remaining');
  var streakEl = document.getElementById('quiz-streak');
  var scoreEl = document.getElementById('quiz-score');

  /* --- Spaced repetition --- */
  function loadProgress() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; } catch (e) { return {}; }
  }

  function saveProgress(progress) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
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
      /* Exponential backoff: 1h, 4h, 12h, 1d, 3d, 7d */
      var intervals = [3600000, 14400000, 43200000, 86400000, 259200000, 604800000];
      var idx = Math.min(p.count - 1, intervals.length - 1);
      p.next = Date.now() + intervals[idx];
    } else {
      /* Wrong: show again in 5 minutes */
      p.next = Date.now() + 300000;
      p.count = Math.max(0, (p.count || 1) - 1);
    }
    progress[id] = p;
    saveProgress(progress);
  }

  /* --- Load data --- */
  function loadQuestions() {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', BASE_URL + '/assets/quiz-data.json');
    xhr.onload = function () {
      if (xhr.status !== 200) { loading.textContent = 'Failed to load questions.'; return; }
      allQuestions = JSON.parse(xhr.responseText);
      populateDomains();
      buildQueue();
      loading.style.display = 'none';
      actionsEl.style.display = '';
      nextQuestion();
    };
    xhr.onerror = function () { loading.textContent = 'Network error loading questions.'; };
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
    /* Sort: due first (oldest due date), then never-seen */
    queue = filtered.sort(function (a, b) {
      var da = getDueDate(a.id);
      var db = getDueDate(b.id);
      if (da === 0 && db === 0) return Math.random() - 0.5;
      if (da === 0) return 1;
      if (db === 0) return -1;
      return da - db;
    });
    /* Filter to only due or never-seen */
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
      updateStats();
      return;
    }
    current = queue.shift();
    qText.textContent = 'Q: ' + current.q;
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
    showBtn.style.display = '';
    resultBtns.style.display = 'none';
    actionsEl.style.display = '';
    updateStats();
  }

  function updateStats() {
    remainingEl.textContent = queue.length;
    streakEl.textContent = streak;
    scoreEl.textContent = totalAnswered > 0 ? Math.round(totalCorrect / totalAnswered * 100) + '%' : '—';
  }

  /* --- Events --- */
  showBtn.addEventListener('click', function () {
    answerEl.style.display = '';
    showBtn.style.display = 'none';
    resultBtns.style.display = '';
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
    /* Re-add to front of queue so it comes up again soon */
    queue.unshift(current);
    nextQuestion();
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
    }
  });

  /* --- Boot --- */
  loadQuestions();
})();
