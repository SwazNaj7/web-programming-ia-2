/*
    Najay Green 2402084 Javascript
 */

// Load cart from localStorage or initialize as empty array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    // Update cart count on page load
    updateCartCount();

    // Navigation menu toggle
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

    // Home page: hero button focus styling
    const heroCtas = document.querySelectorAll('.hero-actions .btn');
    heroCtas.forEach((cta) => {
        cta.addEventListener('focus', () => cta.classList.add('is-focused'));
        cta.addEventListener('blur', () => cta.classList.remove('is-focused'));
    });

    // Login page
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        const sessionUser = localStorage.getItem('sessionUser');
        
        if (sessionUser) {
            const storedProfile = localStorage.getItem('campusThriveProfile');
            
            if (storedProfile) {
                const userProfile = JSON.parse(storedProfile);
                
                loginForm.classList.add('hidden');
                
                const loginFeedback = document.getElementById('loginFeedback');
                if (loginFeedback) {
                    loginFeedback.textContent = `Welcome back, ${userProfile.firstName} ${userProfile.lastName}! You are already logged in.`;
                    loginFeedback.className = 'message-box success';
                    loginFeedback.classList.remove('hidden');
                }
                
                const welcomeMessage = document.createElement('div');
                welcomeMessage.className = 'auth-card';
                welcomeMessage.innerHTML = `
                    <h2>Welcome Back!</h2>
                    <p>Hello ${userProfile.firstName}, you're already logged in.</p>
                    <div class="hero-actions">
                        <a class="btn btn-primary" href="products.html">Go to Products</a>
                        <button class="btn btn-outline" id="logoutBtn">Logout</button>
                    </div>
                `;
                loginForm.parentNode.insertBefore(welcomeMessage, loginForm);
                
                const logoutBtn = document.getElementById('logoutBtn');
                if (logoutBtn) {
                    logoutBtn.addEventListener('click', () => {
                        localStorage.removeItem('sessionUser');
                        window.location.reload();
                    });
                }
            }
        } else {
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

                const storedProfile = localStorage.getItem('campusThriveProfile');
                
                if (!storedProfile) {
                    showError('loginIdentifierError', 'No account found. Please register first.');
                    showMessage('loginFeedback', 'Invalid credentials. Please register if you don\'t have an account.', 'error');
                    return;
                }

                const userProfile = JSON.parse(storedProfile);
                
                const identifierMatch = identifier === userProfile.registerUsername || identifier === userProfile.registerEmail;
                const passwordMatch = password === userProfile.registerPassword;

                if (!identifierMatch || !passwordMatch) {
                    showError('loginIdentifierError', 'Invalid username/email or password.');
                    showError('loginPasswordError', 'Invalid username/email or password.');
                    showMessage('loginFeedback', 'Login failed. Please check your credentials.', 'error');
                    return;
                }

                localStorage.setItem('sessionUser', JSON.stringify({ 
                    identifier,
                    firstName: userProfile.firstName,
                    lastName: userProfile.lastName 
                }));
                
                showMessage('loginFeedback', `Welcome back, ${userProfile.firstName}! Redirecting to products...`, 'success');

                setTimeout(() => {
                    window.location.href = 'products.html';
                }, 1500);
            });
        }
    }

    // Register page
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
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

            let hasError = false;
            requiredFields.forEach((field) => {
                const input = document.getElementById(field.id);
                if (!input || !input.value.trim()) {
                    showError(field.error, field.message);
                    hasError = true;
                }
            });

            const passwordInput = document.getElementById('registerPassword');
            const confirmInput = document.getElementById('confirmPassword');
            if (passwordInput && confirmInput && passwordInput.value !== confirmInput.value) {
                showError('confirmPasswordError', 'Passwords must match.');
                hasError = true;
            }

            const termsAccepted = document.getElementById('terms');
            if (termsAccepted && !termsAccepted.checked) {
                alert('Please accept the terms to continue.');
                hasError = true;
            }

            if (hasError) {
                showMessage('registerFeedback', 'Please complete the highlighted fields.', 'error');
                return;
            }

            const profile = requiredFields.reduce((data, field) => {
                const input = document.getElementById(field.id);
                data[field.id] = input ? input.value.trim() : '';
                return data;
            }, {});

            profile.phoneNumber = document.getElementById('phoneNumber').value.trim() || '';
            profile.dateOfBirth = document.getElementById('dateOfBirth').value || '';
            profile.campus = document.getElementById('campus').value || '';

            localStorage.setItem('campusThriveProfile', JSON.stringify(profile));
            showMessage('registerFeedback', 'Registration saved! Redirecting to login...', 'success');

            setTimeout(() => {
                window.location.href = 'login.html';
            }, 1500);
        });
    }

    // Products page: add to cart buttons
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

    // Cart page
    const cartItemsContainer = document.getElementById('cartItems');
    if (cartItemsContainer) {
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

    // Checkout page
    const checkoutForm = document.getElementById('checkoutForm');
    if (checkoutForm) {
        displayCheckoutSummary();

        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                window.location.href = 'cart.html';
            });
        }

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
});

function updateCartCount() {
    // Calculate total number of items in cart
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    // Update all cart count displays on the page
    document.querySelectorAll('#cartCount, .cart-indicator').forEach((node) => {
        node.textContent = totalItems;
    });
}

function saveCart() {
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(cart));
    // Update cart count display
    updateCartCount();
}

function addToCart(name, price) {
    // Check if product already exists in cart
    const existingItem = cart.find((item) => item.name === name);
    if (existingItem) {
        // Increase quantity if product exists
        existingItem.quantity += 1;
    } else {
        // Add new product to cart
        cart.push({ name, price, quantity: 1 });
    }
    // Save cart to localStorage
    saveCart();
}

/* ---------- Cart Display and Calculations ---------- */

function displayCart() {
    // Get cart display elements
    const cartItemsContainer = document.getElementById('cartItems');
    const emptyCartMessage = document.getElementById('emptyCartMessage');
    const cartContainer = document.getElementById('cartContainer');
    if (!cartItemsContainer || !emptyCartMessage || !cartContainer) return;

    // Show empty cart message if no items
    if (cart.length === 0) {
        emptyCartMessage.classList.remove('hidden');
        cartContainer.classList.add('hidden');
        calculateCartTotals();
        return;
    }

    // Show cart table if items exist
    emptyCartMessage.classList.add('hidden');
    cartContainer.classList.remove('hidden');
    cartItemsContainer.innerHTML = '';

    // Create a table row for each cart item
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

    // Add event listeners to quantity inputs
    document.querySelectorAll('.quantity-input').forEach((input) => {
        input.addEventListener('change', () => {
            const index = Number(input.getAttribute('data-index'));
            const newQuantity = Number(input.value);
            // Update quantity if valid
            if (Number.isInteger(newQuantity) && newQuantity > 0) {
                cart[index].quantity = newQuantity;
                saveCart();
                displayCart();
            }
        });
    });

    // Add event listeners to remove buttons
    document.querySelectorAll('.remove-btn').forEach((btn) => {
        btn.addEventListener('click', () => {
            const index = Number(btn.getAttribute('data-index'));
            // Remove item from cart
            cart.splice(index, 1);
            saveCart();
            displayCart();
        });
    });

    // Update cart totals
    calculateCartTotals();
}

function calculateCartTotals() {
    // Get total display elements
    const subtotalEl = document.getElementById('cartSubtotal');
    const discountEl = document.getElementById('cartDiscount');
    const taxEl = document.getElementById('cartTax');
    const totalEl = document.getElementById('cartTotal');
    if (!subtotalEl || !discountEl || !taxEl || !totalEl) return;

    // Calculate cart totals
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = 0;
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    // Update display elements with calculated values
    subtotalEl.textContent = subtotal.toFixed(2);
    discountEl.textContent = discount.toFixed(2);
    taxEl.textContent = tax.toFixed(2);
    totalEl.textContent = total.toFixed(2);
}

/* ---------- Checkout Display and Calculations ---------- */

function displayCheckoutSummary() {
    // Get checkout summary container
    const checkoutItemsContainer = document.getElementById('checkoutItems');
    if (!checkoutItemsContainer) return;

    // Show empty message if no items in cart
    if (cart.length === 0) {
        checkoutItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
        calculateCheckoutTotals();
        return;
    }

    // Clear container and display each cart item
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

    // Calculate and display totals
    calculateCheckoutTotals();
}

function calculateCheckoutTotals() {
    // Get checkout total display elements
    const subtotalEl = document.getElementById('checkoutSubtotal');
    const discountEl = document.getElementById('checkoutDiscount');
    const taxEl = document.getElementById('checkoutTax');
    const totalEl = document.getElementById('checkoutTotal');
    if (!subtotalEl || !discountEl || !taxEl || !totalEl) return;

    // Calculate checkout totals
    const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const discount = 0;
    const tax = subtotal * 0.15;
    const total = subtotal + tax;

    // Update total display elements
    subtotalEl.textContent = subtotal.toFixed(2);
    discountEl.textContent = discount.toFixed(2);
    taxEl.textContent = tax.toFixed(2);
    totalEl.textContent = total.toFixed(2);

    // Set payment input to total amount
    const payInput = document.getElementById('amountPaying');
    if (payInput) {
        payInput.value = total.toFixed(2);
    }
}

/* ---------- Generic Messaging Helpers ---------- */

function showError(elementId, message) {
    // Display error message in specified element
    const errorElement = document.getElementById(elementId);
    if (errorElement) {
        errorElement.textContent = message;
    }
}

function clearErrorMessages(elementIds) {
    // Clear error messages from specified elements
    elementIds.forEach((id) => {
        const node = document.getElementById(id);
        if (node) node.textContent = '';
    });
}

function showMessage(elementId, message, type) {
    // Display feedback message with specified type (success or error)
    const messageElement = document.getElementById(elementId);
    if (!messageElement) return;
    messageElement.textContent = message;
    messageElement.className = `message-box ${type}`;
    messageElement.classList.remove('hidden');
}
