// This is your new details.js file
let map;
const token = localStorage.getItem('authToken');
const urlParams = new URLSearchParams(window.location.search);
const dustbinId = urlParams.get('id'); // Get the ID from the URL (e.g., ?id=12345)

// --- THIS IS THE FIX ---
// This function is now in the global scope, so the Google script can find it
function initMap(bin) {
    const binLocation = { lat: bin.lat, lng: bin.lng };
    
    // Check if location is 0,0 (device hasn't reported yet)
    if (bin.lat === 0) {
        document.getElementById('map').innerHTML = '<p style="text-align:center; padding-top: 50px; color: var(--gray);">Waiting for device\'s first location update...</p>';
        return;
    }

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 16, // Zoom in closer
        center: binLocation,
    });
    
    new google.maps.Marker({
        position: binLocation,
        map: map,
        title: `${bin.name} (${bin.status})`,
    });
}
// --- END OF FIX ---


// --- 1. Security Check & Page Setup ---
document.addEventListener('DOMContentLoaded', function () {
    if (!token) {
        alert('You must be logged in.');
        window.location.href = 'login.html';
        return;
    }
    
    if (!dustbinId) {
        alert('No dustbin ID provided.');
        window.location.href = 'index.html';
        return;
    }
    
    // Set up user email and logout (same as iot.js)
    const payload = JSON.parse(atob(token.split('.')[1]));
    document.getElementById('user-email-display').textContent = payload.email;
    document.getElementById('logout-link').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('authToken');
        alert('You have been logged out.');
        window.location.href = 'login.html';
    });

    // Go fetch the data for this one dustbin
    fetchDustbinDetails();
    
    // TODO: Add delete button logic
});
async function fetchDustbinDetails() {
    try {
        const response = await fetch(`/api/dustbins/${dustbinId}`, {
// ... existing code ...
            headers: {
                'Authorization': `Bearer ${token}`
            }
// ... existing code ...
        });

        if (!response.ok) {
// ... existing code ...
            throw new Error('Could not fetch dustbin details.');
        }

        const bin = await response.json();
        
        // Populate the page with the data
        document.getElementById('bin-name-title').textContent = bin.name;
        document.getElementById('detail-id').textContent = bin.dustbinId;
        document.getElementById('detail-status').textContent = bin.status;
        document.getElementById('detail-distance').textContent = `${bin.distance} cm`; // <-- NEW: Show distance
        document.getElementById('detail-coords').textContent = `${bin.lat.toFixed(6)}, ${bin.lng.toFixed(6)}`;
        
        const lastUpdated = new Date(bin.lastUpdated);
// ... existing code ...
        document.getElementById('detail-update').textContent = lastUpdated.toLocaleString();

        // Load the map
// ... existing code ...
        initMap(bin);

    } catch (err) {
// ... existing code ...
        console.error(err);
        alert(err.message);
    }
}