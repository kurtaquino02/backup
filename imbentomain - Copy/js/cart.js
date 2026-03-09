// Shared Cart Logic

// Mock Initial Data (if empty)
const initialCart = [
    { id: 101, name: "Safety Wet Floor Sign", price: 700, image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400", qty: 1, subtitle: "Size: Standard" },
    { id: 102, name: "Herbal Muscle Balm", price: 450, image: "https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=400", qty: 2, subtitle: "Size: 50g" },
    { id: 103, name: "Solar-Powered Lamp", price: 950, image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", qty: 1, subtitle: "Model: Garden-X" }
];

// State
let cart = JSON.parse(localStorage.getItem('imbento-cart')) || initialCart;

// Save to LocalStorage
function saveCart() {
    localStorage.setItem('imbento-cart', JSON.stringify(cart));
    updateCartUI();
}

// Get Totals
function getCartTotals() {
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    return { count, subtotal };
}

// Update UI
function updateCartUI() {
    const totals = getCartTotals();
    
    // Update Badges
    document.querySelectorAll('.cart-badge, #cartCount, #cartCountHeader').forEach(el => {
        if(el) el.textContent = totals.count;
    });

    // Update Subtotal Display
    document.querySelectorAll('#cartSubtotal').forEach(el => {
        if(el) el.textContent = '₱' + totals.subtotal.toLocaleString();
    });

    // Render Sidebar Items
    const sidebarContainer = document.querySelector('#cartItemsContainer');
    if (sidebarContainer) {
        if (cart.length === 0) {
            sidebarContainer.innerHTML = '<div style="padding:20px;text-align:center;color:#888">Your cart is empty.</div>';
        } else {
            let html = '';
            // Show only first 4 items in sidebar if implied limit
            // But user asked for View All logic if > 4
            const displayItems = cart.slice(0, 4); 
            
            displayItems.forEach(item => {
                // Ensure image URL exists and is valid
                const imgUrl = item.image && item.image.startsWith('http') ? item.image : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400';
                html += `
                <div class="cart-item">
                    <div style="width:70px;height:70px;min-width:70px;background:#f9fafb;display:flex;align-items:center;justify-content:center;border-radius:8px;overflow:hidden">
                        <img src="${imgUrl}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;" onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'">
                    </div>
                    <div class="cart-item-details">
                        <a href="product.html?id=${item.id}" class="cart-item-title" style="text-decoration:none;color:inherit;">${item.name}</a>
                        <div class="cart-item-price">₱${item.price.toLocaleString()}</div>
                        <div class="cart-item-qty">
                            <button class="qty-btn" onclick="updateItemQty(${item.id}, -1)">-</button>
                            <span>${item.qty}</span>
                            <button class="qty-btn" onclick="updateItemQty(${item.id}, 1)">+</button>
                        </div>
                    </div>
                </div>
                `;
            });

            // View All Link
            if (cart.length > 4) {
                html += `<div class="view-all-cart" style="display:block"><a href="cart.html">View All ${cart.length} Products →</a></div>`;
            }

            sidebarContainer.innerHTML = html;
        }
    }

    // Render Cart Page Table (if on cart.html)
    if (window.location.pathname.includes('cart.html')) {
        renderCartPageTable();
    }
}

// Pagination State
let currentCartPage = 1;
const cartItemsPerPage = 6;

// Render Full Cart Page Table
function renderCartPageTable() {
    const tbody = document.querySelector('.cart-table tbody');
    if (!tbody) return;

    if (cart.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:40px">Your cart is empty. <a href="featuredproducts.html">Start Shopping</a></td></tr>';
        const pag = document.getElementById('cartPagination');
        if(pag) pag.remove();
        return;
    }

    // Pagination Logic
    const totalPages = Math.ceil(cart.length / cartItemsPerPage);
    if(currentCartPage > totalPages) currentCartPage = totalPages || 1;
    if(currentCartPage < 1) currentCartPage = 1;

    const start = (currentCartPage - 1) * cartItemsPerPage;
    const end = start + cartItemsPerPage;
    const itemsToShow = cart.slice(start, end);

    let html = '';
    itemsToShow.forEach(item => {
        const total = item.price * item.qty;
        const imgUrl = item.image && item.image.startsWith('http') ? item.image : 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400';
        html += `
        <tr>
            <td>
                <div class="cp-info">
                    <div class="cp-img"><img src="${imgUrl}" alt="${item.name}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" onerror="this.src='https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400'"></div>
                    <div>
                        <a href="product.html?id=${item.id}" class="cp-name" style="text-decoration:none;color:inherit;">${item.name}</a>
                        <small style="color:#888">${item.subtitle || ''}</small>
                    </div>
                </div>
            </td>
            <td class="cp-price">₱${item.price.toLocaleString()}</td>
            <td>
                <div class="cp-qty">
                    <button class="qty-btn" onclick="updateItemQty(${item.id}, -1)">-</button>
                    <span>${item.qty}</span>
                    <button class="qty-btn" onclick="updateItemQty(${item.id}, 1)">+</button>
                </div>
            </td>
            <td class="cp-price">₱${total.toLocaleString()}</td>
            <td><button class="close-cart" style="color:#d32f2f" onclick="removeFromCart(${item.id})">✕</button></td>
        </tr>
        `;
    });
    tbody.innerHTML = html;

    // Render Pagination Controls
    renderCartPagination(totalPages);

    // Update Summary Section on Cart Page
    const totals = getCartTotals();
    const summaryStart = document.querySelector('.cart-summary');
    
    // Update count in header
    const pageCountEl = document.getElementById('cartPageCount');
    if(pageCountEl) {
        pageCountEl.textContent = `You have ${totals.count} items in your cart`;
    }

    if(summaryStart) {
         const tEl = document.querySelector('.cs-total span:last-child');
         const sEl = document.querySelector('.cs-row span:last-child');
         if(tEl) tEl.textContent = '₱' + totals.subtotal.toLocaleString();
         if(sEl) sEl.textContent = '₱' + totals.subtotal.toLocaleString();
    }
}

function renderCartPagination(totalPages) {
    let pagContainer = document.getElementById('cartPagination');
    if(!pagContainer) {
        pagContainer = document.createElement('div');
        pagContainer.id = 'cartPagination';
        pagContainer.className = 'pagination-container';
        
        const table = document.querySelector('.cart-table');
        if(table && table.parentNode) table.parentNode.appendChild(pagContainer);
    }

    if(totalPages <= 1) {
        pagContainer.style.display = 'none';
        return;
    }
    pagContainer.style.display = ''; // Let CSS handle flex
    pagContainer.innerHTML = '';

    // Prev
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Previous';
    prevBtn.className = 'page-nav';
    prevBtn.disabled = currentCartPage === 1;
    prevBtn.onclick = () => changeCartPage(-1);
    pagContainer.appendChild(prevBtn);

    // Number Container
    const numContainer = document.createElement('div');
    numContainer.className = 'page-numbers';
    pagContainer.appendChild(numContainer);

    // Numbers
    for(let i=1; i<=totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `page-num ${i === currentCartPage ? 'active' : ''}`;
        
        btn.onclick = () => { currentCartPage = i; renderCartPageTable(); window.scrollTo({top:0, behavior:'smooth'}); };
        numContainer.appendChild(btn);
    }

    // Next
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.className = 'page-nav';
    nextBtn.disabled = currentCartPage === totalPages;
    nextBtn.onclick = () => changeCartPage(1);
    pagContainer.appendChild(nextBtn);
}

function changeCartPage(delta) {
    if(delta === -1 && currentCartPage <= 1) return;
    
    currentCartPage += delta;
    renderCartPageTable(); 
    window.scrollTo({top:0, behavior:'smooth'});
}

// Toggle Sidebar
function toggleCart() {
    const overlay = document.getElementById('cartOverlay');
    const sidebar = document.getElementById('cartSidebar');
    if (overlay && sidebar) {
        overlay.classList.toggle('open');
        sidebar.classList.toggle('open');
        document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
    }
}

// Update Qty
function updateItemQty(id, change) {
    const item = cart.find(i => i.id === id);
    if (!item) return;

    item.qty += change;
    if (item.qty <= 0) {
        removeFromCart(id); 
    } else {
        saveCart();
    }
}

// Remove Item
function removeFromCart(id) {
    cart = cart.filter(i => i.id !== id);
    saveCart();
}

// Add Item (Top-level function for other pages to call)
function addToCart(product, openSidebar = false) {
    let itemToAdd = product;

    // If called without product data (e.g. from onclick="addToCart()"), try to scrape context
    if (!itemToAdd || typeof itemToAdd !== 'object') {
        const event = window.event;
        if (event && event.target) {
            const card = event.target.closest('.feat-card') || event.target.closest('.spotlight-card') || event.target.closest('.bento-card');
            
            if (card) {
                // Scrape data from card
                let id = card.getAttribute('data-id') || Math.floor(Math.random() * 10000);
                let name = card.querySelector('.fc-name, .spotlight-name, .bc-name')?.textContent.trim() || 'Product';
                let priceText = card.querySelector('.fc-price, .spotlight-price, .bc-price')?.textContent.trim() || '0';
                let price = parseInt(priceText.replace(/[^\d]/g, '')) || 0;
                let image = card.querySelector('.fc-img, .spotlight-emoji, .bc-emoji')?.innerText.trim().substring(0,2) || '📦';
                
                itemToAdd = { id, name, price, image, qty: 1 };
            } else {
                 // Fallback Mock
                itemToAdd = {
                    id: Date.now(),
                    name: "Featured Product",
                    price: 500,
                    image: "📦",
                    qty: 1
                };
            }
        }
    }

    // Check if we found a valid product
    if (!itemToAdd) return;

    // Check existing
    const existing = cart.find(i => i.name === itemToAdd.name); // Using name as ID proxy if ID is random
    
    if (existing) {
        existing.qty++;
    } else {
        cart.push({ ...itemToAdd, qty: 1 });
    }
    
    saveCart();
    
    // Update Badge immediately
    const totalCount = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('.cart-badge, #cartCount, #cartCountHeader').forEach(el => {
        if(el) el.textContent = totalCount;
    });

    if(openSidebar) {
        toggleCart();
    } else {
        // Show Toast instead
        if(typeof showToast === 'function') {
            showToast('🛒 Added to Cart: ' + itemToAdd.name, 'success');
        } else {
            console.log('Added to cart:', itemToAdd.name);
        }
    }
}

// Apply Promo (Mock)
function applyPromo() {
    const input = document.getElementById('promoInput') || document.querySelector('.promo-box input');
    if(input && input.value) {
        alert('Promo code "' + input.value + '" applied! (Discount logic not implemented yet)');
    } else {
        alert('Please enter a promo code.');
    }
}

// Initialize on Load
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
});

// Global Toast Helper
if (typeof showToast !== 'function') {
    window.showToast = function(msg, type = 'success') {
        const toast = document.getElementById('toast');
        const icon = document.getElementById('toastIcon');
        const msgEl = document.getElementById('toastMsg');
        if (!toast) return;
        
        // Normalize type for compatibility
        if (type === 'green') type = 'success';
        if (type === 'red') type = 'error';
        
        if(icon) {
            icon.className = 'toast-icon ' + type;
            // Set icon and background based on type
            const typeConfig = {
                success: { icon: '✓', bg: '#10B981' },
                error: { icon: '✕', bg: '#ef4444' },
                warning: { icon: '⚠', bg: '#f59e0b' },
                info: { icon: 'ℹ', bg: '#3b82f6' },
                brand: { icon: '🛒', bg: 'var(--brand, #F43F5E)' }
            };
            const config = typeConfig[type] || typeConfig.success;
            icon.textContent = config.icon;
            icon.style.background = config.bg;
        }
        if(msgEl) msgEl.textContent = msg;
        
        toast.classList.add('show');
        clearTimeout(toast._t);
        toast._t = setTimeout(() => toast.classList.remove('show'), 2800);
    };
}
