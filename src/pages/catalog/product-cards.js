// ============================================================================
// SMB Website - Product Cards Functionality for Catalog
// JavaScript for product cards interactions in catalog page
// ============================================================================

(function() {
    'use strict';

    // ========================================================================
    // INITIALIZATION
    // ========================================================================
    
    document.addEventListener('DOMContentLoaded', function() {
        initializeProductCards();
        initializeAccessibility();
        
        console.log('SMB Product Cards initialized');
    });

    // ========================================================================
    // PRODUCT CARDS FUNCTIONALITY
    // ========================================================================
    
    function initializeProductCards() {
        // Initialize all product cards
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            setupCardHover(card);
            setupFavoriteButton(card);
            setupColorSelection(card);
        });
    }

    function setupCardHover(card) {
        const imageContainer = card.querySelector('.product-card__image-container');
        
        if (!imageContainer) return;

        card.addEventListener('mouseenter', function() {
            if (!card.classList.contains('product-card--loading') && 
                !card.classList.contains('product-card--unavailable')) {
                this.style.transform = 'translateY(-8px)';
                this.style.boxShadow = '0 15px 35px rgba(0, 0, 0, 0.15)';
            }
        });

        card.addEventListener('mouseleave', function() {
            this.style.transform = '';
            this.style.boxShadow = '';
        });
    }

    function setupFavoriteButton(card) {
        const favoriteBtn = card.querySelector('.product-card__favorite');
        
        if (!favoriteBtn || favoriteBtn.disabled) return;

        favoriteBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            const productId = this.dataset.productId;
            const isActive = this.classList.contains('product-card__favorite--active');
            
            toggleFavoriteState(this, !isActive);
            updateFavoriteStorage(productId, !isActive);
            
            // Animate the button
            this.style.transform = 'scale(1.2)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    }

    function toggleFavoriteState(button, isActive) {
        const img = button.querySelector('img');
        
        if (isActive) {
            button.classList.add('product-card__favorite--active');
            button.setAttribute('aria-label', 'Remove from favorites');
            img.src = '../assets/icons/favorite-filled.svg';
            img.width = 24;
            img.height = 22;
        } else {
            button.classList.remove('product-card__favorite--active');
            button.setAttribute('aria-label', 'Add to favorites');
            img.src = '../assets/icons/favorite-icon.svg';
            img.width = 20;
            img.height = 18;
        }
    }

    function updateFavoriteStorage(productId, isActive) {
        try {
            let favorites = JSON.parse(localStorage.getItem('smb-favorites') || '[]');
            
            if (isActive) {
                if (!favorites.includes(productId)) {
                    favorites.push(productId);
                }
            } else {
                favorites = favorites.filter(id => id !== productId);
            }
            
            localStorage.setItem('smb-favorites', JSON.stringify(favorites));
            
            // Dispatch custom event
            window.dispatchEvent(new CustomEvent('favoritesUpdated', {
                detail: { productId, isActive, totalCount: favorites.length }
            }));
            
        } catch (error) {
            console.warn('Could not update favorites in localStorage:', error);
        }
    }

    function setupColorSelection(card) {
        const colorButtons = card.querySelectorAll('.product-card__color');
        
        colorButtons.forEach(button => {
            if (button.disabled) return;
            
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                e.preventDefault();
                
                // Remove selection from siblings
                colorButtons.forEach(btn => {
                    btn.classList.remove('product-card__color--selected');
                });
                
                // Add selection to current
                this.classList.add('product-card__color--selected');
                
                // Animate the selection
                this.style.transform = 'scale(1.5)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 200);
                
                const color = this.dataset.color || this.getAttribute('aria-label')?.replace('Select ', '')?.replace(' color', '');
                console.log(`Color selected: ${color}`);
            });
        });
    }

    // ========================================================================
    // ACCESSIBILITY ENHANCEMENTS
    // ========================================================================
    
    function initializeAccessibility() {
        // Keyboard navigation for product cards
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            // Make cards focusable
            card.setAttribute('tabindex', '0');
            
            card.addEventListener('keydown', function(e) {
                // Enter or Space to navigate to product
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    const link = this.querySelector('.product-card__title a');
                    if (link) {
                        link.click();
                    }
                }
                
                // F key to toggle favorite
                if (e.key === 'f' || e.key === 'F') {
                    e.preventDefault();
                    const favoriteBtn = this.querySelector('.product-card__favorite');
                    if (favoriteBtn && !favoriteBtn.disabled) {
                        favoriteBtn.click();
                    }
                }
            });
            
            // Add focus styles
            card.addEventListener('focus', function() {
                this.style.outline = '2px solid var(--green-dark)';
                this.style.outlineOffset = '2px';
            });
            
            card.addEventListener('blur', function() {
                this.style.outline = '';
                this.style.outlineOffset = '';
            });
        });

        // Announce updates to screen readers
        window.addEventListener('favoritesUpdated', function(e) {
            announceToScreenReader(
                `Product ${e.detail.isActive ? 'added to' : 'removed from'} favorites. 
                 Total favorites: ${e.detail.totalCount}`
            );
        });
    }

    function announceToScreenReader(message) {
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', 'polite');
        announcement.setAttribute('aria-atomic', 'true');
        announcement.style.position = 'absolute';
        announcement.style.left = '-10000px';
        announcement.style.width = '1px';
        announcement.style.height = '1px';
        announcement.style.overflow = 'hidden';
        
        document.body.appendChild(announcement);
        
        // Delay to ensure screen readers pick it up
        setTimeout(() => {
            announcement.textContent = message;
        }, 100);
        
        // Clean up after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 3000);
    }

    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================
    
    function loadFavoritesFromStorage() {
        try {
            const favorites = JSON.parse(localStorage.getItem('smb-favorites') || '[]');
            
            favorites.forEach(productId => {
                const favoriteBtn = document.querySelector(`[data-product-id="${productId}"] .product-card__favorite`);
                if (favoriteBtn) {
                    toggleFavoriteState(favoriteBtn, true);
                }
            });
            
            console.log(`Loaded ${favorites.length} favorites from storage`);
        } catch (error) {
            console.warn('Could not load favorites from localStorage:', error);
        }
    }

    // Load favorites when page loads
    document.addEventListener('DOMContentLoaded', loadFavoritesFromStorage);

})();