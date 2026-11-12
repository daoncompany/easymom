(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // 시안 비교: ?logo=2 이면 로고 2안
  const q = new URLSearchParams(location.search);
  if (q.get('logo') === '2') $$('use[href^="img/logo-1.svg"]').forEach(u => u.setAttribute('href', 'img/logo-2.svg#l'));

  // 링크 받으면 여기만 채우면 됨
  const YOUTUBE = '';
  $$('[data-youtube]').forEach(a => { if (YOUTUBE) a.href = YOUTUBE; else a.removeAttribute('target'); });

  // 헤더: 스크롤 시 배경 + 모바일 메뉴
  const hd = $('#hd'), gnb = $('#gnb'), menuBtn = $('#menuBtn');
  const setMenu = open => {
    gnb.classList.toggle('open', open);
    hd.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
  };
  menuBtn.addEventListener('click', () => setMenu(!gnb.classList.contains('open')));
  $$('a', gnb).forEach(a => a.addEventListener('click', () => setMenu(false)));

  // 성적서 확대
  const modal = $('#docModal'), docImg = $('img', modal);
  $$('[data-doc]').forEach(b => b.addEventListener('click', () => {
    docImg.src = b.dataset.doc;
    modal.showModal();
    modal.scrollTop = 0;
  }));
  $('.modal-x', modal).addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });

  // 숫자 카운트업
  const countUp = el => {
    const to = +el.dataset.to, dec = +(el.dataset.dec || 0);
    if (reduce) { el.textContent = to.toFixed(dec); return; }
    const t0 = performance.now(), dur = 1600;
    const step = now => {
      const p = Math.min((now - t0) / dur, 1), e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  // 스크롤 등장
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (!en.isIntersecting) return;
    en.target.classList.add('in');
    $$('.count', en.target).forEach(countUp);
    io.unobserve(en.target);
  }), { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
  $$('.rv, .subhero, .hero').forEach(el => io.observe(el));

  // 글자 채움 문장
  const fill = $('#fillText');
  const wrapChars = node => {
    [...node.childNodes].forEach(c => {
      if (c.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...c.textContent].forEach(ch => {
          const s = document.createElement('span');
          s.className = 'ch' + (node.tagName === 'EM' ? ' hl' : '');
          s.textContent = ch;
          frag.append(s);
        });
        c.replaceWith(frag);
      } else wrapChars(c);
    });
  };
  wrapChars(fill);
  const chars = $$('.ch', fill);
  if (reduce) chars.forEach(c => c.classList.add('on'));

  const onScroll = () => {
    const vh = innerHeight;
    hd.classList.toggle('on', scrollY > vh * 0.6);
    if (reduce) return;
    const r = fill.getBoundingClientRect();
    const p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
    const k = Math.round(p * chars.length);
    chars.forEach((c, i) => c.classList.toggle('on', i < k));
  };
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();
})();
