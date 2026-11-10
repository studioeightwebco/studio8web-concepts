(function () {
  var toggle = document.querySelector('.nav-toggle'), nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', function () { var open = nav.classList.toggle('open'); toggle.setAttribute('aria-expanded', open); });
    nav.addEventListener('click', function (e) { if (e.target.matches('a[href^="#"]')) { nav.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); } });
  }
  var btns = document.querySelectorAll('.menu-btn');
  function closeAll() { btns.forEach(function (o) { o.setAttribute('aria-expanded', 'false'); }); }
  btns.forEach(function (b) {
    b.addEventListener('click', function (e) { e.stopPropagation(); var open = b.getAttribute('aria-expanded') === 'true'; closeAll(); b.setAttribute('aria-expanded', String(!open)); });
  });
  document.addEventListener('click', function (e) { if (!e.target.closest('.has-menu')) closeAll(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeAll(); });

  var slides = document.getElementById('slides');
  if (slides) document.querySelectorAll('.sbtn').forEach(function (b) {
    b.addEventListener('click', function () { slides.scrollBy({ left: slides.clientWidth * +b.dataset.dir, behavior: 'smooth' }); });
  });

  // Prefill the message from links like contact.html?topic=... or ?msg=...
  var params = new URLSearchParams(location.search);
  var pre = params.get('msg') || (params.get('topic') ? 'I would like to request a ' + params.get('topic').toLowerCase() + '.' : '');
  document.querySelectorAll('form.concept-form').forEach(function (form) {
    if (pre && form.message && !form.message.value) form.message.value = pre;
    var note = form.querySelector('.form-note');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var ok = true;
      form.querySelectorAll('[required]').forEach(function (f) {
        var bad = f.type === 'radio' ? !form.querySelector('input[name="' + f.name + '"]:checked') : !f.value.trim() || (f.type === 'email' && !/^\S+@\S+\.\S+$/.test(f.value));
        if (f.type !== 'radio') f.setAttribute('aria-invalid', bad ? 'true' : 'false');
        if (bad) ok = false;
      });
      note.hidden = false;
      note.innerHTML = ok ? 'This is a design concept, so nothing was sent. On the live site this message goes straight to the Advanced Dermatology Center team. To reach them now, call <a href="tel:+17472978534">747-297-8534</a> or use their <a href="https://www.advanceddermcenter.com/contact/">contact page</a>.' : 'Please fill in your name, phone, a valid email and whether you are a new patient.';
    });
  });
  var topic = params.get('topic');
  if (topic) document.querySelectorAll('.path').forEach(function (p) { if (p.getAttribute('href').indexOf(encodeURIComponent(topic).replace(/%20/g, '+')) > -1) p.setAttribute('aria-current', 'true'); });

  // Print a single special
  document.querySelectorAll('.print-offer').forEach(function (b) {
    b.addEventListener('click', function () {
      var card = document.getElementById(b.dataset.target), host = card.closest('.block');
      document.body.classList.add('print-one'); card.classList.add('print-me'); host.classList.add('print-host');
      window.print();
      setTimeout(function () { document.body.classList.remove('print-one'); card.classList.remove('print-me'); host.classList.remove('print-host'); }, 500);
    });
  });
})();
