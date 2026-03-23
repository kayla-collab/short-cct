/**
 * Shared Cart Functionality for Short Circuit
 * Used across product pages, shop page, and cart page
 * Maintains cart state in localStorage
 */

// Product catalog with regular prices (no pre-applied discounts)
const PRODUCT_CATALOG = {
    'smartwatch': {
        id: 'smartwatch',
        name: 'Smartwatch Project Kit',
        category: 'Embedded',
        price: 115.00,
        image: 'images/smartwatch-screens.png',
        link: 'smartwatch.html'
    },
    'ballbeam': {
        id: 'ballbeam',
        name: 'Ball and Beam Kit',
        category: 'Controls, Mechanical',
        price: 115.00,
        image: 'images/ballbeam-side.png',
        link: 'ballbeam.html'
    }
};

// Cart storage key
const CART_STORAGE_KEY = 'shortCircuitCart';

/**
 * Get current cart from localStorage
 */
function getCart() {
    try {
        return JSON.parse(localStorage.getItem(CART_STORAGE_KEY)) || [];
    } catch (e) {
        return [];
    }
}

/**
 * Save cart to localStorage
 */
function saveCart(cart) {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
}

/**
 * Add item to cart by product ID
 * @param {string} productId - The product ID (e.g., 'smartwatch', 'ballbeam')
 * @param {number} quantity - Quantity to add (default: 1)
 */
function addToCartById(productId, quantity = 1) {
    const product = PRODUCT_CATALOG[productId];
    if (!product) {
        console.error('Product not found:', productId);
        return false;
    }

    const cart = getCart();
    const existingItem = cart.find(item => item.id === productId);

    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            ...product,
            quantity: quantity
        });
    }

    saveCart(cart);
    updateCartCountDisplay();
    
    // Show toast notification with quantity
    showCartToast(`Added ${quantity} x ${product.name} to cart`, quantity);
    
    return true;
}

/**
 * Update quantity for cart item
 * @param {string} productId - The product ID
 * @param {number} newQuantity - New quantity
 */
function updateCartItemQuantity(productId, newQuantity) {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCart(cart);
            updateCartCountDisplay();
        }
    }
}

/**
 * Remove item from cart
 * @param {string} productId - The product ID to remove
 */
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartCountDisplay();
}

/**
 * Clear the entire cart
 */
function clearEntireCart() {
    localStorage.removeItem(CART_STORAGE_KEY);
    updateCartCountDisplay();
}

/**
 * Get total item count in cart
 */
function getCartItemCount() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + item.quantity, 0);
}

/**
 * Get cart subtotal (without discounts)
 */
function getCartSubtotal() {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

/**
 * Update cart count display on page
 */
function updateCartCountDisplay() {
    const count = getCartItemCount();
    const cartCountElements = document.querySelectorAll('#cartCount, .cart-count');
    
    cartCountElements.forEach(el => {
        el.textContent = count;
    });
}

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {number} quantity - Optional quantity to display
 */
function showCartToast(message, quantity) {
    // Try to find existing toast element
    let toast = document.getElementById('cartToast') || document.getElementById('toast');
    
    if (toast) {
        // Check if it's a complex cart-toast structure (product pages)
        const toastHeader = toast.querySelector('.cart-toast-header');
        const toastQuantity = document.getElementById('toastQuantity');
        
        if (toastHeader) {
            // Complex cart toast - just show it, update quantity if available
            if (toastQuantity && quantity) {
                toastQuantity.textContent = 'Qty: ' + quantity;
            }
        } else {
            // Simple toast - update text content
            const textContent = toast.querySelector('.toast-text') || toast;
            if (textContent.innerHTML !== undefined) {
                // Check if it has the check-icon structure
                if (toast.querySelector('.check-icon')) {
                    toast.innerHTML = '<span class="check-icon">OK</span> ' + message;
                } else {
                    textContent.textContent = message;
                }
            }
        }
        
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2500);
    } else {
        // No toast element found - create a simple one dynamically
        const newToast = document.createElement('div');
        newToast.id = 'dynamicToast';
        newToast.style.cssText = 'position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: #1a2332; color: white; padding: 15px 30px; border-radius: 8px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); z-index: 10001; transition: opacity 0.3s ease;';
        newToast.innerHTML = '<span style="color: #00ff88; margin-right: 8px;">&#10003;</span>' + message;
        document.body.appendChild(newToast);
        
        setTimeout(() => {
            newToast.style.opacity = '0';
            setTimeout(() => newToast.remove(), 300);
        }, 2500);
    }
}

/**
 * Proceed to Buy Now (direct checkout with single item)
 * @param {string} productId - The product ID
 * @param {number} quantity - Quantity to purchase
 */
async function buyNow(productId, quantity = 1) {
    const product = PRODUCT_CATALOG[productId];
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }

    // Create a temporary cart with just this item for checkout
    const items = [{ id: productId, quantity: quantity }];

    try {
        // Get promo code if applied
        const promoCode = sessionStorage.getItem('appliedPromoCode') || null;

        const response = await fetch('/api/checkout/create-session', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                items,
                promoCode
            }),
        });

        const data = await response.json();

        if (!response.ok) {
            if (data.details) {
                throw new Error(data.details.join(', '));
            }
            throw new Error(data.error || 'Failed to create checkout session');
        }

        // Redirect to Stripe Checkout
        if (data.url) {
            window.location.href = data.url;
        } else {
            throw new Error('No checkout URL received');
        }

    } catch (error) {
        console.error('Buy Now error:', error);
        alert(error.message || 'Checkout failed. Please try again.');
    }
}

// Initialize cart count on page load
document.addEventListener('DOMContentLoaded', function() {
    updateCartCountDisplay();
});

// Export functions for global use
window.addToCartById = addToCartById;
window.updateCartItemQuantity = updateCartItemQuantity;
window.removeFromCart = removeFromCart;
window.clearEntireCart = clearEntireCart;
window.getCart = getCart;
window.getCartItemCount = getCartItemCount;
window.getCartSubtotal = getCartSubtotal;
window.updateCartCountDisplay = updateCartCountDisplay;
window.showCartToast = showCartToast;
window.buyNow = buyNow;
window.PRODUCT_CATALOG = PRODUCT_CATALOG;
