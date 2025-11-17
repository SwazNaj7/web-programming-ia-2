/*
    Najay Green 2402084 Javascript
 */

// Load cart from localStorage or initialize as empty array
let cart = JSON.parse(localStorage.getItem('cart')) || [];

document.addEventListener('DOMContentLoaded', () => {
    // Update cart count on page load
    updateCartCount();
    // Initialize navigation menu
    initNavigation();

    // Determine which page is currently loaded
    const pageKey = document.body.getAttribute('data-page') || getCurrentPage();
    // Map page names to their initialization functions
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

    // Run the appropriate initialization function for this page
    const initializer = pageMap[pageKey];
    if (typeof initializer === 'function') {
        initializer();
    }
});

function getCurrentPage() {
    // Get the current URL path
    const path = window.location.pathname;
    // Extract the filename from the path
    const page = path.split('/').pop();
    return page || 'index.html';
}

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

function initNavigation() {
    // Find all navigation toggle buttons
    const navButtons = document.querySelectorAll('.nav-toggle, #menuToggle');
    navButtons.forEach((button) => {
        // Get the menu that this button controls
        const menuId = button.getAttribute('aria-controls') || 'navMenu';
        const menu = document.getElementById(menuId);
        if (!menu) return;

        // Toggle menu visibility when button is clicked
        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!expanded));
            menu.classList.toggle('active');
        });
    });
}

/* ---------- Home ---------- */

function initHomePage() {
    // Find all call-to-action buttons in hero section
    const heroCtas = document.querySelectorAll('.hero-actions .btn');
    heroCtas.forEach((cta) => {
        // Add focus styling when button receives focus
        cta.addEventListener('focus', () => cta.classList.add('is-focused'));
        // Remove focus styling when button loses focus
        cta.addEventListener('blur', () => cta.classList.remove('is-focused'));
    });
}

/* ---------- Login Validation ---------- */

function initLoginPage() {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) return;

    // Check if user is already logged in
    const sessionUser = localStorage.getItem('sessionUser');
    
    if (sessionUser) {
        // User is already logged in
        const userData = JSON.parse(sessionUser);
        const storedProfile = localStorage.getItem('campusThriveProfile');
        
        if (storedProfile) {
            const userProfile = JSON.parse(storedProfile);
            
            // Hide the login form
            loginForm.classList.add('hidden');
            
            // Show welcome message
            const loginFeedback = document.getElementById('loginFeedback');
            if (loginFeedback) {
                loginFeedback.textContent = `Welcome back, ${userProfile.firstName} ${userProfile.lastName}! You are already logged in.`;
                loginFeedback.className = 'message-box success';
                loginFeedback.classList.remove('hidden');
            }
            
            // Displays the user logged in
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
            
            // Add logout functionality
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', () => {
                    localStorage.removeItem('sessionUser');
                    window.location.reload();
                });
            }
            
            return;
        }
    }

    loginForm.addEventListener('submit', (e) => {
        // Prevent default form submission
        e.preventDefault();

        // Get input values
        const identifierInput = document.getElementById('loginIdentifier');
        const passwordInput = document.getElementById('loginPassword');
        const identifier = identifierInput ? identifierInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value.trim() : '';
        // Clear previous error messages
        clearErrorMessages(['loginIdentifierError', 'loginPasswordError']);

        let hasError = false;

        // Validate username/email field
        if (!identifier) {
            showError('loginIdentifierError', 'Enter your username or email.');
            hasError = true;
        }

        // Validate password field
        if (!password) {
            showError('loginPasswordError', 'Password is required.');
            hasError = true;
        }

        // Stop if validation errors exist
        if (hasError) {
            showMessage('loginFeedback', 'Fill out the required fields.', 'error');
            return;
        }

        // Check if user exists in localStorage
        const storedProfile = localStorage.getItem('campusThriveProfile');
        
        if (!storedProfile) {
            // No registered user found
            showError('loginIdentifierError', 'No account found. Please register first.');
            showMessage('loginFeedback', 'Invalid credentials. Please register if you don\'t have an account.', 'error');
            return;
        }

        // Parse the stored user data
        const userProfile = JSON.parse(storedProfile);
        
        // Check if credentials match (username or email)
        const identifierMatch = identifier === userProfile.registerUsername || identifier === userProfile.registerEmail;
        const passwordMatch = password === userProfile.registerPassword;

        if (!identifierMatch || !passwordMatch) {
            // Invalid credentials
            showError('loginIdentifierError', 'Invalid username/email or password.');
            showError('loginPasswordError', 'Invalid username/email or password.');
            showMessage('loginFeedback', 'Login failed. Please check your credentials.', 'error');
            return;
        }

        // Successful login - Save user session to localStorage
        localStorage.setItem('sessionUser', JSON.stringify({ 
            identifier,
            firstName: userProfile.firstName,
            lastName: userProfile.lastName 
        }));
        // Show success message
        showMessage('loginFeedback', `Welcome back, ${userProfile.firstName}! Redirecting to products...`, 'success');

        // Redirect to products page after delay
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
        // Prevent default form submission
        event.preventDefault();

        // Define all required fields with their error elements
        const requiredFields = [
            { id: 'firstName', error: 'firstNameError', message: 'First name is required.' },
            { id: 'lastName', error: 'lastNameError', message: 'Last name is required.' },
            { id: 'studentId', error: 'studentIdError', message: 'Student ID is required.' },
            { id: 'registerEmail', error: 'emailError', message: 'Email is required.' },
            { id: 'registerUsername', error: 'usernameError', message: 'Username is required.' },
            { id: 'registerPassword', error: 'passwordError', message: 'Password is required.' },
            { id: 'confirmPassword', error: 'confirmPasswordError', message: 'Confirm your password.' }
        ];

        // Clear all previous error messages
        clearErrorMessages(requiredFields.map((field) => field.error));
        clearErrorMessages(['phoneError', 'dobError', 'campusError']);

        // Validate all required fields
        let hasError = false;
        requiredFields.forEach((field) => {
            const input = document.getElementById(field.id);
            if (!input || !input.value.trim()) {
                showError(field.error, field.message);
                hasError = true;
            }
        });

        // Validate password confirmation matches
        const passwordInput = document.getElementById('registerPassword');
        const confirmInput = document.getElementById('confirmPassword');
        if (passwordInput && confirmInput && passwordInput.value !== confirmInput.value) {
            showError('confirmPasswordError', 'Passwords must match.');
            hasError = true;
        }

        // Validate terms checkbox is checked
        const termsAccepted = document.getElementById('terms');
        if (termsAccepted && !termsAccepted.checked) {
            alert('Please accept the terms to continue.');
            hasError = true;
        }

        // Stop if validation errors exist
        if (hasError) {
            showMessage('registerFeedback', 'Please complete the highlighted fields.', 'error');
            return;
        }

        // Collect all required field values into profile object
        const profile = requiredFields.reduce((data, field) => {
            const input = document.getElementById(field.id);
            data[field.id] = input ? input.value.trim() : '';
            return data;
        }, {});

        // Add optional fields to profile
        profile.phoneNumber = document.getElementById('phoneNumber')?.value.trim() || '';
        profile.dateOfBirth = document.getElementById('dateOfBirth')?.value || '';
        profile.campus = document.getElementById('campus')?.value || '';

        // Save profile to localStorage
        localStorage.setItem('campusThriveProfile', JSON.stringify(profile));
        // Show success message
        showMessage('registerFeedback', 'Registration saved! Redirecting to login...', 'success');

        // Redirect to login page after delay
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    });
}

/* ---------- Products + Filters ---------- */

function initProductsPage() {
    // Set up add to cart button functionality
    bindAddToCartButtons();
}

function bindAddToCartButtons() {
    // Find all add to cart buttons
    document.querySelectorAll('.add-to-cart').forEach((button) => {
        button.addEventListener('click', () => {
            // Get product details from button attributes
            const productName = button.getAttribute('data-name');
            const productPrice = parseFloat(button.getAttribute('data-price'));

            // Validate product data
            if (!productName || Number.isNaN(productPrice)) return;

            // Add product to cart
            addToCart(productName, productPrice);
            // Show feedback on button
            button.textContent = 'Added to cart';
            button.disabled = true;

            // Reset button after delay
            setTimeout(() => {
                button.textContent = 'Add to cart';
                button.disabled = false;
            }, 1200);
        });
    });
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

/* ---------- Cart Logic ---------- */

function initCartPage() {
    // Display cart items
    displayCart();

    // Set up clear cart button
    const clearCartBtn = document.getElementById('clearCartBtn');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', () => {
            // Confirm before clearing cart
            if (confirm('Clear all items from your cart?')) {
                cart = [];
                saveCart();
                displayCart();
            }
        });
    }
}

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

/* ---------- Checkout ---------- */

function initCheckoutPage() {
    // Display order summary
    displayCheckoutSummary();

    const checkoutForm = document.getElementById('checkoutForm');
    const cancelBtn = document.getElementById('cancelBtn');

    // Set up cancel button to return to cart
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            window.location.href = 'cart.html';
        });
    }

    if (!checkoutForm) return;

    checkoutForm.addEventListener('submit', (event) => {
        // Prevent default form submission
        event.preventDefault();

        // Define all required checkout fields
        const requiredFields = [
            { id: 'fullName', error: 'fullNameError', message: 'Full name is required.' },
            { id: 'email', error: 'emailCheckoutError', message: 'Email is required.' },
            { id: 'phone', error: 'phoneError', message: 'Phone number is required.' },
            { id: 'address', error: 'addressError', message: 'Address is required.' },
            { id: 'city', error: 'cityError', message: 'City/Town is required.' },
            { id: 'parish', error: 'parishError', message: 'Select a parish.' }
        ];

        // Clear previous error messages
        clearErrorMessages(requiredFields.map((field) => field.error));

        // Validate all required fields
        let hasError = false;
        requiredFields.forEach((field) => {
            const input = document.getElementById(field.id);
            if (!input || !input.value.trim()) {
                showError(field.error, field.message);
                hasError = true;
            }
        });

        // Stop if validation errors exist
        if (hasError) {
            showMessage('orderConfirmation', 'Please finish the required fields before submitting.', 'error');
            return;
        }

        // Create order data object with all information
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

        // Save order to localStorage
        localStorage.setItem('lastOrder', JSON.stringify(orderData));
        // Clear cart
        cart = [];
        saveCart();

        // Show confirmation message
        showMessage('orderConfirmation', 'Order confirmed! Details saved locally.', 'success');
        // Clear form fields
        checkoutForm.reset();

        // Redirect to home page after delay
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    });
}

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
