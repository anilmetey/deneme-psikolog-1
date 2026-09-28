/**
 * Main JavaScript — Dr. Elif Karasu
 * Mobile nav, scroll animations, FAQ accordion, contact form, cookie consent
 */
(function () {
  'use strict';

  document.addEventListener('DOMContentLoaded', init);

  function init() {
    initMobileNav();
    initActiveNavLink();
    initScrollAnimations();
    initFaqAccordion();
    initContactForm();
    initCookieConsent();
  }

  /* ========================
     MOBILE NAVIGATION
     ======================== */
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

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        setNavState(false);
        toggle.focus();
      }
    });

    // Close when a nav link is clicked (mobile)
    nav.querySelectorAll('.nav-link, .header-cta').forEach(function (link) {
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

  /* ========================
     ACTIVE NAV LINK
     ======================== */
  function initActiveNavLink() {
    var path = window.location.pathname;
    var page = path.substring(path.lastIndexOf('/') + 1) || 'index.html';

    document.querySelectorAll('.nav-link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === page) {
        link.classList.add('active');
        link.setAttribute('aria-current', 'page');
      }
    });
  }

  /* ========================
     SCROLL ANIMATIONS
     ======================== */
  function initScrollAnimations() {
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var elements = document.querySelectorAll('.fade-in-up');

    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      elements.forEach(function (el) {
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
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    elements.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ========================
     FAQ ACCORDION
     ======================== */
  function initFaqAccordion() {
    document.querySelectorAll('.faq-question').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var item = btn.closest('.faq-item');
        var isOpen = item.classList.contains('open');

        // Close others
        document.querySelectorAll('.faq-item.open').forEach(function (openItem) {
          if (openItem !== item) {
            openItem.classList.remove('open');
            openItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
          }
        });

        item.classList.toggle('open', !isOpen);
        btn.setAttribute('aria-expanded', String(!isOpen));
      });
    });
  }

  /* ========================
     CONTACT FORM
     ======================== */
  function initContactForm() {
    var form = document.getElementById('contact-form');
    if (!form) return;

    var isSubmitting = false;
    var submitBtn = form.querySelector('[type="submit"]');
    var statusEl = document.getElementById('form-status');
    var originalBtnText = submitBtn ? submitBtn.textContent : '';

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (isSubmitting) return;

      // Honeypot
      var hp = form.querySelector('[name="website"]');
      if (hp && hp.value) return;

      // Validate
      if (!validateForm(form)) {
        var firstError = form.querySelector('.error');
        if (firstError) firstError.focus();
        return;
      }

      // Submit
      isSubmitting = true;
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Gönderiliyor\u2026';
      }
      showStatus('loading', 'Mesajınız gönderiliyor\u2026');

      var formAction = form.getAttribute('action');
      var formData = new FormData(form);

      if (formAction && formAction !== '#') {
        fetch(formAction, {
          method: 'POST',
          body: formData,
          headers: { Accept: 'application/json' },
        })
          .then(function (res) {
            if (res.ok) {
              onSuccess();
            } else {
              throw new Error('Gönderilemedi');
            }
          })
          .catch(function () {
            onError();
          });
      } else {
        // Demo mode — simulate submission
        setTimeout(onSuccess, 1200);
      }

      function onSuccess() {
        showStatus(
          'success',
          'Mesajınız başarıyla iletildi. En kısa sürede sizinle iletişime geçilecektir.'
        );
        form.reset();
        resetBtn();
      }

      function onError() {
        showStatus(
          'error',
          'Mesajınız gönderilemedi. Lütfen daha sonra tekrar deneyin veya doğrudan iletişim bilgilerimizden ulaşın.'
        );
        resetBtn();
      }

      function resetBtn() {
        isSubmitting = false;
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = originalBtnText;
        }
      }
    });

    // Live validation — clear errors on input
    form.querySelectorAll('input, select, textarea').forEach(function (field) {
      field.addEventListener('input', function () {
        clearFieldError(field);
      });
    });

    function showStatus(type, message) {
      if (!statusEl) return;
      statusEl.className = 'form-status form-status--' + type + ' visible';
      statusEl.textContent = message;
      statusEl.setAttribute('role', 'alert');
    }
  }

  function validateForm(form) {
    var valid = true;
    form.querySelectorAll('[required]').forEach(function (field) {
      clearFieldError(field);

      var value = field.value.trim();
      if (field.type === 'checkbox' && !field.checked) {
        setFieldError(field, 'Bu alan zorunludur.');
        valid = false;
      } else if (field.type !== 'checkbox' && !value) {
        setFieldError(field, 'Bu alan zorunludur.');
        valid = false;
      } else if (field.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        setFieldError(field, 'Geçerli bir e-posta adresi giriniz.');
        valid = false;
      } else if (field.type === 'tel' && !/^[\d\s+\-()]{7,}$/.test(value)) {
        setFieldError(field, 'Geçerli bir telefon numarası giriniz.');
        valid = false;
      }
    });
    return valid;
  }

  function setFieldError(field, message) {
    field.classList.add('error');
    var container = field.closest('.form-group') || field.closest('.checkbox-group');
    var errEl = container ? container.querySelector('.form-error') : null;
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add('visible');
    }
  }

  function clearFieldError(field) {
    field.classList.remove('error');
    var container = field.closest('.form-group') || field.closest('.checkbox-group');
    var errEl = container ? container.querySelector('.form-error') : null;
    if (errEl) errEl.classList.remove('visible');
  }

  /* ========================
     COOKIE CONSENT
     ======================== */
  function initCookieConsent() {
    var banner = document.getElementById('cookie-banner');
    if (!banner) return;

    try {
      if (localStorage.getItem('cookie-consent')) return;
    } catch (e) {
      // localStorage unavailable
      return;
    }

    banner.classList.add('visible');

    var acceptBtn = document.getElementById('cookie-accept');
    var rejectBtn = document.getElementById('cookie-reject');

    if (acceptBtn) {
      acceptBtn.addEventListener('click', function () {
        setConsent('accepted');
      });
    }

    if (rejectBtn) {
      rejectBtn.addEventListener('click', function () {
        setConsent('rejected');
      });
    }

    function setConsent(value) {
      try {
        localStorage.setItem('cookie-consent', value);
      } catch (e) {
        // silent fail
      }
      banner.classList.remove('visible');
    }
  }
})();
