/* Studio8Web concept motion layer.
   Content is visible without this script. It only hides an element right before
   animating it in, and cleans up afterwards so the site's own hover/transition rules return. */
(() => {
  const root = document.documentElement;
  const main = document.querySelector('main');
  if (!main || !('IntersectionObserver' in window)) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('m-on');
  if (reduce) root.classList.add('m-reduce');

  const css = getComputedStyle(root);
  const DUR = parseFloat(css.getPropertyValue('--m-dur')) || 700;
  const STAGGER = parseFloat(css.getPropertyValue('--m-stagger')) || 60;
  const MAX_STEPS = 6;

  const skip = (el) => {
    if (!(el instanceof HTMLElement)) return true;
    if (/^(SCRIPT|TEMPLATE|STYLE|BR)$/.test(el.tagName)) return true;
    const cs = getComputedStyle(el);
    return cs.display === 'none' || cs.position === 'sticky' || cs.position === 'fixed' || inScroller(el);
  };

  // Sideways strips and carousels stay static: their off-screen items would wait for a sideways scroll.
  function inScroller(el) {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(a).overflowX)) return true;
    }
    return false;
  }

  // Only layout containers get split up; headings, paragraphs and buttons move as one piece.
  const CONTAINERS = /^(DIV|UL|OL|DL|ARTICLE|ASIDE|FORM)$/;
  const isBlock = (el) => !/^inline($|-block|-flex)/.test(getComputedStyle(el).display);
  const isGroup = (el) => {
    if (!CONTAINERS.test(el.tagName)) return false;
    const d = getComputedStyle(el).display;
    return d.includes('grid') || d.includes('flex');
  };

  // Repeated block children of one tag (cards, reviews, price rows) stagger individually.
  const isList = (el) => {
    const kids = [...el.children].filter((k) => !skip(k));
    if (kids.length < 3 || !kids.every(isBlock)) return false;
    const counts = {};
    kids.forEach((k) => (counts[k.tagName] = (counts[k.tagName] || 0) + 1));
    return Math.max(...Object.values(counts)) / kids.length >= 0.7;
  };

  const collect = (el, depth, out) => {
    for (const c of el.children) {
      if (skip(c)) continue;
      if (isGroup(c) && isList(c)) [...c.children].forEach((k) => !skip(k) && out.push(k));
      else if (isGroup(c) && depth < 2 && c.children.length > 1 && [...c.children].every(isBlock)) collect(c, depth + 1, out);
      else out.push(c);
    }
    return out;
  };

  const finish = (el) => {
    el.classList.remove('m-rise', 'm-img', 'm-clip', 'm-in');
    el.style.removeProperty('--m-i');
  };

  const play = (els) => {
    els.forEach((el, i) => {
      el.style.setProperty('--m-i', Math.min(i, MAX_STEPS));
      el.classList.add('m-in');
      const total = DUR * 1.4 + Math.min(i, MAX_STEPS) * STAGGER + 100;
      setTimeout(() => finish(el), total);
    });
  };

  const sections = [...main.querySelectorAll(':scope > section, :scope > div > section, :scope > div:not([class*="inner"])')];
  const hero = sections[0];

  // 1. Hero: plays on load, text first, then the photo.
  const heroItems = [];
  if (hero) {
    const h1 = hero.querySelector('h1');
    const textBlock = h1 && h1.parentElement;
    if (textBlock) [...textBlock.children].forEach((c) => !skip(c) && (c.classList.add('m-rise'), heroItems.push(c)));
    hero.querySelectorAll('img').forEach((img) => {
      if (textBlock && textBlock.contains(img)) return;
      const box = img.closest('figure, picture, [class*="photo"], [class*="arch"], [class*="visual"], [class*="frame"]') || img;
      if (hero.contains(box) && !heroItems.includes(box)) { box.classList.add('m-img'); heroItems.push(box); }
    });
  }

  // 2. Before/after photos: wipe down like a reveal, never cropped at rest.
  const resultImgs = [...main.querySelectorAll('img')].filter((img) => /efore|reated/i.test(img.alt) && !(hero && hero.contains(img)) && !inScroller(img));
  resultImgs.forEach((img) => img.classList.add('m-clip'));

  // 3. Everything else: rise in as it scrolls into view.
  const scrollItems = [];
  sections.slice(1).forEach((sec) => {
    if (skip(sec)) return;
    const content = sec.querySelector(':scope > .inner, :scope > div') || sec;
    collect(content, 0, []).forEach((el) => {
      if (el.closest('.m-rise')) return;
      el.classList.add('m-rise');
      scrollItems.push(el);
    });
  });

  setTimeout(() => play(heroItems), 40);

  // A fully clipped image never counts as visible, so watch its parent and wipe the image.
  // An image that already rises in as its own item skips the wipe.
  const clipFor = new Map();
  resultImgs.filter((img) => img.classList.contains('m-rise') ? (img.classList.remove('m-clip'), false) : true).forEach((img) => clipFor.set(img.parentElement, [...(clipFor.get(img.parentElement) || []), img]));

  const io = new IntersectionObserver((entries) => {
    const batch = entries.filter((e) => e.isIntersecting).map((e) => e.target);
    batch.sort((a, b) => (a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1));
    batch.forEach((el) => io.unobserve(el));
    play(batch.filter((el) => scrollSet.has(el)));
    // Result photos play on their own timeline, not the card stagger.
    batch.forEach((el) => (clipFor.get(el) || []).forEach((img) => play([img])));
  }, { rootMargin: '0px', threshold: 0 });

  const scrollSet = new Set(scrollItems);
  new Set([...scrollItems, ...clipFor.keys()]).forEach((el) => io.observe(el));

  // Safety net: anything already scrolled past (fast flicks, anchor jumps, layout shifts) shows right away.
  let ticking = false;
  const sweep = () => {
    ticking = false;
    const passed = [...scrollSet].filter((el) => el.classList.contains('m-rise') && !el.classList.contains('m-in') && el.getBoundingClientRect().top < innerHeight);
    passed.forEach((el) => io.unobserve(el));
    if (passed.length) play(passed);
    [...clipFor.keys()].forEach((p) => {
      if (p.getBoundingClientRect().top < innerHeight) (clipFor.get(p) || []).forEach((img) => img.classList.contains('m-clip') && !img.classList.contains('m-in') && play([img]));
    });
  };
  addEventListener('scroll', () => { if (!ticking) { ticking = true; setTimeout(sweep, 150); } }, { passive: true });

  // Never leave anything hidden for print or when content is swapped by filters.
  addEventListener('beforeprint', () => document.querySelectorAll('.m-rise, .m-img, .m-clip').forEach(finish));
})();
