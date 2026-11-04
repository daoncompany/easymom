(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // 헤더: 스크롤 시 배경 + 모바일 메뉴
  const hd = $('#hd'), gnb = $('#gnb'), menuBtn = $('#menuBtn');
  const setMenu = open => {
    gnb.classList.toggle('open', open);
    hd.classList.toggle('menu-open', open);
    menuBtn.setAttribute('aria-expanded', open);
  };
  menuBtn.addEventListener('click', () => setMenu(!gnb.classList.contains('open')));
  $$('a', gnb).forEach(a => a.addEventListener('click', () => setMenu(false)));

  // 후기 영상 18편
  const titles = [
    '당뇨환자 사용후기', '항암환자 사용후기', '얼굴비대칭환자 사용후기', '안구건조증환자 사용후기',
    '합병증환자 사용후기', '고지혈증환자 사용후기', '회전근개파열환자 사용후기', '허리통증환자 사용후기',
    '요실금환자 사용후기', '산후풍환자 사용후기', '전립선통증환자 사용후기', '전립선통증환자 사용후기',
    '소화불량환자 사용후기', '피부처짐환자 사용후기', '수족냉증환자 사용후기', '합병증환자 사용후기',
    '복부팽만환자 사용후기', '허리통증환자 사용후기'
  ];
  const N = titles.length, pad = i => String(i).padStart(2, '0');
  const player = $('#rvPlayer'), title = $('#rvTitle'), thumbs = $('#thumbs');
  thumbs.innerHTML = Array.from({ length: N }, (_, k) => {
    const n = pad(k + 1);
    return `<li><button class="thumb" type="button" data-n="${n}"${k ? '' : ' aria-current="true"'}><img src="img/review${n}.jpg" alt="" loading="lazy" width="640" height="360"><span><small>${n}</small>${titles[k]}</span></button></li>`;
  }).join('');
  thumbs.addEventListener('click', e => {
    const b = e.target.closest('.thumb');
    if (!b) return;
    const n = b.dataset.n;
    $$('.thumb', thumbs).forEach(t => t.removeAttribute('aria-current'));
    b.setAttribute('aria-current', 'true');
    player.poster = `img/review${n}.jpg`;
    player.src = `video/review${n}.mp4`;
    title.textContent = `${n} ${titles[+n - 1]}`;
    player.play().catch(() => {});
    player.closest('.player').scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
  });

  // 홍보영상 모달
  const modal = $('#promo'), promo = $('video', modal);
  $$('[data-open="promo"]').forEach(b => b.addEventListener('click', () => {
    modal.showModal();
    promo.play().catch(() => {});
  }));
  $('.modal-x', modal).addEventListener('click', () => modal.close());
  modal.addEventListener('click', e => { if (e.target === modal) modal.close(); });
  modal.addEventListener('close', () => promo.pause());

  // 탭 (좌우 화살표 지원)
  const tabs = $$('[role="tab"]');
  const selectTab = t => {
    tabs.forEach(x => {
      const on = x === t;
      x.setAttribute('aria-selected', on);
      x.tabIndex = on ? 0 : -1;
      const panel = $('#' + x.getAttribute('aria-controls'));
      panel.hidden = !on;
      if (on) {
        panel.classList.add('in');
        $$('.count', panel).forEach(countUp);
      }
    });
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => selectTab(t));
    t.addEventListener('keydown', e => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (!d) return;
      const next = tabs[(i + d + tabs.length) % tabs.length];
      selectTab(next); next.focus();
    });
  });

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
  $$('.rv, .subhero, .hero, .panel').forEach(el => io.observe(el));

  // 글자 채움 문장: 글자 단위로 쪼갬
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

  // 스크롤마다: 헤더, 글자 채움, 패럴랙스
  const pars = $$('.ph-par');
  const onScroll = () => {
    const y = scrollY, vh = innerHeight;
    hd.classList.toggle('on', y > vh * 0.6);
    if (reduce) return;
    const r = fill.getBoundingClientRect();
    const p = Math.min(Math.max((vh * 0.85 - r.top) / (r.height + vh * 0.35), 0), 1);
    const k = Math.round(p * chars.length);
    chars.forEach((c, i) => c.classList.toggle('on', i < k));
    pars.forEach(el => {
      const b = el.getBoundingClientRect();
      if (b.bottom < 0 || b.top > vh) return;
      el.style.transform = `translateY(${(b.top + b.height / 2 - vh / 2) * -+el.dataset.speed}px)`;
    });
  };
  let ticking = false;
  addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();
})();
