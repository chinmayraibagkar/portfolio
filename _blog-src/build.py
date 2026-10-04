#!/usr/bin/env python3
"""Build the portfolio blog.

    python3 _blog-src/build.py

Reads every _blog-src/posts/*.html (a JSON meta block followed by the body),
writes blog/<slug>/index.html and blog/index.html, and refreshes the "Writing"
section of index.html between the BLOG:START / BLOG:END markers.

This folder starts with an underscore, so GitHub Pages (Jekyll) never publishes it.
Body conventions:
  ```sql title="Optional title"  ...  ```   -> highlighted code block
Everything else is plain HTML using the classes in blog/blog.css.
"""

import html
import json
import re
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / '_blog-src' / 'posts'
OUT = ROOT / 'blog'
HOME = ROOT / 'index.html'
ASSET_VERSION = '2'

SQL_KEYWORDS = (
    'SELECT FROM WHERE JOIN LEFT RIGHT INNER OUTER ON AND OR NOT IN IS NULL AS GROUP BY ORDER '
    'HAVING WITH SUM COUNT DISTINCT AVG MIN MAX CASE WHEN THEN ELSE END IF ROUND NULLIF COALESCE '
    'SAFE_DIVIDE DATE DATE_SUB DATE_TRUNC TIMESTAMP_SUB TIMESTAMP_ADD CURRENT_DATE CURRENT_TIMESTAMP '
    'INTERVAL DAY MONTH HOUR BETWEEN CREATE REPLACE VIEW ALTER TABLE COLUMN SET OPTIONS OVER '
    'SQRT CONCAT USING DESC ASC LIMIT'
).split()
KW_RE = re.compile(r'\b(' + '|'.join(SQL_KEYWORDS) + r')\b')

THEME_BOOT = """<script>
  (function () {
    var t = new URLSearchParams(location.search).get('theme');
    var saved = t === 'light' || t === 'dark' ? t : null;
    try { saved = saved || localStorage.getItem('theme'); if (t) localStorage.setItem('theme', t); } catch (e) {}
    if (saved === 'light' || (!saved && matchMedia('(prefers-color-scheme: light)').matches)) {
      document.documentElement.classList.add('light-theme');
    }
  })();
</script>"""

GA = """<script async src="https://www.googletagmanager.com/gtag/js?id=G-6GHQ57J0SF"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag() { dataLayer.push(arguments); }
  gtag('js', new Date());
  gtag('config', 'G-6GHQ57J0SF');
</script>"""

THEME_ICONS = """<svg class="icon-moon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" /></svg>
          <svg class="icon-sun" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>"""


def esc(s):
    return html.escape(s, quote=True)


def highlight_sql(code):
    out = []
    for line in code.split('\n'):
        body, sep, comment = line.partition('--')
        body = KW_RE.sub(r'<span class="kw">\1</span>', esc(body))
        out.append(body + (f'<span class="cm">{esc(sep + comment)}</span>' if sep else ''))
    return '\n'.join(out)


FENCE_RE = re.compile(r'```(\w+)(?:[ \t]+title="([^"]*)")?\n(.*?)\n```', re.S)


def render_fences(body):
    def repl(m):
        lang, title, code = m.group(1), m.group(2), m.group(3)
        inner = highlight_sql(code) if lang == 'sql' else esc(code)
        head = f'<div class="code-title">{esc(title)}</div>' if title else ''
        return f'<div class="code">{head}<pre><code>{inner}</code></pre></div>'
    return FENCE_RE.sub(repl, body)


def load_posts():
    posts = []
    for path in sorted(SRC.glob('*.html')):
        text = path.read_text(encoding='utf-8')
        m = re.match(r'\s*<!--meta\s*(\{.*?\})\s*-->\s*(.*)', text, re.S)
        if not m:
            raise SystemExit(f'{path.name}: missing <!--meta {{...}} --> block')
        meta = json.loads(m.group(1))
        meta['body'] = render_fences(m.group(2).strip())
        meta.setdefault('slug', path.stem)
        posts.append(meta)
    posts.sort(key=lambda p: (p['date'], p.get('order', 0)), reverse=True)
    return posts


def human_date(iso):
    return date.fromisoformat(iso).strftime('%B %-d, %Y')


def nav(prefix, current):
    blog_current = ' aria-current="page"' if current == 'blog' else ''
    return f"""<nav class="blog-nav">
    <div class="blog-nav-inner">
      <a href="{prefix}" class="nav-logo" aria-label="Chinmay Raibagkar — home"><span>CR</span></a>
      <a href="{prefix}" class="blog-nav-link">Home</a>
      <a href="{prefix}blog/" class="blog-nav-link"{blog_current}>Blog</a>
      <button class="theme-toggle" id="themeToggle" aria-label="Toggle theme">
          {THEME_ICONS}
      </button>
    </div>
  </nav>"""


def head(title, description, prefix, canonical_path):
    # noindex: these pages are for portfolio visitors; they are deliberately kept
    # out of search results.
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>{esc(title)}</title>
  <meta name="description" content="{esc(description)}" />
  <meta name="robots" content="noindex, follow" />
  <meta property="og:title" content="{esc(title)}" />
  <meta property="og:description" content="{esc(description)}" />
  <meta property="og:type" content="article" />
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'><text y='50' font-size='48'>⚡</text></svg>" />
  {THEME_BOOT}
  {GA}
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="{prefix}style.css?v=5" />
  <link rel="stylesheet" href="{prefix}blog/blog.css?v={ASSET_VERSION}" />
</head>"""


def footer(prefix):
    return f"""<footer class="blog-footer">
    <p>© {date.today().year} Chinmay Raibagkar · <a href="{prefix}">Portfolio</a> · <a href="{prefix}blog/">All posts</a></p>
  </footer>
  <script src="{prefix}blog/blog.js?v={ASSET_VERSION}" defer></script>
</body>
</html>
"""


def card(p, href):
    return f"""<a class="post-card" href="{href}">
        <span class="tag">{esc(p['tag'])}</span>
        <h3>{esc(p['title'])}</h3>
        <span class="hand">{esc(p['hand'])}</span>
        <p>{esc(p['description'])}</p>
        <span class="meta">{p['minutes']} min read</span>
      </a>"""


def build_post(p, posts):
    prefix = '../../'
    tldr = ''.join(f'<li>{li}</li>' for li in p['tldr'])
    # The next three posts in reading order (wrapping), so each page suggests different ones.
    i = next(k for k, o in enumerate(posts) if o['slug'] == p['slug'])
    others = [posts[(i + k) % len(posts)] for k in range(1, 4)]
    more = '\n      '.join(card(o, f"../{o['slug']}/") for o in others)
    page = f"""{head(p['title'] + ' — Chinmay Raibagkar', p['description'], prefix, f"blog/{p['slug']}/")}
<body>
  {nav(prefix, 'post')}
  <main class="blog-main">
    <article>
      <header>
        <span class="post-eyebrow">{esc(p['tag'])}</span>
        <h1 class="post-title">{esc(p['title'])} <span class="post-hand">{esc(p['hand'])}</span></h1>
        <p class="post-meta">By <a href="{prefix}">Chinmay Raibagkar</a> · {human_date(p['date'])} · {p['minutes']} min read</p>
      </header>
      <section class="tldr" aria-label="The 60-second version">
        <h2>The 60-second version</h2>
        <ul>{tldr}</ul>
        <p class="bottom">{esc(p['bottom'])}</p>
      </section>
      <div class="prose">
{p['body']}
      </div>
      <aside class="post-author">
        <span class="avatar" aria-hidden="true">CR</span>
        <div>
          <span class="who">Chinmay Raibagkar</span>
          <p>Marketing analyst working on data and automation — warehouses, ad platforms and the reports in between. <a href="{prefix}#contact">Say hello</a>.</p>
        </div>
      </aside>
    </article>
    <section class="more-posts" aria-label="More posts">
      <h2>Keep reading</h2>
      <div class="post-grid">
      {more}
      </div>
    </section>
  </main>
  {footer(prefix)}"""
    dest = OUT / p['slug'] / 'index.html'
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(page, encoding='utf-8')


def build_index(posts):
    prefix = '../'
    cards = '\n      '.join(card(p, f"{p['slug']}/") for p in posts)
    page = f"""{head('Blog — Chinmay Raibagkar', 'Notes on marketing analytics, ad platforms and using AI on real business data.', prefix, 'blog/')}
<body>
  {nav(prefix, 'blog')}
  <main class="blog-main wide">
    <section class="blog-hero">
      <span class="post-eyebrow">Blog</span>
      <h1>Notes from the <span class="gradient-text">data side of marketing</span></h1>
      <p>Practical write-ups on ad platforms, testing, SQL and putting AI to work on real business data — each one built around a mistake worth avoiding.</p>
    </section>
    <div class="post-grid">
      {cards}
    </div>
  </main>
  {footer(prefix)}"""
    (OUT / 'index.html').write_text(page, encoding='utf-8')


def build_home_section(posts):
    cards = '\n          '.join(card(p, f"blog/{p['slug']}/") for p in posts[:6])
    section = f"""<!-- BLOG:START (generated by _blog-src/build.py — edit the posts, not this block) -->
  <section class="writing" id="writing">
    <div class="container">
      <span class="section-label reveal">Writing</span>
      <h2 class="section-title reveal">Notes on <span class="gradient-text">data &amp; marketing</span></h2>
      <p class="section-subtitle reveal">Practical write-ups on ad platforms, testing, SQL and using AI on real business data.</p>
      <div class="post-grid writing-grid">
          {cards}
      </div>
      <div class="writing-more reveal">
        <a href="blog/" class="btn btn-outline">Read all {len(posts)} posts</a>
      </div>
    </div>
  </section>
  <!-- BLOG:END -->"""
    text = HOME.read_text(encoding='utf-8')
    new, n = re.subn(r'<!-- BLOG:START.*?<!-- BLOG:END -->', section, text, flags=re.S)
    if n != 1:
        raise SystemExit('index.html: expected exactly one BLOG:START/BLOG:END block')
    HOME.write_text(new, encoding='utf-8')


def main():
    posts = load_posts()
    for p in posts:
        build_post(p, posts)
    build_index(posts)
    build_home_section(posts)
    # Guard: words that must never appear on the blog, one per line, kept in a
    # local file that is gitignored (so the list itself is never published).
    blocked_file = ROOT / '_blog-src' / 'blocked-words.txt'
    if blocked_file.exists():
        words = [w.strip() for w in blocked_file.read_text(encoding='utf-8').splitlines() if w.strip()]
        for f in OUT.rglob('*.html'):
            text = f.read_text(encoding='utf-8').lower()
            hits = [w for w in words if w.lower() in text]
            if hits:
                raise SystemExit(f'{f.relative_to(ROOT)}: blocked word(s) found — {", ".join(hits)}')
    else:
        print('Note: _blog-src/blocked-words.txt not found; skipping the blocked-word check.')
    print(f'Built {len(posts)} posts.')


if __name__ == '__main__':
    main()
