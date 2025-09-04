// ============================================================================
// SMB Website - Gift Cards JavaScript
// Functionality for gift cards page
// ============================================================================

(function() {
    'use strict';

    // ========================================================================
    // INITIALIZATION
    // ========================================================================

    document.addEventListener('DOMContentLoaded', function() {
        initializeGiftCards();
        initializeCustomAmountModal();
        initializeForm();
        
        console.log('SMB Gift Cards initialized');
    });

    // ========================================================================
    // GIFT CARDS FUNCTIONALITY
    // ========================================================================

    function initializeGiftCards() {
        const giftCardSelects = document.querySelectorAll('.gift-card__select');
        const customAmountBtn = document.getElementById('custom-amount-btn');
        const giftForm = document.getElementById('gift-form');
        const amountInput = document.getElementById('card-amount');

        // Handle gift card selection
        giftCardSelects.forEach(button => {
            button.addEventListener('click', function() {
                const amount = this.dataset.amount;
                selectGiftCard(amount);
            });
        });

        // Handle custom amount button
        if (customAmountBtn) {
            customAmountBtn.addEventListener('click', function() {
                showCustomAmountModal();
            });
        }

        function selectGiftCard(amount) {
            // Show the form
            if (giftForm) {
                giftForm.style.display = 'block';
                giftForm.scrollIntoView({ behavior: 'smooth' });
            }

            // Set the amount
            if (amountInput) {
                amountInput.value = amount;
            }

            // Update visual selection
            updateCardSelection(amount);
        }

        function updateCardSelection(amount) {
            const giftCards = document.querySelectorAll('.gift-card');
            
            giftCards.forEach(card => {
                card.classList.remove('gift-card--selected');
                if (card.dataset.amount === amount) {
                    card.classList.add('gift-card--selected');
                }
            });
        }
    }

    // ========================================================================
    // CUSTOM AMOUNT MODAL
    // ========================================================================

    function initializeCustomAmountModal() {
        const modal = document.getElementById('custom-amount-modal');
        const closeBtn = document.getElementById('close-modal');
        const confirmBtn = document.getElementById('confirm-custom-amount');
        const cancelBtn = document.getElementById('cancel-custom-amount');
        const customAmountInput = document.getElementById('custom-amount');
        const backdrop = modal?.querySelector('.modal__backdrop');

        // Close modal handlers
        [closeBtn, cancelBtn, backdrop].forEach(element => {
            if (element) {
                element.addEventListener('click', hideCustomAmountModal);
            }
        });

        // Confirm custom amount
        if (confirmBtn) {
            confirmBtn.addEventListener('click', function() {
                const amount = customAmountInput?.value;
                if (validateCustomAmount(amount)) {
                    selectCustomAmount(amount);
                    hideCustomAmountModal();
                }
            });
        }

        // Enter key confirmation
        if (customAmountInput) {
            customAmountInput.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    confirmBtn?.click();
                }
            });
        }

        // ESC key to close
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && modal?.style.display !== 'none') {
                hideCustomAmountModal();
            }
        });
    }

    function showCustomAmountModal() {
        const modal = document.getElementById('custom-amount-modal');
        const customAmountInput = document.getElementById('custom-amount');
        
        if (modal) {
            modal.style.display = 'block';
            customAmountInput?.focus();
        }
    }

    function hideCustomAmountModal() {
        const modal = document.getElementById('custom-amount-modal');
        const customAmountInput = document.getElementById('custom-amount');
        
        if (modal) {
            modal.style.display = 'none';
            customAmountInput.value = '';
        }
    }

    function validateCustomAmount(amount) {
        const numAmount = parseInt(amount);
        
        if (!amount || isNaN(numAmount)) {
            showMessage('Пожалуйста, введите корректную сумму', 'error');
            return false;
        }

        if (numAmount < 1000) {
            showMessage('Минимальная сумма подарочной карты: 1 000 ₽', 'error');
            return false;
        }

        if (numAmount > 100000) {
            showMessage('Максимальная сумма подарочной карты: 100 000 ₽', 'error');
            return false;
        }

        if (numAmount % 100 !== 0) {
            showMessage('Сумма должна быть кратна 100 рублям', 'error');
            return false;
        }

        return true;
    }

    function selectCustomAmount(amount) {
        const giftForm = document.getElementById('gift-form');
        const amountInput = document.getElementById('card-amount');
        
        // Show the form
        if (giftForm) {
            giftForm.style.display = 'block';
            giftForm.scrollIntoView({ behavior: 'smooth' });
        }

        // Set the amount
        if (amountInput) {
            amountInput.value = amount;
        }

        // Update visual selection
        updateCustomCardSelection();
        
        showMessage(`Выбрана сумма: ${parseInt(amount).toLocaleString('ru-RU')} ₽`, 'success');
    }

    function updateCustomCardSelection() {
        const giftCards = document.querySelectorAll('.gift-card');
        
        giftCards.forEach(card => {
            card.classList.remove('gift-card--selected');
        });

        const customCard = document.querySelector('.gift-card--custom');
        if (customCard) {
            customCard.classList.add('gift-card--selected');
        }
    }

    // ========================================================================
    // FORM FUNCTIONALITY
    // ========================================================================

    function initializeForm() {
        const form = document.getElementById('gift-card-form');
        const cancelBtn = document.getElementById('cancel-form');

        if (form) {
            form.addEventListener('submit', handleFormSubmit);
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', function() {
                hideForm();
                resetForm();
            });
        }
    }

    function handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const giftCardData = {
            amount: document.getElementById('card-amount')?.value,
            recipientName: document.getElementById('recipient-name')?.value,
            recipientEmail: document.getElementById('recipient-email')?.value,
            message: document.getElementById('gift-message')?.value,
            senderName: document.getElementById('sender-name')?.value,
            senderEmail: document.getElementById('sender-email')?.value
        };

        if (validateForm(giftCardData)) {
            processGiftCard(giftCardData);
        }
    }

    function validateForm(data) {
        const required = ['amount', 'recipientName', 'recipientEmail', 'senderName', 'senderEmail'];
        
        for (const field of required) {
            if (!data[field] || data[field].trim() === '') {
                showMessage('Пожалуйста, заполните все обязательные поля', 'error');
                return false;
            }
        }

        // Validate email formats
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.recipientEmail)) {
            showMessage('Неверный формат email получателя', 'error');
            return false;
        }

        if (!emailRegex.test(data.senderEmail)) {
            showMessage('Неверный формат вашего email', 'error');
            return false;
        }

        return true;
    }

    function processGiftCard(data) {
        // Show loading state
        const submitBtn = document.querySelector('button[type="submit"]');
        const originalText = submitBtn?.textContent;
        
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Обработка...';
        }

        // Simulate API call
        setTimeout(() => {
            // Reset button
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }

            // Show success message
            showMessage('Подарочная карта успешно оформлена! Проверьте email.', 'success');
            
            // Save to localStorage for demo
            saveGiftCardOrder(data);
            
            // Hide form and reset
            setTimeout(() => {
                hideForm();
                resetForm();
            }, 2000);
            
        }, 2000);
    }

    function saveGiftCardOrder(data) {
        try {
            let orders = JSON.parse(localStorage.getItem('smb-gift-cards') || '[]');
            
            const order = {
                id: 'GC-' + Date.now(),
                ...data,
                orderDate: new Date().toISOString(),
                status: 'processed'
            };
            
            orders.push(order);
            localStorage.setItem('smb-gift-cards', JSON.stringify(orders));
            
        } catch (error) {
            console.warn('Could not save gift card order:', error);
        }
    }

    function hideForm() {
        const giftForm = document.getElementById('gift-form');
        if (giftForm) {
            giftForm.style.display = 'none';
        }
    }

    function resetForm() {
        const form = document.getElementById('gift-card-form');
        const giftCards = document.querySelectorAll('.gift-card');
        
        if (form) {
            form.reset();
        }

        // Remove selection from all cards
        giftCards.forEach(card => {
            card.classList.remove('gift-card--selected');
        });
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
            animation: 'slideInRight 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxWidth: '350px'
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
        
        // Remove message after 4 seconds
        setTimeout(() => {
            message.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (message.parentNode) {
                    message.parentNode.removeChild(message);
                }
            }, 300);
        }, 4000);
    }

    // Add CSS animations if not already present
    if (!document.querySelector('#gift-cards-animations')) {
        const style = document.createElement('style');
        style.id = 'gift-cards-animations';
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }

            .gift-card--selected {
                transform: translateY(-8px);
                box-shadow: 0 12px 30px rgba(194, 224, 40, 0.3);
                border: 2px solid var(--green);
            }

            .form__group {
                position: relative;
            }

            .form__currency {
                position: absolute;
                right: 12px;
                top: 50%;
                transform: translateY(-50%);
                color: var(--gray-500);
                font-weight: 500;
                pointer-events: none;
            }
        `;
        document.head.appendChild(style);
    }

    // Make functions available globally for inline handlers
    window.showCustomAmountModal = showCustomAmountModal;
    window.hideCustomAmountModal = hideCustomAmountModal;

})();