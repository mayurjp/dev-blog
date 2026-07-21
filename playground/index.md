---
layout: page
title: Playground
permalink: /playground/
---

Paste code, pick a language, and run it in your browser. No server needed — everything executes client-side.

<div class="playground-container">
  <div class="playground-toolbar">
    <select id="playground-lang" aria-label="Language">
      <option value="javascript">JavaScript</option>
      <option value="python">Python (Pyodide)</option>
      <option value="sql">SQL (sql.js)</option>
    </select>
    <button type="button" id="playground-run" class="playground-run-btn">▶ Run</button>
    <button type="button" id="playground-clear" class="playground-clear-btn">Clear</button>
  </div>
  <div class="playground-editor-wrap">
    <textarea id="playground-editor" class="playground-editor" spellcheck="false" aria-label="Code editor" placeholder="// Paste your code here and click Run">console.log("Hello from the playground!");</textarea>
  </div>
  <div class="playground-output-wrap">
    <div class="playground-output-header">Output</div>
    <pre id="playground-output" class="playground-output" role="log" aria-live="polite"></pre>
  </div>
</div>

<script>
(function () {
  var editor = document.getElementById('playground-editor');
  var output = document.getElementById('playground-output');
  var runBtn = document.getElementById('playground-run');
  var clearBtn = document.getElementById('playground-clear');
  var langSelect = document.getElementById('playground-lang');
  var running = false;

  function log(text, cls) {
    var span = document.createElement('span');
    if (cls) span.className = cls;
    span.textContent = text + '\n';
    output.appendChild(span);
    output.scrollTop = output.scrollHeight;
  }

  function clearOutput() {
    output.textContent = '';
  }

  /* ===== JavaScript ===== */
  function runJS(code) {
    clearOutput();
    var origLog = console.log;
    var origWarn = console.warn;
    var origError = console.error;
    console.log = function () {
      log(Array.from(arguments).map(String).join(' '), 'log-line');
    };
    console.warn = function () {
      log('[WARN] ' + Array.from(arguments).map(String).join(' '), 'warn-line');
    };
    console.error = function () {
      log('[ERROR] ' + Array.from(arguments).map(String).join(' '), 'error-line');
    };
    try {
      var result = new Function(code)();
      if (result !== undefined) log(String(result), 'log-line');
      log('\n[done]', 'done-line');
    } catch (e) {
      log('[ERROR] ' + e.name + ': ' + e.message, 'error-line');
      if (e.stack) {
        var line = e.stack.split('\n').find(function (l) { return l.indexOf('<anonymous>') !== -1; });
        if (line) log('  at ' + line.trim(), 'dim-line');
      }
    } finally {
      console.log = origLog;
      console.warn = origWarn;
      console.error = origError;
    }
  }

  /* ===== SQL ===== */
  var sqlReady = false;
  var SQL = null;
  function initSQL(cb) {
    if (sqlReady) { cb(); return; }
    log('[loading sql.js...]', 'dim-line');
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/sql-wasm.js';
    script.onload = function () {
      SQL.initSqlJs({ locateFile: function (f) { return 'https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.8.0/' + f; } })
        .then(function (mod) {
          SQL = mod;
          sqlReady = true;
          cb();
        })
        .catch(function (e) {
          log('[ERROR] Failed to load sql.js: ' + e.message, 'error-line');
        });
    };
    script.onerror = function () {
      log('[ERROR] Failed to load sql.js from CDN', 'error-line');
    };
    document.head.appendChild(script);
  }

  function runSQL(code) {
    initSQL(function () {
      clearOutput();
      try {
        var db = new SQL.Database();
        var stmts = code.split(';').filter(function (s) { return s.trim(); });
        stmts.forEach(function (stmt) {
          var trimmed = stmt.trim();
          if (!trimmed) return;
          try {
            var results = db.exec(trimmed);
            if (results.length > 0) {
              results.forEach(function (r) {
                var cols = r.columns.join(' | ');
                log(cols, 'dim-line');
                log('-'.repeat(cols.length), 'dim-line');
                r.values.forEach(function (row) {
                  log(row.map(String).join(' | '), 'log-line');
                });
                log('', 'log-line');
              });
            } else {
              log('[OK] ' + trimmed.substring(0, 60) + (trimmed.length > 60 ? '...' : ''), 'dim-line');
            }
          } catch (e) {
            log('[ERROR] ' + e.message, 'error-line');
          }
        });
        db.close();
        log('\n[done]', 'done-line');
      } catch (e) {
        log('[ERROR] ' + e.message, 'error-line');
      }
    });
  }

  /* ===== Python (Pyodide) ===== */
  var pyReady = false;
  var pyodide = null;
  function initPython(cb) {
    if (pyReady) { cb(); return; }
    log('[loading Pyodide (may take a moment)...]', 'dim-line');
    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js';
    script.onload = function () {
      loadPyodide().then(function (py) {
        pyodide = py;
        pyReady = true;
        cb();
      }).catch(function (e) {
        log('[ERROR] Failed to load Pyodide: ' + e.message, 'error-line');
      });
    };
    script.onerror = function () {
      log('[ERROR] Failed to load Pyodide from CDN', 'error-line');
    };
    document.head.appendChild(script);
  }

  function runPython(code) {
    initPython(function () {
      clearOutput();
      try {
        pyodide.runPython('import sys, io\n__stdout_capture = io.StringIO()\nsys.stdout = __stdout_capture');
        pyodide.runPython(code);
        var captured = pyodide.runPython('__stdout_capture.getvalue()');
        pyodide.runPython('sys.stdout = sys.__stdout__');
        if (captured) log(captured, 'log-line');
        log('\n[done]', 'done-line');
      } catch (e) {
        pyodide.runPython('sys.stdout = sys.__stdout__');
        log('[ERROR] ' + e.message, 'error-line');
      }
    });
  }

  /* ===== Run button ===== */
  runBtn.addEventListener('click', function () {
    if (running) return;
    running = true;
    runBtn.textContent = '⏳ Running...';
    var code = editor.value;
    var lang = langSelect.value;

    setTimeout(function () {
      try {
        if (lang === 'javascript') runJS(code);
        else if (lang === 'sql') runSQL(code);
        else if (lang === 'python') runPython(code);
      } finally {
        running = false;
        runBtn.textContent = '▶ Run';
      }
    }, 50);
  });

  clearBtn.addEventListener('click', function () {
    editor.value = '';
    clearOutput();
    editor.focus();
  });

  /* Tab key in editor */
  editor.addEventListener('keydown', function (e) {
    if (e.key === 'Tab') {
      e.preventDefault();
      var start = editor.selectionStart;
      var end = editor.selectionEnd;
      editor.value = editor.value.substring(0, start) + '  ' + editor.value.substring(end);
      editor.selectionStart = editor.selectionEnd = start + 2;
    }
    /* Ctrl/Cmd+Enter to run */
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      runBtn.click();
    }
  });
})();
</script>
