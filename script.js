// --- Product Data ---
const products = [
    {
        id: 1,
        name: "Wireless Mouse",
        price: 9,
        image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=500&q=80"
    },
    {
        id: 2,
        name: "Mechanical Keyboard",
        price: 199,
        image: "https://images.unsplash.com/photo-1595225476474-87563907a212?w=500&q=80"
    },
    {
        id: 3,
        name: "Headphones",
        price: 15,
        image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&q=80"
    },
    {
        id: 4,
        name: "USB Hub",
        price: 399,
        image: "https://images.unsplash.com/photo-1616423640778-28d1b53229bd?w=500&q=80"
    },
    {
        id: 5,
        name: "Webcam",
        price: 1299,
        image: "https://images.unsplash.com/photo-1588600878108-578307a3cc9d?w=500&q=80"
    },
    {
        id: 6,
        name: "Laptop Stand",
        price: 799,
        image: "https://images.unsplash.com/photo-1621252179027-94459d278660?w=500&q=80"
    }
];

// --- State ---
let cart = []; // Array of objects: { id, quantity }

// --- DOM Elements ---
const productGrid = document.getElementById('product-grid');
const cartIcon = document.getElementById('cart-icon');
const cartOverlay = document.getElementById('cart-overlay');
const cartPanel = document.getElementById('cart-panel');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsContainer = document.getElementById('cart-items');
const emptyCartMessage = document.getElementById('empty-cart');
const cartCountElem = document.getElementById('cart-count');
const totalItemsElem = document.getElementById('total-items-count');
const grandTotalElem = document.getElementById('grand-total');
const checkoutBtn = document.getElementById('checkout-btn');

// --- Initialization ---
function init() {
    renderProducts();
    updateCartUI();
}

// --- Render Products ---
function renderProducts() {
    productGrid.innerHTML = '';
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">₹${product.price}</div>
                <button class="add-to-cart-btn" onclick="addToCart(${product.id})">Add to Cart</button>
            </div>
        `;
        productGrid.appendChild(card);
    });
}

// --- Cart Logic ---
function addToCart(productId) {
    const existingItem = cart.find(item => item.id === productId);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }
    
    const product = products.find(p => p.id === productId);
    showToast(`${product.name} added to cart!`);
    updateCartUI();
    openCart();
}

function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            updateCartUI();
        }
    }
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    updateCartUI();
}

// --- UI Updates ---
function updateCartUI() {
    // Clear current items (except the empty state message)
    const itemsHTML = Array.from(cartItemsContainer.children).filter(el => el.id !== 'empty-cart');
    itemsHTML.forEach(el => el.remove());

    let totalItems = 0;
    let grandTotal = 0;

    if (cart.length === 0) {
        emptyCartMessage.classList.add('active');
        checkoutBtn.style.opacity = '0.5';
        checkoutBtn.style.pointerEvents = 'none';
    } else {
        emptyCartMessage.classList.remove('active');
        checkoutBtn.style.opacity = '1';
        checkoutBtn.style.pointerEvents = 'auto';

        cart.forEach(cartItem => {
            const product = products.find(p => p.id === cartItem.id);
            const subtotal = product.price * cartItem.quantity;
            totalItems += cartItem.quantity;
            grandTotal += subtotal;

            const itemElem = document.createElement('div');
            itemElem.className = 'cart-item';
            itemElem.innerHTML = `
                <img src="${product.image}" alt="${product.name}">
                <div class="item-details">
                    <div class="item-name">${product.name}</div>
                    <div class="item-price">₹${product.price}</div>
                    <div class="item-actions">
                        <button class="qty-btn" onclick="updateQuantity(${product.id}, -1)">-</button>
                        <span class="item-qty">${cartItem.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${product.id}, 1)">+</button>
                    </div>
                </div>
                <div class="item-subtotal" style="font-weight: 600; font-size: 0.9rem;">₹${subtotal}</div>
                <button class="remove-btn" onclick="removeFromCart(${product.id})"><i class='bx bx-trash'></i></button>
            `;
            cartItemsContainer.appendChild(itemElem);
        });
    }

    // Update Headers and Summaries
    cartCountElem.textContent = totalItems;
    totalItemsElem.textContent = totalItems;
    grandTotalElem.textContent = `₹${grandTotal}`;
    
    // Store total amount globally for Razorpay
    window.cartTotalAmount = grandTotal;
}

// --- Cart Toggle ---
function openCart() {
    cartOverlay.classList.add('active');
    cartPanel.classList.add('active');
}

function closeCart() {
    cartOverlay.classList.remove('active');
    cartPanel.classList.remove('active');
}

cartIcon.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

// --- Toast Notifications ---
function showToast(message) {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<i class='bx bx-check-circle' style="color: var(--primary); font-size: 1.2rem;"></i> ${message}`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'fadeOut 0.3s forwards';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// --- Modals Logic ---
function showSuccessModal(paymentId, amount) {
    document.getElementById('success-payment-id').textContent = paymentId;
    document.getElementById('success-amount').textContent = amount;
    document.getElementById('success-modal').classList.add('active');
    
    // Clear cart on success
    cart = [];
    updateCartUI();
    closeCart();
}

function showFailureModal(reason) {
    document.getElementById('failure-reason').textContent = reason || "Payment failed or was cancelled.";
    document.getElementById('failure-modal').classList.add('active');
}

function closeModals() {
    document.getElementById('success-modal').classList.remove('active');
    document.getElementById('failure-modal').classList.remove('active');
}

// --- Razorpay Integration ---
const razorpayKey = "rzp_live_SwfxXe135PO694";

function startPayment() {
    if (cart.length === 0) return;

    // Show loading state on button
    const checkoutText = document.getElementById('checkout-text');
    const loader = document.getElementById('checkout-loader');
    checkoutText.style.display = 'none';
    loader.style.display = 'block';

    const totalInPaise = window.cartTotalAmount * 100;

    var options = {
        "key": razorpayKey, 
        "amount": totalInPaise, 
        "currency": "INR",
        "name": "TechStore Demo",
        "description": "Test Transaction for E-commerce Setup",
        "image": "https://cdn-icons-png.flaticon.com/512/8146/8146003.png", // Sample Store Icon
        "handler": function (response) {
            // Revert Button
            checkoutText.style.display = 'block';
            loader.style.display = 'none';
            // Show Success
            showSuccessModal(response.razorpay_payment_id, window.cartTotalAmount);
        },
        "prefill": {
            "name": "Test Customer",
            "email": "test@example.com",
            "contact": "9876543210"
        },
        "notes": {
            "address": "TechStore HQ"
        },
        "theme": {
            "color": "#4f46e5" // Matches primary CSS variable
        }
    };

    var rzp1 = new Razorpay(options);
    
    rzp1.on('payment.failed', function (response){
        // Revert Button
        checkoutText.style.display = 'block';
        loader.style.display = 'none';
        // Show Failure
        showFailureModal(response.error.description);
    });

    // Handle closing the popup manually
    rzp1.on('modal.closed', function() {
        checkoutText.style.display = 'block';
        loader.style.display = 'none';
    });

    rzp1.open();
}

// Boot up
init();