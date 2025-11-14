// DOM Elements
const quickBookForm = document.querySelector('.quick-book-form');
const searchBtn = document.querySelector('.search-btn');
const bookRideBtn = document.querySelector('.book-btn');

// Get current user from localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser'));

// Initialize page
function initializePage() {
    // Check authentication
    checkAuth();
    
    // Setup event listeners
    setupEventListeners();
}

// Check authentication status
function checkAuth() {
    if (!currentUser) {
        // Redirect to auth page if not logged in
        bookRideBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'auth.html';
        });
    } else {
        // Update UI for logged-in user
        bookRideBtn.addEventListener('click', () => {
            window.location.href = 'Search.html';
        });
    }
}

// Handle quick book form submission
function handleQuickBook(e) {
    e.preventDefault();
    
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }

    const formData = new FormData(quickBookForm);
    const searchParams = new URLSearchParams();
    
    for (let [key, value] of formData.entries()) {
        searchParams.append(key, value);
    }
    
    window.location.href = `Search.html?${searchParams.toString()}`;
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Quick book form
    quickBookForm.addEventListener('submit', handleQuickBook);
    
    // Search button
    searchBtn.addEventListener('click', () => {
        if (!currentUser) {
            window.location.href = 'auth.html';
        } else {
            window.location.href = 'Search.html';
        }
    });
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 