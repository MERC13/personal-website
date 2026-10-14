// Progressive enhancement: without this file every section still reads, with static
// numbers in place of the demos. No third parties, no requests.
(function () {
  "use strict";

  var root = document.documentElement;
  var status = document.getElementById("status");
  var D = window.SITE_DATA || {};
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function css(name) { return getComputedStyle(root).getPropertyValue(name).trim(); }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }
  function say(msg) { if (!status) return; status.textContent = ""; setTimeout(function () { status.textContent = msg; }, 100); }
  function svg(w, h, inner, label) {
    return '<svg class="chart" viewBox="0 0 ' + w + " " + h + '" role="img" aria-label="' + esc(label) + '">' +
      '<defs><pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" fill="none"/><line x1="0" y1="0" x2="0" y2="6" stroke="currentColor" stroke-width="2" opacity=".35"/></pattern></defs>' +
      inner + "</svg>";
  }
  function fmt(v, dp) { return (v > 0 ? "+" : v < 0 ? "−" : "") + Math.abs(v).toFixed(dp == null ? 3 : dp); }

  // ── Theme ──────────────────────────────────────────────────────────────
  var themeListeners = [];
  function theme() {
    return root.getAttribute("data-theme") || (matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark");
  }
  function onTheme(fn) { themeListeners.push(fn); }
  function themeChanged() {
    var m = $('meta[name="theme-color"]');
    if (m) m.content = theme() === "dark" ? "#0A0D13" : "#F4F6FA";
    themeListeners.forEach(function (fn) { fn(); });
  }
  var toggle = $(".theme");
  if (toggle) {
    var label = function () { toggle.setAttribute("aria-label", theme() === "dark" ? "Use light theme" : "Use dark theme"); };
    label();
    toggle.addEventListener("click", function () {
      var next = theme() === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      try { localStorage.setItem("jc:theme", next); } catch (e) {}
      label(); themeChanged(); say(next === "dark" ? "Dark theme" : "Light theme");
    });
    matchMedia("(prefers-color-scheme: light)").addEventListener("change", function () { label(); themeChanged(); });
  }
  themeChanged();

  // ── Copy buttons ───────────────────────────────────────────────────────
  $$("[data-copy], [data-copy-from]").forEach(function (b) {
    b.addEventListener("click", function () {
      var from = b.getAttribute("data-copy-from");
      var text = from ? document.getElementById(from).textContent : b.getAttribute("data-copy");
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(
        function () { say(b.getAttribute("data-ok")); flash(b); },
        function () { say(b.getAttribute("data-fail")); });
    });
  });
  function flash(b) {
    var old = b.style.borderColor; b.style.borderColor = css("--good");
    setTimeout(function () { b.style.borderColor = old; }, 900);
  }

  // ── Visibility helper ──────────────────────────────────────────────────
  function whenVisible(el, fn, margin) {
    if (!("IntersectionObserver" in window)) { fn(); return; }
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { io.disconnect(); fn(); } });
    }, { rootMargin: margin || "0px 0px -10% 0px" });
    io.observe(el);
  }

  // ── Reveal on scroll ───────────────────────────────────────────────────
  if (!reduced && "IntersectionObserver" in window) {
    var revealIO = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("is-in"); revealIO.unobserve(e.target); } });
    }, { rootMargin: "0px 0px -8% 0px" });
    $$(".tl, .role, .edu > *, .proj, .sec__head").forEach(function (el) {
      if (el.getBoundingClientRect().top > innerHeight) { el.classList.add("reveal"); revealIO.observe(el); }
    });
  }

  // ── Count-up numbers ───────────────────────────────────────────────────
  $$("[data-count]").forEach(function (el) {
    var to = parseFloat(el.getAttribute("data-count"));
    var dp = parseInt(el.getAttribute("data-dp") || "0", 10);
    var plus = el.hasAttribute("data-plus") ? "+" : "";
    var final = el.textContent;
    if (reduced) return;
    function show(v) { el.textContent = (dp ? v.toFixed(dp) : Math.round(v).toLocaleString("en-US")) + plus; }
    show(0);
    whenVisible(el, function () {
      var t0 = performance.now(), dur = 1100;
      (function tick(t) {
        var p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
        show(to * e);
        if (p < 1) requestAnimationFrame(tick); else el.textContent = final;
      })(t0);
    });
  });

  // ── Scroll spy: header nav + timeline ──────────────────────────────────
  if ("IntersectionObserver" in window) {
    var navLinks = $$(".hdr__nav a");
    var spy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (!e.isIntersecting) return;
        navLinks.forEach(function (a) {
          if (a.getAttribute("href") === "#" + e.target.id) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current");
        });
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    $$("main > section[id]").forEach(function (s) { spy.observe(s); });

    var tlRows = $$(".tl__row");
    var roleSpy = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        var row = tlRows.filter(function (r) { return r.getAttribute("href") === "#" + e.target.id; })[0];
        if (row) row.classList.toggle("is-on", e.isIntersecting);
      });
    }, { rootMargin: "-40% 0px -40% 0px" });
    $$(".role").forEach(function (r) { roleSpy.observe(r); });
  }

  // ── Segmented tabs (the shared control) ────────────────────────────────
  function tabs(group, onPick) {
    var bs = $$("button", group);
    function pick(b, focus) {
      bs.forEach(function (x) { x.setAttribute("aria-selected", x === b ? "true" : "false"); x.tabIndex = x === b ? 0 : -1; });
      if (focus) b.focus();
      onPick(b.getAttribute("data-view"), b);
    }
    bs.forEach(function (b, i) {
      b.tabIndex = b.getAttribute("aria-selected") === "true" ? 0 : -1;
      b.addEventListener("click", function () { pick(b); });
      b.addEventListener("keydown", function (ev) {
        var d = ev.key === "ArrowRight" ? 1 : ev.key === "ArrowLeft" ? -1 : 0;
        if (d) { ev.preventDefault(); pick(bs[(i + d + bs.length) % bs.length], true); }
      });
    });
    var start = bs.filter(function (b) { return b.getAttribute("aria-selected") === "true"; })[0] || bs[0];
    if (start) pick(start);
  }

  // ── Hero: a voxel field with a haemodynamic lag ────────────────────────
  // Each cell low-pass filters its input twice, so it peaks a couple of seconds after the
  // cursor passes and then fades: a cartoon of a BOLD response.
  (function () {
    var cv = $(".hero__field"); if (!cv) return;
    var ctx = cv.getContext("2d"), hero = cv.parentElement;
    var cell = 22, gap = 3, cols = 0, rows = 0, a, b, s, noise, rgb = "91,224,230";
    var px = -1e4, py = -1e4, lastMove = -1e4, running = false, visible = true, dpr = 1;

    function size() {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      var w = hero.clientWidth, h = hero.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr;
      cell = w < 640 ? 16 : 22;
      cols = Math.ceil(w / cell); rows = Math.ceil(h / cell);
      var n = cols * rows;
      a = new Float32Array(n); b = new Float32Array(n); s = new Float32Array(n); noise = new Float32Array(n);
      for (var i = 0; i < n; i++) noise[i] = Math.random();
      draw(0);
    }
    function colour() { rgb = css("--voxel") || rgb; }
    onTheme(function () { colour(); draw(performance.now()); });
    colour();

    function stim(t) {
      var x = px, y = py;
      if (t - lastMove > 2500) { // idle: a slow figure-eight
        var w = hero.clientWidth, h = hero.clientHeight, u = t / 2600;
        x = w * (0.68 + 0.22 * Math.sin(u)); y = h * (0.5 + 0.3 * Math.sin(2 * u));
      }
      var r = cell * 3.2;
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
        var dx = i * cell + cell / 2 - x, dy = j * cell + cell / 2 - y;
        var d2 = (dx * dx + dy * dy) / (r * r);
        s[j * cols + i] = d2 < 4 ? Math.exp(-d2) : 0;
      }
    }
    function draw(t) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (var j = 0; j < rows; j++) for (var i = 0; i < cols; i++) {
        var k = j * cols + i;
        var base = 0.035 + 0.035 * Math.sin(t / 1700 + noise[k] * 6.28);
        var v = Math.min(1, base + (b ? b[k] * 1.6 : 0));
        ctx.fillStyle = "rgba(" + rgb + "," + v.toFixed(3) + ")";
        ctx.fillRect(i * cell + gap / 2, j * cell + gap / 2, cell - gap, cell - gap);
      }
    }
    function frame(t) {
      if (!running) return;
      stim(t);
      for (var k = 0; k < s.length; k++) {
        a[k] += (s[k] - a[k]) * 0.035;   // first stage: slow rise
        b[k] += (a[k] - b[k]) * 0.03;    // second stage: the lag and the long tail
      }
      draw(t);
      requestAnimationFrame(frame);
    }
    function start() { if (!running && visible && !reduced) { running = true; requestAnimationFrame(frame); } }
    function stop() { running = false; }

    hero.addEventListener("pointermove", function (e) {
      var r = hero.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; lastMove = performance.now();
    });
    hero.addEventListener("pointerleave", function () { px = py = -1e4; });
    window.addEventListener("resize", function () { size(); });
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) { visible = es[0].isIntersecting; visible ? start() : stop(); }).observe(hero);
    }
    document.addEventListener("visibilitychange", function () { document.hidden ? stop() : start(); });
    size(); start();
  })();

  // ── UCSF: brain decoding results ───────────────────────────────────────
  // Numbers from the project's results write-up (all held-out, 8 NSD subjects unless noted).
  (function () {
    var fig = $('[data-demo="neuro"]'); if (!fig) return;
    var stage = $("[data-stage]", fig), note = $("[data-note]", fig), current = "headline";
    // Draw at the stage's real width, so chart text stays at its set size on a phone.
    function width() { return Math.max(300, Math.min(760, stage.clientWidth - 32)); }

    function hbars(items, opt) {
      // items: [label, value, sublabel, cls]; scale 0..max
      var W = width(), rowH = 40, top = 8, L = W < 480 ? 142 : (opt.left || 190), R = 62, H = top + items.length * rowH + 26;
      var x = function (v) { return L + (W - L - R) * (v / opt.max); };
      var g = "";
      opt.ticks.forEach(function (t) {
        g += '<line class="grid" x1="' + x(t) + '" x2="' + x(t) + '" y1="' + top + '" y2="' + (H - 22) + '"/>' +
          '<text x="' + x(t) + '" y="' + (H - 6) + '" text-anchor="middle">' + (opt.tickFmt ? opt.tickFmt(t) : t) + "</text>";
      });
      items.forEach(function (it, i) {
        var y = top + i * rowH;
        g += '<text class="t-strong" x="0" y="' + (y + 17) + '">' + esc(it[0]) + "</text>";
        if (it[2]) g += '<text x="0" y="' + (y + 31) + '">' + esc(it[2]) + "</text>";
        if (it[1] == null) {
          g += '<rect class="bar--hatch" x="' + L + '" y="' + (y + 8) + '" width="' + (W - L - R) + '" height="18" rx="3" style="color:var(--faint)"/>' +
            '<text x="' + (L + 10) + '" y="' + (y + 21) + '" class="t-strong">' + esc(it[3]) + "</text>";
        } else {
          g += '<rect class="bar grow ' + (it[3] || "") + '" style="animation-delay:' + i * 90 + 'ms" x="' + L + '" y="' + (y + 8) + '" width="' + (x(it[1]) - L) + '" height="18" rx="3"/>' +
            '<text class="t-k" x="' + (x(it[1]) + 8) + '" y="' + (y + 21) + '">' + (opt.valFmt ? opt.valFmt(it[1]) : it[1]) + "</text>";
        }
      });
      if (opt.chance != null) {
        g += '<line class="chance" x1="' + x(opt.chance) + '" x2="' + x(opt.chance) + '" y1="' + (top - 4) + '" y2="' + (H - 22) + '"/>' +
          '<text x="' + (x(opt.chance) + 4) + '" y="' + (top + 2) + '" style="fill:var(--bad)">chance</text>';
      }
      return svg(W, H, g, opt.label);
    }

    var views = {
      headline: function () {
        return {
          html: '<ul class="tiles fade-in">' +
            "<li><b>0.955</b><span>held-out 2-way identification, mean of all 8 NSD subjects (range 0.92–0.98; chance 0.50)</span></li>" +
            "<li><b>155×</b><span>chance: top-1 retrieval of the seen image among 897 it never trained on</span></li>" +
            "<li><b>0.13 → 0.30</b><span>pixel correlation after fusing a low-level decoder, about 92% of state of the art</span></li>" +
            "<li><b>~0 → +0.19</b><span>per-stimulus reliability once a one-line sort bug that scrambled image–scan pairs was fixed</span></li>" +
            "</ul>",
          note: "Every number is on held-out images the model never saw, next to an oracle that decodes the true CLIP embedding."
        };
      },
      foils: function () {
        return {
          html: hbars([
            ["Any other image", 0.972, "random foil"],
            ["Same supercategory", 0.926, "e.g. animal vs animal"],
            ["Same category", 0.898, "e.g. dog vs dog"]
          ], { max: 1, ticks: [0, .25, .5, .75, 1], chance: .5, label: "2-way identification against harder foils", valFmt: function (v) { return v.toFixed(3); } }),
          note: "Is it just classifying categories? Make the wrong answer the same kind of thing and accuracy barely drops: the decoder tells apart new dogs it never saw. 8 of 8 subjects."
        };
      },
      gran: function () {
        return {
          html: hbars([
            ["Coarse category", 90, "animal, vehicle…"],
            ["Object identity", 79, "which object"],
            ["Count", 39, "how many"],
            ["Colour", 34, "what colour"],
            ["Spatial relation", null, "left of / right of", "the CLIP target itself can’t see it"]
          ], { max: 100, ticks: [0, 25, 50, 75, 100], label: "Share of the decodable signal recovered per attribute", valFmt: function (v) { return v + "%"; }, tickFmt: function (t) { return t + "%"; } }),
          note: "Share of what CLIP could carry that the brain decode recovers. The near-ceiling score is object gist; spatial relations fail because the pooled CLIP target is blind to them, not the brain."
        };
      },
      pool: function () {
        var W = width(), L = W < 480 ? 104 : 150, R = 30, top = 22, x = function (v) { return L + (W - L - R) * (v - .45) / .3; };
        var rows = [["CLIP ViT-L/14", .554, .691, .545], ["DINOv2 ViT-B/14", .584, .714, .589]];
        var g = "";
        [.5, .6, .7].forEach(function (t) { g += '<line class="grid" x1="' + x(t) + '" x2="' + x(t) + '" y1="' + top + '" y2="134"/><text x="' + x(t) + '" y="150" text-anchor="middle">' + t.toFixed(1) + "</text>"; });
        g += '<line class="chance" x1="' + x(.5) + '" x2="' + x(.5) + '" y1="' + (top - 6) + '" y2="134"/><text x="' + (x(.5) + 4) + '" y="' + (top - 8) + '" style="fill:var(--bad)">chance</text>';
        rows.forEach(function (r, i) {
          var y = top + 22 + i * 56;
          g += '<text class="t-strong" x="0" y="' + (y + 4) + '">' + r[0] + "</text>";
          g += '<line class="grid" x1="' + x(Math.min(r[1], r[3])) + '" x2="' + x(r[2]) + '" y1="' + y + '" y2="' + y + '" style="stroke:var(--line-2);stroke-width:3"/>';
          [["pooled", r[1], "var(--muted)", -14], ["scrambled", r[3], "var(--faint)", 22], ["dense", r[2], "var(--k)", -14]].forEach(function (p, j) {
            g += '<circle class="fade-in" style="animation-delay:' + (i * 3 + j) * 80 + 'ms;fill:' + p[2] + '" cx="' + x(p[1]) + '" cy="' + y + '" r="7"/>' +
              '<text x="' + x(p[1]) + '" y="' + (y + p[3]) + '" text-anchor="middle"' + (p[0] === "dense" ? ' class="t-k"' : "") + ">" + p[0] + " " + p[1].toFixed(3) + "</text>";
          });
        });
        return {
          html: svg(W, 156, g, "Is A left of B: pooled vs dense vs scrambled features, two backbones"),
          note: "Is A left of B? Average the image into one vector and both backbones lose the same ~0.13; shuffle the patches and you land back at pooled. The arrangement is what pooling throws away, in either model."
        };
      },
      data: function () {
        return {
          html: hbars([
            ["NSD", 0.19, "7T images · 2-way 0.955"],
            ["BOLD Moments", 0.11, "3T clips · 2-way 0.956"],
            ["Short clips", 0.05, "3T movie · 2-way 0.885"]
          ], { max: 0.25, left: 210, ticks: [0, .05, .1, .15, .2, .25], label: "Per-stimulus reliability by dataset", valFmt: function (v) { return "+" + v.toFixed(2); }, tickFmt: function (t) { return t.toFixed(2); } }),
          note: "Per-stimulus reliability: how much a repeat of the same stimulus repeats the scan. A simple linear map matches deeper decoders here; the lever is the quality of the data, not the model."
        };
      }
    };
    function draw(v) { current = v; var r = views[v](); stage.innerHTML = r.html; note.textContent = r.note; }
    tabs($(".seg", fig), draw);
    var lastW = width(), rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt); rt = setTimeout(function () { if (Math.abs(width() - lastW) > 40) { lastW = width(); draw(current); } }, 200);
    });
  })();

  // ── Uplevel: invoice pipeline ──────────────────────────────────────────
  (function () {
    var fig = $('[data-demo="pipe"]'); if (!fig) return;
    var run = $("[data-run]", fig), lab = $("[data-run-l]", fig), read = $("[data-read]", fig);
    var pipe = $("[data-pipe]", fig), steps = $$("li", pipe), timer = null;
    function reset() {
      clearInterval(timer); timer = null;
      pipe.classList.remove("is-running");
      steps.forEach(function (s) { s.classList.remove("is-on", "is-done"); });
      run.setAttribute("aria-pressed", "false");
    }
    run.addEventListener("click", function () {
      if (timer) { reset(); lab.textContent = "Send an invoice through"; read.textContent = "stopped"; return; }
      reset(); pipe.classList.add("is-running"); run.setAttribute("aria-pressed", "true"); lab.textContent = "Stop";
      var i = 0;
      function step() {
        if (i >= steps.length) {
          clearInterval(timer); timer = null;
          steps.forEach(function (s) { s.classList.remove("is-on"); s.classList.add("is-done"); });
          pipe.classList.remove("is-running");
          run.setAttribute("aria-pressed", "false"); lab.textContent = "Run it again";
          read.textContent = "done · the real system answers in under a minute";
          say("Pipeline finished");
          return;
        }
        steps.forEach(function (s, j) { s.classList.toggle("is-on", j === i); s.classList.toggle("is-done", j < i); });
        read.textContent = "stage " + (i + 1) + " of " + steps.length + " · " + steps[i].querySelector("b").textContent;
        i++;
      }
      step(); timer = setInterval(step, reduced ? 300 : 900);
    });
  })();

  // ── failure-detection-WM: forest plot ──────────────────────────────────
  (function () {
    var fig = $('[data-demo="forest"]'), F = D.forest; if (!fig || !F) return;
    var stage = $("[data-stage]", fig), note = $("[data-note]", fig);
    // x positions are percentages, so the SVG stretches with its column without distorting the dots.
    var lo = F.min, hi = F.max, x = function (v) { return (2 + 96 * (v - lo) / (hi - lo)).toFixed(2) + "%"; };
    var hint = "Hover or tab through a row to read its setup.";

    function rowSvg(r) {
      var g = '<line class="zero" x1="' + x(0) + '" x2="' + x(0) + '" y1="0" y2="26"/>';
      var n = r.marks.length;
      r.marks.forEach(function (m, i) {
        var y = n === 1 ? 13 : 5 + i * (16 / (n - 1));
        g += '<line class="ci" x1="' + x(m[2]) + '" x2="' + x(m[3]) + '" y1="' + y + '" y2="' + y + '"/>' +
          '<circle class="pt" cx="' + x(m[1]) + '" cy="' + y + '" r="3.6"/>';
      });
      return '<svg aria-hidden="true">' + g + "</svg>";
    }
    function describe(r) {
      return "<b>Row " + r.row + ".</b> Fault window: " + esc(r.window) + ". Repair search: " + esc(r.chooser) + ". " + r.n + " episodes. " +
        r.marks.map(function (m) {
          return (m[0] ? esc(m[0]) + ": " : "") + "<b>" + fmt(m[1]) + "</b> [" + fmt(m[2]) + ", " + fmt(m[3]) + "]";
        }).join(" · ") + (r.verdict === "Yes" ? ' · <b style="color:var(--good)">beats random</b>' : " · interval includes 0");
    }
    function render(which) {
      var rows = F.rows.filter(function (r) { return which === "all" || r.group === "deployable"; });
      var ax = '<span class="forest__ticks" aria-hidden="true">' + F.ticks.map(function (t) {
        return '<i style="left:' + x(t) + '">' + (t === 0 ? "0" : fmt(t, 1)) + "</i>";
      }).join("") + "</span>";
      var h = '<div class="forest fade-in"><div class="forest__head"><span>fault window · repair search</span><span>← random better · search better →</span><span>beats?</span></div>';
      var grp = null;
      rows.forEach(function (r) {
        if (r.group !== grp) { grp = r.group; h += '<p class="forest__grp">' + esc(F.groups[grp]) + "</p>"; }
        h += '<div class="forest__row ' + (r.verdict === "Yes" ? "yes" : "") + '" tabindex="0" data-row="' + r.row + '">' +
          '<span class="forest__lab"><b>' + esc(r.window) + "</b><br>" + esc(r.chooser) + "</span>" + rowSvg(r) +
          '<span class="forest__v ' + (r.verdict === "Yes" ? "yes" : "no") + '">' + r.verdict + "</span></div>";
      });
      h += '<div class="forest__row forest__axis"><span></span>' + ax + "<span></span></div></div>";
      h += '<p class="readout" data-readout>' + hint + "</p>";
      stage.innerHTML = h;
      var out = $("[data-readout]", stage);
      $$(".forest__row[data-row]", stage).forEach(function (el) {
        var r = F.rows.filter(function (q) { return q.row === +el.getAttribute("data-row"); })[0];
        var on = function () { $$(".forest__row.is-on", stage).forEach(function (o) { o.classList.remove("is-on"); }); el.classList.add("is-on"); out.innerHTML = describe(r); };
        el.addEventListener("mouseenter", on); el.addEventListener("focus", on);
      });
      note.textContent = which === "all"
        ? "The oracle rows hand the search the true fault window. Only there does re-ranking beat a random edit, and a deployed robot never gets that window."
        : "Each dot is one setting of the search; the bar is its 95% bootstrap interval. Every interval reaches zero.";
    }
    tabs($(".seg", fig), render);
  })();

  // ── openpi steering: per-task episode grid ─────────────────────────────
  (function () {
    var fig = $('[data-demo="steer"]'), S = D.steer; if (!fig || !S) return;
    var stage = $("[data-stage]", fig), bar = $("[data-tasks]", fig);
    bar.innerHTML = S.tasks.map(function (t, i) {
      return '<button role="tab" type="button" data-view="' + i + '" aria-selected="' + (i === 0) + '">' + esc(t.title) + "</button>";
    }).join("");
    var names = S.categories;
    function render(v) {
      var t = S.tasks[+v];
      var h = '<div class="steer fade-in"><p class="steer__sum"><span><b>' + t.k + "/" + t.n + "</b> episodes succeeded</span>" +
        "<span>prompts move success? <b class=\"" + t.gate + '">' + (t.gate === "pass" ? "yes" : "barely") + "</b></span>" +
        "<span>headroom over the original prompt: <b>" + esc(t.headroom) + "</b></span>" +
        "<span>" + (t.set === "locked" ? "locked set" : "candidate screen") + "</span></p>";
      var d = 0;
      t.prompts.forEach(function (p) {
        var eps = "";
        for (var i = 0; i < p[3]; i++) eps += '<i class="' + (i < p[2] ? "ok" : "") + '" style="--d:' + (d++) + '"></i>';
        h += '<div class="prow"><p class="prow__p"><i class="c c--' + p[0] + '" title="' + names[p[0]] + '"></i><span>“' + esc(p[1]) + "”</span></p>" +
          '<span class="eps" style="--cc:var(--cat-' + p[0] + ')" aria-label="' + p[2] + " of " + p[3] + ' succeeded">' + eps + "</span>" +
          '<span class="prow__k">' + p[2] + "/" + p[3] + "</span></div>";
      });
      stage.innerHTML = h + "</div>";
    }
    tabs(bar, render);
  })();

  // ── AttentionRetention: scripted replay ────────────────────────────────
  (function () {
    var fig = $('[data-demo="lecture"]'); if (!fig) return;
    var run = $("[data-run]", fig), lab = $("[data-run-l]", fig), tx = $("[data-tx]", fig), q = $("[data-q]", fig);
    var agents = $$("[data-agents] li", fig), lec = $(".lec", fig), timers = [];
    var lines = [
      "So the gradient points in the direction that increases the loss fastest.",
      "Gradient descent just takes a step the other way, scaled by the learning rate.",
      "Make that rate too large and you overshoot the minimum, and the loss blows up.",
      "Too small, and training crawls. That trade-off is most of the art.",
      "Okay. Let’s switch gears and talk about momentum…"
    ];
    function light(idx) { agents.forEach(function (a, i) { a.classList.toggle("is-on", idx.indexOf(i) >= 0); }); }
    function later(ms, fn) { timers.push(setTimeout(fn, reduced ? Math.min(ms, 200) : ms)); }
    function clear() { timers.forEach(clearTimeout); timers = []; tx.innerHTML = ""; q.hidden = true; q.innerHTML = ""; light([]); lec.classList.remove("is-live"); }
    function add(html, cls) { var li = document.createElement("li"); if (cls) li.className = cls; li.innerHTML = html; tx.appendChild(li); }
    function play() {
      clear(); lec.classList.add("is-live"); run.setAttribute("aria-pressed", "true"); lab.textContent = "Restart";
      var t = 300;
      lines.slice(0, 4).forEach(function (l) {
        later(t, function () { light([0, 1]); add(esc(l)); }); t += 1700;
        later(t - 600, function () { light([2, 5]); });
      });
      later(t, function () { light([0, 1]); add(esc(lines[4])); }); t += 1100;
      later(t, function () { light([2, 5]); add("topic ended: gradient descent", "cut"); }); t += 1100;
      later(t, function () { light([3, 5]); }); t += 900;
      later(t, function () {
        light([]); lec.classList.remove("is-live");
        q.hidden = false;
        q.innerHTML = "<p>Quick check: what happens if the learning rate is too large?</p>" +
          '<div class="opts"><button type="button" data-ok="0">Training slows to a crawl</button>' +
          '<button type="button" data-ok="1">It overshoots and the loss diverges</button>' +
          '<button type="button" data-ok="0">The gradient becomes zero</button></div><p class="fb" data-fb aria-live="polite">Pick an answer.</p>';
        $$(".opts button", q).forEach(function (b) {
          b.addEventListener("click", function () {
            var ok = b.getAttribute("data-ok") === "1";
            $$(".opts button", q).forEach(function (o) { o.classList.remove("right", "wrong"); });
            b.classList.add(ok ? "right" : "wrong");
            light([4, 5]);
            $("[data-fb]", q).textContent = "Questioning agent: " + (ok
              ? "Right. A big step jumps past the minimum, so the loss can grow instead of shrink."
              : "Not quite. That’s what a too-small rate does; a too-large step jumps past the minimum.");
            setTimeout(function () { light([]); }, 1400);
          });
        });
        run.setAttribute("aria-pressed", "false"); lab.textContent = "Replay";
      });
    }
    run.addEventListener("click", play);
    // Start once on first view, so the panel isn't empty.
    whenVisible(fig, function () { if (!tx.children.length) play(); }, "0px 0px -30% 0px");
  })();

  // ── Deep-learning results ──────────────────────────────────────────────
  (function () {
    var fig = $('[data-demo="dl"]'); if (!fig) return;
    var stage = $("[data-stage]", fig), title = $("[data-dl-title]", fig);
    var ff = [["QB", 6.20, 7.85, .282], ["RB", 4.16, 5.80, .434], ["WR", 4.42, 6.24, .364], ["TE", 3.82, 5.18, .280]];
    var views = {
      ff: function () {
        title.textContent = "Fantasy football: test error by position";
        var W = 420, H = 210, L = 30, B = 170, max = 8, bw = 26, gx = (W - L) / 4;
        var y = function (v) { return B - (B - 16) * v / max; };
        var g = "";
        [0, 2, 4, 6, 8].forEach(function (t) { g += '<line class="grid" x1="' + L + '" x2="' + W + '" y1="' + y(t) + '" y2="' + y(t) + '"/><text x="' + (L - 6) + '" y="' + (y(t) + 4) + '" text-anchor="end">' + t + "</text>"; });
        ff.forEach(function (r, i) {
          var cx = L + gx * i + gx / 2;
          g += '<rect class="bar grow-up" style="animation-delay:' + i * 80 + 'ms" x="' + (cx - bw - 2) + '" y="' + y(r[1]) + '" width="' + bw + '" height="' + (B - y(r[1])) + '" rx="3"/>' +
            '<rect class="bar--2 grow-up" style="animation-delay:' + (i * 80 + 40) + 'ms" x="' + (cx + 2) + '" y="' + y(r[2]) + '" width="' + bw + '" height="' + (B - y(r[2])) + '" rx="3"/>' +
            '<text class="t-k" x="' + (cx - bw / 2 - 2) + '" y="' + (y(r[1]) - 5) + '" text-anchor="middle">' + r[1].toFixed(1) + "</text>" +
            '<text x="' + (cx + bw / 2 + 2) + '" y="' + (y(r[2]) - 5) + '" text-anchor="middle">' + r[2].toFixed(1) + "</text>" +
            '<text class="t-strong" x="' + cx + '" y="' + (B + 16) + '" text-anchor="middle">' + r[0] + "</text>" +
            '<text x="' + cx + '" y="' + (B + 32) + '" text-anchor="middle">R² ' + r[3].toFixed(2) + "</text>";
        });
        return svg(W, H, g, "MAE and RMSE in weekly PPR points by position") +
          '<p class="demo__key mono" style="padding:.5rem 0 0"><span><i class="c" style="background:var(--k)"></i>MAE</span><span><i class="c" style="background:var(--line-2)"></i>RMSE</span><span>points per week, season-based split</span></p>';
      },
      gan: function () {
        title.textContent = "DCGAN: generator samples after 10 epochs";
        return '<div class="gan fade-in"><img src="assets/img/gan-cifar10-epoch10.jpg" width="480" height="480" alt="An 8 by 8 grid of 32-pixel images generated by the DCGAN after 10 epochs on CIFAR-10: blurry animals, boats and skies" loading="lazy">' +
          "<p>64 images the generator invented after 10 epochs on CIFAR-10. You can already see sky, water, grass and boat-like shapes; none of them is a real photo.</p></div>";
      }
    };
    tabs($(".seg", fig), function (v) { stage.innerHTML = views[v](); });
  })();

  // ── K-means on Palmer Penguins ─────────────────────────────────────────
  (function () {
    var fig = $('[data-demo="kmeans"]'), P = D.penguins; if (!fig || !P) return;
    var cv = $("canvas", fig), ctx = cv.getContext("2d"), read = $("[data-read]", fig);
    var run = $("[data-run]", fig), lab = $("[data-run-l]", fig), kbar = $("[data-k]", fig);
    var k = 3, cents = [], assign = new Int8Array(P.length).fill(-1), iter = 0, timer = null, done = false;
    // z-score both axes so neither dominates the distance
    var mx = [0, 0], sd = [0, 0];
    [0, 1].forEach(function (d) {
      P.forEach(function (p) { mx[d] += p[d]; }); mx[d] /= P.length;
      P.forEach(function (p) { sd[d] += (p[d] - mx[d]) * (p[d] - mx[d]); }); sd[d] = Math.sqrt(sd[d] / P.length);
    });
    var Z = P.map(function (p) { return [(p[0] - mx[0]) / sd[0], (p[1] - mx[1]) / sd[1]]; });
    var X0 = 30, X1 = 62, Y0 = 168, Y1 = 236;

    function colours() { return [css("--r"), css("--e"), css("--cat-S"), css("--good")]; }
    function seed() {
      // k-means++ seeding
      cents = [Z[Math.floor(Math.random() * Z.length)].slice()];
      while (cents.length < k) {
        var d2 = Z.map(function (z) { return Math.min.apply(null, cents.map(function (c) { return dist(z, c); })); });
        var sum = d2.reduce(function (a, b) { return a + b; }, 0), r = Math.random() * sum, i = 0;
        while ((r -= d2[i]) > 0) i++;
        cents.push(Z[i].slice());
      }
      assign.fill(-1); iter = 0; done = false;
    }
    function dist(a, b) { var dx = a[0] - b[0], dy = a[1] - b[1]; return dx * dx + dy * dy; }
    function step() {
      var changed = 0;
      Z.forEach(function (z, i) {
        var best = 0, bd = Infinity;
        cents.forEach(function (c, j) { var d = dist(z, c); if (d < bd) { bd = d; best = j; } });
        if (assign[i] !== best) { assign[i] = best; changed++; }
      });
      cents = cents.map(function (c, j) {
        var sx = 0, sy = 0, n = 0;
        Z.forEach(function (z, i) { if (assign[i] === j) { sx += z[0]; sy += z[1]; n++; } });
        return n ? [sx / n, sy / n] : c;
      });
      iter++;
      if (!changed) done = true;
    }
    function inertia() { var s = 0; Z.forEach(function (z, i) { if (assign[i] >= 0) s += dist(z, cents[assign[i]]); }); return s; }
    function purity() {
      var s = 0;
      for (var j = 0; j < k; j++) {
        var c = {}; P.forEach(function (p, i) { if (assign[i] === j) c[p[2]] = (c[p[2]] || 0) + 1; });
        s += Math.max.apply(null, [0].concat(Object.keys(c).map(function (key) { return c[key]; })));
      }
      return s / P.length;
    }
    function draw() {
      var dpr = Math.min(2, window.devicePixelRatio || 1), w = cv.clientWidth, h = cv.clientHeight;
      if (!w) return;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      var pad = { l: 44, r: 12, t: 12, b: 34 };
      var sx = function (v) { return pad.l + (w - pad.l - pad.r) * (v - X0) / (X1 - X0); };
      var sy = function (v) { return h - pad.b - (h - pad.t - pad.b) * (v - Y0) / (Y1 - Y0); };
      var col = colours(), muted = css("--faint"), line = css("--line");
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = line; ctx.fillStyle = muted; ctx.lineWidth = 1; ctx.font = "11px " + css("--mono");
      [35, 40, 45, 50, 55, 60].forEach(function (t) { ctx.beginPath(); ctx.moveTo(sx(t), pad.t); ctx.lineTo(sx(t), h - pad.b); ctx.stroke(); ctx.textAlign = "center"; ctx.fillText(t, sx(t), h - pad.b + 14); });
      [180, 200, 220].forEach(function (t) { ctx.beginPath(); ctx.moveTo(pad.l, sy(t)); ctx.lineTo(w - pad.r, sy(t)); ctx.stroke(); ctx.textAlign = "right"; ctx.fillText(t, pad.l - 6, sy(t) + 4); });
      ctx.textAlign = "center"; ctx.fillText("bill length (mm)", pad.l + (w - pad.l - pad.r) / 2, h - 4);
      ctx.save(); ctx.translate(11, pad.t + (h - pad.t - pad.b) / 2); ctx.rotate(-Math.PI / 2); ctx.fillText("flipper (mm)", 0, 0); ctx.restore();
      // points: shape = true species (circle Adelie, triangle Chinstrap, square Gentoo); colour = cluster
      P.forEach(function (p, i) {
        var x = sx(p[0]), y = sy(p[1]), c = assign[i] >= 0 ? col[assign[i]] : muted;
        ctx.fillStyle = c; ctx.globalAlpha = assign[i] >= 0 ? .85 : .5; ctx.beginPath();
        if (p[2] === "A") ctx.arc(x, y, 3.2, 0, 6.283);
        else if (p[2] === "C") { ctx.moveTo(x, y - 4); ctx.lineTo(x + 3.8, y + 3); ctx.lineTo(x - 3.8, y + 3); ctx.closePath(); }
        else ctx.rect(x - 3, y - 3, 6, 6);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      cents.forEach(function (c, j) {
        var x = sx(c[0] * sd[0] + mx[0]), y = sy(c[1] * sd[1] + mx[1]);
        ctx.strokeStyle = css("--bg"); ctx.lineWidth = 6; cross(x, y);
        ctx.strokeStyle = col[j]; ctx.lineWidth = 3; cross(x, y);
      });
    }
    function cross(x, y) { ctx.beginPath(); ctx.moveTo(x - 8, y - 8); ctx.lineTo(x + 8, y + 8); ctx.moveTo(x + 8, y - 8); ctx.lineTo(x - 8, y + 8); ctx.stroke(); }
    function report() {
      if (iter === 0) { read.textContent = P.length + " penguins · " + k + " seeds placed · press Run"; return; }
      read.textContent = "iteration " + iter + " · inertia " + inertia().toFixed(1) + " · purity vs species " + Math.round(purity() * 100) + "%" + (done ? " · converged" : "");
    }
    function stop() { clearInterval(timer); timer = null; run.setAttribute("aria-pressed", "false"); lab.textContent = done ? "Run again" : "Run"; }
    run.addEventListener("click", function () {
      if (timer) { stop(); return; }
      if (done) seed();
      run.setAttribute("aria-pressed", "true"); lab.textContent = "Pause";
      timer = setInterval(function () { step(); draw(); report(); if (done) { stop(); say("K-means converged"); } }, reduced ? 120 : 650);
    });
    $("[data-reset]", fig).addEventListener("click", function () { stop(); seed(); draw(); report(); lab.textContent = "Run"; });
    $$("button", kbar).forEach(function (b) {
      b.addEventListener("click", function () {
        $$("button", kbar).forEach(function (o) { o.setAttribute("aria-checked", o === b ? "true" : "false"); });
        k = +b.getAttribute("data-v"); stop(); seed(); draw(); report(); lab.textContent = "Run";
      });
    });
    window.addEventListener("resize", draw);
    onTheme(draw);
    seed(); draw(); report();
  })();
})();
