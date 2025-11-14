// DOM Elements
const navButtons = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');
const logoutBtn = document.querySelector('.logout-btn');
const settingsForm = document.querySelector('.settings-form');
const ridesList = document.querySelector('.rides-list');
const historyList = document.querySelector('.history-list');
const userInfo = document.querySelector('.user-info');

// Get current user from localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const users = JSON.parse(localStorage.getItem('users')) || [];
const rides = JSON.parse(localStorage.getItem('rides')) || [];

// Initialize page
function initializePage() {
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }

    console.log('Initializing profile page...');
    console.log('Current user:', currentUser);
    console.log('All rides:', rides);

    // Update user info
    updateUserInfo();
    
    // Load active rides
    loadActiveRides();
    
    // Load ride history
    loadRideHistory();
    
    // Setup event listeners
    setupEventListeners();
}

// Update user information display
function updateUserInfo() {
    const user = users.find(u => u.email === currentUser.email);
    if (user) {
        userInfo.querySelector('h2').textContent = user.name;
        userInfo.querySelector('p').textContent = user.email;
    }
}

// Load active rides
function loadActiveRides() {
    console.log('Loading active rides...');
    
    const userRides = rides.filter(ride => {
        return ride.driverEmail === currentUser.email && ride.status !== 'booked';
    });

    console.log('User rides:', userRides);

    if (userRides.length === 0) {
        ridesList.innerHTML = `
            <div class="no-rides">
                <i class="fas fa-car"></i>
                <p>No active rides</p>
                <p>Share a ride to get started!</p>
            </div>
        `;
        return;
    }

    ridesList.innerHTML = userRides.map(ride => createRideCard(ride)).join('');
}

// Load ride history
function loadRideHistory() {
    console.log('Loading ride history...');
    
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    const userBookings = bookings.filter(booking => booking.userId === currentUser.email);
    
    const bookedRides = userBookings.map(booking => {
        const ride = rides.find(r => r.id === booking.rideId);
        return { ...ride, booking };
    });

    console.log('User booked rides:', bookedRides);

    const historyList = document.getElementById('historyList');
    if (bookedRides.length === 0) {
        historyList.innerHTML = `
            <div class="no-rides">
                <i class="fas fa-history"></i>
                <p>No ride history</p>
            </div>
        `;
        return;
    }

    historyList.innerHTML = bookedRides.map(ride => createHistoryCard(ride)).join('');
}

// Create ride card
function createRideCard(ride) {
    const departureTime = new Date(ride.departureTime);
    const formattedDate = departureTime.toLocaleDateString();
    const formattedTime = departureTime.toLocaleTimeString();

    return `
        <div class="ride-card">
            <div class="ride-header">
                <div class="ride-info">
                    <h3>${ride.vehicle}</h3>
                    <p>${ride.type}</p>
                </div>
                <span class="price">₹${ride.price}/seat</span>
            </div>
            <div class="ride-details">
                <div class="detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${ride.pickup}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-flag"></i>
                    <span>${ride.destination}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-clock"></i>
                    <span>${formattedDate} ${formattedTime}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-chair"></i>
                    <span>${ride.seats} seats available</span>
                </div>
            </div>
            <div class="ride-footer">
                <button class="cancel-btn" onclick="cancelRide('${ride.id}')">
                    Cancel Ride
                </button>
            </div>
        </div>
    `;
}

// Create history card
function createHistoryCard(ride) {
    const departureTime = new Date(ride.departureTime);
    const formattedDate = departureTime.toLocaleDateString();
    const formattedTime = departureTime.toLocaleTimeString();
    const bookingTime = new Date(ride.booking.bookedAt);
    const formattedBookingTime = bookingTime.toLocaleString();

    return `
        <div class="ride-card">
            <div class="ride-header">
                <div class="ride-info">
                    <h3>${ride.vehicle}</h3>
                    <p>${ride.type}</p>
                </div>
                <span class="price">₹${ride.price}/seat</span>
            </div>
            <div class="ride-details">
                <div class="detail">
                    <i class="fas fa-map-marker-alt"></i>
                    <span>${ride.pickup}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-flag"></i>
                    <span>${ride.destination}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-clock"></i>
                    <span>${formattedDate} ${formattedTime}</span>
                </div>
                <div class="detail">
                    <i class="fas fa-calendar-check"></i>
                    <span>Booked on: ${formattedBookingTime}</span>
                </div>
            </div>
            <div class="ride-footer">
                <span class="status ${ride.booking.status}">${ride.booking.status}</span>
                ${ride.booking.status === 'confirmed' ? `
                    <button class="cancel-btn" onclick="cancelBooking('${ride.booking.id}')">
                        Cancel Booking
                    </button>
                ` : ''}
            </div>
        </div>
    `;
}

// Cancel ride
function cancelRide(rideId) {
    if (confirm('Are you sure you want to cancel this ride?')) {
        const rideIndex = rides.findIndex(ride => ride.id === rideId);
        if (rideIndex !== -1) {
            rides.splice(rideIndex, 1);
            localStorage.setItem('rides', JSON.stringify(rides));
            loadActiveRides();
            showNotification('Ride cancelled successfully');
        }
    }
}

// Cancel booking
function cancelBooking(bookingId) {
    if (confirm('Are you sure you want to cancel this booking?')) {
        const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
        const bookingIndex = bookings.findIndex(b => b.id === bookingId);
        
        if (bookingIndex !== -1) {
            const booking = bookings[bookingIndex];
            const ride = rides.find(r => r.id === booking.rideId);
            
            if (ride) {
                // Update ride seats and status
                ride.seats++;
                if (ride.status === 'booked') {
                    ride.status = 'active';
                }
                
                // Update localStorage
                localStorage.setItem('rides', JSON.stringify(rides));
            }
            
            // Remove booking
            bookings.splice(bookingIndex, 1);
            localStorage.setItem('bookings', JSON.stringify(bookings));
            
            // Reload history
            loadRideHistory();
            showNotification('Booking cancelled successfully', 'success');
        }
    }
}

// Update user settings
function updateSettings(e) {
    e.preventDefault();
    
    const formData = new FormData(settingsForm);
    const updatedUser = {
        ...currentUser,
        name: formData.get('name'),
        email: formData.get('email')
    };

    // Update user in users array
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('users', JSON.stringify(users));
        localStorage.setItem('currentUser', JSON.stringify(updatedUser));
        
        updateUserInfo();
        showNotification('Settings updated successfully');
    }
}

// Show notification
function showNotification(message, type = 'error') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Setup event listeners
function setupEventListeners() {
    // Navigation buttons
    navButtons.forEach(button => {
        button.addEventListener('click', () => {
            const target = button.dataset.section;
            
            // Update active states
            navButtons.forEach(btn => btn.classList.remove('active'));
            contentSections.forEach(section => section.classList.remove('active'));
            
            button.classList.add('active');
            document.querySelector(`#${target}`).classList.add('active');
        });
    });

    // Settings form
    settingsForm.addEventListener('submit', updateSettings);

    // Logout button
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'auth.html';
    });
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 