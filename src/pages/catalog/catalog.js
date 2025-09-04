/**
 * SMB Website - Catalog JavaScript
 * Handles catalog filtering, sorting, and product display functionality
 */

'use strict';

class CatalogManager {
  constructor() {
    this.products = [];
    this.filteredProducts = [];
    this.filters = {
      category: [],
      price: { min: 0, max: 100000 },
      color: [],
      size: []
    };
    this.sortBy = 'popular';
    this.viewMode = 'grid';
    this.currentPage = 1;
    this.itemsPerPage = 8; // Show 8 items per page
    this.totalPages = 1;
    
    this.init();
  }

  init() {
    this.loadProducts();
    this.bindEvents();
    this.initPriceRangeSlider();
    this.applyFilters(); // Apply default filters on load
  }

  loadProducts() {
    // Load product data from the existing product cards in the DOM
    const productElements = document.querySelectorAll('.product-card');
    
    this.products = Array.from(productElements).map(card => {
      const productId = card.dataset.productId;
      const title = card.querySelector('.product-card__title a')?.textContent || '';
      const priceText = card.querySelector('.product-card__price-current')?.textContent || '0';
      const price = parseInt(priceText.replace(/\s/g, '').replace('₽', '')) || 0;
      const colors = Array.from(card.querySelectorAll('.product-card__color')).map(colorBtn => {
        const className = colorBtn.className;
        if (className.includes('color--brown')) return 'brown';
        if (className.includes('color--tan')) return 'tan';
        if (className.includes('color--black')) return 'black';
        if (className.includes('color--light-gray')) return 'gray';
        return 'unknown';
      });
      
      return {
        id: productId,
        title: title,
        price: price,
        colors: colors,
        category: 'women', // Default category
        size: 'medium', // Default size
        element: card
      };
    });
    
    this.filteredProducts = [...this.products];
  }

  bindEvents() {
    // Category filter changes
    const categoryCheckboxes = document.querySelectorAll('input[name="category"]');
    categoryCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.onFilterChange());
    });

    // Price filter changes
    const priceMinInput = document.getElementById('price-min');
    const priceMaxInput = document.getElementById('price-max');
    if (priceMinInput && priceMaxInput) {
      priceMinInput.addEventListener('input', () => {
        this.updatePriceRangeSlider();
        this.onFilterChange();
      });
      priceMaxInput.addEventListener('input', () => {
        this.updatePriceRangeSlider();
        this.onFilterChange();
      });
    }

    // Price range sliders
    const priceRangeMin = document.getElementById('price-range-min');
    const priceRangeMax = document.getElementById('price-range-max');
    if (priceRangeMin && priceRangeMax) {
      priceRangeMin.addEventListener('input', () => {
        this.updatePriceRangeThumb('min');
        this.onFilterChange();
      });
      priceRangeMax.addEventListener('input', () => {
        this.updatePriceRangeThumb('max');
        this.onFilterChange();
      });
    }
    
    // Direct thumb manipulation
    const thumbMin = document.getElementById('price-thumb-min');
    const thumbMax = document.getElementById('price-thumb-max');
    if (thumbMin && thumbMax) {
      this.setupThumbDrag(thumbMin, 'min');
      this.setupThumbDrag(thumbMax, 'max');
    }

    // Color filter changes
    const colorCheckboxes = document.querySelectorAll('input[name="color"]');
    colorCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.onFilterChange());
    });

    // Size filter changes
    const sizeCheckboxes = document.querySelectorAll('input[name="size"]');
    sizeCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => this.onFilterChange());
    });

    // Sort select changes
    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
        // Reset to first page when sorting changes
        this.currentPage = 1;
        this.applyFilters();
      });
    }

    // View toggle buttons
    const viewToggleButtons = document.querySelectorAll('.view-toggle__btn');
    viewToggleButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        this.viewMode = e.currentTarget.dataset.view;
        this.updateViewMode();
      });
    });

    // Reset filters button
    const resetButton = document.querySelector('.filters__reset');
    if (resetButton) {
      resetButton.addEventListener('click', () => this.resetFilters());
    }
  }

  onFilterChange() {
    this.collectFilters();
    // Reset to first page when filters change
    this.currentPage = 1;
    this.applyFilters();
  }

  initPriceRangeSlider() {
    const priceRangeMin = document.getElementById('price-range-min');
    const priceRangeMax = document.getElementById('price-range-max');
    const thumbMin = document.getElementById('price-thumb-min');
    const thumbMax = document.getElementById('price-thumb-max');
    const progress = document.getElementById('price-range-progress');
    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');
    
    if (priceRangeMin && priceRangeMax && progress && thumbMin && thumbMax) {
      // Set initial values
      const minValue = parseInt(priceRangeMin.value);
      const maxValue = parseInt(priceRangeMax.value);
      const total = parseInt(priceRangeMax.max);
      
      // Set initial thumb positions
      const minPercent = (minValue / total) * 100;
      const maxPercent = (maxValue / total) * 100;
      
      thumbMin.style.left = `${minPercent}%`;
      thumbMax.style.left = `${maxPercent}%`;
      
      progress.style.left = `${minPercent}%`;
      progress.style.width = `${maxPercent - minPercent}%`;
      
      // Make sure inputs match range values
      if (minInput && maxInput) {
        minInput.value = minValue;
        maxInput.value = maxValue;
      }
    }
  }
  
  updatePriceRangeThumb(type) {
    const priceRangeMin = document.getElementById('price-range-min');
    const priceRangeMax = document.getElementById('price-range-max');
    const thumbMin = document.getElementById('price-thumb-min');
    const thumbMax = document.getElementById('price-thumb-max');
    const progress = document.getElementById('price-range-progress');
    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');
    
    if (!priceRangeMin || !priceRangeMax || !progress || !thumbMin || !thumbMax || !minInput || !maxInput) {
      return;
    }
    
    const total = parseInt(priceRangeMax.max);
    let minValue = parseInt(priceRangeMin.value);
    let maxValue = parseInt(priceRangeMax.value);
    
    // Make sure min isn't greater than max
    if (minValue > maxValue) {
      if (type === 'min') {
        minValue = maxValue;
        priceRangeMin.value = minValue;
      } else {
        maxValue = minValue;
        priceRangeMax.value = maxValue;
      }
    }
    
    // Update input fields with formatted numbers
    minInput.value = minValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    maxInput.value = maxValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    
    // Calculate percentages
    const minPercent = (minValue / total) * 100;
    const maxPercent = (maxValue / total) * 100;
    
    // Update DOM elements
    thumbMin.style.left = `${minPercent}%`;
    thumbMax.style.left = `${maxPercent}%`;
    
    progress.style.left = `${minPercent}%`;
    progress.style.width = `${maxPercent - minPercent}%`;
  }
  
  updatePriceRangeSlider() {
    const priceRangeMin = document.getElementById('price-range-min');
    const priceRangeMax = document.getElementById('price-range-max');
    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');
    
    if (!priceRangeMin || !priceRangeMax || !minInput || !maxInput) {
      return;
    }
    
    // Parse the input values, removing any spaces
    let minValue = parseInt(minInput.value.replace(/\s/g, '')) || 0;
    let maxValue = parseInt(maxInput.value.replace(/\s/g, '')) || 100000;
    
    // Make sure min isn't greater than max
    if (minValue > maxValue) {
      minValue = maxValue;
      minInput.value = minValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }
    
    // Update range inputs
    priceRangeMin.value = minValue;
    priceRangeMax.value = maxValue;
    
    this.updatePriceRangeThumb('both');
  }

  collectFilters() {
    // Collect category filters
    this.filters.category = Array.from(document.querySelectorAll('input[name="category"]:checked'))
      .map(cb => cb.value);
    
    // Collect price filters
    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');
    
    if (minInput && maxInput) {
      this.filters.price.min = parseInt(minInput.value.replace(/\s/g, '')) || 0;
      this.filters.price.max = parseInt(maxInput.value.replace(/\s/g, '')) || 100000;
    }
    
    // Collect color filters
    this.filters.color = Array.from(document.querySelectorAll('input[name="color"]:checked'))
      .map(cb => cb.value);
    
    // Collect size filters
    this.filters.size = Array.from(document.querySelectorAll('input[name="size"]:checked'))
      .map(cb => cb.value);
  }

  applyFilters() {
    this.filteredProducts = this.products.filter(product => {
      // Category filter
      if (this.filters.category.length > 0 && !this.filters.category.includes(product.category)) {
        return false;
      }
      
      // Price filter
      if (product.price < this.filters.price.min || product.price > this.filters.price.max) {
        return false;
      }
      
      // Color filter
      if (this.filters.color.length > 0) {
        const hasColor = this.filters.color.some(color => product.colors.includes(color));
        if (!hasColor) return false;
      }
      
      // Size filter
      if (this.filters.size.length > 0 && !this.filters.size.includes(product.size)) {
        return false;
      }
      
      return true;
    });
    
    this.sortProducts();
    this.updateProductDisplay();
    this.updateProductCount();
  }

  sortProducts() {
    switch (this.sortBy) {
      case 'price-asc':
        this.filteredProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        this.filteredProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        this.filteredProducts.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'newest':
        // For demo purposes, we'll sort by ID
        this.filteredProducts.sort((a, b) => b.id.localeCompare(a.id));
        break;
      case 'popular':
      default:
        // Keep original order for popular sort
        break;
    }
  }

  updateProductDisplay() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    // Calculate pagination
    this.totalPages = Math.ceil(this.filteredProducts.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const paginatedProducts = this.filteredProducts.slice(startIndex, endIndex);
    
    // Hide all products first
    const allProducts = document.querySelectorAll('.product-card');
    allProducts.forEach(product => {
      product.style.display = 'none';
    });
    
    // Show only products for current page
    paginatedProducts.forEach(product => {
      if (product.element) {
        product.element.style.display = 'block';
      }
    });
    
    // Update pagination controls
    this.updatePaginationControls();
  }

  updateProductCount() {
    const countElement = document.getElementById('products-count');
    if (countElement) {
      countElement.textContent = this.filteredProducts.length;
    }
  }

  updatePaginationControls() {
    const paginationList = document.querySelector('.pagination__list');
    if (!paginationList) return;
    
    // Clear existing pagination items except first and last
    while (paginationList.children.length > 2) {
      paginationList.removeChild(paginationList.children[1]);
    }
    
    // Add page links
    for (let i = 1; i <= this.totalPages; i++) {
      const li = document.createElement('li');
      li.className = 'pagination__item';
      
      const button = document.createElement('button');
      button.className = 'pagination__link';
      button.textContent = i;
      
      if (i === this.currentPage) {
        button.classList.add('pagination__link--active');
      }
      
      button.addEventListener('click', () => {
        this.goToPage(i);
      });
      
      li.appendChild(button);
      // Insert before the last item (next button)
      paginationList.insertBefore(li, paginationList.children[paginationList.children.length - 1]);
    }
    
    // Update previous/next buttons
    const prevButton = paginationList.querySelector('.pagination__link--disabled:not([disabled])') || 
                      paginationList.querySelector('.pagination__link:not(.pagination__link--active):first-child');
    const nextButton = paginationList.querySelector('.pagination__link:not(.pagination__link--active):last-child');
    
    if (prevButton) {
      prevButton.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M10 12l-4-4 4-4" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
        Назад
      `;
      
      if (this.currentPage > 1) {
        prevButton.classList.remove('pagination__link--disabled');
        prevButton.disabled = false;
        prevButton.onclick = () => this.goToPage(this.currentPage - 1);
      } else {
        prevButton.classList.add('pagination__link--disabled');
        prevButton.disabled = true;
        prevButton.onclick = null;
      }
    }
    
    if (nextButton) {
      nextButton.innerHTML = `
        Вперед
        <svg width="16" height="16" viewBox="0 0 16 16">
          <path d="M6 4l4 4-4 4" fill="none" stroke="currentColor" stroke-width="2"/>
        </svg>
      `;
      
      if (this.currentPage < this.totalPages) {
        nextButton.classList.remove('pagination__link--disabled');
        nextButton.disabled = false;
        nextButton.onclick = () => this.goToPage(this.currentPage + 1);
      } else {
        nextButton.classList.add('pagination__link--disabled');
        nextButton.disabled = true;
        nextButton.onclick = null;
      }
    }
  }

  goToPage(page) {
    if (page < 1 || page > this.totalPages) return;
    
    this.currentPage = page;
    this.updateProductDisplay();
    
    // Scroll to top of products
    const productsGrid = document.getElementById('products-grid');
    if (productsGrid) {
      productsGrid.scrollIntoView({ behavior: 'smooth' });
    }
  }

  updateViewMode() {
    const productsGrid = document.getElementById('products-grid');
    if (!productsGrid) return;
    
    // Update active button state
    const buttons = document.querySelectorAll('.view-toggle__btn');
    buttons.forEach(btn => {
      if (btn.dataset.view === this.viewMode) {
        btn.classList.add('view-toggle__btn--active');
      } else {
        btn.classList.remove('view-toggle__btn--active');
      }
    });
    
    // Update grid class for view mode
    if (this.viewMode === 'list') {
      productsGrid.classList.add('catalog__products--list');
    } else {
      productsGrid.classList.remove('catalog__products--list');
    }
  }

  setupThumbDrag(thumb, type) {
    const slider = document.querySelector('.price-range__slider');
    const priceRangeMin = document.getElementById('price-range-min');
    const priceRangeMax = document.getElementById('price-range-max');
    const rangeMax = parseInt(priceRangeMax.max);
    
    let isDragging = false;
    
    thumb.addEventListener('mousedown', (e) => {
      isDragging = true;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
      e.preventDefault(); // Prevent text selection
    });
    
    thumb.addEventListener('touchstart', (e) => {
      isDragging = true;
      document.addEventListener('touchmove', onTouchMove);
      document.addEventListener('touchend', onTouchEnd);
    });
    
    const onMouseMove = (e) => {
      if (!isDragging) return;
      updateThumbPosition(e.clientX);
    };
    
    const onTouchMove = (e) => {
      if (!isDragging || !e.touches[0]) return;
      updateThumbPosition(e.touches[0].clientX);
    };
    
    const onMouseUp = () => {
      endDrag();
    };
    
    const onTouchEnd = () => {
      endDrag();
    };
    
    const endDrag = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onTouchEnd);
    };
    
    const updateThumbPosition = (clientX) => {
      const rect = slider.getBoundingClientRect();
      let percent = (clientX - rect.left) / rect.width;
      
      // Constrain to 0-1 range
      percent = Math.max(0, Math.min(1, percent));
      
      // Calculate the value based on the percentage
      let value = Math.round(percent * rangeMax);
      
      // Update the appropriate range input
      if (type === 'min') {
        const maxValue = parseInt(priceRangeMax.value);
        value = Math.min(value, maxValue);
        priceRangeMin.value = value;
      } else {
        const minValue = parseInt(priceRangeMin.value);
        value = Math.max(value, minValue);
        priceRangeMax.value = value;
      }
      
      // Update the visual representation
      this.updatePriceRangeThumb(type);
      
      // Update filters
      this.onFilterChange();
    };
  }

  resetFilters() {
    // Reset all checkboxes
    const checkboxes = document.querySelectorAll('.filter-checkbox input, .color-filter input, .size-filter input');
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    
    // Reset price inputs and range sliders
    const minInput = document.getElementById('price-min');
    const maxInput = document.getElementById('price-max');
    const priceRangeMin = document.getElementById('price-range-min');
    const priceRangeMax = document.getElementById('price-range-max');
    
    if (minInput && maxInput && priceRangeMin && priceRangeMax) {
      minInput.value = 0;
      maxInput.value = 100000;
      priceRangeMin.value = 0;
      priceRangeMax.value = 100000;
      
      // Update visual slider
      this.updatePriceRangeSlider();
    }
    
    // Reset sort select
    const sortSelect = document.getElementById('sort');
    if (sortSelect) {
      sortSelect.value = 'popular';
    }
    
    // Reset view mode to grid
    this.viewMode = 'grid';
    this.updateViewMode();
    
    // Reset filters object
    this.filters = {
      category: [],
      price: { min: 0, max: 100000 },
      color: [],
      size: []
    };
    
    // Reset pagination
    this.currentPage = 1;
    
    // Reapply filters (which will now show all products)
    this.applyFilters();
  }
}

// Initialize catalog when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  window.catalogManager = new CatalogManager();
  console.log('SMB Catalog Manager initialized');
});