(function () {
  // Scroll reveal animations
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const liquidVideo = document.querySelector('.liquid-bg-video');
  if (liquidVideo && prefersReducedMotion) {
    liquidVideo.pause();
  }

  if (!prefersReducedMotion) {
    const singleSelectors = [
      '.sidebar', '.tag', '.intro-title', '.section-title',
      '.intro-desc', '.section-desc', '.spin-badge', '.portfolio-list > div:first-child', '.portfolio-list > div:last-child',
      '.testimonial-card', '.carousel-controls', '.brands-label', '.contact-email',
      '.contact-form', '.attach-row', '.send-btn', '.pricing-footer'
    ];
    document.querySelectorAll(singleSelectors.join(',')).forEach((el) => {
      el.classList.add('reveal');
    });

    const groupSelectors = [
      '.stats-row', '.social-row', '.timeline', '.service-list',
      '.skills-grid', '.portfolio-grid', '.pricing-grid', '.brands-grid'
    ];
    document.querySelectorAll(groupSelectors.join(',')).forEach((group) => {
      [...group.children].forEach((child, i) => {
        child.classList.add('reveal');
        child.style.transitionDelay = `${i * 70}ms`;
      });
    });

    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
    );

    document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

    // Count-up numbers (hero stats, skill percentages, pricing)
    function animateCount(el) {
      const match = el.textContent.trim().match(/^(\D*)(\d+)(\D*)$/);
      if (!match) return;
      const [, prefix, numStr, suffix] = match;
      const target = parseInt(numStr, 10);
      const duration = 1100;
      let startTime = null;

      el.textContent = `${prefix}0${suffix}`;

      function step(timestamp) {
        if (startTime === null) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${prefix}${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    const countObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.4 }
    );

    document.querySelectorAll('.stat-num, .skill-pct, .price').forEach((el) => countObserver.observe(el));

    // Timeline line draws in on scroll
    const timelineEl = document.querySelector('.timeline');
    if (timelineEl) {
      const lineObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('line-grown');
              lineObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1 }
      );
      lineObserver.observe(timelineEl);
    }
  }

  // Scroll-spy nav highlight
  const sectionIds = ['introduce', 'about', 'resume', 'services', 'skills', 'portfolio', 'testimonial', 'contact'];
  const navLinks = document.querySelectorAll('.nav-link');

  function setActive(id) {
    const target = id === 'pricing' ? 'testimonial' : id;
    navLinks.forEach((link) => {
      link.classList.toggle('active', link.dataset.target === target);
    });
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActive(entry.target.id);
      });
    },
    { rootMargin: '-45% 0px -50% 0px' }
  );

  [...sectionIds, 'pricing'].forEach((id) => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  setActive('introduce');

  // Project cover image carousels — a true one-directional ring: every step
  // shifts all photos left by one slot, and whichever photo exits past the
  // left edge is snapped (with no transition) to the back of the queue on
  // the right, so it's ready to slide in again without ever animating backward.
  document.querySelectorAll('.project-carousel').forEach((cover) => {
    const imgs = [...cover.querySelectorAll('.project-cover-img')];
    const dots = [...cover.querySelectorAll('.carousel-dot')];
    const n = imgs.length;
    let current = 0;
    const offsets = imgs.map((_, i) => i);

    function snapInstantly(img, value) {
      img.style.transition = 'none';
      img.style.setProperty('--pos', value);
      void img.offsetWidth; // force reflow so the next change animates again
      img.style.transition = '';
    }

    function step(direction) {
      const leavingIndex = current;
      current = (current + direction + n) % n;

      offsets.forEach((_, i) => { offsets[i] -= direction; });
      imgs.forEach((img, i) => img.style.setProperty('--pos', offsets[i]));
      imgs.forEach((img, i) => img.classList.toggle('is-current', i === current));
      dots.forEach((dot, i) => dot.classList.toggle('active', i === current));

      const leavingImg = imgs[leavingIndex];
      const onEnd = (e) => {
        if (e.target !== leavingImg || e.propertyName !== 'transform') return;
        leavingImg.removeEventListener('transitionend', onEnd);
        if (offsets[leavingIndex] < 0) {
          offsets[leavingIndex] += n;
          snapInstantly(leavingImg, offsets[leavingIndex]);
        } else if (offsets[leavingIndex] >= n) {
          offsets[leavingIndex] -= n;
          snapInstantly(leavingImg, offsets[leavingIndex]);
        }
      };
      leavingImg.addEventListener('transitionend', onEnd);
    }

    const prevBtn = cover.querySelector('.carousel-nav-prev');
    const nextBtn = cover.querySelector('.carousel-nav-next');
    prevBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      step(-1);
      restartAutoplay();
    });
    nextBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      step(1);
      restartAutoplay();
    });

    // Ring autoplay: always advances forward, pauses while hovered
    let autoplayTimer = null;
    function startAutoplay() {
      if (n < 2 || prefersReducedMotion) return;
      autoplayTimer = setInterval(() => step(1), 3500);
    }
    function stopAutoplay() {
      clearInterval(autoplayTimer);
    }
    function restartAutoplay() {
      stopAutoplay();
      startAutoplay();
    }
    cover.addEventListener('mouseenter', stopAutoplay);
    cover.addEventListener('mouseleave', startAutoplay);
    startAutoplay();
  });

  // Testimonial carousel
  const testimonials = [
    {
      name: 'IrisParis Team',
      role: 'Client,',
      company: 'Corporate Website Project',
      quote: '“Thamod delivered our corporate website and admin panel exactly as we envisioned — clean, fast, and easy for our team to manage.”',
      avatar: 'assets/irisparis/irisparis-logo-avatar.png'
    },
    {
      name: 'Project Supervisor',
      role: 'Final Year Research,',
      company: 'University of Bedfordshire',
      quote: '“YalaGuard stood out as one of the most complete final-year projects — real-time tracking, geofencing, and automated alerts all working seamlessly.”',
      avatar: ''
    },
    {
      name: 'ThisaraTravels Team',
      role: 'Group Project,',
      company: '5-Member Dev Team',
      quote: '“As project lead, Thamod kept our team on track and built an admin panel that made managing bookings effortless.”',
      avatar: 'assets/thisara-travels/thisara-travels-logo-avatar.png'
    }
  ];

  let tIndex = 0;
  const nameEl = document.getElementById('testimonial-name');
  const roleEl = document.getElementById('testimonial-role');
  const quoteEl = document.getElementById('testimonial-quote');
  const indexEl = document.getElementById('testimonial-index');
  const avatarImgEl = document.getElementById('testimonial-avatar-img');

  function renderTestimonial() {
    const t = testimonials[tIndex];
    nameEl.textContent = t.name;
    roleEl.innerHTML = `${t.role} <span class="company">${t.company}</span>`;
    quoteEl.textContent = t.quote;
    indexEl.textContent = tIndex + 1;
    if (t.avatar) {
      avatarImgEl.src = t.avatar;
      avatarImgEl.alt = t.name;
      avatarImgEl.hidden = false;
    } else {
      avatarImgEl.hidden = true;
      avatarImgEl.src = '';
    }
  }

  document.getElementById('testimonial-prev').addEventListener('click', () => {
    tIndex = (tIndex + testimonials.length - 1) % testimonials.length;
    renderTestimonial();
  });

  document.getElementById('testimonial-next').addEventListener('click', () => {
    tIndex = (tIndex + 1) % testimonials.length;
    renderTestimonial();
  });

  renderTestimonial();

  // Contact form: honeypot + simple math check, then delivered via Web3Forms
  const contactForm = document.getElementById('contact-form');
  const formStatus = document.getElementById('form-status');
  const captchaQuestionEl = document.getElementById('captcha-question');
  const captchaAnswerEl = document.getElementById('captcha-answer');
  const sendBtn = document.querySelector('button[form="contact-form"]');
  const attachRow = document.getElementById('attach-row');
  const attachLabel = document.getElementById('attach-label');
  const attachmentInput = document.getElementById('attachment-input');

  const MAX_ATTACHMENT_MB = 5;

  function resetAttachment() {
    attachmentInput.value = '';
    attachLabel.textContent = 'ADD AN ATTACHMENT';
    attachRow.classList.remove('has-file');
  }

  attachRow.addEventListener('click', () => attachmentInput.click());

  attachmentInput.addEventListener('change', () => {
    const file = attachmentInput.files[0];
    if (!file) {
      resetAttachment();
      return;
    }
    if (file.size > MAX_ATTACHMENT_MB * 1024 * 1024) {
      setStatus(`That file is too large — please attach something under ${MAX_ATTACHMENT_MB}MB.`, 'error');
      resetAttachment();
      return;
    }
    attachLabel.textContent = file.name;
    attachRow.classList.add('has-file');
  });

  let captchaExpected = 0;
  function newCaptcha() {
    const a = Math.floor(Math.random() * 8) + 2;
    const b = Math.floor(Math.random() * 8) + 1;
    captchaExpected = a + b;
    captchaQuestionEl.textContent = `${a} + ${b} =`;
    captchaAnswerEl.value = '';
  }
  newCaptcha();

  function setStatus(message, type) {
    formStatus.textContent = message;
    formStatus.className = type ? `form-status form-status-${type}` : 'form-status';
  }

  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Honeypot: real visitors never fill this hidden field, bots often do
    const honeypot = contactForm.elements.botcheck;
    if (honeypot && honeypot.value) {
      return;
    }

    if (parseInt(captchaAnswerEl.value, 10) !== captchaExpected) {
      setStatus("That answer isn't quite right — please try the security check again.", 'error');
      newCaptcha();
      return;
    }

    const accessKey = contactForm.elements.access_key.value;
    if (!accessKey || accessKey === 'YOUR_WEB3FORMS_ACCESS_KEY') {
      setStatus('Form delivery isn\'t configured yet — please email me directly at thamoduthpala@gmail.com.', 'error');
      return;
    }

    const originalLabel = sendBtn.textContent;
    sendBtn.disabled = true;
    sendBtn.textContent = 'SENDING...';
    setStatus('', null);

    try {
      // FormData (not JSON) is required here — Web3Forms only accepts
      // multipart bodies when an attachment is included.
      const formData = new FormData(contactForm);
      formData.delete('captcha_answer');
      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData
      });
      const result = await response.json();
      if (response.ok && result.success) {
        setStatus("Thanks! Your message has been sent — I'll get back to you soon.", 'success');
        contactForm.reset();
        resetAttachment();
        newCaptcha();
      } else {
        throw new Error(result.message || 'Submission failed');
      }
    } catch (err) {
      setStatus('Something went wrong sending your message. Please email me directly at thamoduthpala@gmail.com.', 'error');
    } finally {
      sendBtn.disabled = false;
      sendBtn.textContent = originalLabel;
    }
  });
})();
