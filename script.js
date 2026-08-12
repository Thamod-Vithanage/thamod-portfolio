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
      '.intro-desc', '.section-desc', '.spin-badge', '.portfolio-list > div:first-child',
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

  // Testimonial carousel
  const testimonials = [
    {
      name: 'IrisParis Team',
      role: 'Client,',
      company: 'Corporate Website Project',
      quote: '“Thamod delivered our corporate website and admin panel exactly as we envisioned — clean, fast, and easy for our team to manage.”'
    },
    {
      name: 'Project Supervisor',
      role: 'Final Year Research,',
      company: 'University of Bedfordshire',
      quote: '“YalaGuard stood out as one of the most complete final-year projects — real-time tracking, geofencing, and automated alerts all working seamlessly.”'
    },
    {
      name: 'ThisaraTravels Team',
      role: 'Group Project,',
      company: '5-Member Dev Team',
      quote: '“As project lead, Thamod kept our team on track and built an admin panel that made managing bookings effortless.”'
    }
  ];

  let tIndex = 0;
  const nameEl = document.getElementById('testimonial-name');
  const roleEl = document.getElementById('testimonial-role');
  const quoteEl = document.getElementById('testimonial-quote');
  const indexEl = document.getElementById('testimonial-index');

  function renderTestimonial() {
    const t = testimonials[tIndex];
    nameEl.textContent = t.name;
    roleEl.innerHTML = `${t.role} <span class="company">${t.company}</span>`;
    quoteEl.textContent = t.quote;
    indexEl.textContent = tIndex + 1;
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

  // Contact form (no backend wired up yet)
  document.getElementById('contact-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Thanks! This form isn\'t wired up to a backend yet — add an endpoint or a service like Formspree to receive messages.');
  });
})();
