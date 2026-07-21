---
layout: page
title: Search
permalink: /search/
---

# Search Posts

<div class="search-container">
  <input type="text" id="post-search" placeholder="Search across 350+ posts…" aria-label="Search posts" autocomplete="off" />
  <div id="search-results" class="search-results"></div>
</div>

<p class="search-hint">Type to search post titles across all 22 domains. Results update as you type.</p>

<script>
(function () {
  var posts = [
    {%- for post in site.posts -%}
      {%- if post.title -%}
      {"t": {{ post.title | jsonify }}, "u": "{{ post.url | relative_url }}", "c": "{{ post.categories | first }}", "d": "{{ post.date | date: '%b %Y' }}"},
      {%- endif -%}
    {%- endfor -%}
  ];

  var input = document.getElementById('post-search');
  var results = document.getElementById('search-results');
  var topics = {
    {%- for topic in site.data.topics -%}
    "{{ topic.slug }}": "{{ topic.name }}"{% unless forloop.last %},{% endunless %}
    {%- endfor -%}
  };

  input.addEventListener('input', function () {
    var q = this.value.trim().toLowerCase();
    if (q.length < 2) { results.innerHTML = ''; return; }

    var matched = posts.filter(function (p) {
      return p.t.toLowerCase().indexOf(q) !== -1;
    }).slice(0, 20);

    if (matched.length === 0) {
      results.innerHTML = '<p class="search-empty">No posts found for "' + q + '"</p>';
      return;
    }

    results.innerHTML = matched.map(function (p) {
      return '<a class="search-result" href="' + p.u + '">' +
        '<span class="search-result-title">' + p.t + '</span>' +
        '<span class="search-result-meta">' + (topics[p.c] || p.c) + ' · ' + p.d + '</span>' +
      '</a>';
    }).join('');
  });
})();
</script>
