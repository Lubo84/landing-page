const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.primary-nav');

if (menuButton && navigation) {
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') === 'true';
    menuButton.setAttribute('aria-expanded', String(!open));
    navigation.classList.toggle('open', !open);
  });

  navigation.addEventListener('click', (event) => {
    if (event.target.closest('a')) {
      menuButton.setAttribute('aria-expanded', 'false');
      navigation.classList.remove('open');
    }
  });
}

const progressBar = document.querySelector('.progress span');
if (progressBar) {
  const updateProgress = () => {
    const maximum = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maximum > 0 ? window.scrollY / maximum : 0;
    progressBar.style.width = `${Math.min(1, progress) * 100}%`;
  };
  updateProgress();
  window.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress);
}

const reveals = document.querySelectorAll('.reveal');
if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -7% 0px' });
  reveals.forEach((element) => revealObserver.observe(element));
} else {
  reveals.forEach((element) => element.classList.add('is-visible'));
}

const toast = document.querySelector('.toast');
document.querySelectorAll('[data-copy]').forEach((button) => {
  button.addEventListener('click', async () => {
    const value = button.dataset.copy;
    try {
      await navigator.clipboard.writeText(value);
      button.textContent = 'Copied';
      if (toast) {
        toast.textContent = `${value} copied`;
        toast.classList.add('show');
        window.setTimeout(() => toast.classList.remove('show'), 1600);
      }
      window.setTimeout(() => { button.textContent = 'Copy'; }, 1600);
    } catch {
      if (toast) {
        toast.textContent = 'Select the number to copy it';
        toast.classList.add('show');
        window.setTimeout(() => toast.classList.remove('show'), 1800);
      }
    }
  });
});
