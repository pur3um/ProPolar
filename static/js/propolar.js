/* ProPolar project page interactions.
 * 1. Placeholder links (href="#") stay inert until real URLs replace them.
 * 2. Lightbox for any element with data-lightbox="image url".
 * 3. Before/after comparison sliders with a zoom toggle (data-zoom="x0,y0,x1,y1", normalized).
 * 4. Tabs and PSNR/SSIM toggle for the NeRF tables.
 * 5. Interactive plot of the rank schedule, Eq. (5), and raWSD, Eqs. (6)-(7).
 */
(function () {
  'use strict';

  function initPlaceholderLinks() {
    // Checked at click time, so a link works as soon as its href is filled in.
    document.addEventListener('click', function (e) {
      var a = e.target.closest ? e.target.closest('a') : null;
      if (a && a.getAttribute('href') === '#') e.preventDefault();
    });
  }

  /* ------------------------------------------------------------ lightbox */
  function initLightbox() {
    var box = document.getElementById('lightbox');
    if (!box) return;
    var img = box.querySelector('img');
    var full = box.querySelector('.lightbox-full');
    var closeBtn = box.querySelector('.lightbox-close');
    var opener = null;

    function open(el) {
      var src = el.getAttribute('data-lightbox');
      var inner = el.querySelector('img');
      img.src = src;
      img.alt = el.getAttribute('data-lightbox-alt') || (inner ? inner.alt : '');
      full.href = src;
      box.hidden = false;
      document.body.style.overflow = 'hidden';
      opener = el;
      closeBtn.focus();
    }

    function close() {
      box.hidden = true;
      document.body.style.overflow = '';
      img.removeAttribute('src');
      if (opener) opener.focus();
    }

    document.querySelectorAll('[data-lightbox]').forEach(function (el) {
      el.addEventListener('click', function () { open(el); });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open(el);
        }
      });
    });

    box.addEventListener('click', function (e) {
      if (e.target === box || e.target.closest('.lightbox-close')) close();
    });

    document.addEventListener('keydown', function (e) {
      if (box.hidden) return;
      if (e.key === 'Escape') close();
      if (e.key === 'Tab') {
        var items = [full, closeBtn];
        var i = items.indexOf(document.activeElement);
        e.preventDefault();
        items[(i + (e.shiftKey ? items.length - 1 : 1)) % items.length].focus();
      }
    });
  }

  /* ------------------------------------------------- comparison sliders */
  function initCompare() {
    document.querySelectorAll('.cmp-card').forEach(function (card) {
      var view = card.querySelector('.cmp-view');
      var zoomBtn = card.querySelector('.cmp-zoom');
      var layers = view.querySelectorAll('.cmp-img, .cmp-mark');
      var baseImg = view.querySelector('.cmp-img');
      var leftName = view.getAttribute('data-left') || 'Baseline';
      var pos = 50;
      var dragging = false;
      var zoomed = false;

      function setPos(p) {
        pos = Math.max(0, Math.min(100, p));
        view.style.setProperty('--pos', pos + '%');
        view.setAttribute('aria-valuenow', String(Math.round(pos)));
        view.setAttribute('aria-valuetext',
          leftName + ' on the left ' + Math.round(pos) + ' percent, ProPolar on the rest');
      }

      function fromEvent(e) {
        var r = view.getBoundingClientRect();
        if (r.width > 0) setPos(((e.clientX - r.left) / r.width) * 100);
      }

      view.addEventListener('pointerdown', function (e) {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        dragging = true;
        if (view.setPointerCapture) view.setPointerCapture(e.pointerId);
        view.classList.add('is-dragging');
        fromEvent(e);
      });
      view.addEventListener('pointermove', function (e) {
        if (dragging) fromEvent(e);
      });
      ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (type) {
        view.addEventListener(type, function () {
          dragging = false;
          view.classList.remove('is-dragging');
        });
      });

      view.addEventListener('keydown', function (e) {
        var step = e.shiftKey ? 10 : 2;
        var handled = true;
        switch (e.key) {
          case 'ArrowLeft':
          case 'ArrowDown': setPos(pos - step); break;
          case 'ArrowRight':
          case 'ArrowUp': setPos(pos + step); break;
          case 'PageDown': setPos(pos - 10); break;
          case 'PageUp': setPos(pos + 10); break;
          case 'Home': setPos(0); break;
          case 'End': setPos(100); break;
          default: handled = false;
        }
        if (handled) e.preventDefault();
      });

      function applyZoom() {
        var region = (card.getAttribute('data-zoom') || '').split(',').map(Number);
        if (!zoomed || region.length !== 4) {
          layers.forEach(function (l) { l.style.transform = ''; });
          view.classList.remove('is-zoomed');
          return;
        }
        var x0 = region[0], y0 = region[1], x1 = region[2], y1 = region[3];
        var cx = (x0 + x1) / 2;
        var cy = (y0 + y1) / 2;
        var natural = baseImg.naturalWidth || 800;
        var width = view.clientWidth || 1;
        // Fill the view with the marked region, capped at 4x upscaling of native pixels.
        var s = Math.min(1 / Math.max(x1 - x0, y1 - y0), (4 * natural) / width);
        s = Math.max(s, 1.5);
        var tx = Math.min(0, Math.max(1 - s, 0.5 - s * cx));
        var ty = Math.min(0, Math.max(1 - s, 0.5 - s * cy));
        var t = 'translate(' + (tx * 100).toFixed(3) + '%, ' + (ty * 100).toFixed(3) + '%) scale(' + s.toFixed(3) + ')';
        layers.forEach(function (l) { l.style.transform = t; });
        view.classList.add('is-zoomed');
      }

      if (zoomBtn) {
        var label = zoomBtn.querySelector('.cmp-zoom-label');
        var icon = zoomBtn.querySelector('i');
        zoomBtn.addEventListener('click', function () {
          zoomed = !zoomed;
          zoomBtn.setAttribute('aria-pressed', String(zoomed));
          if (label) label.textContent = zoomed ? 'Full view' : 'Zoom';
          if (icon) icon.className = zoomed ? 'fas fa-search-minus' : 'fas fa-search-plus';
          applyZoom();
        });
        window.addEventListener('resize', function () {
          if (zoomed) applyZoom();
        });
      }

      setPos(50);
    });
  }

  /* ------------------------------------------------ tabs and metric toggle */
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(function (list) {
      var tabs = Array.prototype.slice.call(list.querySelectorAll('[role="tab"]'));
      var panels = tabs.map(function (t) {
        return document.getElementById(t.getAttribute('aria-controls'));
      });

      function select(i, focus) {
        tabs.forEach(function (t, j) {
          var on = i === j;
          t.setAttribute('aria-selected', String(on));
          t.tabIndex = on ? 0 : -1;
          if (panels[j]) panels[j].hidden = !on;
        });
        if (focus) tabs[i].focus();
      }

      tabs.forEach(function (t, i) {
        t.addEventListener('click', function () { select(i, false); });
        t.addEventListener('keydown', function (e) {
          var k = null;
          if (e.key === 'ArrowRight') k = (i + 1) % tabs.length;
          if (e.key === 'ArrowLeft') k = (i - 1 + tabs.length) % tabs.length;
          if (e.key === 'Home') k = 0;
          if (e.key === 'End') k = tabs.length - 1;
          if (k !== null) {
            e.preventDefault();
            select(k, true);
          }
        });
      });

      var start = 0;
      tabs.forEach(function (t, i) {
        if (t.getAttribute('aria-selected') === 'true') start = i;
      });
      select(start, false);
    });

    document.querySelectorAll('[data-metric-toggle]').forEach(function (group) {
      var block = document.getElementById(group.getAttribute('data-metric-toggle'));
      var buttons = group.querySelectorAll('button[data-metric]');
      buttons.forEach(function (b) {
        b.addEventListener('click', function () {
          if (block) block.setAttribute('data-metric', b.getAttribute('data-metric'));
          buttons.forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
        });
      });
    });
  }

  /* --------------------------------------------------- schedule explorer */
  function initExplorer() {
    var root = document.getElementById('schedule-explorer');
    if (!root) return;
    var svg = root.querySelector('svg');
    var T = Number(root.getAttribute('data-t')) || 5000;
    var RMAX = Number(root.getAttribute('data-rmax')) || 256;
    var GMIN = Number(root.getAttribute('data-gmin')) || 0;

    var ins = {
      t0: root.querySelector('#se-t0'),
      tg: root.querySelector('#se-tg'),
      rinit: root.querySelector('#se-rinit'),
      dsat: root.querySelector('#se-dsat')
    };
    var outs = {
      t0: root.querySelector('#se-t0-out'),
      tg: root.querySelector('#se-tg-out'),
      rinit: root.querySelector('#se-rinit-out'),
      dsat: root.querySelector('#se-dsat-out'),
      tsat: root.querySelector('#se-tsat-out'),
      td: root.querySelector('#se-td-out')
    };

    // Two layouts: a wide one, and a narrow one whose smaller viewBox keeps labels legible on phones.
    function layout() {
      var w = svg.getBoundingClientRect().width || 720;
      if (w < 560) {
        return { narrow: true, VW: 400, VH: 356, X0: 38, X1: 386, TOP0: 50, TOP1: 158, BOT0: 190, BOT1: 298 };
      }
      return { narrow: false, VW: 720, VH: 336, X0: 58, X1: 700, TOP0: 30, TOP1: 142, BOT0: 178, BOT1: 290 };
    }
    var L = layout();

    function x(t) { return L.X0 + (L.X1 - L.X0) * t / (T - 1); }
    function yr(r) { return L.TOP1 - (L.TOP1 - L.TOP0) * r / RMAX; }
    function yg(g) { return L.BOT1 - (L.BOT1 - L.BOT0) * g; }
    function fmt(n) { return Number(n).toLocaleString('en-US'); }
    function f1(v) { return v.toFixed(1); }

    function compute(t0, tg, rinit, dsat) {
      var rank = new Array(T);
      var t;
      for (t = 0; t < T; t++) {
        if (t < t0) {
          rank[t] = rinit; // stand-in for the energy-based rank of Eq. (4)
        } else {
          var s = Math.min(1, (t - t0) / (tg - 1));
          var v = rinit + (RMAX - rinit) * (1 - Math.cos(Math.PI * s)) / 2;
          rank[t] = Math.min(RMAX, Math.ceil(v - 1e-9));
        }
      }
      var tsat = T - 1;
      for (t = t0; t < T; t++) {
        if (rank[t] >= RMAX) { tsat = t; break; }
      }
      var td = Math.min(T - 1, tsat + dsat);
      return { rank: rank, tsat: tsat, td: td };
    }

    function rankPath(rank, from, to) {
      var step = Math.max(1, Math.floor((to - from) / 480));
      var pts = [];
      for (var t = from; t < to; t += step) pts.push(t);
      pts.push(to);
      return pts.map(function (t, i) {
        return (i ? 'L' : 'M') + f1(x(t)) + ' ' + f1(yr(rank[t]));
      }).join('');
    }

    function label(xp, yp, text, cls, sub) {
      var anchor = xp > L.X1 - 50 ? 'end' : 'start';
      var dx = anchor === 'end' ? -5 : 5;
      var subPart = sub ? '<tspan dy="3" font-size="9">' + sub + '</tspan>' : '';
      return '<text class="' + cls + '" x="' + f1(xp + dx) + '" y="' + f1(yp) + '" text-anchor="' + anchor + '">' +
        text + subPart + '</text>';
    }

    function legend() {
      var s = '';
      var rankX = L.X0, lrX, lrY, decayX, decayY;
      if (L.narrow) {
        decayX = L.X0 + 170; decayY = 12; lrX = L.X0; lrY = 32;
      } else {
        decayX = L.X0 + 330; decayY = 12; lrX = L.X0 + 118; lrY = 12;
      }
      s += '<line class="se-rank" x1="' + rankX + '" x2="' + (rankX + 22) + '" y1="10" y2="10"/>';
      s += '<text class="se-name-rank" x="' + (rankX + 28) + '" y="14">rank r<tspan dy="3" font-size="9">t</tspan></text>';
      s += '<line class="se-lr" x1="' + lrX + '" x2="' + (lrX + 22) + '" y1="' + (lrY - 2) + '" y2="' + (lrY - 2) + '"/>';
      s += '<text class="se-name-lr" x="' + (lrX + 28) + '" y="' + (lrY + 2) + '">learning-rate multiplier \u03b3<tspan dy="3" font-size="9">t</tspan></text>';
      s += '<rect class="se-decay" x="' + decayX + '" y="' + (decayY - 9) + '" width="22" height="13"/>';
      s += '<text class="se-tick" x="' + (decayX + 28) + '" y="' + (decayY + 2) + '">decay phase</text>';
      return s;
    }

    function render() {
      L = layout();
      svg.setAttribute('viewBox', '0 0 ' + L.VW + ' ' + L.VH);

      var t0 = Number(ins.t0.value);
      var tgMax = T - t0;
      ins.tg.max = String(tgMax);
      if (Number(ins.tg.value) > tgMax) ins.tg.value = String(tgMax);
      var tg = Math.max(2, Number(ins.tg.value));
      var rinit = Number(ins.rinit.value);
      var dsat = Number(ins.dsat.value);
      var r = compute(t0, tg, rinit, dsat);

      outs.t0.textContent = fmt(t0);
      outs.tg.textContent = fmt(tg);
      outs.rinit.textContent = fmt(rinit);
      outs.dsat.textContent = fmt(dsat);
      outs.tsat.textContent = fmt(r.tsat);
      outs.td.textContent = fmt(r.td);

      var s = legend();
      var k, t;
      // decay region, shaded as in Figure 1
      [[L.TOP0, L.TOP1], [L.BOT0, L.BOT1]].forEach(function (p) {
        s += '<rect class="se-decay" x="' + f1(x(r.td)) + '" y="' + p[0] + '" width="' +
          f1(Math.max(0, x(T - 1) - x(r.td))) + '" height="' + (p[1] - p[0]) + '"/>';
      });
      // grid
      for (k = 1; k <= 3; k++) {
        var gy1 = L.TOP0 + (L.TOP1 - L.TOP0) * k / 4;
        var gy2 = L.BOT0 + (L.BOT1 - L.BOT0) * k / 4;
        s += '<line class="se-grid" x1="' + L.X0 + '" x2="' + L.X1 + '" y1="' + f1(gy1) + '" y2="' + f1(gy1) + '"/>';
        s += '<line class="se-grid" x1="' + L.X0 + '" x2="' + L.X1 + '" y1="' + f1(gy2) + '" y2="' + f1(gy2) + '"/>';
      }
      for (t = 1000; t < T; t += 1000) {
        s += '<line class="se-grid" x1="' + f1(x(t)) + '" x2="' + f1(x(t)) + '" y1="' + L.TOP0 + '" y2="' + L.TOP1 + '"/>';
        s += '<line class="se-grid" x1="' + f1(x(t)) + '" x2="' + f1(x(t)) + '" y1="' + L.BOT0 + '" y2="' + L.BOT1 + '"/>';
      }
      // axes
      s += '<path class="se-axis" d="M' + L.X0 + ' ' + L.TOP0 + 'V' + L.TOP1 + 'H' + L.X1 + '"/>';
      s += '<path class="se-axis" d="M' + L.X0 + ' ' + L.BOT0 + 'V' + L.BOT1 + 'H' + L.X1 + '"/>';
      // y ticks
      s += '<text class="se-tick" x="' + (L.X0 - 6) + '" y="' + f1(yr(RMAX) + 4) + '" text-anchor="end">' + RMAX + '</text>';
      s += '<text class="se-tick" x="' + (L.X0 - 6) + '" y="' + f1(yr(0) + 4) + '" text-anchor="end">0</text>';
      s += '<text class="se-tick" x="' + (L.X0 - 6) + '" y="' + f1(yg(1) + 4) + '" text-anchor="end">1</text>';
      s += '<text class="se-tick" x="' + (L.X0 - 6) + '" y="' + f1(yg(0) + 4) + '" text-anchor="end">' + GMIN + '</text>';
      // x ticks
      for (t = 0; t < T - 500; t += 1000) {
        var tickText = L.narrow && t > 0 ? (t / 1000) + 'k' : fmt(t);
        s += '<text class="se-tick" x="' + f1(x(t)) + '" y="' + (L.BOT1 + 17) + '" text-anchor="middle">' + tickText + '</text>';
      }
      s += '<text class="se-tick" x="' + L.X1 + '" y="' + (L.BOT1 + 17) + '" text-anchor="middle">T\u22121</text>';
      s += '<text class="se-tick" x="' + f1((L.X0 + L.X1) / 2) + '" y="' + (L.BOT1 + 36) + '" text-anchor="middle">iteration t</text>';
      // T0 marker across both panels
      s += '<line class="se-t0" x1="' + f1(x(t0)) + '" x2="' + f1(x(t0)) + '" y1="' + L.TOP0 + '" y2="' + L.BOT1 + '"/>';
      // rank schedule: dashed during the initialization phase, solid afterwards
      s += '<path class="se-rank se-rank-init" d="M' + f1(x(0)) + ' ' + f1(yr(rinit)) + 'L' + f1(x(t0)) + ' ' + f1(yr(rinit)) + '"/>';
      s += '<path class="se-rank" d="' + rankPath(r.rank, t0, T - 1) + '"/>';
      // learning-rate multiplier, Eq. (7): exact vertices
      s += '<path class="se-lr" d="M' + f1(x(0)) + ' ' + f1(yg(1 / t0)) + 'L' + f1(x(t0 - 1)) + ' ' + f1(yg(1)) +
        'L' + f1(x(r.td)) + ' ' + f1(yg(1)) + 'L' + f1(x(T - 1)) + ' ' + f1(yg(GMIN)) + '"/>';
      // saturation and decay-start markers
      s += '<line class="se-mark-rank" x1="' + f1(x(r.tsat)) + '" x2="' + f1(x(r.tsat)) + '" y1="' + L.TOP0 + '" y2="' + L.TOP1 + '"/>';
      s += '<line class="se-mark-lr" x1="' + f1(x(r.td)) + '" x2="' + f1(x(r.td)) + '" y1="' + L.BOT0 + '" y2="' + L.BOT1 + '"/>';
      s += '<circle class="se-dot-rank" cx="' + f1(x(r.tsat)) + '" cy="' + f1(yr(RMAX)) + '" r="3.5"/>';
      s += '<circle class="se-dot-lr" cx="' + f1(x(r.td)) + '" cy="' + f1(yg(1)) + '" r="3.5"/>';
      s += label(x(r.tsat), L.TOP1 - 8, '\u03c4', 'se-label-rank', 'sat');
      s += label(x(r.td), L.BOT1 - 8, 'T', 'se-label-lr', 'd');
      s += label(x(t0), L.BOT0 + 14, 'T', 'se-label-t0', '0');

      svg.innerHTML = s;
      svg.setAttribute('aria-label',
        'Rank grows from ' + rinit + ' to ' + RMAX + ' and saturates at iteration ' + fmt(r.tsat) +
        '. The learning-rate multiplier holds its peak until iteration ' + fmt(r.td) +
        ' and then decays to ' + GMIN + '.');
    }

    Object.keys(ins).forEach(function (key) {
      if (ins[key]) ins[key].addEventListener('input', render);
    });
    var pending = false;
    window.addEventListener('resize', function () {
      if (pending) return;
      pending = true;
      window.requestAnimationFrame(function () {
        pending = false;
        if (layout().narrow !== L.narrow) render();
      });
    });
    render();
  }

  function init() {
    initPlaceholderLinks();
    initLightbox();
    initCompare();
    initTabs();
    initExplorer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
