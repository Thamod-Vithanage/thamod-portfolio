(function () {
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
      name: 'Paublo Dybala',
      role: 'CEO of',
      company: 'IBM Global',
      quote: '“Drake - A Developer with the creativity, professional and master of code. Much more than what i\'m expect. High quality product & flexiable price. Recommended!.”'
    },
    {
      name: 'Marta Kovacs',
      role: 'Design Lead at',
      company: 'Northline',
      quote: '“Fast, thoughtful and genuinely invested in the outcome. Shipped our marketing site two weeks early and it still converts better than anything we had before.”'
    },
    {
      name: 'Sam Oduya',
      role: 'Founder of',
      company: 'Taskly',
      quote: '“He takes a messy brief and returns something clearer than we imagined. The handoff was immaculate — our team had zero questions.”'
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
