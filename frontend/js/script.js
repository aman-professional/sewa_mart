// Sewa Mart Main Script

document.addEventListener('DOMContentLoaded', () => {
    const featuredContainer = document.getElementById('featured-products');
    if (featuredContainer) loadFeaturedProducts();
    updateCartIcon();
    checkLoginState();
});

function checkLoginState() {
    const token = localStorage.getItem('token');
    const loginLink = document.getElementById('login-link');
    if (!loginLink) return;

    if (token) {
        const roles = JSON.parse(localStorage.getItem('userRoles') || '[]');
        if (roles.includes('ADMIN')) {
            loginLink.innerHTML = '<i class="fas fa-user-shield"></i> Admin';
            loginLink.href = 'admin.html';
        } else {
            loginLink.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            loginLink.href = '#';
            loginLink.onclick = (e) => {
                e.preventDefault();
                localStorage.clear();
                location.reload();
            };
        }
    }
}


async function loadFeaturedProducts() {
    const featuredContainer = document.getElementById('featured-products');
    try {
        const response = await fetch('/api/products');
        const products = await response.json();

        if (products.length === 0) {
            featuredContainer.innerHTML = '<p>No products featured yet.</p>';
            return;
        }

        featuredContainer.innerHTML = products.slice(0, 4).map(product => `
            <div class="product-card animate-fade">
                <div class="product-image-container">
                    <img src="${product.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80'}" alt="${product.name}" class="product-image">
                </div>
                <div class="product-info">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <h3>${product.name}</h3>
                        <span style="background: #fff5f0; color: var(--primary-orange); padding: 4px 10px; border-radius: 50px; font-size: 0.75rem; font-weight: 700;">${product.category || 'Fresh'}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-top: auto;">
                        <p class="product-price">Rs. ${product.price}</p>
                        <button class="add-to-cart" onclick="addToCart('${product.id}', '${product.name}', ${product.price}, '${product.imageUrl}')">
                            <i class="fas fa-cart-plus"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading products:', error);
        featuredContainer.innerHTML = '<p>Error loading products. Please make sure the backend is running.</p>';
    }
}

function addToCart(id, name, price, imageUrl) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingIndex = cart.findIndex(item => item.id === id);

    if (existingIndex > -1) {
        cart[existingIndex].quantity += 1;
    } else {
        cart.push({ id, name, price, imageUrl, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartIcon();
    alert(`${name} added to cart!`);
}

function updateCartIcon() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartCountEl = document.getElementById('cart-count');
    if (cartCountEl) {
        cartCountEl.textContent = count;
    }
}
