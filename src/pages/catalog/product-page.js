// ============================================================================
// SMB Website - Product Page JavaScript
// Functionality for product detail page
// ============================================================================

(function() {
    'use strict';

    // Product data from Figma
    const products = {
        'mini-rosa-1': {
            name: 'MINI ROSA',
            price: '29 000 ₽',
            originalPrice: null,
            sku: 'MR-001',
            description: 'Элегантная сумка MINI ROSA воплощает в себе современный стиль и функциональность. Изготовлена из высококачественной кожи с тщательной обработкой каждой детали. Компактный размер идеально подходит для повседневного использования.',
            images: ['../assets/images/product-1.png'],
            colors: ['brown', 'tan', 'black', 'light-gray']
        },
        'mini-rosa-basic': {
            name: 'MINI ROSA',
            price: '29 000 ₽',
            originalPrice: null,
            sku: 'MR-001',
            description: 'Элегантная сумка MINI ROSA воплощает в себе современный стиль и функциональность. Изготовлена из высококачественной кожи с тщательной обработкой каждой детали. Компактный размер идеально подходит для повседневного использования.',
            images: ['../assets/images/product-1.png'],
            colors: ['brown', 'tan', 'black', 'light-gray']
        },
        'mini-rosa-sale': {
            name: 'MINI ROSA',
            price: '21 000 ₽',
            originalPrice: '29 000 ₽',
            sku: 'MR-002',
            description: 'Специальное предложение! Элегантная сумка MINI ROSA с отличной скидкой. Изготовлена из высококачественной кожи с тщательной обработкой каждой детали.',
            images: ['../assets/images/product-1.png'],
            colors: ['brown', 'tan', 'black', 'light-gray']
        },
        'moss-favorited': {
            name: 'MOSS',
            price: '35 000 ₽',
            originalPrice: null,
            sku: 'MS-001',
            description: 'Сумка MOSS - это воплощение природной элегантности и городского стиля. Уникальная текстура и продуманные детали делают её незаменимым спутником в любой ситуации.',
            images: ['../assets/images/product-moss-15277b.png'],
            colors: ['brown', 'black']
        },
        'classic-bag': {
            name: 'CLASSIC BAG',
            price: '42 000 ₽',
            originalPrice: null,
            sku: 'CB-001',
            description: 'Классическая сумка, которая никогда не выйдет из моды. Строгие линии и высококачественные материалы создают образ успешного и стильного человека.',
            images: ['../assets/images/product-3.png'],
            colors: ['black', 'brown']
        },
        'new-mini-rosa-1': {
            name: 'MINI ROSA',
            price: '21 000 ₽',
            originalPrice: '29 000 ₽',
            sku: 'MR-002',
            description: 'Новая коллекция! Элегантная сумка MINI ROSA по специальной цене. Изготовлена из высококачественной кожи с тщательной обработкой каждой детали.',
            images: ['../assets/images/product-1.png'],
            colors: ['brown', 'tan', 'black', 'light-gray'],
            badge: 'NEW'
        }
    };

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    document.addEventListener('DOMContentLoaded', function() {
        initializeProductPage();
        initializeGallery();
        initializeQuantityControl();
        initializeColorSelection();
        initializeActions();
        loadProductFromURL();
        
        console.log('SMB Product Page initialized');
    });

    // ========================================================================
    // PRODUCT PAGE SETUP
    // ========================================================================

    function initializeProductPage() {
        setupFavoriteButton();
        setupThumbnailNavigation();
    }

    function setupFavoriteButton() {
        const favoriteBtn = document.querySelector('.product-gallery__favorite');
        
        if (favoriteBtn) {
            favoriteBtn.addEventListener('click', function() {
                const isActive = this.classList.contains('product-gallery__favorite--active');
                toggleFavoriteState(this, !isActive);
                
                // Get product ID from URL or default
                const urlParams = new URLSearchParams(window.location.search);
                const productId = urlParams.get('id') || 'mini-rosa-basic';
                updateFavoriteStorage(productId, !isActive);
            });
        }
    }

    function toggleFavoriteState(button, isActive) {
        const img = button.querySelector('img');
        
        if (isActive) {
            button.classList.add('product-gallery__favorite--active');
            button.setAttribute('aria-label', 'Remove from favorites');
            img.src = '../assets/icons/favorite-filled.svg';
        } else {
            button.classList.remove('product-gallery__favorite--active');
            button.setAttribute('aria-label', 'Add to favorites');
            img.src = '../assets/icons/favorite-icon.svg';
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
            
            window.dispatchEvent(new CustomEvent('favoritesUpdated', {
                detail: { productId, isActive, totalCount: favorites.length }
            }));
            
        } catch (error) {
            console.warn('Could not update favorites:', error);
        }
    }

    // ========================================================================
    // GALLERY FUNCTIONALITY
    // ========================================================================

    function initializeGallery() {
        setupThumbnailNavigation();
        setupImageZoom();
    }

    function setupThumbnailNavigation() {
        const thumbnails = document.querySelectorAll('.product-gallery__thumbnail');
        const mainImage = document.getElementById('main-image');
        
        thumbnails.forEach(thumbnail => {
            thumbnail.addEventListener('click', function() {
                const imageUrl = this.dataset.image;
                
                if (mainImage && imageUrl) {
                    mainImage.src = imageUrl;
                    
                    // Update active thumbnail
                    thumbnails.forEach(t => t.classList.remove('product-gallery__thumbnail--active'));
                    this.classList.add('product-gallery__thumbnail--active');
                }
            });
        });
    }

    function setupImageZoom() {
        const mainImage = document.getElementById('main-image');
        
        if (mainImage) {
            mainImage.addEventListener('click', function() {
                // Simple zoom implementation - can be enhanced
                if (this.style.transform === 'scale(1.5)') {
                    this.style.transform = 'scale(1)';
                    this.style.cursor = 'zoom-in';
                } else {
                    this.style.transform = 'scale(1.5)';
                    this.style.cursor = 'zoom-out';
                }
            });
        }
    }

    // ========================================================================
    // QUANTITY CONTROL
    // ========================================================================

    function initializeQuantityControl() {
        const decreaseBtn = document.querySelector('[data-action="decrease"]');
        const increaseBtn = document.querySelector('[data-action="increase"]');
        const quantityInput = document.getElementById('quantity');

        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', function() {
                const currentValue = parseInt(quantityInput.value);
                if (currentValue > 1) {
                    quantityInput.value = currentValue - 1;
                    updateQuantity(currentValue - 1);
                }
            });
        }

        if (increaseBtn) {
            increaseBtn.addEventListener('click', function() {
                const currentValue = parseInt(quantityInput.value);
                const maxValue = parseInt(quantityInput.max) || 10;
                if (currentValue < maxValue) {
                    quantityInput.value = currentValue + 1;
                    updateQuantity(currentValue + 1);
                }
            });
        }

        if (quantityInput) {
            quantityInput.addEventListener('change', function() {
                const value = parseInt(this.value);
                const min = parseInt(this.min) || 1;
                const max = parseInt(this.max) || 10;
                
                if (value < min) this.value = min;
                if (value > max) this.value = max;
                
                updateQuantity(parseInt(this.value));
            });
        }
    }

    function updateQuantity(quantity) {
        console.log(`Quantity updated to: ${quantity}`);
        // Here you could update total price, etc.
    }

    // ========================================================================
    // COLOR SELECTION
    // ========================================================================

    function initializeColorSelection() {
        const colorButtons = document.querySelectorAll('.product-detail__color');
        
        colorButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all colors
                colorButtons.forEach(btn => {
                    btn.classList.remove('product-detail__color--active');
                });
                
                // Add active class to clicked color
                this.classList.add('product-detail__color--active');
                
                const color = this.dataset.color;
                console.log(`Color selected: ${color}`);
                
                // Here you could update product images based on color
                updateProductImages(color);
            });
        });
    }

    function updateProductImages(color) {
        // This is where you'd update product images based on selected color
        // For demo purposes, we'll just log the selection
        console.log(`Updating product images for color: ${color}`);
    }

    // ========================================================================
    // ACTION BUTTONS
    // ========================================================================

    function initializeActions() {
        const addToCartBtn = document.querySelector('.product-detail__add-to-cart');
        const buyNowBtn = document.querySelector('.product-detail__buy-now');

        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', function() {
                const productData = getCurrentProductData();
                addToCart(productData);
            });
        }

        if (buyNowBtn) {
            buyNowBtn.addEventListener('click', function() {
                const productData = getCurrentProductData();
                buyNow(productData);
            });
        }
    }

    function getCurrentProductData() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id') || 'mini-rosa-basic';
        const quantity = parseInt(document.getElementById('quantity')?.value || '1');
        const selectedColor = document.querySelector('.product-detail__color--active')?.dataset.color || 'brown';
        
        return {
            id: productId,
            name: document.getElementById('product-title')?.textContent || 'Product',
            price: document.getElementById('current-price')?.textContent || '0 ₽',
            quantity,
            color: selectedColor,
            image: document.getElementById('main-image')?.src || ''
        };
    }

    function addToCart(productData) {
        try {
            let cart = JSON.parse(localStorage.getItem('smb-cart') || '[]');
            
            // Check if product already exists in cart
            const existingIndex = cart.findIndex(item => 
                item.id === productData.id && item.color === productData.color
            );
            
            if (existingIndex >= 0) {
                cart[existingIndex].quantity += productData.quantity;
            } else {
                cart.push(productData);
            }
            
            localStorage.setItem('smb-cart', JSON.stringify(cart));
            
            // Show success message
            showMessage(`${productData.name} добавлен в корзину`, 'success');
            
            // Dispatch event for cart updates
            window.dispatchEvent(new CustomEvent('cartUpdated', {
                detail: { cart, totalItems: cart.reduce((sum, item) => sum + item.quantity, 0) }
            }));
            
        } catch (error) {
            console.error('Error adding to cart:', error);
            showMessage('Ошибка при добавлении в корзину', 'error');
        }
    }

    function buyNow(productData) {
        // For demo purposes, we'll just add to cart and redirect
        addToCart(productData);
        
        // In a real app, this would redirect to checkout
        setTimeout(() => {
            showMessage('Перенаправление на страницу оформления заказа...', 'info');
            // window.location.href = '../shop/checkout.html';
        }, 1000);
    }

    // ========================================================================
    // URL-BASED PRODUCT LOADING
    // ========================================================================

    function loadProductFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const productId = urlParams.get('id');
        
        if (productId && products[productId]) {
            loadProduct(products[productId], productId);
        } else {
            // Load default product
            loadProduct(products['mini-rosa-basic'], 'mini-rosa-basic');
        }
        
        // Load favorite state
        loadFavoriteState(productId || 'mini-rosa-basic');
    }

    function loadProduct(product, productId) {
        // Update product info
        const titleElement = document.getElementById('product-title');
        const nameElement = document.getElementById('product-name');
        const priceElement = document.getElementById('current-price');
        const originalPriceElement = document.getElementById('original-price');
        const descriptionElement = document.getElementById('product-description');
        const mainImage = document.getElementById('main-image');

        if (titleElement) titleElement.textContent = product.name;
        if (nameElement) nameElement.textContent = product.name;
        if (priceElement) priceElement.textContent = product.price;
        if (descriptionElement) descriptionElement.textContent = product.description;
        if (mainImage && product.images[0]) mainImage.src = product.images[0];

        if (originalPriceElement) {
            if (product.originalPrice) {
                originalPriceElement.textContent = product.originalPrice;
                originalPriceElement.style.display = 'inline';
            } else {
                originalPriceElement.style.display = 'none';
            }
        }

        // Update available colors
        updateAvailableColors(product.colors);
        
        // Update page title
        document.title = `${product.name} - SMB`;
    }

    function updateAvailableColors(availableColors) {
        const colorButtons = document.querySelectorAll('.product-detail__color');
        
        colorButtons.forEach(button => {
            const color = button.dataset.color;
            if (availableColors.includes(color)) {
                button.style.display = 'block';
                button.disabled = false;
            } else {
                button.style.display = 'none';
                button.disabled = true;
            }
        });
        
        // Set first available color as active
        if (availableColors.length > 0) {
            const firstAvailableBtn = document.querySelector(`[data-color="${availableColors[0]}"]`);
            if (firstAvailableBtn) {
                firstAvailableBtn.classList.add('product-detail__color--active');
            }
        }
    }

    function loadFavoriteState(productId) {
        try {
            const favorites = JSON.parse(localStorage.getItem('smb-favorites') || '[]');
            const favoriteBtn = document.querySelector('.product-gallery__favorite');
            
            if (favoriteBtn && favorites.includes(productId)) {
                toggleFavoriteState(favoriteBtn, true);
            }
        } catch (error) {
            console.warn('Could not load favorite state:', error);
        }
    }

    // ========================================================================
    // UTILITY FUNCTIONS
    // ========================================================================

    function showMessage(text, type = 'info') {
        // Create message element
        const message = document.createElement('div');
        message.className = `message message--${type}`;
        message.textContent = text;
        
        // Style the message
        Object.assign(message.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            zIndex: '9999',
            animation: 'slideIn 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
        });
        
        // Set colors based on type
        if (type === 'success') {
            message.style.backgroundColor = '#C2E028';
            message.style.color = '#272727';
        } else if (type === 'error') {
            message.style.backgroundColor = '#ff4444';
            message.style.color = '#ffffff';
        } else {
            message.style.backgroundColor = '#272727';
            message.style.color = '#ffffff';
        }
        
        document.body.appendChild(message);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 3000);
    }

    // Add CSS animations
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);

})();