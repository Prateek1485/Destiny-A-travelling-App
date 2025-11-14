// DOM Elements
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const tabBtns = document.querySelectorAll('.tab-btn');

// Tab switching
tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all buttons and forms
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
        
        // Add active class to clicked button and corresponding form
        btn.classList.add('active');
        document.getElementById(`${btn.dataset.tab}Form`).classList.add('active');
    });
});

// Handle login
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    // Get users from localStorage
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // Find user
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        // Store logged in user
        localStorage.setItem('currentUser', JSON.stringify({
            name: user.name,
            email: user.email,
            mobile: user.mobile
        }));
        
        showNotification('Login successful!', 'success');
        setTimeout(() => {
            window.location.href = 'Home.html';
        }, 1000);
    } else {
        showNotification('Invalid email or password!', 'error');
    }
});

// Handle registration
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('email').value;
    const mobile = document.getElementById('mobile').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;

    // Validate passwords match
    if (password !== confirmPassword) {
        showNotification('Passwords do not match!', 'error');
        return;
    }

    // Validate mobile number
    if (!/^[0-9]{10}$/.test(mobile)) {
        showNotification('Please enter a valid 10-digit mobile number', 'error');
        return;
    }

    // Get existing users
    const users = JSON.parse(localStorage.getItem('users')) || [];

    // Check if email already exists
    if (users.some(user => user.email === email)) {
        showNotification('Email already registered', 'error');
        return;
    }

    // Create new user
    const newUser = {
        name,
        email,
        mobile,
        password, // In a real app, this should be hashed
        createdAt: new Date().toISOString()
    };

    // Add user to users array
    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    // Set current user
    localStorage.setItem('currentUser', JSON.stringify({
        name: newUser.name,
        email: newUser.email,
        mobile: newUser.mobile
    }));

    // Show success message
    showNotification('Registration successful!', 'success');

    // Redirect to home page
    setTimeout(() => {
        window.location.href = 'Home.html';
    }, 1500);
});

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Check if user is already logged in
function checkAuth() {
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        window.location.href = 'Home.html';
    }
}

// Check auth status when page loads
checkAuth();

// Logout function
function logout() {
    // Clear current user from localStorage
    localStorage.removeItem('currentUser');
    
    // Redirect to auth page
    window.location.href = 'auth.html';
}

// Add event listener for logout button
document.addEventListener('DOMContentLoaded', function() {
    const logoutBtn = document.querySelector('.logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
}); 