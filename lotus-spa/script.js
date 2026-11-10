(function () {
  var t = document.querySelector('.nav-toggle'), nav = document.getElementById('nav');
  t.addEventListener('click', function () { var o = nav.classList.toggle('open'); t.setAttribute('aria-expanded', o); });
  nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') { nav.classList.remove('open'); t.setAttribute('aria-expanded', 'false'); } });

  // Treatment menu tabs (arrow keys move between tabs)
  var tabs = [].slice.call(document.querySelectorAll('[role="tab"]'));
  function select(tab) {
    tabs.forEach(function (x) {
      var on = x === tab; x.setAttribute('aria-selected', on); x.tabIndex = on ? 0 : -1;
      document.getElementById(x.getAttribute('aria-controls')).hidden = !on;
    });
  }
  tabs.forEach(function (tab, i) {
    tab.addEventListener('click', function () { select(tab); });
    tab.addEventListener('keydown', function (e) {
      var n = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (n) { var next = tabs[(i + n + tabs.length) % tabs.length]; select(next); next.focus(); e.preventDefault(); }
    });
  });

  // Forms are a concept: they validate but send nothing
  document.querySelectorAll('form.concept-form').forEach(function (form) {
    var note = form.querySelector('.form-note');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var bad = !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        f.setAttribute('aria-invalid', bad ? 'true' : 'false'); if (bad) ok = false;
      });
      note.hidden = false;
      note.innerHTML = ok ? 'This is a design concept, so nothing was sent. To reach Lotus Spa now, call <a href="tel:+15626824332">562-682-4332</a> or email <a href="mailto:info@lotusspa.biz">info@lotusspa.biz</a>.' : 'Please fill in the required fields with a valid email address.';
    });
  });
})();
