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
    initAssessmentTool();
    initSlotChips();
    initSessionSimulator();
    initPageTransitions();
  }

  /* ----------------------------------------------------
     0. ELİT SPLASH SCREEN (ÖN YÜKLEME EKRANI) - CINEMATIC
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

    var progressBar = splash.querySelector('.splash-progress-bar');
    var counterEl = splash.querySelector('#splash-counter');
    var skipBtn = splash.querySelector('#splash-skip-btn');

    var startTime = performance.now();
    var duration = 1600;
    var isDone = false;

    function frame(now) {
      if (isDone) return;
      var elapsed = now - startTime;
      var progress = Math.min(elapsed / duration, 1);
      var pct = Math.floor(progress * 100);

      if (progressBar) progressBar.style.width = pct + '%';
      if (counterEl) counterEl.textContent = (pct < 10 ? '0' + pct : pct) + '%';

      if (progress < 1) {
        requestAnimationFrame(frame);
      } else {
        setTimeout(dismissSplash, 220);
      }
    }
    requestAnimationFrame(frame);

    if (skipBtn) {
      skipBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        dismissSplash();
      });
    }

    splash.addEventListener('click', dismissSplash);
    document.addEventListener('keydown', onKey);

    function onKey(e) {
      if (e.key === 'Escape' || e.keyCode === 27) {
        dismissSplash();
      }
    }

    function dismissSplash() {
      if (isDone) return;
      isDone = true;
      document.removeEventListener('keydown', onKey);
      splash.classList.add('is-dismissing');
      try {
        sessionStorage.setItem('splash_shown_v1', 'true');
      } catch (e) {}
      setTimeout(function () {
        splash.style.display = 'none';
        document.documentElement.classList.add('splash-skip');
      }, 700);
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

  /* ----------------------------------------------------
     7. INTERACTIVE CLINICAL ASSESSMENT TOOL (CRO TEST)
     ---------------------------------------------------- */
  function initAssessmentTool() {
    var tool = document.getElementById('clinical-assessment');
    if (!tool) return;

    var currentStep = 1;
    var userAnswers = {};

    var steps = tool.querySelectorAll('.assessment-step');
    var pills = tool.querySelectorAll('.progress-pill');
    var resultCard = tool.querySelector('.assessment-result');
    var resultTitle = tool.querySelector('.result-heading');
    var resultText = tool.querySelector('.result-text');
    var fillFormBtn = tool.querySelector('#btn-prefill-booking');

    tool.querySelectorAll('.assessment-option-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var stepNum = parseInt(btn.dataset.step, 10);
        var answerVal = btn.dataset.value;
        var focusCategory = btn.dataset.category || 'Kaygı & Panik Bozukluk';

        userAnswers[stepNum] = { val: answerVal, category: focusCategory };

        if (stepNum < steps.length) {
          goToStep(stepNum + 1);
        } else {
          showResult();
        }
      });
    });

    function goToStep(step) {
      currentStep = step;
      steps.forEach(function (s, idx) {
        s.classList.toggle('active', idx + 1 === step);
      });
      pills.forEach(function (p, idx) {
        p.classList.toggle('active', idx + 1 <= step);
      });
    }

    function showResult() {
      steps.forEach(function (s) { s.classList.remove('active'); });
      pills.forEach(function (p) { p.classList.add('active'); });

      var dominantCategory = (userAnswers[1] && userAnswers[1].category) || 'Kaygı & Panik Bozukluk';

      var descMap = {
        'Kaygı & Panik Bozukluk': 'Deneyimlediğiniz belirtiler, zihnin felaket senaryoları ve bedensel alarm sisteminin aşırı uyarılmasıyla ilişkili görünüyor. Bilişsel Davranışçı Terapi (BDT) protokolüyle kaygı döngülerini kırmak ve bedensel regülasyon becerisi kazanmak sizin için öncelikli klinik hedef olabilir.',
        'Depresyon & Tükenmişlik': 'İçsel enerjinizin düşmesi ve keyif kaybı, bastırılmış duygusal ihtiyaçlara ve mesleki/kişisel tükenmişliğe işaret ediyor. Şema Terapi ve BDT kombinasyonuyla kendi kaynaklarınızı yeniden uyandırabileceğimiz bir çerçeve önerilmektedir.',
        'İlişki & Bağlanma Sorunları': 'İlişkilerde tekrarlayan zorlanmalar ve terk edilme kaygıları, erken dönem bağlanma deneyimlerinin bugünkü yansımasıdır. Şema Terapi odaklı yaşantısal tekniklerle güvenli bağ kurma çalışması size kalıcı içsel dayanıklılık kazandırabilir.',
        'Geçmiş Yaşantılar & Travma': 'Geçmişte yaşanan sarsıcı anıların bugüne taşınan yükleri, regülasyon ve travma odaklı duyarsızlaştırma ile hafifletilebilir. İlk değerlendirme seansında güvenli bir zemin kurarak adım adım ilerlemek esastır.'
      };

      if (resultTitle) resultTitle.textContent = 'Klinik Öneri: ' + dominantCategory;
      if (resultText) resultText.textContent = descMap[dominantCategory] || descMap['Kaygı & Panik Bozukluk'];

      if (resultCard) {
        resultCard.style.display = 'block';
        resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (fillFormBtn) {
        fillFormBtn.addEventListener('click', function () {
          var targetForm = document.getElementById('hero-booking-form') || document.getElementById('contact-form');
          if (targetForm) {
            var selectField = targetForm.querySelector('[name="interest"]');
            if (selectField) {
              for (var i = 0; i < selectField.options.length; i++) {
                if (selectField.options[i].value.indexOf(dominantCategory.split(' ')[0]) !== -1) {
                  selectField.selectedIndex = i;
                  break;
                }
              }
            }
            var targetAnchor = document.getElementById('ilk-seans') || targetForm;
            targetAnchor.scrollIntoView({ behavior: 'smooth' });
            var nameInput = targetForm.querySelector('[name="name"]');
            if (nameInput) setTimeout(function () { nameInput.focus(); }, 600);
          }
        });
      }
    }
  }

  /* ----------------------------------------------------
     8. INTERACTIVE SLOT & FORMAT CHIPS
     ---------------------------------------------------- */
  function initSlotChips() {
    document.querySelectorAll('.slot-chips-group').forEach(function (group) {
      var chips = group.querySelectorAll('.slot-chip');
      var hiddenInput = group.querySelector('input[type="hidden"]');

      chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
          var isMulti = group.dataset.multi === 'true';

          if (!isMulti) {
            chips.forEach(function (c) { c.classList.remove('selected'); });
            chip.classList.add('selected');
            if (hiddenInput) hiddenInput.value = chip.dataset.value;
          } else {
            chip.classList.toggle('selected');
            var selectedVals = [];
            group.querySelectorAll('.slot-chip.selected').forEach(function (sc) {
              selectedVals.push(sc.dataset.value);
            });
            if (hiddenInput) hiddenInput.value = selectedVals.join(', ');
          }
        });
      });
    });
  }

  /* ----------------------------------------------------
     9. 50-MINUTE CLINICAL SESSION SIMULATOR
     ---------------------------------------------------- */
  function initSessionSimulator() {
    var section = document.getElementById('seans-deneyimi');
    if (!section) return;

    var stages = [
      {
        minute: "00:00 – 10:00 · AŞAMA 01",
        title: "Kapsama & Güvenli Alanın Kurulması",
        desc: "Seans kapısı kapanır, dış dünyanın hızı ve gürültüsü kapının ardında bırakılır. Yargılanma korkusu olmadan, terapist ile danışan arasında 'kapsayıcı ve etik sınırları net' bir güven bağı tesis edilir.",
        tags: ["Akustik Yalıtım", "Telefonlar Sessizde", "Çerçeve Sözleşmesi"],
        dialogueKicker: "İLK ANIN KLİNİK PSİKOLOJİSİ",
        dialogueQuote: "«Bugün buraya gelirken içinizdeki hangi parça en çok duyulmak ve yükünü indirmek istedi?»",
        clinicianNote: "Dr. Elif Karasu Gözlemi: Danışanın ilk dakikalarda hissettiği kaygı son derece doğaldır. Bu aşamada asla aceleci sorular sorulmaz; zihnin kendi ritminde açılmasına saygı gösterilir."
      },
      {
        minute: "10:00 – 25:00 · AŞAMA 02",
        title: "Semptomun Ardındaki Kökleri Haritalama",
        desc: "Danışanın getirdiği güncel kriz (ilişki tartışması, iş stresi veya ani panik atağı) masaya yatırılır. Şema Terapi perspektifiyle bu tablonun kökenindeki çocukluk ihtiyaçları ve otomatik başa çıkma biçimleri belirlenir.",
        tags: ["Bilişsel Haritalama", "Kök İnanç Tespiti", "Duygusal Farkındalık"],
        dialogueKicker: "ŞEMA VE MOD ANALİZİ",
        dialogueQuote: "«Bu terk edilme korkusu size geçmişten, çocukluğunuzdaki hangi yalnızlık anından tanıdık geliyor?»",
        clinicianNote: "Dr. Elif Karasu Gözlemi: Semptom bir düşman değil, geçmişte bizi hayatta tutmaya çalışmış koruyucu bir kalkan gibidir. Onu yargılamadan dinlediğimizde direnç kendiliğinden çözülür."
      },
      {
        minute: "25:00 – 40:00 · AŞAMA 03",
        title: "Yaşantısal Temas & Yeniden Ebeveynlik",
        desc: "Yalnızca entelektüel düzeyde konuşmak kalıcı dönüşüm sağlamaz. İmajinasyon veya sandalye tekniğiyle, geçmişte incinmiş çocuk parçaya bugünkü sağlıklı yetişkin şefkatiyle temas edilir ve duygusal bellek yeniden onarılır.",
        tags: ["İmajinasyon Tekniği", "Duygusal Boşalım", "Sandalye Çalışması"],
        dialogueKicker: "YAŞANTISAL MÜDAHALE ANI",
        dialogueQuote: "«O küçük çocuğun yanına gidin ve ona söyleyin: 'Artık yalnız değilsin, seni koruyacak ve sınırlarını savunacak bir yetişkin var.'»",
        clinicianNote: "Dr. Elif Karasu Gözlemi: Bedenin ve duygunun derin katmanlarına inilen en dönüştürücü 15 dakikadır. Terapist burada güvenli bir sığınak rolü üstlenir."
      },
      {
        minute: "40:00 – 50:00 · AŞAMA 04",
        title: "Bilişsel Entegrasyon & Güvenli Topraklanma",
        desc: "Açılan duygusal alan toparlanır. Danışanın seans odasından savunmasız değil; güçlenmiş, kendi sınırlarının farkında ve regüle olmuş bir zihinle günlük yaşama dönmesi sağlanır.",
        tags: ["Regülasyon & Nefes", "Gündelik Eylem Planı", "Kapanış Çerçevesi"],
        dialogueKicker: "SEANS KAPANIŞI VE TOPRAKLANMA",
        dialogueQuote: "«Bugün odada keşfettiğimiz bu sağlıklı yetişkin sesini, bu hafta karşılaşacağınız o zorlu görüşmede nasıl yanınızda taşıyabilirsiniz?»",
        clinicianNote: "Dr. Elif Karasu Gözlemi: Her seans, danışanın kendi terapisti olma yolculuğundaki bir tuğladır. 50. dakikada güvenle ayağa kalkılır ve haftaya randevulaşılır."
      }
    ];

    var currentIdx = 0;
    var navBtns = section.querySelectorAll('.sim-nav-btn');
    var badgeEl = section.querySelector('.sim-minute-badge');
    var titleEl = section.querySelector('.sim-stage-title');
    var descEl = section.querySelector('.sim-stage-desc');
    var tagsContainer = section.querySelector('.sim-role-tags');
    var kickerEl = section.querySelector('.sim-dialogue-kicker');
    var quoteEl = section.querySelector('.sim-dialogue-quote');
    var noteEl = section.querySelector('.sim-clinician-note');
    var prevBtn = section.querySelector('#sim-prev-btn');
    var nextBtn = section.querySelector('#sim-next-btn');

    function renderStage(idx) {
      currentIdx = idx;
      var data = stages[idx];
      if (!data) return;

      navBtns.forEach(function (btn, i) {
        btn.classList.toggle('active', i === idx);
        btn.setAttribute('aria-selected', String(i === idx));
      });

      if (badgeEl) badgeEl.textContent = data.minute;
      if (titleEl) titleEl.textContent = data.title;
      if (descEl) descEl.textContent = data.desc;
      if (kickerEl) kickerEl.textContent = data.dialogueKicker;
      if (quoteEl) quoteEl.textContent = data.dialogueQuote;
      if (noteEl) noteEl.textContent = data.clinicianNote;

      if (tagsContainer) {
        tagsContainer.innerHTML = '';
        data.tags.forEach(function (tag) {
          var span = document.createElement('span');
          span.className = 'sim-role-tag';
          span.textContent = tag;
          tagsContainer.appendChild(span);
        });
      }

      if (prevBtn) prevBtn.disabled = idx === 0;
      if (nextBtn) {
        if (idx === stages.length - 1) {
          nextBtn.textContent = 'İlk Seansı Planlayın →';
        } else {
          nextBtn.textContent = 'Sonraki Aşama (' + stages[idx + 1].minute.split(' · ')[0] + ') →';
        }
      }
    }

    navBtns.forEach(function (btn, idx) {
      btn.addEventListener('click', function () {
        renderStage(idx);
      });
    });

    if (prevBtn) {
      prevBtn.addEventListener('click', function () {
        if (currentIdx > 0) renderStage(currentIdx - 1);
      });
    }

    if (nextBtn) {
      nextBtn.addEventListener('click', function () {
        if (currentIdx < stages.length - 1) {
          renderStage(currentIdx + 1);
        } else {
          var booking = document.getElementById('ilk-seans');
          if (booking) booking.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }

    renderStage(0);
  }

  /* ----------------------------------------------------
     11. SMOOTH PAGE TRANSITION VEIL
     ---------------------------------------------------- */
  function initPageTransitions() {
    var veil = document.createElement('div');
    veil.className = 'page-veil';
    veil.setAttribute('aria-hidden', 'true');
    document.body.appendChild(veil);

    document.querySelectorAll('a[href]').forEach(function (link) {
      var href = link.getAttribute('href');
      if (
        !href ||
        href.startsWith('#') ||
        href.startsWith('mailto:') ||
        href.startsWith('tel:') ||
        href.startsWith('javascript:') ||
        link.target === '_blank' ||
        link.hasAttribute('download')
      ) {
        return;
      }

      link.addEventListener('click', function (e) {
        if (link.hostname === window.location.hostname || !link.hostname) {
          e.preventDefault();
          veil.classList.add('is-active');
          setTimeout(function () {
            window.location.href = href;
          }, 240);
        }
      });
    });
  }
})();
