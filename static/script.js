// Light effect tracking
document.querySelectorAll('.timeline-content').forEach(card => {
    const lightEffect = card.querySelector('.light-effect');
    
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        lightEffect.style.setProperty('--x', `${x}px`);
        lightEffect.style.setProperty('--y', `${y}px`);
    });
});

// Intersection Observer for fade-in effect
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            const delay = Array.from(document.querySelectorAll('.timeline-item'))
                .indexOf(entry.target) * 100;
            entry.target.style.transitionDelay = `${delay}ms`;
        }
    });
}, {
    threshold: 0.1
});

document.querySelectorAll('.timeline-item').forEach(item => {
    observer.observe(item);
});


// Gradient init for the first container
document.addEventListener('DOMContentLoaded', function() {
    // Create and inject canvas
    const firstContainer = document.querySelector('.first-container');
    const canvas = document.createElement('canvas');
    canvas.id = 'gradient-canvas';
    canvas.setAttribute('data-js-darken-top', '');
    canvas.setAttribute('data-transition-in', '');
    firstContainer.insertBefore(canvas, firstContainer.firstChild);

    // Initialize gradient
    const gradient = new Gradient();
    gradient.initGradient('#gradient-canvas');

    // Optional: Adjust gradient properties
    gradient.amp = 320;
    gradient.seed = 5;
    gradient.freqX = 14e-5;
    gradient.freqY = 29e-5;
    gradient.freqDelta = 1e-5;

    if (typeof initAllGradients === 'function') {
        initAllGradients();
    }
});

// Intersection Observer options
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };
  
  // Create observer for sections
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('section-visible');
        // Start observing items within this section
        const items = entry.target.querySelectorAll('.reveal-item');
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('item-visible');
          }, index * 100); // Stagger the animations
        });
        sectionObserver.unobserve(entry.target); // Only animate once
      }
    });
  }, observerOptions);
  
  // Create observer for skill items
  const skillsObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('skill-visible');
        }, Array.from(entry.target.parentElement.children).indexOf(entry.target) * 100);
      }
    });
  }, observerOptions);
  
  // Initialize observers when DOM is loaded
  document.addEventListener('DOMContentLoaded', () => {
    // Update sections selector to include form-container
    const sections = document.querySelectorAll('.first-container, .contact-container, .education-container, .timeline-container, .skills-container, .form-container');
    sections.forEach(section => sectionObserver.observe(section));
    
    // Observe individual items
    const contactCards = document.querySelectorAll('.contact-card');
    const educationCards = document.querySelectorAll('.education-card');
    const skillItems = document.querySelectorAll('.skills-item');
    
    contactCards.forEach(card => card.classList.add('reveal-item'));
    educationCards.forEach(card => card.classList.add('reveal-item'));
    skillItems.forEach(item => skillsObserver.observe(item));

    // Add form field effects
    document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
        field.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });

        field.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    // Add form submission handler
    document.querySelector('.contact-form')?.addEventListener('submit', function(e) {
      const submitBtn = this.querySelector('.submit-btn');
      submitBtn.classList.add('sending');
      submitBtn.innerHTML = 'Sending...';
    });
});
  