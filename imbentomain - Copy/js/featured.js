// Functions for Features page
function wishItem(btn, product){
    // Determine current state based on button text
    const isWishlisted = btn.textContent === '❤️';
    
    // Get current wishlist from storage (using wishlist-data.js helper if available, or fallback)
    let wishlist = [];
    if (typeof getWishlist === 'function') {
        wishlist = getWishlist();
    } else {
        // Fallback if wishlist-data.js not loaded
        try {
            wishlist = JSON.parse(localStorage.getItem('imbento-wishlist')) || [];
        } catch(e) { wishlist = []; }
    }

    if (isWishlisted) {
        // Remove item
        wishlist = wishlist.filter(item => item.id !== product.id);
        btn.textContent = '♡';
        showToast('❤️ Removed from wishlist', 'error');
    } else {
        // Add item if not already present
        if (!wishlist.some(item => item.id === product.id)) {
            wishlist.push(product);
        }
        btn.textContent = '❤️';
        showToast('❤️ Saved to wishlist!', 'success');
    }
    
    // Save back to storage
    localStorage.setItem('imbento-wishlist', JSON.stringify(wishlist));
    
    // Update header count if available
    updateWishlistCount(wishlist.length);
}

function updateWishlistCount(count) {
    // Optional: update a wishlist counter in header if it exists
    const badge = document.getElementById('wishlist-count');
    if (badge) {
        badge.textContent = count;
        badge.style.display = count > 0 ? 'flex' : 'none';
    }
}

function showToast(msg, type = 'success') {
    const t = document.getElementById('toast');
    const ic = document.getElementById('toastIcon');
    const msgEl = document.getElementById('toastMsg');
    if (!t) return;
    
    // Normalize type for compatibility
    if (type === 'green') type = 'success';
    if (type === 'red') type = 'error';
    
    if (ic) {
        const typeConfig = {
            success: { icon: '✓', bg: 'var(--green, #10B981)' },
            error: { icon: '✕', bg: 'var(--red, #ef4444)' },
            warning: { icon: '⚠', bg: '#f59e0b' },
            info: { icon: 'ℹ', bg: '#3b82f6' },
            brand: { icon: '❤️', bg: 'var(--brand, #F43F5E)' }
        };
        const config = typeConfig[type] || typeConfig.success;
        ic.textContent = config.icon;
        ic.style.background = config.bg;
    }
    if (msgEl) msgEl.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), 2800);
}

// Initialize wishlist state on load
document.addEventListener('DOMContentLoaded', () => {
    try {
        const wishlist = JSON.parse(localStorage.getItem('imbento-wishlist') || '[]');
        const buttons = document.querySelectorAll('button[onclick^="wishItem"]');
        
        buttons.forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            const match = onclick.match(/id:\s*(\d+)/);
            if (match && match[1]) {
                const id = parseInt(match[1]);
                if (wishlist.some(item => item.id === id)) {
                    btn.textContent = '❤️';
                }
            }
        });
        updateWishlistCount(wishlist.length);
    } catch(e) { console.error('Error syncing wishlist state', e); }
});

function copyCode(){
    showToast('✅ Promo code PINOY2026 copied!', 'success');
}

// Countdown to midnight
function getMidnightCountdown() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(23, 59, 59, 999);
    return Math.max(0, Math.floor((midnight - now) / 1000));
}

let total = getMidnightCountdown();
function tick(){
    if(total <= 0) {
        total = getMidnightCountdown();
        if(total <= 0) total = 24 * 3600; // Reset to 24 hours if exactly midnight
    }
    total--;
    const h=Math.floor(total/3600);
    const m=Math.floor((total%3600)/60);
    const s=total%60;
    const elH = document.getElementById('cdH');
    const elM = document.getElementById('cdM');
    const elS = document.getElementById('cdS');
    if(elH) elH.textContent=String(h).padStart(2,'0');
    if(elM) elM.textContent=String(m).padStart(2,'0');
    if(elS) elS.textContent=String(s).padStart(2,'0');
}
tick(); // Initialize immediately
setInterval(tick,1000);

document.querySelectorAll('.cat-chip').forEach(chip=>{
    chip.addEventListener('click',function(e){
        e.preventDefault(); // Prevent jump
        
        // UI Toggle
        document.querySelectorAll('.cat-chip').forEach(c=>c.classList.remove('active'));
        this.classList.add('active');

        // Filtering Logic
        const filter = this.getAttribute('data-filter');
        if (!filter) return; // Guard

        const products = document.querySelectorAll('.feat-grid .feat-card');
        let count = 0;
        
        products.forEach(p => {
            const cat = p.getAttribute('data-category');
            // Check if matches filter (or show all)
            if (filter === 'all' || cat === filter) {
                p.style.display = ''; // Show
                count++;
            } else {
                p.style.display = 'none'; // Hide
            }
        });

        // Optional: Show message if no items found
        if(count === 0) showToast(`No products found for ${this.textContent.trim()}`, 'warning');
    });
});

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
    const panel = document.getElementById('panel-' + id);
    if(panel) panel.classList.add('active');
}

document.addEventListener('click', function(e) {
    const wrap = document.querySelector('.cat-dropdown-wrap');
    if (wrap && !wrap.contains(e.target)) {
        const trigger = document.getElementById('catTrigger');
        const menu = document.getElementById('catMenu');
        if (trigger) trigger.classList.remove('open');
        if (menu) menu.classList.remove('open');
    }
});
