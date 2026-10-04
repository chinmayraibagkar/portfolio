// Blog pages: theme toggle (same localStorage key as the home page) and the
// handful of small interactive widgets the posts use. Widgets find themselves
// by data-widget, so a page without one costs nothing.
(function () {
  'use strict';

  // ---------- Theme ----------
  var html = document.documentElement;
  var toggle = document.getElementById('themeToggle');
  if (toggle) {
    toggle.addEventListener('click', function () {
      html.classList.toggle('light-theme');
      try { localStorage.setItem('theme', html.classList.contains('light-theme') ? 'light' : 'dark'); } catch (e) { /* private mode */ }
    });
  }

  // ---------- Helpers ----------
  function fmtInt(n) { return Math.round(n).toLocaleString('en-IN'); }
  function fmtInr(n) { return '₹' + Math.round(n).toLocaleString('en-IN'); }
  function pct(n, d) { return (n * 100).toFixed(d === undefined ? 1 : d) + '%'; }
  function cell(label, value) {
    return '<div class="case-cell"><span class="k">' + label + '</span><span class="v">' + value + '</span></div>';
  }
  function bind(root, render) {
    root.querySelectorAll('input').forEach(function (i) { i.addEventListener('input', render); });
    render();
  }
  function val(root, name) { return parseFloat(root.querySelector('[name="' + name + '"]').value); }
  function show(root, name, text) { var el = root.querySelector('[data-show="' + name + '"]'); if (el) el.textContent = text; }

  // ---------- A/A test: two identical ads, how big a fake gap? ----------
  function binomial(n, p) {
    // Normal approximation is plenty for a teaching widget at these sizes.
    var mean = n * p, sd = Math.sqrt(n * p * (1 - p));
    var u = 1 - Math.random(), v = Math.random();
    var z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return Math.max(0, Math.round(mean + sd * z));
  }
  document.querySelectorAll('[data-widget="aa-test"]').forEach(function (root) {
    var rate = parseFloat(root.dataset.rate || '0.02');
    var days = parseInt(root.dataset.days || '7', 10);
    function run() {
      var daily = val(root, 'daily');
      show(root, 'daily', fmtInt(daily) + ' visitors per ad per day');
      var n = daily * days;
      var a = binomial(n, rate), b = binomial(n, rate);
      var lo = Math.min(a, b), hi = Math.max(a, b);
      var gap = lo > 0 ? hi / lo - 1 : 0;
      root.querySelector('.out').innerHTML =
        cell('Ad A conversions', fmtInt(a) + ' (' + pct(a / n, 2) + ')') +
        cell('Ad B conversions', fmtInt(b) + ' (' + pct(b / n, 2) + ')') +
        cell('Fake "winner" lift', '+' + pct(gap));
      var v = root.querySelector('.verdict');
      v.className = 'verdict ' + (gap > 0.1 ? 'bad' : gap > 0.04 ? 'warn' : 'ok');
      v.textContent = gap > 0.1
        ? 'Both ads are identical. A gap this size would still get one of them crowned the winner.'
        : gap > 0.04 ? 'Identical ads, a noticeable gap — still pure chance.' : 'With enough data, identical ads look identical.';
    }
    root.querySelector('button').addEventListener('click', run);
    bind(root, run);
  });

  // ---------- Test size calculator ----------
  document.querySelectorAll('[data-widget="test-size"]').forEach(function (root) {
    bind(root, function () {
      var p = val(root, 'cvr'), lift = val(root, 'lift'), daily = val(root, 'daily');
      show(root, 'cvr', pct(p, 1));
      show(root, 'lift', pct(lift, 0));
      show(root, 'daily', fmtInt(daily));
      // n ≈ 16·p(1−p) / (p·lift)²  — 95% confidence, 80% power
      var n = 16 * p * (1 - p) / Math.pow(p * lift, 2);
      var d = n / daily;
      root.querySelector('.out').innerHTML =
        cell('Visitors needed per ad', fmtInt(n)) +
        cell('Conversions per ad', fmtInt(n * p)) +
        cell('Days to read it', fmtInt(Math.ceil(d)));
      var v = root.querySelector('.verdict');
      v.className = 'verdict ' + (d > 28 ? 'bad' : d > 14 ? 'warn' : 'ok');
      v.textContent = d > 28
        ? 'Too small to read inside a month. Test a bolder idea, use fewer variants, or test on click-through rate.'
        : d > 14 ? 'Readable, but plan for 2+ weeks and fix the end date before you start.'
        : 'Readable within two weeks. Fix the end date and check significance once, at the end.';
    });
  });

  // ---------- Blast radius of one agent action ----------
  document.querySelectorAll('[data-widget="blast-radius"]').forEach(function (root) {
    bind(root, function () {
      var extra = val(root, 'extra'), hours = val(root, 'hours'), waste = val(root, 'waste');
      show(root, 'extra', fmtInr(extra) + ' / day');
      show(root, 'hours', fmtInt(hours) + ' hours');
      show(root, 'waste', pct(waste, 0));
      var spent = extra * hours / 24, lost = spent * waste;
      root.querySelector('.out').innerHTML =
        cell('Extra spend before anyone looks', fmtInr(spent)) +
        cell('Of which wasted', fmtInr(lost));
      var v = root.querySelector('.verdict');
      v.className = 'verdict ' + (lost > 50000 ? 'bad' : lost > 10000 ? 'warn' : 'ok');
      v.textContent = lost > 50000
        ? 'A change this size needs a person to approve it. Cap what the agent may do alone.'
        : lost > 10000 ? 'Survivable but avoidable: cap the change size and alert on every write.'
        : 'Small and reversible — fine to automate, as long as every action is logged.';
    });
  });

  // ---------- PMax channel check ----------
  document.querySelectorAll('[data-widget="channel-check"]').forEach(function (root) {
    bind(root, function () {
      var spend = val(root, 'spend'), value = val(root, 'value'), margin = val(root, 'margin'), view = val(root, 'view');
      show(root, 'spend', fmtInr(spend));
      show(root, 'value', fmtInr(value));
      show(root, 'margin', pct(margin, 0));
      show(root, 'view', pct(view, 0));
      var roas = value / spend, click = value * (1 - view) / spend, be = 1 / margin;
      root.querySelector('.out').innerHTML =
        cell('Channel ROAS', roas.toFixed(2) + 'x') +
        cell('Click-only ROAS', click.toFixed(2) + 'x') +
        cell('Breakeven ROAS', be.toFixed(2) + 'x');
      var v = root.querySelector('.verdict');
      var tone = roas >= be ? 'ok' : click < be / 2 ? 'bad' : 'warn';
      v.className = 'verdict ' + tone;
      v.textContent = tone === 'ok'
        ? 'Pays its way even on reported numbers.'
        : tone === 'bad' ? 'Below breakeven, and most of the credit is from views. Prove it with a holdout or starve it.'
        : 'Not covering its costs on reported numbers. Check assets and signals before deciding it cannot work.';
    });
  });
})();
