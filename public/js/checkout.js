/**
 * Stripe Checkout Integration for Short Circuit
 * Handles secure payment processing via Stripe Checkout
 */

let stripe = null;
let isInitialized = false;

// Initialize Stripe with publishable key from server
async function initializeStripe() {
    if (isInitialized) return true;
    
    try {
        const response = await fetch('/api/config');
        if (!response.ok) {
            throw new Error('Failed to fetch Stripe config');
        }
        const config = await response.json();
        
        if (!config.publishableKey) {
            console.error('No publishable key in config');
            return false;
        }
        
        stripe = Stripe(config.publishableKey);
        isInitialized = true;
        console.log('Stripe initialized successfully');
        return true;
    } catch (error) {
        console.error('Failed to initialize Stripe:', error);
        return false;
    }
}

// Check inventory before checkout
async function checkInventory(items) {
    try {
        const response = await fetch('/api/inventory/check', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ items }),
        });
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Inventory check failed:', error);
        return { available: false, error: 'Failed to check inventory' };
    }
}

// Create checkout session and redirect to Stripe
async function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('shortCircuitCart')) || [];
    
    if (cart.length === 0) {
        showToast('Your cart is empty');
        return;
    }

    // Get checkout button and show loading state
    const checkoutBtn = document.querySelector('.checkout-btn');
    const originalText = checkoutBtn ? checkoutBtn.textContent : 'Proceed to Checkout';
    
    if (checkoutBtn) {
        checkoutBtn.textContent = 'Checking inventory...';
        checkoutBtn.disabled = true;
    }

    try {
        // Initialize Stripe if not already done
        const initialized = await initializeStripe();
        if (!initialized) {
            throw new Error('Failed to initialize payment system');
        }

        // Prepare items for API
        const items = cart.map(item => ({
            id: item.id,
            quantity: item.quantity,
        }));

        // Check inventory first
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Checking availability...';
        }
        
        const inventoryCheck = await checkInventory(items);
        
        if (!inventoryCheck.available) {
            // Show inventory issues
            const issues = inventoryCheck.items
                ?.filter(i => !i.available)
                .map(i => i.reason)
                .join(', ');
            
            throw new Error(issues || inventoryCheck.details?.join(', ') || 'Some items are unavailable');
        }

        // Create checkout session
        if (checkoutBtn) {
            checkoutBtn.textContent = 'Preparing checkout...';
        }

        // Get promo code if applied
        const promoCode = sessionStorage.getItem('appliedPromoCode') || null;

        const response = await fetch('/api/checkout/create-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                items,
                promoCode // Pass promo code to backend for Stripe
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            // Handle inventory or other errors
            if (data.details) {
                throw new Error(data.details.join(', '));
            }
            throw new Error(data.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        if (data.url) {
            // Clear cart before redirect (it will be restored if user cancels)
            const cartBackup = localStorage.getItem('shortCircuitCart');
            sessionStorage.setItem('shortCircuitCartBackup', cartBackup);
            localStorage.removeItem('shortCircuitCart');
            
            window.location.href = data.url;
        } else {
            throw new Error('No checkout URL received');
        }

    } catch (error) {
        console.error('Checkout error:', error);
        showToast(error.message || 'Checkout failed. Please try again.');
        
        if (checkoutBtn) {
            checkoutBtn.textContent = originalText;
            checkoutBtn.disabled = false;
        }
    }
}

// Show toast notification (uses existing toast element)
function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 3500);
    } else {
        alert(message);
    }
}

// Restore cart if checkout was cancelled
function restoreCartIfNeeded() {
    const backup = sessionStorage.getItem('shortCircuitCartBackup');
    const currentCart = localStorage.getItem('shortCircuitCart');
    
    // If we have a backup and no current cart, restore it
    if (backup && !currentCart) {
        localStorage.setItem('shortCircuitCart', backup);
        sessionStorage.removeItem('shortCircuitCartBackup');
        console.log('Cart restored from backup');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Pre-initialize Stripe for faster checkout
    initializeStripe();
    
    // Restore cart if user cancelled checkout
    restoreCartIfNeeded();
});

// Export for use in HTML
window.proceedToCheckout = proceedToCheckout;
window.initializeStripe = initializeStripe;
