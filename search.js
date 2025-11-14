// DOM Elements
const searchForm = document.getElementById('searchForm');
const ridesList = document.getElementById('ridesList');
const rideCount = document.getElementById('rideCount');
const priceRange = document.getElementById('priceRange');
const minPrice = document.getElementById('minPrice');
const maxPrice = document.getElementById('maxPrice');
const vehicleTypes = document.querySelectorAll('input[name="vehicleType"]');
const sortBy = document.getElementById('sortBy');

// Get current user and rides from localStorage
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
const rides = JSON.parse(localStorage.getItem('rides')) || [];

// Initialize page
function initializePage() {
    if (!currentUser) {
        window.location.href = 'auth.html';
        return;
    }

    console.log('Initializing search page...');
    console.log('Current user:', currentUser);
    console.log('All rides:', rides);

    // Set default date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;

    // Set default price range
    const prices = rides.map(ride => ride.price);
    const minPriceValue = Math.min(...prices, 0);
    const maxPriceValue = Math.max(...prices, 1000);
    
    priceRange.min = minPriceValue;
    priceRange.max = maxPriceValue;
    priceRange.value = maxPriceValue;
    minPrice.value = minPriceValue;
    maxPrice.value = maxPriceValue;

    // Check for search parameters in URL
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('from') || urlParams.has('to') || urlParams.has('date')) {
        searchForm.from.value = urlParams.get('from') || '';
        searchForm.to.value = urlParams.get('to') || '';
        searchForm.date.value = urlParams.get('date') || today;
    }

    // Show all available rides initially
    showAllRides();
    
    // Setup event listeners
    setupEventListeners();
}

// Show all available rides
function showAllRides() {
    console.log('Showing all available rides...');
    console.log('Current rides:', rides);
    
    const availableRides = rides.filter(ride => {
        // Only show rides that are not booked and not created by current user
        return ride.status !== 'booked' ;
    });

    console.log('Available rides:', availableRides);
    updateRidesList(availableRides);
}

// Search rides
function searchRides() {
    console.log('Searching rides...');
    console.log('Current rides:', rides);
    
    const searchParams = {
        from: searchForm.from.value.toLowerCase(),
        to: searchForm.to.value.toLowerCase(),
        date: searchForm.date.value,
        seats: parseInt(searchForm.seats.value) || 1,
        minPrice: parseInt(minPrice.value) || 0,
        maxPrice: parseInt(maxPrice.value) || Infinity,
        vehicleTypes: Array.from(vehicleTypes)
            .filter(cb => cb.checked)
            .map(cb => cb.value)
    };

    console.log('Search parameters:', searchParams);

    // Filter rides
    let filteredRides = rides.filter(ride => {
        const rideDate = new Date(ride.departureTime);
        const searchDate = new Date(searchParams.date);
        
        // // Basic filters
        // if (ride.seats < searchParams.seats) return false;
        // if (ride.price < searchParams.minPrice || ride.price > searchParams.maxPrice) return false;
        // if (searchParams.vehicleTypes.length > 0 && !searchParams.vehicleTypes.includes(ride.type)) return false;
        // if (ride.driverEmail === currentUser.email) return false;
        if (ride.status === 'booked') return false;

        // Location filters
        if (searchParams.from && !ride.pickup.toLowerCase().includes(searchParams.from)) return false;
        if (searchParams.to && !ride.destination.toLowerCase().includes(searchParams.to)) return false;

        // Date filter
        if (!isSameDay(rideDate, searchDate)) return false;

        return true;
    });

    // Sort rides
    filteredRides = sortRides(filteredRides);

    // Update UI
    updateRidesList(filteredRides);
}

// Sort rides
function sortRides(rides) {
    const sortValue = sortBy.value;
    
    return [...rides].sort((a, b) => {
        switch (sortValue) {
            case 'price-asc':
                return a.price - b.price;
            case 'price-desc':
                return b.price - a.price;
            case 'time-asc':
                return new Date(a.departureTime) - new Date(b.departureTime);
            case 'time-desc':
                return new Date(b.departureTime) - new Date(a.departureTime);
            default:
                return 0;
        }
    });
}

// Update rides list
function updateRidesList(rides) {
    console.log('Updating rides list:', rides);
    
    if (rides.length === 0) {
        ridesList.innerHTML = `
            <div class="no-rides">
                <i class="fas fa-search"></i>
                <p>No rides found matching your criteria</p>
                <p>Try adjusting your search filters</p>
            </div>
        `;
        rideCount.textContent = '0';
        return;
    }

    rideCount.textContent = rides.length;
    ridesList.innerHTML = rides.map(ride => createRideCard(ride)).join('');
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
                <button class="book-btn" onclick="bookRide('${ride.id}')" ${ride.seats === 0 ? 'disabled' : ''}>
                    ${ride.seats === 0 ? 'Fully Booked' : 'Book Now'}
                </button>
            </div>
        </div>
    `;
}

// Book a ride
function bookRide(rideId) {
    console.log('Booking ride:', rideId);
    console.log('Current rides:', rides);
    
    const rideIndex = rides.findIndex(r => r.id === rideId);
    if (rideIndex === -1) {
        showNotification('Ride not found', 'error');
        return;
    }

    const ride = rides[rideIndex];
    if (ride.seats <= 0) {
        showNotification('Sorry, no seats available for this ride', 'error');
        return;
    }

    // Update ride seats and status
    ride.seats--;
    if (ride.seats === 0) {
        ride.status = 'booked';
    }
    
    // Create booking
    const booking = {
        id: Date.now().toString(),
        rideId: ride.id,
        userId: currentUser.email,
        userName: currentUser.name,
        userMobile: currentUser.mobile,
        status: 'confirmed',
        bookedAt: new Date().toISOString(),
        rideDetails: {
            pickup: ride.pickup,
            destination: ride.destination,
            departureTime: ride.departureTime,
            vehicle: ride.vehicle,
            type: ride.type,
            price: ride.price
        }
    };

    // Update rides array with the modified ride
    rides[rideIndex] = ride;
    
    // Update localStorage
    localStorage.setItem('rides', JSON.stringify(rides));
    console.log('Updated rides:', rides);
    
    // Add booking to bookings array
    const bookings = JSON.parse(localStorage.getItem('bookings')) || [];
    bookings.push(booking);
    localStorage.setItem('bookings', JSON.stringify(bookings));

    // Send notification to ride owner
    sendBookingNotification(ride, booking);

    // Update UI
    if (searchForm.from.value || searchForm.to.value || searchForm.date.value) {
        searchRides();
    } else {
        showAllRides();
    }
    showNotification('Ride booked successfully!', 'success');
}

// Send booking notification
function sendBookingNotification(ride, booking) {
    // Get ride owner's details
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const rideOwner = users.find(user => user.email === ride.driverEmail);

    if (!rideOwner) {
        console.error('Ride owner not found');
        return;
    }

    // Create notification message
    const notification = {
        id: Date.now().toString(),
        type: 'booking',
        rideId: ride.id,
        message: `New booking from ${booking.userName} (${booking.userMobile}) for your ride from ${ride.pickup} to ${ride.destination}`,
        timestamp: new Date().toISOString(),
        isRead: false
    };

    // Add notification to ride owner's notifications
    const notifications = JSON.parse(localStorage.getItem('notifications')) || {};
    if (!notifications[rideOwner.email]) {
        notifications[rideOwner.email] = [];
    }
    notifications[rideOwner.email].push(notification);
    localStorage.setItem('notifications', JSON.stringify(notifications));

    // Send SMS notification (mock implementation)
    sendSMSNotification(rideOwner.mobile, notification.message);
}

// Send SMS notification (mock implementation)
function sendSMSNotification(mobileNumber, message) {
    // In a real implementation, this would integrate with an SMS service
    console.log(`Sending SMS to ${mobileNumber}: ${message}`);
    
    // Mock SMS sending
    const smsNotification = {
        to: mobileNumber,
        message: message,
        timestamp: new Date().toISOString()
    };

    // Store SMS notification in localStorage for demo purposes
    const smsNotifications = JSON.parse(localStorage.getItem('smsNotifications')) || [];
    smsNotifications.push(smsNotification);
    localStorage.setItem('smsNotifications', JSON.stringify(smsNotifications));
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Helper function to check if two dates are the same day
function isSameDay(date1, date2) {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
}

// Setup event listeners
function setupEventListeners() {
    // Search form
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        searchRides();
    });

    // Price range
    priceRange.addEventListener('input', (e) => {
        const value = e.target.value;
        minPrice.value = value;
        maxPrice.value = value;
        if (searchForm.from.value || searchForm.to.value || searchForm.date.value) {
            searchRides();
        } else {
            showAllRides();
        }
    });

    // Price inputs
    minPrice.addEventListener('change', () => {
        if (searchForm.from.value || searchForm.to.value || searchForm.date.value) {
            searchRides();
        } else {
            showAllRides();
        }
    });
    maxPrice.addEventListener('change', () => {
        if (searchForm.from.value || searchForm.to.value || searchForm.date.value) {
            searchRides();
        } else {
            showAllRides();
        }
    });

    // Vehicle types
    vehicleTypes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (searchForm.from.value || searchForm.to.value || searchForm.date.value) {
                searchRides();
            } else {
                showAllRides();
            }
        });
    });

    // Sort select
    sortBy.addEventListener('change', () => {
        if (searchForm.from.value || searchForm.to.value || searchForm.date.value) {
            searchRides();
        } else {
            showAllRides();
        }
    });
}

// Initialize page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 