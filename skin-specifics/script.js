// Mobile menu
const head = document.querySelector('.site-head');
const menuBtn = document.querySelector('.menu-btn');
if (menuBtn) menuBtn.addEventListener('click', () => {
  const open = head.classList.toggle('open');
  menuBtn.setAttribute('aria-expanded', open);
  menuBtn.textContent = open ? 'Close' : 'Menu';
});
// Results filter
const buttons = document.querySelectorAll('.filters button');
buttons.forEach(b => b.addEventListener('click', () => {
  buttons.forEach(x => x.setAttribute('aria-pressed', x === b));
  const f = b.dataset.f;
  document.querySelectorAll('.masonry .ba').forEach(card => {
    card.hidden = f && !card.dataset.tags.split(', ').includes(f);
  });
}));
