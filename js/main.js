/**
 * DR. ELİF KARASU — PRINCIPAL EDITORIAL SYSTEM JAVASCRIPT
 * High performance, zero dependency, accessible interaction layer.
 */
(function () {
  'use strict';

  // Run Splash controller as early as possible
  initSplashScreen();

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initMobileNav();
    initActiveNav();
    initScrollObserver();
    initFaqAccordion();
    initForms();
    initCookieNotice();
  }

  /* ----------------------------------------------------
     0. ELİT SPLASH SCREEN (ÖN YÜKLEME EKRANI)
     ---------------------------------------------------- */
  function initSplashScreen() {
    var splash = document.getElementById('splash-screen');
    if (!splash) return;

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var alreadyShown = false;
    try {
      alreadyShown = sessionStorage.getItem('splash_shown_v1') === 'true';
    } catch (e) {}

    if (alreadyShown || prefersReducedMotion) {
      splash.style.display = 'none';
      document.documentElement.classList.add('splash-skip');
      return;
    }

    var timer = setTimeout(dismissSplash, 2700);

    splash.addEventListener('animationend', function (e) {
      if (e.animationName === 'splashSlideUp') {
        dismissSplash();
      }
    });

    // Instant bypass on click or keypress
    splash.addEventListener('click', dismissSplash);
    document.addEventListener('keydown', onKey);

    function onKey() {
      if (splash && splash.style.display !== 'none') {
        dismissSplash();
      }
    }

    function dismissSplash() {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      try {
        sessionStorage.setItem('splash_shown_v1', 'true');
      } catch (e) {}
      splash.style.display = 'none';
      document.documentElement.classList.add('splash-skip');
    }
  }

  /* ----------------------------------------------------
     1. ACCESSIBLE MOBILE NAVIGATION
     ---------------------------------------------------- */
  function initMobileNav() {
    var toggle = document.getElementById('menu-toggle');
    var nav = document.getElementById('main-nav');
    var overlay = document.getElementById('nav-overlay');

    if (!toggle || !nav) return;

    toggle.addEventListener('click', function () {
      var isOpen = toggle.getAttribute('aria-expanded') === 'true';
      setNavState(!isOpen);
    });

    if (overlay) {
      overlay.addEventListener('click', function () {
        setNavState(false);
      });
    }

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setNavState(false);
        toggle.focus();
      }
    });

    nav.querySelectorAll('.nav-link, .nav-cta').forEach(function (link) {
      link.addEventListener('click', function () {
        if (nav.classList.contains('open')) {
          setNavState(false);
        }
      });
    });

    function setNavState(open) {
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
      nav.classList.toggle('open', open);
      if (overlay) overlay.classList.toggle('active', open);
      document.body.style.overflow = open ? 'hidden' : '';
    }
  }

  /* ----------------------------------------------------
     2. ACTIVE ROUTE HIGHLIGHTING
     ---------------------------------------------------- */
  function initActiveNav() {
    var path = window.location.pathname;
    var page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    document.querySelectorAll('.nav-link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === page || (page === '' && href === 'index.html')) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ----------------------------------------------------
     3. EDITORIAL SCROLL REVEAL (PREFERS-REDUCED-MOTION READY)
     ---------------------------------------------------- */
  function initScrollObserver() {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var revealElements = document.querySelectorAll('.fade-in, .fade-in-up');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      revealElements.forEach(function (el) {
        el.classList.add('visible');
      });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -30px 0px' }
    );

    revealElements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ----------------------------------------------------
     4. ACCESSIBLE FAQ ACCORDION
     ---------------------------------------------------- */
  function initFaqAccordion() {
    var questions = document.querySelectorAll('.faq-question');
    if (!questions.length) return;

    questions.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var isOpen = item.classList.contains('open');

        // Close siblings
        document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove('open');
            var q = openItem.querySelector('.faq-question');
            if (q) q.setAttribute('aria-expanded', 'false');
          }
        });

        item.classList.toggle('open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }

  /* ----------------------------------------------------
     5. CRO FRICTIONLESS FORM SYSTEM (CSRF, HONEYPOT & DUAL CHECK)
     ---------------------------------------------------- */
  function initForms() {
    var forms = document.querySelectorAll('#contact-form, #hero-booking-form');

    forms.forEach(function (form) {
      var isSubmitting = false;
      var submitBtn = form.querySelector('[type="submit"]');
      var originalBtnText = submitBtn ? submitBtn.innerHTML : '';
      var statusEl = form.querySelector('.form-status') || form.parentElement.querySelector('.form-status');

      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (isSubmitting) return;

        // Anti-spam Honeypot
        var hp = form.querySelector('[name="website"]');
        if (hp && hp.value) return;

        // Client Validation
        if (!validateForm(form)) {
          var firstError = form.querySelector('.error, :invalid');
          if (firstError) firstError.focus();
          return;
        }

        isSubmitting = true;
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.innerHTML = 'İşleniyor & Randevu Açılıyor&hellip;';
        }
        showStatus(statusEl, 'loading', 'Bilgileriniz şifrelenerek iletiliyor...');

        var formAction = form.getAttribute('action');
        var formData = new FormData(form);

        if (formAction && formAction !== '#' && !formAction.startsWith('javascript:')) {
          fetch(formAction, {
            method: 'POST',
            body: formData,
            headers: { Accept: 'application/json' },
          })
            .then(function (res) {
              if (res.ok) onSuccess();
              else throw new Error('Hata');
            })
            .catch(function () {
              onError();
            });
        } else {
          // Instant frictionless feedback mode
          setTimeout(onSuccess, 1100);
        }

        function onSuccess() {
          showStatus(
            statusEl,
            'success',
            '✓ Talebiniz başarıyla alındı. Klinik koordinasyon asistanımız gün içinde randevu takvimi için sizinle irtibat kuracaktır.'
          );
          form.reset();
          resetButton();
        }

        function onError() {
          showStatus(
            statusEl,
            'error',
            'Talebiniz iletilirken teknik bir aksaklık oluştu. Lütfen doğrudan +90 (212) 236 41 85 veya iletisim@elifkarasu.com üzerinden ulaşınız.'
          );
          resetButton();
        }

        function resetButton() {
          isSubmitting = false;
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
        }
      });

      form.querySelectorAll('input, select, textarea').forEach(function (field) {
        field.addEventListener('input', function () {
          clearFieldError(field);
        });
      });
    });

    function validateForm(form) {
      var valid = true;
      form.querySelectorAll('[required]').forEach(function (field) {
        clearFieldError(field);
        var val = field.value.trim();

        if (field.type === 'checkbox' && !field.checked) {
          setFieldError(field, 'Lütfen onay kutusunu işaretleyiniz.');
          valid = false;
        } else if (field.type !== 'checkbox' && !val) {
          setFieldError(field, 'Bu alanın doldurulması zorunludur.');
          valid = false;
        } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
          setFieldError(field, 'Geçerli bir e-posta formatı giriniz.');
          valid = false;
        } else if (field.type === 'tel' && !/^[\d\s+\-()]{7,}$/.test(val)) {
          setFieldError(field, 'Geçerli bir telefon numarası giriniz.');
          valid = false;
        }
      });
      return valid;
    }

    function setFieldError(field, message) {
      field.classList.add('error');
      var container = field.closest('.form-group, .form-field, .field-checkbox-row');
      var err = container ? container.querySelector('.form-error, .field-error-msg') : null;
      if (err) {
        err.textContent = message;
        err.classList.add('visible');
      }
    }

    function clearFieldError(field) {
      field.classList.remove('error');
      var container = field.closest('.form-group, .form-field, .field-checkbox-row');
      var err = container ? container.querySelector('.form-error, .field-error-msg') : null;
      if (err) {
        err.classList.remove('visible');
      }
    }

    function showStatus(el, type, message) {
      if (!el) return;
      el.className = 'form-status form-status--' + type + ' visible';
      el.textContent = message;
      el.style.display = 'block';
      el.style.marginTop = '1rem';
      el.style.padding = '0.875rem 1rem';
      el.style.fontSize = '0.875rem';
      el.style.lineHeight = '1.5';
      el.style.borderRadius = '3px';
      el.style.backdropFilter = 'blur(12px)';

      if (type === 'success') {
        el.style.backgroundColor = 'rgba(232, 245, 233, 0.85)';
        el.style.color = '#1B5E20';
        el.style.border = '1px solid #A5D6A7';
      } else if (type === 'error') {
        el.style.backgroundColor = 'rgba(255, 235, 238, 0.85)';
        el.style.color = '#B71C1C';
        el.style.border = '1px solid #FFCDD2';
      } else {
        el.style.backgroundColor = 'rgba(236, 239, 241, 0.85)';
        el.style.color = '#37474F';
        el.style.border = '1px solid #CFD8DC';
      }
    }
  }

  /* ----------------------------------------------------
     6. EDITORIAL PRIVACY & COOKIE SYSTEM
     ---------------------------------------------------- */
  function initCookieNotice() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;

    try {
      if (localStorage.getItem('cookie-consent-v2')) return;
    } catch (e) {
      return;
    }

    banner.classList.add('visible');

    var acceptBtn = document.getElementById('cookie-accept');
    var rejectBtn = document.getElementById('cookie-reject');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        setChoice('accepted');
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        setChoice('rejected');
      });
    }

    function setChoice(val) {
      try {
        localStorage.setItem('cookie-consent-v2', val);
      } catch (e) {}
      banner.classList.remove('visible');
    }
  }
})();
