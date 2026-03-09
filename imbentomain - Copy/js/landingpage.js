function addToCartWithModal(product) {
    // 1. Add to cart storage (Handles Toast internally if #toast exists)
    addToCart(product); 
    
    // 2. Modals are disabled in favor of Toasts for better UX
    // const modal = document.getElementById('addToCartModal');
    // if(modal) modal.classList.add('active');
}

function addToWishlistWithModal(product, btnElement) {
    // 1. Add to wishlist storage
    let wishlist = JSON.parse(localStorage.getItem('imbento-wishlist')) || [];

    // Enrich product with seller info from productsDB if available
    if (typeof productsDB !== 'undefined') {
        const dbProduct = productsDB.find(p => p.id === product.id);
        if (dbProduct && dbProduct.seller) {
            product.sellerName = dbProduct.seller.name;
            product.sellerLocation = dbProduct.seller.location || 'Philippines';
        }
    }

    // Check if already exists based on ID or Name to catch duplicates
    const exists = wishlist.some(p => p.id === product.id || p.name === product.name);
    
    if (!exists) {
        wishlist.push(product);
        localStorage.setItem('imbento-wishlist', JSON.stringify(wishlist));
        
        // Show Success Toast
        if (typeof showToast === 'function') {
            showToast('❤️ Added to Wishlist: ' + product.name, 'success');
        } else {
            // Fallback to Modal if toast not available
            const modal = document.getElementById('addToWishlistModal');
            if(modal) {
                modal.querySelector('h3').textContent = 'Added to Wishlist!';
                modal.querySelector('p').textContent = 'This item has been saved to your wishlist.';
                modal.classList.add('active');
            } else {
                alert('Added to Wishlist!');
            }
        }
    } else {
        // Show "Already Added" Toast
        if (typeof showToast === 'function') {
            showToast('⚠️ Already in Wishlist', 'warning');
        } else {
             // Fallback to Modal
            const modal = document.getElementById('addToWishlistModal');
            if(modal) {
                modal.querySelector('h3').textContent = 'Already in Wishlist';
                modal.querySelector('p').textContent = 'This item is already in your wishlist.';
                modal.classList.add('active');
            } else {
                alert('Already in Wishlist!');
            }
        }
    }

    // 2. Change Heart Icon Color (Visual feedback)
    if(btnElement) {
        btnElement.style.color = '#F43F5E';
        btnElement.style.borderColor = '#F43F5E';
        btnElement.style.backgroundColor = '#FFF1F2';
        btnElement.innerHTML = '❤️';
    }
}

function closeCartModal() {
    document.getElementById('addToCartModal').classList.remove('active');
}

function closeWishlistModal() {
    document.getElementById('addToWishlistModal').classList.remove('active');
}

// Close modal when clicking outside
const cartModal = document.getElementById('addToCartModal');
if(cartModal){
    cartModal.addEventListener('click', function(e) {
        if (e.target === this) closeCartModal();
    });
}

const wishlistModal = document.getElementById('addToWishlistModal');
if(wishlistModal){
    wishlistModal.addEventListener('click', function(e) {
        if (e.target === this) closeWishlistModal();
    });
}

function toggleCat() {
    const trigger = document.getElementById('catTrigger');
    const menu = document.getElementById('catMenu');
    trigger.classList.toggle('open');
    menu.classList.toggle('open');
}

function showPanel(id) {
    document.querySelectorAll('.cat-sidebar-item').forEach(el => el.classList.remove('active'));
    if(event && event.currentTarget) event.currentTarget.classList.add('active');
    document.querySelectorAll('.cat-panel').forEach(p => p.classList.remove('active'));
    document.getElementById('panel-' + id).classList.add('active');
}

document.addEventListener('click', function(e) {
    const wrap = document.querySelector('.cat-dropdown-wrap');
    if (wrap && !wrap.contains(e.target)) {
        const trigger = document.getElementById('catTrigger');
        const menu = document.getElementById('catMenu');
        if(trigger) trigger.classList.remove('open');
        if(menu) menu.classList.remove('open');
    }
});

// Check wishlist status on load to mark hearts
function checkWishlistStatus() {
    const wishlist = JSON.parse(localStorage.getItem('imbento-wishlist')) || [];
    // Create a Set of IDs for faster lookup
    const wishIds = new Set(wishlist.map(p => p.id));
    
    document.querySelectorAll('.wishlist-btn').forEach(btn => {
        const onclickAttr = btn.getAttribute('onclick');
        if (onclickAttr) {
            // Extract ID from the inline object in onclick
            // Format is usually: ... {id:1, name:...} ...
            const match = onclickAttr.match(/id\s*:\s*(\d+)/);
            if (match && match[1]) {
                const id = parseInt(match[1]);
                if (wishIds.has(id)) {
                    btn.style.color = '#F43F5E';
                    btn.style.borderColor = '#F43F5E';
                    btn.style.backgroundColor = '#FFF1F2';
                    btn.innerHTML = '❤️';
                } else {
                    // Reset if not in wishlist (for re-render scenarios)
                    btn.style.color = '';
                    btn.style.borderColor = '';
                    btn.style.backgroundColor = '';
                    btn.innerHTML = '♡';
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    checkWishlistStatus();
});
