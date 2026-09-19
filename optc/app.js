(() => {
  document.documentElement.classList.add('js');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const root = document.documentElement;
  const header = document.querySelector('[data-header]');
  const progress = document.querySelector('.progress span');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const story = document.querySelector('.story-track');
  const cards = [...document.querySelectorAll('.story-card')];
  const join = document.querySelector('.join');

  document.getElementById('year').textContent = new Date().getFullYear();

  const reveals = document.querySelectorAll('.reveal');
  if (reduced) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach((el) => revealObserver.observe(el));
  }

  const closeMenu = () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    mobileMenu?.classList.remove('is-open');
    document.body.classList.remove('menu-open');
  };

  menuButton?.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    mobileMenu.classList.toggle('is-open', !open);
    document.body.classList.toggle('menu-open', !open);
  });
  mobileMenu?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));

  let ticking = false;
  const updateScroll = () => {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const pageProgress = max > 0 ? y / max : 0;
    progress.style.transform = `scaleY(${pageProgress})`;
    header.classList.toggle('is-solid', y > 40);

    if (!reduced) {
      root.style.setProperty('--hero-scale', Math.min(y / window.innerHeight, 1) * 0.07);
      if (story) {
        const rect = story.getBoundingClientRect();
        const total = story.offsetHeight - window.innerHeight;
        const current = Math.min(Math.max(-rect.top, 0), total);
        const p = total > 0 ? current / total : 0;
        root.style.setProperty('--story-progress', p.toFixed(3));
        root.style.setProperty('--story-zoom', (p * 0.08).toFixed(3));
        const activeIndex = Math.min(cards.length - 1, Math.floor(p * cards.length));
        cards.forEach((card, i) => card.classList.toggle('is-active', i === activeIndex));
      }
      if (join) {
        const rect = join.getBoundingClientRect();
        const p = Math.min(Math.max((window.innerHeight - rect.top) / (window.innerHeight + rect.height), 0), 1);
        root.style.setProperty('--ball-y', `${(p - .5) * 90}px`);
      }
    } else if (cards.length) {
      cards[0].classList.add('is-active');
    }

    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      window.requestAnimationFrame(updateScroll);
      ticking = true;
    }
  }, { passive: true });
  window.addEventListener('resize', updateScroll);
  updateScroll();

  if (window.matchMedia('(pointer: fine)').matches && !reduced) {
    const dot = document.querySelector('.cursor-dot');
    const ring = document.querySelector('.cursor-ring');
    let ringX = 0;
    let ringY = 0;
    let targetX = 0;
    let targetY = 0;

    window.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      dot.style.transform = `translate(${targetX - 3}px, ${targetY - 3}px)`;
    }, { passive: true });

    const animateRing = () => {
      ringX += (targetX - ringX) * .16;
      ringY += (targetY - ringY) * .16;
      ring.style.transform = `translate(${ringX - 17}px, ${ringY - 17}px)`;
      requestAnimationFrame(animateRing);
    };
    animateRing();

    document.querySelectorAll('a, button').forEach((element) => {
      element.addEventListener('mouseenter', () => ring.classList.add('is-hover'));
      element.addEventListener('mouseleave', () => ring.classList.remove('is-hover'));
    });
  }
})();
