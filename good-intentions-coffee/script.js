// Hero background video: muted and decorative, with a visible pause/play control
// (WCAG 2.2.2). It does not autoplay for people who prefer reduced motion, and
// it stops while scrolled out of view.
(function () {
  var video = document.querySelector("[data-hero-video]");
  var btn = document.querySelector("[data-video-toggle]");
  if (!video || !btn) return;
  var label = btn.querySelector("[data-video-label]");
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var userPaused = reduce;
  var inView = true;

  function render() {
    btn.setAttribute("aria-pressed", String(userPaused));
    label.textContent = userPaused ? "Play video" : "Pause video";
  }
  function sync() {
    if (!userPaused && inView) {
      var p = video.play();
      if (p && p.catch) p.catch(function () { userPaused = true; render(); });
    } else {
      video.pause();
    }
  }
  btn.hidden = false;
  btn.addEventListener("click", function () { userPaused = !userPaused; render(); sync(); });
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting; sync();
    }, { threshold: 0.1 }).observe(video);
  }
  render();
  sync();
})();

// Values scene, "the sun is kindled": the section pins, each value comes forward
// in turn, and the logo's sun rises inside its ring until the real mark resolves.
// Skipped entirely for reduced motion, so those visitors get the static layout.
(function () {
  var sec = document.querySelector("[data-kindle]");
  if (!sec) return;
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;

  var steps = [].slice.call(sec.querySelectorAll("[data-kindle-step]"));
  var stage = sec.querySelector(".kindle-stage");
  var AT = [0.1, 0.36, 0.62];       // scroll progress where each value arrives
  var WHOLE = 0.8;                   // sun reaches the logo position here
  var ticking = false, active = false;

  sec.classList.add("is-kindling");

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function update() {
    ticking = false;
    var r = sec.getBoundingClientRect();
    var travel = r.height - stage.offsetHeight;
    var p = travel > 0 ? clamp(-r.top / travel) : 1;
    sec.style.setProperty("--sun", ease(clamp(p / WHOLE)).toFixed(4));
    steps.forEach(function (li, i) { li.classList.toggle("is-on", p >= AT[i]); });
    sec.classList.toggle("is-whole", p >= WHOLE);
  }
  function onScroll() {
    if (!ticking) { ticking = true; requestAnimationFrame(update); }
  }
  new IntersectionObserver(function (entries) {
    var on = entries[0].isIntersecting;
    if (on && !active) { window.addEventListener("scroll", onScroll, { passive: true }); active = true; update(); }
    if (!on && active) { window.removeEventListener("scroll", onScroll); active = false; update(); }
  }).observe(sec);
  window.addEventListener("resize", onScroll, { passive: true });
  update();
})();

// About page, "the chain": on wide screens the makers row pans sideways with
// scroll while a line fills from maker to maker and ends at Good Intentions.
// Phones, reduced motion and no-IntersectionObserver keep the stacked layout.
(function () {
  var sec = document.querySelector("[data-chain]");
  if (!sec || !window.matchMedia) return;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !("IntersectionObserver" in window)) return;
  var wide = window.matchMedia("(min-width: 760px)");
  var stage = sec.querySelector(".chain-stage");
  var rail = sec.querySelector("[data-chain-track]");
  var line = sec.querySelector(".chain-line");
  var cards = [].slice.call(sec.querySelectorAll(".maker"));
  var distance = 0, ticking = false, listening = false, on = false;
  var END = 0.85; // pan and line finish here; the rest of the scroll holds on Good Intentions

  function clamp(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
  function measure() {
    sec.style.height = "";
    distance = Math.max(0, rail.scrollWidth - stage.clientWidth);
    sec.style.height = Math.round(stage.offsetHeight + distance / END + 1) + "px";
  }
  function update() {
    ticking = false;
    if (!on) return;
    var r = sec.getBoundingClientRect();
    var travel = sec.offsetHeight - stage.offsetHeight;
    var p = travel > 0 ? clamp(-r.top / travel) : 1;
    var t = clamp(p / END);
    rail.style.setProperty("--x", (-t * distance).toFixed(1) + "px");
    sec.style.setProperty("--chain", t.toFixed(4));
    var fillEnd = line.offsetLeft + t * line.offsetWidth;
    cards.forEach(function (c, i) {
      var mid = c.offsetLeft + c.parentNode.offsetLeft + c.offsetWidth / 2;
      c.classList.toggle("is-on", i === 0 || mid <= fillEnd + 4);
    });
  }
  function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(update); } }
  function setup() {
    on = wide.matches;
    sec.classList.toggle("is-panning", on);
    if (!on) {
      sec.style.height = ""; rail.style.removeProperty("--x");
      cards.forEach(function (c) { c.classList.remove("is-on"); });
      return;
    }
    measure(); update();
  }
  new IntersectionObserver(function (entries) {
    var vis = entries[0].isIntersecting;
    if (vis && !listening) { window.addEventListener("scroll", onScroll, { passive: true }); listening = true; update(); }
    if (!vis && listening) { window.removeEventListener("scroll", onScroll); listening = false; }
  }).observe(sec);
  if (wide.addEventListener) wide.addEventListener("change", setup);
  window.addEventListener("resize", function () { if (on) { measure(); onScroll(); } }, { passive: true });
  window.addEventListener("load", function () { if (on) { measure(); update(); } });
  setup();
})();

// "signatures for {month}": current month in Los Angeles time.
(function () {
  try {
    var m = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", month: "long" }).format(new Date());
    document.querySelectorAll("[data-month]").forEach(function (el) { el.textContent = m; });
  } catch (e) {}
})();

// Open/closed status and today's hours, from the hours published on goodintentionscoffee.com.
// Times are in minutes after midnight, Los Angeles time. Index 0 = Sunday.
(function () {
  var HOURS = [
    [420, 780],  // Sun 7am-1pm
    [390, 960],  // Mon 6:30am-4pm
    [390, 960],
    [390, 960],
    [390, 960],
    [390, 960],  // Fri
    [420, 840]   // Sat 7am-2pm
  ];
  var DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function fmt(m) {
    var h = Math.floor(m / 60), min = m % 60, ap = h >= 12 ? "pm" : "am";
    h = h % 12 || 12;
    return h + (min ? ":" + String(min).padStart(2, "0") : "") + ap;
  }

  var parts;
  try {
    parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Los_Angeles", weekday: "short", hour: "numeric", minute: "numeric", hourCycle: "h23"
    }).formatToParts(new Date());
  } catch (e) { return; }
  var get = function (t) { var p = parts.find(function (x) { return x.type === t; }); return p ? p.value : ""; };
  var day = DAYS.indexOf(get("weekday"));
  var now = parseInt(get("hour"), 10) * 60 + parseInt(get("minute"), 10);
  if (day < 0 || isNaN(now)) return;

  var today = HOURS[day];
  var open = now >= today[0] && now < today[1];
  var text;
  if (open) {
    text = "Open now until " + fmt(today[1]);
  } else if (now < today[0]) {
    text = "Closed now. Opens today at " + fmt(today[0]);
  } else {
    var next = HOURS[(day + 1) % 7];
    text = "Closed now. Opens tomorrow at " + fmt(next[0]);
  }

  document.querySelectorAll("[data-status]").forEach(function (el) {
    el.textContent = text;
    el.classList.toggle("open", open);
    el.hidden = false;
  });
  document.querySelectorAll("[data-today-hours]").forEach(function (el) {
    el.textContent = fmt(today[0]) + " to " + fmt(today[1]);
  });
  var row = document.querySelector('.hours tr[data-day="' + day + '"]');
  if (row) row.classList.add("today");
})();
