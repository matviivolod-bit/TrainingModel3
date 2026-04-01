/* ===========================
   HAMBURGER MENU
=========================== */
const hamburger = document.getElementById('hamburger');
const navMenu   = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
  const isOpen = navMenu.classList.toggle('open');
  hamburger.classList.toggle('active');
  hamburger.setAttribute('aria-expanded', isOpen);
});

// Close menu when a nav link is clicked
navMenu.querySelectorAll('a').forEach(link => {
  link.addEventListener('click', () => {
    navMenu.classList.remove('open');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', false);
  });
});


/* ===========================
   SMOOTH SCROLL
   Intercepts clicks on all nav
   anchor links and scrolls
   smoothly to the target section.
=========================== */
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', (e) => {
    const targetId = link.getAttribute('href');
    const target   = document.querySelector(targetId);

    if (!target) return;

    e.preventDefault();

    const headerHeight = document.querySelector('header').offsetHeight;
    const targetTop    = target.getBoundingClientRect().top + window.scrollY - headerHeight - 16;

    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
});


/* ===========================
   PROJECT FILTER
   Each button holds data-filter.
   Articles have data-tags.
   Multiple active filters = AND logic
   (project must have ALL active tags).
=========================== */
const filterButtons = document.querySelectorAll('.filter-btn');
const projects      = document.querySelectorAll('#projects-list article');
const noResults     = document.getElementById('no-results');

// Track which filters are currently active
let activeFilters = new Set(['all']);

filterButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const filter = btn.dataset.filter;

    if (filter === 'all') {
      // "All" clears everything and resets to show all
      activeFilters.clear();
      activeFilters.add('all');
    } else {
      // Remove "all" if a specific filter is chosen
      activeFilters.delete('all');

      if (activeFilters.has(filter)) {
        // Toggle off if already active
        activeFilters.delete(filter);
        // If nothing left, revert to "all"
        if (activeFilters.size === 0) activeFilters.add('all');
      } else {
        activeFilters.add(filter);
      }
    }

    updateFilterButtons();
    applyFilters();
  });
});

function updateFilterButtons() {
  filterButtons.forEach(btn => {
    btn.classList.toggle('active', activeFilters.has(btn.dataset.filter));
  });
}

function applyFilters() {
  let visibleCount = 0;

  projects.forEach(article => {
    const tags = article.dataset.tags.split(' ');

    let shouldShow;
    if (activeFilters.has('all')) {
      shouldShow = true;
    } else {
      // AND logic: article must contain every active filter tag
      shouldShow = [...activeFilters].every(f => tags.includes(f));
    }

    article.classList.toggle('hidden', !shouldShow);
    if (shouldShow) visibleCount++;
  });

  // Show "no results" message if nothing matches
  noResults.hidden = visibleCount > 0;
}


/* ===========================
   IMAGE MODAL
   Clicking a project image opens
   it in a centred modal overlay.
   Close via X button, backdrop
   click, or Escape key.
=========================== */
const modal        = document.getElementById('img-modal');
const modalImg     = document.getElementById('modal-img');
const modalClose   = document.getElementById('modal-close');
const modalBackdrop = document.getElementById('modal-backdrop');

// Open modal when any project image is clicked
document.querySelectorAll('.project-img').forEach(img => {
  img.addEventListener('click', () => {
    const fullSrc = img.dataset.full || img.src;
    modalImg.src = fullSrc;
    modalImg.alt = img.alt;
    modal.hidden = false;
    modalClose.focus();
  });
});

function closeModal() {
  modal.hidden = true;
  modalImg.src = '';
}

modalClose.addEventListener('click', closeModal);
modalBackdrop.addEventListener('click', closeModal);

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !modal.hidden) closeModal();
});


/* ===========================
   CONTACT FORM VALIDATION
   - Checks all 3 fields on submit
   - Blocks spaces in email field
   - Highlights empty/invalid fields
   - Shows specific error messages
   - Shows alert if fields are empty
=========================== */
const contactForm  = document.getElementById('contact-form');
const nameInput    = document.getElementById('name');
const emailInput   = document.getElementById('email');
const messageInput = document.getElementById('message');

// Block spaces being typed in the email field
emailInput.addEventListener('keydown', (e) => {
  if (e.key === ' ') e.preventDefault();
});

// Also strip spaces if user pastes text into email
emailInput.addEventListener('input', () => {
  emailInput.value = emailInput.value.replace(/\s/g, '');
});

// Clear error styling as soon as the user starts fixing a field
[nameInput, emailInput, messageInput].forEach(field => {
  field.addEventListener('input', () => clearError(field));
});

contactForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const errors = validateForm();

  if (errors.length > 0) {
    alert('Please fill in all required fields before sending:\n\n' + errors.join('\n'));
    return;
  }

  // All good — would normally send data here
  alert('Your message has been sent! I\'ll get back to you soon.');
  contactForm.reset();
});

function validateForm() {
  const errors = [];

  // Name — must not be empty
  if (nameInput.value.trim() === '') {
    setError(nameInput, 'name-error', 'Please enter your name.');
    errors.push('• Name is required');
  } else {
    clearError(nameInput);
  }

  // Email — must not be empty and must look like an email
  const emailVal = emailInput.value.trim();
  if (emailVal === '') {
    setError(emailInput, 'email-error', 'Please enter your email address.');
    errors.push('• Email is required');
  } else if (!isValidEmail(emailVal)) {
    setError(emailInput, 'email-error', 'Please enter a valid email address (e.g. you@example.com).');
    errors.push('• Email address is not valid');
  } else {
    clearError(emailInput);
  }

  // Message — must not be empty
  if (messageInput.value.trim() === '') {
    setError(messageInput, 'message-error', 'Please describe your project or idea.');
    errors.push('• Message is required');
  } else {
    clearError(messageInput);
  }

  return errors;
}

function isValidEmail(value) {
  // Simple but solid email pattern check
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setError(field, errorId, message) {
  field.classList.add('error');
  field.setAttribute('aria-invalid', 'true');
  document.getElementById(errorId).textContent = message;
}

function clearError(field) {
  field.classList.remove('error');
  field.removeAttribute('aria-invalid');
  // Find the associated error span (next sibling after the input)
  const errorSpan = field.parentElement.querySelector('.field-error');
  if (errorSpan) errorSpan.textContent = '';
}