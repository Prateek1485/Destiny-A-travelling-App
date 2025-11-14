// DOM Elements
const shareForm = document.querySelector('.share-form');
const ridesList = document.querySelector('.rides-list');

// Get current user and rides from localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const rides = JSON.parse(localStorage.getItem('rides')) || [];

// Initialize page
function initializePage() {
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }

    // Load active rides
    loadActiveRides();
    
    // Setup event listeners
    setupEventListeners();
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
                <span class="status ${ride.status}">${ride.status}</span>
                <button class="cancel-btn" onclick="cancelRide('${ride.id}')">
                    Cancel Ride
                </button>
            </div>
        </div>
    `;
}

// Handle share form
function handleShareForm(e) {
    e.preventDefault();
    
    const newRide = {
        id: Date.now().toString(),
        driver: currentUser.name,
        driverEmail: currentUser.email,
        vehicle: document.getElementById('vehicle-model').value,
        type: document.getElementById('vehicle-type').value,
        seats: parseInt(document.getElementById('seats').value),
        price: parseInt(document.getElementById('price').value),
        departureTime: document.getElementById('departure-time').value,
        pickup: document.getElementById('pickup').value,
        destination: document.getElementById('destination').value,
        additionalInfo: document.getElementById('additional-info').value,
        status: 'active',
        createdAt: new Date().toISOString()
    };

    console.log('Creating new ride:', newRide);

    // Add ride to rides array
    rides.push(newRide);
    localStorage.setItem('rides', JSON.stringify(rides));
    console.log('Updated rides:', rides);

    // Reset form
    e.target.reset();

    // Reload active rides
    loadActiveRides();

    // Show success message
    showNotification('Ride shared successfully!', 'success');
}

// Cancel ride
function cancelRide(rideId) {
    if (confirm('Are you sure you want to cancel this ride?')) {
        const rideIndex = rides.findIndex(ride => ride.id === rideId);
        if (rideIndex !== -1) {
            // Remove any bookings for this ride
            const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
            const updatedBookings = bookings.filter(booking => booking.rideId !== rideId);
            localStorage.setItem('bookings', JSON.stringify(updatedBookings));

            // Remove the ride
            rides.splice(rideIndex, 1);
            localStorage.setItem('rides', JSON.stringify(rides));
            console.log('Updated rides after cancellation:', rides);
            
            loadActiveRides();
            showNotification('Ride cancelled successfully', 'success');
        }
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
    // Share form
    shareForm.addEventListener('submit', handleShareForm);
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 