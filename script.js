/* ============================================
   CHINMAY RAIBAGKAR — PORTFOLIO
   JavaScript — Interactions & Animations
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

  // ============================================
  // 1. THEME TOGGLE
  // ============================================
  const themeToggle = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Check saved preference or system preference
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'light') {
    html.classList.add('light-theme');
  } else if (!savedTheme && window.matchMedia('(prefers-color-scheme: light)').matches) {
    html.classList.add('light-theme');
  }

  themeToggle.addEventListener('click', () => {
    html.classList.toggle('light-theme');
    const isLight = html.classList.contains('light-theme');
    localStorage.setItem('theme', isLight ? 'light' : 'dark');
  });

  // ============================================
  // 2. NAVBAR SCROLL EFFECT
  // ============================================
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  const handleNavScroll = () => {
    const scrollY = window.scrollY;
    if (scrollY > 50) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }

    // Show/hide back-to-top button after scrolling past hero
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
      if (scrollY > window.innerHeight * 0.8) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    }

    lastScroll = scrollY;
  };

  window.addEventListener('scroll', handleNavScroll, { passive: true });
  handleNavScroll();

  // Back-to-top click handler
  const backToTopBtn = document.getElementById('backToTop');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ============================================
  // 3. ACTIVE NAV LINK HIGHLIGHT
  // ============================================
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const updateActiveLink = () => {
    const scrollY = window.scrollY + 100;

    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  };

  window.addEventListener('scroll', updateActiveLink, { passive: true });

  // ============================================
  // 4. MOBILE HAMBURGER MENU
  // ============================================
  const hamburger = document.getElementById('navHamburger');
  const navLinksContainer = document.getElementById('navLinks');

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinksContainer.classList.toggle('open');
    document.body.style.overflow = navLinksContainer.classList.contains('open') ? 'hidden' : '';
  });

  // Close menu on link click
  navLinksContainer.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinksContainer.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // ============================================
  // 5. SCROLL REVEAL ANIMATIONS
  // ============================================
  const revealElements = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ============================================
  // 6. STAT COUNTER ANIMATION
  // ============================================
  const statNumbers = document.querySelectorAll('.stat-number[data-count]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        animateCounter(el, 0, target, 1500);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  statNumbers.forEach(el => counterObserver.observe(el));

  function animateCounter(element, start, end, duration) {
    const startTime = performance.now();

    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(start + (end - start) * eased);
      element.textContent = current + '+';

      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }

    requestAnimationFrame(update);
  }

  // ============================================
  // 7. SMOOTH SCROLL FOR NAV LINKS
  // ============================================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');

      // If href is just '#', scroll to top (CR logo)
      if (targetId === '#') {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      const targetEl = document.querySelector(targetId);
      if (targetEl) {
        const navHeight = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height'));
        const targetPosition = targetEl.offsetTop - navHeight;

        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ============================================
  // 8. CONTACT FORM HANDLING
  // ============================================
  const contactForm = document.getElementById('contactForm');
  const formStatus = document.getElementById('formStatus');

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(contactForm);
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;

      submitBtn.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="animation: spin 1s linear infinite;"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg>
        Sending...
      `;
      submitBtn.disabled = true;

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          body: formData,
          headers: { 'Accept': 'application/json' }
        });

        if (response.ok) {
          formStatus.textContent = '✅ Message sent successfully! I\'ll get back to you soon.';
          formStatus.className = 'form-status success';
          contactForm.reset();

          // Track form submission in GA4
          if (typeof gtag !== 'undefined') {
            gtag('event', 'contact_form_submit', {
              event_category: 'engagement',
              event_label: 'Contact Form'
            });
          }
        } else {
          throw new Error('Form submission failed');
        }
      } catch (error) {
        formStatus.textContent = '❌ Something went wrong. Please try emailing me directly.';
        formStatus.className = 'form-status error';
      } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;

        // Hide status after 5 seconds
        setTimeout(() => {
          formStatus.className = 'form-status';
        }, 5000);
      }
    });
  }

  // ============================================
  // 8.5 ROBUST WORKFLOW ARCHITECTURE (Animated SVG)
  // ============================================
  function initWorkflowAnimation() {
    const container = document.getElementById('workflowArchitecture');
    const svg = document.getElementById('workflowSvg');
    if (!container || !svg) return;

    const drawPaths = () => {
      svg.innerHTML = ''; // Clear existing
      const containerRect = container.getBoundingClientRect();
      const isMobile = window.innerWidth <= 900;

      // Helper to calculate exact center or edge
      const getAnchor = (id, side = 'center') => {
        const el = document.getElementById(id);
        if (!el) return { x: 0, y: 0 };
        const rect = el.getBoundingClientRect();
        
        let x = rect.left - containerRect.left;
        let y = rect.top - containerRect.top;
        
        if (side === 'right') x += rect.width;
        else if (side === 'center' || side === 'top' || side === 'bottom') x += rect.width / 2;
        
        if (side === 'bottom') y += rect.height;
        else if (side === 'center' || side === 'left' || side === 'right') y += rect.height / 2;
        
        // Add padding offsets to prevent lines from overlapping borders
        if (side === 'right') x += 2;
        if (side === 'left') x -= 2;
        if (side === 'bottom') y += 2;
        if (side === 'top') y -= 2;

        return { x, y };
      };

      const createPath = (start, end, isFeedback = false) => {
        let bezierD;
        
        if (isFeedback) {
           const bottomY = containerRect.height - 30; // Increased clearance for feedback layer text
           if (isMobile) {
               // On mobile, flow down to the bottom, curve left, go all the way up the left side, then curve right into the start node
               bezierD = `M ${start.x} ${start.y} L ${start.x} ${bottomY} Q ${start.x} ${bottomY + 15} ${start.x - 20} ${bottomY + 15} L 20 ${bottomY + 15} Q 5 ${bottomY + 15} 5 ${bottomY} L 5 ${end.y} Q 5 ${end.y - 15} 20 ${end.y - 15} L ${end.x - 10} ${end.y - 15} Q ${end.x} ${end.y - 15} ${end.x} ${end.y}`;
           } else {
               // Standard feedback loop underneath
               bezierD = `M ${start.x} ${start.y} Q ${start.x} ${bottomY} ${start.x - 50} ${bottomY} L ${end.x + 50} ${bottomY} Q ${end.x} ${bottomY} ${end.x} ${end.y + 20}`;
           }
        } else if (isMobile) {
            // Vertical flow - increase the curve control points for smoother S-curves on mobile and prevent overlapping straight lines
            const deltaY = end.y - start.y;
            bezierD = `M ${start.x} ${start.y} C ${start.x} ${start.y + (deltaY * 0.4)}, ${end.x} ${end.y - (deltaY * 0.4)}, ${end.x} ${end.y}`;
        } else {
            // Horizontal flow
            bezierD = `M ${start.x} ${start.y} C ${start.x + 60} ${start.y}, ${end.x - 60} ${end.y}, ${end.x} ${end.y}`;
        } ${start.y} C ${start.x + 50} ${start.y}, ${end.x - 50} ${end.y}, ${end.x} ${end.y}`;
        }

        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.setAttribute('d', bezierD);
        path.setAttribute('class', isFeedback ? 'wf-path wf-path-feedback' : 'wf-path');
        svg.appendChild(path);

        // Particle logic
        const particle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        particle.setAttribute('r', isFeedback ? '2.5' : '3');
        particle.setAttribute('class', isFeedback ? 'wf-particle wf-particle-feedback' : 'wf-particle');
        
        const animate = document.createElementNS('http://www.w3.org/2000/svg', 'animateMotion');
        const dur = isFeedback ? (Math.random() * 2 + 5) : (Math.random() * 1.5 + 2.5); // Randomize speed slightly
        animate.setAttribute('dur', dur + 's');
        animate.setAttribute('repeatCount', 'indefinite');
        animate.setAttribute('path', bezierD);
        
        particle.appendChild(animate);
        svg.appendChild(particle);
      };

      // Define Connections
      const gads = getAnchor('wf-gads', isMobile ? 'bottom' : 'right');
      const meta = getAnchor('wf-meta', isMobile ? 'bottom' : 'right');
      const prepIn = getAnchor('wf-prep', isMobile ? 'top' : 'left');
      
      createPath(gads, prepIn);
      createPath(meta, prepIn);

      const prepOut = getAnchor('wf-prep', isMobile ? 'bottom' : 'right');
      const bqIn = getAnchor('wf-bq', isMobile ? 'top' : 'left');
      
      createPath(prepOut, bqIn);

      const bqOut = getAnchor('wf-bq', isMobile ? 'bottom' : 'right');
      const appsIn = getAnchor('wf-apps', isMobile ? 'top' : 'left');
      const sheetsIn = getAnchor('wf-sheets', isMobile ? 'top' : 'left');
      
      createPath(bqOut, appsIn);
      createPath(bqOut, sheetsIn);

      // Feedback Loop (Apps Script back to Google Ads)
      const appsOut = getAnchor('wf-apps', isMobile ? 'bottom' : 'bottom');
      const gadsFeedbackIn = getAnchor('wf-gads', isMobile ? 'left' : 'bottom');
      createPath(appsOut, gadsFeedbackIn, true);
    };

    // Draw initially, using setTimeout to ensure fonts/layout are loaded
    setTimeout(drawPaths, 300);
    
    // Redraw on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(drawPaths, 200);
    });

    // Optional: Add pulsing classes sequentially to nodes
    const nodes = document.querySelectorAll('.wf-node, .wf-glass-card');
    let delay = 0;
    nodes.forEach(node => {
      setTimeout(() => node.classList.add('active-pulse'), delay);
      delay += 800;
    });
  }

  initWorkflowAnimation();

  // ============================================
  // 9. GA4 SECTION VIEW TRACKING
  // ============================================
  if (typeof gtag !== 'undefined') {
    const trackableSections = document.querySelectorAll('section[id]');
    const sectionTracker = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gtag('event', 'section_view', {
            event_category: 'engagement',
            event_label: entry.target.getAttribute('id'),
            section_name: entry.target.getAttribute('id')
          });
          sectionTracker.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    trackableSections.forEach(section => sectionTracker.observe(section));
  }

  // ============================================
  // 10. KEYBOARD ACCESSIBILITY
  // ============================================
  // Add focus-visible support
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      document.body.classList.add('keyboard-nav');
    }
  });

  document.addEventListener('mousedown', () => {
    document.body.classList.remove('keyboard-nav');
  });

});

// ============================================
// GLOBAL FUNCTIONS (called from HTML onclick)
// ============================================

/** Toggle certification sub-course accordion */
function toggleCert(headerEl) {
  const card = headerEl.closest('.cert-expandable');
  card.classList.toggle('open');
}

/** Toggle skill description */
function toggleSkill(wrapEl) {
  // Close any other open skill in the same category
  const parentCategory = wrapEl.closest('.skill-category');
  parentCategory.querySelectorAll('.skill-tag-wrap.open').forEach(open => {
    if (open !== wrapEl) open.classList.remove('open');
  });
  wrapEl.classList.toggle('open');
}

/** Track resume download in GA4 */
function trackResumeDownload() {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'file_download', {
      event_category: 'engagement',
      event_label: 'Resume Download',
      file_name: 'Resume_Chinmay_Analyst.pdf'
    });
  }
}

/* Utility: Add spin animation for loading state */
const styleSheet = document.createElement('style');
styleSheet.textContent = `
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  .keyboard-nav *:focus {
    outline: 2px solid var(--accent-1) !important;
    outline-offset: 2px;
  }
`;
document.head.appendChild(styleSheet);
