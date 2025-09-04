/**
 * SMB Website - Main JavaScript
 * Handles all interactive functionality
 */

'use strict';

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Debounce function to limit the rate of function execution
 * @param {Function} func - Function to debounce
 * @param {number} wait - Delay in milliseconds
 * @param {boolean} immediate - Whether to execute immediately
 * @returns {Function} Debounced function
 */
function debounce(func, wait, immediate) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
}

/**
 * Throttle function to limit the rate of function execution
 * @param {Function} func - Function to throttle
 * @param {number} limit - Time limit in milliseconds
 * @returns {Function} Throttled function
 */
function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Check if element is in viewport
 * @param {Element} element - Element to check
 * @returns {boolean} Whether element is visible
 */
function isElementInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// ============================================================================
// FAVORITES FUNCTIONALITY
// ============================================================================

class FavoritesManager {
  constructor() {
    this.favorites = this.loadFavorites();
    this.init();
  }

  init() {
    document.addEventListener('click', this.handleFavoriteClick.bind(this));
    this.updateFavoriteButtons();
  }

  handleFavoriteClick(event) {
    const favoriteBtn = event.target.closest('[data-action="toggle-favorite"]');
    if (!favoriteBtn) return;

    event.preventDefault();
    const productId = favoriteBtn.dataset.productId;
    
    if (!productId) {
      console.warn('Product ID not found for favorite button');
      return;
    }

    this.toggleFavorite(productId);
    this.updateFavoriteButton(favoriteBtn, productId);
    
    // Add animation
    favoriteBtn.style.transform = 'scale(1.2)';
    setTimeout(() => {
      favoriteBtn.style.transform = '';
    }, 150);
  }

  toggleFavorite(productId) {
    if (this.favorites.includes(productId)) {
      this.favorites = this.favorites.filter(id => id !== productId);
    } else {
      this.favorites.push(productId);
    }
    this.saveFavorites();
  }

  updateFavoriteButton(button, productId) {
    const isFavorite = this.favorites.includes(productId);
    const img = button.querySelector('img');
    
    if (isFavorite) {
      button.classList.add('product-card__favorite--active');
      button.setAttribute('aria-label', 'Remove from favorites');
      if (img) {
        img.src = '../assets/icons/favorite-filled.svg';
        img.setAttribute('width', '24');
        img.setAttribute('height', '22');
      }
    } else {
      button.classList.remove('product-card__favorite--active');
      button.setAttribute('aria-label', 'Add to favorites');
      if (img) {
        img.src = '../assets/icons/favorite-icon.svg';
        img.setAttribute('width', '20');
        img.setAttribute('height', '18');
      }
    }
  }

  updateFavoriteButtons() {
    const favoriteButtons = document.querySelectorAll('[data-action="toggle-favorite"]');
    favoriteButtons.forEach(button => {
      const productId = button.dataset.productId;
      if (productId) {
        this.updateFavoriteButton(button, productId);
      }
    });
  }

  loadFavorites() {
    try {
      const stored = localStorage.getItem('smb-favorites');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Could not load favorites from localStorage:', error);
      return [];
    }
  }

  saveFavorites() {
    try {
      localStorage.setItem('smb-favorites', JSON.stringify(this.favorites));
    } catch (error) {
      console.warn('Could not save favorites to localStorage:', error);
    }
  }

  getFavorites() {
    return [...this.favorites];
  }

  getFavoriteCount() {
    return this.favorites.length;
  }
}

// ============================================================================
// HEADER FUNCTIONALITY
// ============================================================================

class HeaderManager {
  constructor() {
    this.header = document.querySelector('.header');
    this.lastScrollTop = 0;
    this.scrollThreshold = 10;
    this.init();
  }

  init() {
    if (!this.header) return;

    // Header scroll behavior
    this.handleScroll = throttle(this.onScroll.bind(this), 16);
    window.addEventListener('scroll', this.handleScroll);

    // Header action buttons
    this.initActionButtons();
  }

  onScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add/remove sticky class based on scroll position
    if (scrollTop > this.scrollThreshold) {
      this.header.classList.add('header--scrolled');
    } else {
      this.header.classList.remove('header--scrolled');
    }

    this.lastScrollTop = scrollTop;
  }

  initActionButtons() {
    const actionButtons = document.querySelectorAll('.header__action-btn');
    
    actionButtons.forEach(button => {
      button.addEventListener('click', this.handleActionClick.bind(this));
    });
  }

  handleActionClick(event) {
    const button = event.currentTarget;
    const action = button.dataset.action;

    switch (action) {
      case 'search':
        this.openSearch();
        break;
      case 'favorites':
        this.openFavorites();
        break;
      case 'cart':
        this.openCart();
        break;
      case 'account':
        this.openAccount();
        break;
      default:
        console.log(`Action ${action} not implemented yet`);
    }
  }

  openSearch() {
    console.log('Opening search...');
    // TODO: Implement search modal
  }

  openFavorites() {
    console.log('Opening favorites...');
    // TODO: Implement favorites page/modal
  }

  openCart() {
    console.log('Opening cart...');
    // TODO: Implement cart sidebar/modal
  }

  openAccount() {
    console.log('Opening account...');
    // TODO: Implement account modal/redirect
  }
}

// ============================================================================
// PRODUCT FUNCTIONALITY
// ============================================================================

class ProductManager {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('click', this.handleColorSelection.bind(this));
    document.addEventListener('click', this.handleProductClick.bind(this));
  }

  handleColorSelection(event) {
    const colorButton = event.target.closest('[data-action="select-color"]');
    if (!colorButton) return;

    event.preventDefault();
    
    const productCard = colorButton.closest('.product-card');
    const colorButtons = productCard.querySelectorAll('[data-action="select-color"]');
    
    // Remove active state from all color buttons
    colorButtons.forEach(btn => btn.classList.remove('product-card__color--active'));
    
    // Add active state to clicked button
    colorButton.classList.add('product-card__color--active');
    
    // Add selection animation
    colorButton.style.transform = 'scale(1.3)';
    setTimeout(() => {
      colorButton.style.transform = '';
    }, 150);

    const color = colorButton.dataset.color;
    console.log(`Selected color: ${color}`);
  }

  handleProductClick(event) {
    const productCard = event.target.closest('.product-card');
    if (!productCard) return;

    // Don't navigate if clicking on interactive elements
    if (event.target.closest('button') || event.target.closest('a')) return;

    const productId = productCard.dataset.productId;
    if (productId) {
      console.log(`Navigating to product: ${productId}`);
      // TODO: Implement navigation to product page
    }
  }
}

// ============================================================================
// SCROLL BANNER FUNCTIONALITY
// ============================================================================

class ScrollBanner {
  constructor() {
    this.banner = document.querySelector('.scroll-banner');
    this.init();
  }

  init() {
    if (!this.banner) return;

    // Pause animation on hover
    this.banner.addEventListener('mouseenter', this.pauseAnimation.bind(this));
    this.banner.addEventListener('mouseleave', this.resumeAnimation.bind(this));
  }

  pauseAnimation() {
    const content = this.banner.querySelector('.scroll-banner__content');
    if (content) {
      content.style.animationPlayState = 'paused';
    }
  }

  resumeAnimation() {
    const content = this.banner.querySelector('.scroll-banner__content');
    if (content) {
      content.style.animationPlayState = 'running';
    }
  }
}

// ============================================================================
// NEWSLETTER FUNCTIONALITY
// ============================================================================

class NewsletterManager {
  constructor() {
    this.init();
  }

  init() {
    const subscribeButtons = document.querySelectorAll('.newsletter button, [data-action="subscribe"]');
    subscribeButtons.forEach(button => {
      button.addEventListener('click', this.handleSubscription.bind(this));
    });
  }

  handleSubscription(event) {
    event.preventDefault();
    const button = event.currentTarget;
    
    // Add loading state
    const originalText = button.textContent;
    button.textContent = 'Подписываем...';
    button.disabled = true;

    // Simulate subscription process
    setTimeout(() => {
      button.textContent = 'Подписаны!';
      button.classList.add('btn--success');
      
      setTimeout(() => {
        button.textContent = originalText;
        button.disabled = false;
        button.classList.remove('btn--success');
      }, 2000);
    }, 1000);

    console.log('Newsletter subscription requested');
  }
}

// ============================================================================
// LAZY LOADING
// ============================================================================

class LazyLoader {
  constructor() {
    this.images = document.querySelectorAll('[data-lazy]');
    this.init();
  }

  init() {
    if ('IntersectionObserver' in window) {
      this.observer = new IntersectionObserver(this.handleIntersection.bind(this), {
        rootMargin: '50px 0px',
        threshold: 0.1
      });

      this.images.forEach(img => this.observer.observe(img));
    } else {
      // Fallback for older browsers
      this.loadAllImages();
    }
  }

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.loadImage(entry.target);
        this.observer.unobserve(entry.target);
      }
    });
  }

  loadImage(img) {
    const src = img.dataset.lazy;
    if (src) {
      img.src = src;
      img.removeAttribute('data-lazy');
      img.classList.add('loaded');
    }
  }

  loadAllImages() {
    this.images.forEach(img => this.loadImage(img));
  }
}

// ============================================================================
// ACCESSIBILITY
// ============================================================================

class AccessibilityManager {
  constructor() {
    this.init();
  }

  init() {
    this.handleKeyboardNavigation();
    this.handleFocusManagement();
    this.announcePageChanges();
  }

  handleKeyboardNavigation() {
    document.addEventListener('keydown', (event) => {
      // Escape key handling
      if (event.key === 'Escape') {
        this.closeModals();
        this.clearFocus();
      }

      // Tab navigation enhancement
      if (event.key === 'Tab') {
        document.body.classList.add('keyboard-navigation');
      }
    });

    // Remove keyboard navigation class on mouse use
    document.addEventListener('mousedown', () => {
      document.body.classList.remove('keyboard-navigation');
    });
  }

  handleFocusManagement() {
    // Ensure focus is visible for keyboard users
    const focusableElements = document.querySelectorAll(
      'a, button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
    );

    focusableElements.forEach(element => {
      element.addEventListener('focus', this.handleFocus.bind(this));
      element.addEventListener('blur', this.handleBlur.bind(this));
    });
  }

  handleFocus(event) {
    event.target.setAttribute('data-focused', 'true');
  }

  handleBlur(event) {
    event.target.removeAttribute('data-focused');
  }

  closeModals() {
    // Close any open modals
    const openModals = document.querySelectorAll('.modal:not(.hidden)');
    openModals.forEach(modal => {
      modal.classList.add('hidden');
    });
  }

  clearFocus() {
    document.activeElement?.blur();
  }

  announcePageChanges() {
    // Create live region for screen readers
    const liveRegion = document.createElement('div');
    liveRegion.id = 'live-region';
    liveRegion.setAttribute('aria-live', 'polite');
    liveRegion.setAttribute('aria-atomic', 'true');
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);

    this.liveRegion = liveRegion;
  }

  announce(message) {
    if (this.liveRegion) {
      this.liveRegion.textContent = message;
      setTimeout(() => {
        this.liveRegion.textContent = '';
      }, 1000);
    }
  }
}

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

class PerformanceMonitor {
  constructor() {
    this.init();
  }

  init() {
    if ('PerformanceObserver' in window) {
      this.observeLCP();
      this.observeFID();
      this.observeCLS();
    }
  }

  observeLCP() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('LCP:', lastEntry.startTime);
      });
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (error) {
      console.warn('LCP observation failed:', error);
    }
  }

  observeFID() {
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          console.log('FID:', entry.processingStart - entry.startTime);
        });
      });
      observer.observe({ entryTypes: ['first-input'] });
    } catch (error) {
      console.warn('FID observation failed:', error);
    }
  }

  observeCLS() {
    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        console.log('CLS:', clsValue);
      });
      observer.observe({ entryTypes: ['layout-shift'] });
    } catch (error) {
      console.warn('CLS observation failed:', error);
    }
  }
}

// ============================================================================
// MAIN APP INITIALIZATION
// ============================================================================

class SMBApp {
  constructor() {
    this.managers = {};
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', this.initializeApp.bind(this));
    } else {
      this.initializeApp();
    }
  }

  initializeApp() {
    console.log('SMB App initializing...');

    try {
      // Initialize all managers
      this.managers.favorites = new FavoritesManager();
      this.managers.header = new HeaderManager();
      this.managers.products = new ProductManager();
      this.managers.scrollBanner = new ScrollBanner();
      this.managers.newsletter = new NewsletterManager();
      this.managers.lazyLoader = new LazyLoader();
      this.managers.accessibility = new AccessibilityManager();
      this.managers.performance = new PerformanceMonitor();

      // Add global error handling
      this.initErrorHandling();

      console.log('SMB App initialized successfully');
    } catch (error) {
      console.error('Error initializing SMB App:', error);
    }
  }

  initErrorHandling() {
    window.addEventListener('error', (event) => {
      console.error('Global error:', event.error);
    });

    window.addEventListener('unhandledrejection', (event) => {
      console.error('Unhandled promise rejection:', event.reason);
    });
  }

  getManager(name) {
    return this.managers[name];
  }
}

// ============================================================================
// INITIALIZE APP
// ============================================================================

// Create global app instance
window.SMBApp = new SMBApp();

// Export for module usage (if needed)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    SMBApp,
    FavoritesManager,
    HeaderManager,
    ProductManager,
    ScrollBanner,
    NewsletterManager,
    LazyLoader,
    AccessibilityManager,
    PerformanceMonitor
  };
}