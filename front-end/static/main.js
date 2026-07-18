/* ==========================================================================
   FORGE — Minimal front-end behavior
   No dependencies beyond Bootstrap's own bundle (used only for the navbar
   collapse and accordion — both driven by data-bs-* attributes, zero
   custom JS needed for those). Everything below respects
   prefers-reduced-motion and degrades gracefully without IntersectionObserver.
   ========================================================================== */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Footer year, always current ---------- */
  document.querySelectorAll('.js-year').forEach((el) => { el.textContent = new Date().getFullYear(); });

  /* ---------- Sticky header: add shadow once the page scrolls ---------- */
  const header = document.querySelector('.site-header');
  if (header) {
    const toggleScrolled = () => header.classList.toggle('is-scrolled', window.scrollY > 8);
    toggleScrolled();
    window.addEventListener('scroll', toggleScrolled, { passive: true });
  }

  /* ---------- Active nav link for the current page ---------- */
  const here = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link-custom[href]').forEach((link) => {
    const target = link.getAttribute('href').split('/').pop();
    if (target && target === here) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  /* ---------- Scroll-reveal for elements marked .reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      revealEls.forEach((el) => el.classList.add('is-visible'));
    } else {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---------- Animated stat counters: <span data-count-to="120" data-count-suffix="+"> ---------- */
  const animateCount = (el) => {
    const target = parseFloat(el.getAttribute('data-count-to'));
    const suffix = el.getAttribute('data-count-suffix') || '';
    if (reduceMotion || Number.isNaN(target)) { el.textContent = target + suffix; return; }
    const duration = 1200;
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); /* ease-out-cubic */
      el.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const counters = document.querySelectorAll('[data-count-to]');
  if (counters.length) {
    if ('IntersectionObserver' in window) {
      const cio = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            cio.unobserve(entry.target);
          }
        });
      }, { threshold: 0.5 });
      counters.forEach((el) => cio.observe(el));
    } else {
      counters.forEach(animateCount);
    }
  }

  /* ---------- Back-to-top button ---------- */
  const backToTop = document.querySelector('.back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', () => {
      backToTop.classList.toggle('is-visible', window.scrollY > 640);
    }, { passive: true });
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- Contact form: client-side validation feedback only.
     Real handling happens server-side once this is wired to a Django view. ---------- */
  const form = document.querySelector('.js-contact-form');
  if (form) {
    form.addEventListener('submit', (event) => {
      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }
      form.classList.add('was-validated');
    });
  }
})();
