/*
    Najay Green 2402084 Javascript
 */

let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initNavigation();

    const pageKey = document.body.getAttribute('data-page') || getCurrentPage();
    const pageMap = {
        home: initHomePage,
        'index.html': initHomePage,
        login: initLoginPage,
        'login.html': initLoginPage,
        register: initRegisterPage,
        'register.html': initRegisterPage,
        products: initProductsPage,
        'products.html': initProductsPage,
        cart: initCartPage,
        'cart.html': initCartPage,
        checkout: initCheckoutPage,
        'checkout.html': initCheckoutPage
    };

    const initializer = pageMap[pageKey];
    if (typeof initializer === 'function') {
        initializer();
    }
});

function getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split('/').pop();
    return page || 'index.html';
}

function updateCartCount() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.querySelectorAll('#cartCount, .cart-indicator').forEach((node) => {
        node.textContent = totalItems;
    });
}

function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

function initNavigation() {
    const navButtons = document.querySelectorAll('.nav-toggle, #menuToggle');
    navButtons.forEach((button) => {
        const menuId = button.getAttribute('aria-controls') || 'navMenu';
        const menu = document.getElementById(menuId);
        if (!menu) return;

        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            menu.classList.toggle('active');
        });
    });
}

/* ---------- Home ---------- */

function initHomePage() {
    const heroCtas = document.querySelectorAll('.hero-actions .btn');
    heroCtas.forEach((cta) => {
        cta.addEventListener('focus', () => cta.classList.add('is-focused'));
        cta.addEventListener('blur', () => cta.classList.remove('is-focused'));
    });
}

/* ---------- Login Validation ---------- */

function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const identifierInput = document.getElementById('loginIdentifier');
        const passwordInput = document.getElementById('loginPassword');
        const identifier = identifierInput ? identifierInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value.trim() : '';
        clearErrorMessages(['loginIdentifierError', 'loginPasswordError']);

        let hasError = false;

        if (!identifier) {
            showError('loginIdentifierError', 'Enter your username or email.');
            hasError = true;
        }

        if (!password) {
            showError('loginPasswordError', 'Password is required.');
            hasError = true;
        }

        if (hasError) {
            showMessage('loginFeedback', 'Fill out the required fields.', 'error');
            return;
        }

        localStorage.setItem('sessionUser', JSON.stringify({ identifier }));
        showMessage('loginFeedback', 'Welcome back! Redirecting to products...', 'success');

        setTimeout(() => {
            window.location.href = 'products.html';
        }, 1500);
    });
}

/* ---------- Registration Validation ---------- */

function initRegisterPage() {
    const registerForm = document.getElementById('registerForm');
    if (!registerForm) return;
    
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const requiredFields = [
            { id: 'firstName', error: 'firstNameError', message: 'First name is required.' },
            { id: 'lastName', error: 'lastNameError', message: 'Last name is required.' },
            { id: 'studentId', error: 'studentIdError', message: 'Student ID is required.' },
            { id: 'registerEmail', error: 'emailError', message: 'Email is required.' },
            { id: 'registerUsername', error: 'usernameError', message: 'Username is required.' },
            { id: 'registerPassword', error: 'passwordError', message: 'Password is required.' },
            { id: 'confirmPassword', error: 'confirmPasswordError', message: 'Confirm your password.' }
        ];

        clearErrorMessages(requiredFields.map((field) => field.error));
        clearErrorMessages(['phoneError', 'dobError', 'campusError']);

        let issues = 0;
        requiredFields.forEach((field) => {
            const input = document.getElementById(field.id);
            if (!input || !input.value.trim()) {
                showError(field.error, field.message);
                issues++;
            }
        });

        const passwordInput = document.getElementById('registerPassword');
        const confirmInput = document.getElementById('confirmPassword');
        if (passwordInput && confirmInput && passwordInput.value !== confirmInput.value) {
            showError('confirmPasswordError', 'Passwords must match.');
            issues++;
        }

        const termsAccepted = document.getElementById('terms');
        if (termsAccepted && !termsAccepted.checked) {
            alert('Please accept the terms to continue.');
            issues++;
        }

        if (issues > 0) {
            showMessage('registerFeedback', 'Please complete the highlighted fields.', 'error');
            return;
        }

        const profile = requiredFields.reduce((data, field) => {
            const input = document.getElementById(field.id);
            data[field.id] = input ? input.value.trim() : '';
            return data;
        }, {});

        profile.phoneNumber = document.getElementById('phoneNumber')?.value.trim() || '';
        profile.dateOfBirth = document.getElementById('dateOfBirth')?.value || '';
        profile.campus = document.getElementById('campus')?.value || '';

        localStorage.setItem('campusThriveProfile', JSON.stringify(profile));
        showMessage('registerFeedback', 'Registration saved! Redirecting to login...', 'success');

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    });
}

/* ---------- Products + Filters ---------- */

function initProductsPage() {
    bindAddToCartButtons();
}

function bindAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach((button) => {
        button.addEventListener('click', () => {
            const productName = button.getAttribute('data-name');
            const productPrice = parseFloat(button.getAttribute('data-price'));

            if (!productName || Number.isNaN(productPrice)) return;

            addToCart(productName, productPrice);
            button.textContent = 'Added to cart';
            button.disabled = true;

            setTimeout(() => {
                button.textContent = 'Add to cart';
                button.disabled = false;
            }, 1200);
        });
    });
}

function addToCart(name, price) {
    const existingItem = cart.find((item) => item.name === name);
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ name, price, quantity: 1 });
    }
    saveCart();
}

/* ---------- Cart Logic ---------- */

function initCartPage() {
    displayCart();

    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            if (confirm('Clear all items from your cart?')) {
                cart = [];
                saveCart();
                displayCart();
            }
        });
    }
}

function displayCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartContainer = document.getElementById('cartContainer');
    if (!cartItemsContainer || !emptyCartMessage || !cartContainer) return;

    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        cartContainer.classList.add('hidden');
        calculateCartTotals();
        return;
    }

    emptyCartMessage.classList.add('hidden');
    cartContainer.classList.remove('hidden');
    cartItemsContainer.innerHTML = '';

    cart.forEach((item, index) => {
        const subtotal = item.price * item.quantity;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>$${item.price.toFixed(2)}</td>
            <td>
                <input type="number" min="1" max="99" value="${item.quantity}" class="quantity-input" data-index="${index}">
            </td>
            <td>$${subtotal.toFixed(2)}</td>
            <td><button class="remove-btn" data-index="${index}">Remove</button></td>
        `;
        cartItemsContainer.appendChild(row);
    });

    document.querySelectorAll('.quantity-input').forEach((input) => {
        input.addEventListener('change', () => {
            const index = Number(input.getAttribute('data-index'));
            const newQuantity = Number(input.value);
            if (Number.isInteger(newQuantity) && newQuantity > 0) {
                cart[index].quantity = newQuantity;
                saveCart();
                displayCart();
            }
        });
    });

    document.querySelectorAll('.remove-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const index = Number(btn.getAttribute('data-index'));
            cart.splice(index, 1);
            saveCart();
            displayCart();
        });
    });

    calculateCartTotals();
}

function calculateCartTotals() {
    const subtotalEl = document.getElementById('cartSubtotal');
    const discountEl = document.getElementById('cartDiscount');
    const taxEl = document.getElementById('cartTax');
    const totalEl = document.getElementById('cartTotal');
    if (!subtotalEl || !discountEl || !taxEl || !totalEl) return;

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = 0;
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    subtotalEl.textContent = subtotal.toFixed(2);
    discountEl.textContent = discount.toFixed(2);
    taxEl.textContent = tax.toFixed(2);
    totalEl.textContent = total.toFixed(2);
}

/* ---------- Checkout ---------- */

function initCheckoutPage() {
    displayCheckoutSummary();

    const checkoutForm = document.getElementById('checkoutForm');
    const cancelBtn = document.getElementById('cancelBtn');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }

    if (!checkoutForm) return;

    checkoutForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const requiredFields = [
            { id: 'fullName', error: 'fullNameError', message: 'Full name is required.' },
            { id: 'email', error: 'emailCheckoutError', message: 'Email is required.' },
            { id: 'phone', error: 'phoneError', message: 'Phone number is required.' },
            { id: 'address', error: 'addressError', message: 'Address is required.' },
            { id: 'city', error: 'cityError', message: 'City/Town is required.' },
            { id: 'parish', error: 'parishError', message: 'Select a parish.' }
        ];

        clearErrorMessages(requiredFields.map((field) => field.error));

        let hasError = false;
        requiredFields.forEach((field) => {
            const input = document.getElementById(field.id);
            if (!input || !input.value.trim()) {
                showError(field.error, field.message);
                hasError = true;
            }
        });

        if (hasError) {
            showMessage('orderConfirmation', 'Please finish the required fields before submitting.', 'error');
            return;
        }

        const summaryTotal = document.getElementById('checkoutTotal');
        const orderData = {
            fields: requiredFields.reduce((acc, field) => {
                const input = document.getElementById(field.id);
                acc[field.id] = input ? input.value.trim() : '';
                return acc;
            }, {}),
            items: cart,
            total: summaryTotal ? summaryTotal.textContent : '0.00',
            date: new Date().toISOString()
        };

        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        cart = [];
        saveCart();

        showMessage('orderConfirmation', 'Order confirmed! Details saved locally.', 'success');
        checkoutForm.reset();

        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    });
}

function displayCheckoutSummary() {
    const checkoutItemsContainer = document.getElementById('checkoutItems');
    if (!checkoutItemsContainer) return;

    if (cart.length === 0) {
        checkoutItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        calculateCheckoutTotals();
        return;
    }

    checkoutItemsContainer.innerHTML = '';
    cart.forEach((item) => {
        const wrapper = document.createElement('div');
        wrapper.className = 'checkout-item';
        wrapper.innerHTML = `
            <div>
                <strong>${item.name}</strong><br>
                <small>Qty: ${item.quantity} x $${item.price.toFixed(2)}</small>
            </div>
            <div>$${(item.price * item.quantity).toFixed(2)}</div>
        `;
        checkoutItemsContainer.appendChild(wrapper);
    });

    calculateCheckoutTotals();
}

function calculateCheckoutTotals() {
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const discountEl = document.getElementById('checkoutDiscount');
    const taxEl = document.getElementById('checkoutTax');
    const totalEl = document.getElementById('checkoutTotal');
    if (!subtotalEl || !discountEl || !taxEl || !totalEl) return;

    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = 0;
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    subtotalEl.textContent = subtotal.toFixed(2);
    discountEl.textContent = discount.toFixed(2);
    taxEl.textContent = tax.toFixed(2);
    totalEl.textContent = total.toFixed(2);

    const payInput = document.getElementById('amountPaying');
    if (payInput) {
        payInput.value = total.toFixed(2);
    }
}

/* ---------- Generic Messaging Helpers ---------- */
function showError(elementId, message) {
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrorMessages(elementIds) {
    elementIds.forEach((id) => {
        const node = document.getElementById(id);
        if (node) node.textContent = '';
    });
}

function showMessage(elementId, message, type) {
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;
    messageElement.textContent = message;
    messageElement.className = `message-box ${type}`;
    messageElement.classList.remove('hidden');
}
