// This is your new iot.js, now fully secure and multi-user
let map;
let markers = [];
const token = localStorage.getItem('authToken'); // Get the token

// --- 1. NEW: SECURITY CHECK & PAGE SETUP ---
document.addEventListener('DOMContentLoaded', function () {
    
    // Check for token on all pages that use iot.js (index.html and change_password.html)
    if (!token && window.location.pathname.indexOf('login.html') === -1 && window.location.pathname.indexOf('register.html') === -1) {
        alert('You must be logged in to view this page.');
        window.location.href = 'login.html';
        return; // Stop running the script
    }

    // Only proceed with dashboard setup if the token exists
    if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const userEmail = payload.email;

        // 1. Update the dashboard header
        const emailDisplay = document.getElementById('user-email-display');
        if (emailDisplay) {
            emailDisplay.textContent = userEmail;
        }
        
        // 2. Set up the logout link
        document.getElementById('logout-link')?.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('authToken');
            alert('You have been logged out.');
            window.location.href = 'login.html';
        });

        // 3. Conditional: Run dashboard-specific functions only on index.html
        if (document.getElementById('status-overview')) {
            console.log('Smart Dustbin Monitoring System UI Loaded');
            fetchDustbinData();
            connectWebSocket();
        }
        
        // 4. Logic for the "Register Device" form
        const addBinForm = document.getElementById('add-bin-form');
        if (addBinForm) {
            addBinForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                // 1. Only get the name from the form
                const name = document.getElementById('bin-name').value;

                try {
                    const response = await fetch('/api/dustbins', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        // 2. Only send the name
                        body: JSON.stringify({ name }) 
                    });

                    if (!response.ok) {
                        const err = await response.json();
                        throw new Error(err.message);
                    }
                    
                    // 3. Get the new dustbin data back from the server
                    const newBin = await response.json();
                    
                    addBinForm.reset();
                    
                    // 4. Show the user the new ID they must program!
                    alert(`Device "${newBin.name}" registered successfully!\n\nYour new Unique ID is:\n${newBin.dustbinId}\n\nPlease program this ID onto your ESP8266 device.`);
                    
                    // The websocket will handle updating the list automatically
                    
                } catch (err) {
                    alert('Failed to register device: ' + err.message);
                }
            });
        }
        
        // 5. NEW: Logic for the "Change Password" form (on change_password.html)
        const changePasswordForm = document.getElementById('change-password-form');
        if (changePasswordForm) {
             changePasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                
                const currentPassword = document.getElementById('currentPassword').value;
                const newPassword = document.getElementById('newPassword').value;
                const confirmNewPassword = document.getElementById('confirmNewPassword').value;
                
                if (newPassword !== confirmNewPassword) {
                    alert('New password and confirmation do not match.');
                    return;
                }

                try {
                    const response = await fetch('/api/auth/change-password', {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ currentPassword, newPassword }) 
                    });

                    const data = await response.json();
                    
                    if (response.ok) {
                        alert(data.message + ' You will be logged out now. Please log in with your new password.');
                        localStorage.removeItem('authToken');
                        window.location.href = 'login.html';
                    } else {
                        // Display error from server (e.g., "Invalid current password.")
                        alert(`Password change failed: ${data.message}`);
                    }
                } catch (err) {
                    console.error('Password change error:', err);
                    alert('An unexpected error occurred. Please try again.');
                }
             });
        }

    } // End of token check
    
    // --- 2. Initial Data Load (Dashboard Only) ---
    async function fetchDustbinData() {
        try {
            const response = await fetch('/api/dustbins', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) {
                if (response.status === 401 || response.status === 400) {
                        localStorage.removeItem('authToken');
                        alert('Your session has expired. Please log in again.');
                        window.location.href = 'login.html';
                }
                throw new Error(`Server responded with ${response.status}`);
            }
            const dustbins = await response.json();
            updateDashboard(dustbins);
        } catch (error) {
            console.error('Failed to fetch initial dustbin data:', error);
        }
    }

    // --- 3. Real-Time WebSocket Listener (Dashboard Only) ---
    function connectWebSocket() {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const ws = new WebSocket(`${protocol}//${window.location.host}?token=${token}`);
        ws.onopen = () => console.log('Connected to real-time update server');
        ws.onmessage = (event) => {
            console.log('Received real-time update from server');
            const dustbins = JSON.parse(event.data);
            updateDashboard(dustbins); // This one function updates everything
        };
        ws.onclose = () => {
            console.log('Disconnected from real-time server. Attempting to reconnect...');
            setTimeout(connectWebSocket, 3000);
        };
        ws.onerror = (error) => console.error('WebSocket Error:', error);
    }

    // --- 4. Page Update Functions (Dashboard Only) ---

    // This is the new "main" update function
    function updateDashboard(dustbins) {
        updateDustbinList(dustbins);
        initMap(dustbins);
        updateStats(dustbins);
    }

    function updateStats(dustbins) {
        let total = dustbins.length;
        let full = dustbins.filter(d => d.status === 'Full').length;
        let empty = dustbins.filter(d => d.status === 'Empty').length;
        let offline = dustbins.filter(d => d.status === 'Offline').length;

        document.getElementById('stat-total-bins').textContent = total;
        document.getElementById('stat-bins-full').textContent = full;
        document.getElementById('stat-bins-empty').textContent = empty;
        document.getElementById('stat-bins-offline').textContent = offline;

        // Update the progress bars
        let half = dustbins.filter(d => d.status === 'Half').length;
        let totalActive = total - offline;
        let fullPercent = totalActive === 0 ? 0 : (full / totalActive) * 100;
        let halfPercent = totalActive === 0 ? 0 : (half / totalActive) * 100;
        let emptyPercent = totalActive === 0 ? 0 : (empty / totalActive) * 100;
        
        document.getElementById('status-overview').innerHTML = `
            <div class="space-y-3">
                <div class="flex items-center justify-between text-xs">
                    <span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-emerald-500"></span> Empty (${empty})</span>
                    <span class="font-mono text-zinc-500">${Math.round(emptyPercent)}%</span>
                </div>
                <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-emerald-500 transition-all duration-1000" style="width: ${emptyPercent}%"></div>
                </div>

                <div class="flex items-center justify-between text-xs mt-4">
                    <span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-amber-500"></span> Half Full (${half})</span>
                    <span class="font-mono text-zinc-500">${Math.round(halfPercent)}%</span>
                </div>
                <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-amber-500 transition-all duration-1000" style="width: ${halfPercent}%"></div>
                </div>

                <div class="flex items-center justify-between text-xs mt-4">
                    <span class="flex items-center gap-2"><span class="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span> Full (${full})</span>
                    <span class="font-mono text-zinc-500">${Math.round(fullPercent)}%</span>
                </div>
                <div class="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div class="h-full bg-red-500 transition-all duration-1000 shadow-[0_0_10px_rgba(239,68,68,0.5)]" style="width: ${fullPercent}%"></div>
                </div>
            </div>
        `;
    }

    function updateDustbinList(dustbins) {
        const list = document.querySelector('.dustbin-list');
        list.innerHTML = ''; 
        if (dustbins.length === 0) {
            list.innerHTML = '<p style="padding: 15px; text-align: center; color: var(--gray);">You have not registered any devices yet. Use the form below.</p>';
        }
        
        dustbins.sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));
        
        dustbins.forEach(bin => {
            // 1. Create an <a> (link) element
            const item = document.createElement('a');
            item.className = 'dustbin-item';
            // 2. Set its link to the new details page, passing the bin's MongoDB _id
            item.href = `details.html?id=${bin._id}`; 

            let statusHtml = '';
            let dotColor = 'bg-emerald-400';
            
            if (bin.status === 'Full') {
                statusHtml = '<span class="px-2 py-1 bg-red-500/15 border border-red-500/30 text-red-400 rounded text-[10px] font-semibold tracking-wide">FULL</span>';
                dotColor = 'bg-red-500 animate-pulse';
            } else if (bin.status === 'Half') {
                statusHtml = '<span class="text-amber-400">Half</span>';
                dotColor = 'bg-amber-400';
            } else if (bin.status === 'Offline') {
                statusHtml = '<span class="text-zinc-500">Offline</span>';
                dotColor = 'bg-zinc-600';
            } else {
                statusHtml = '<span class="text-emerald-400">Empty</span>';
            }

            const lastUpdated = new Date(bin.lastUpdated);
            const now = new Date();
            const minutesAgo = Math.round((now - lastUpdated) / (1000 * 60));
            
            let locationText = `GPS: ${bin.lat.toFixed(4)}, ${bin.lng.toFixed(4)}`;
            if (bin.lat === 0) {
                locationText = "Waiting for sync...";
            }

            item.innerHTML = `
                <div class="w-1.5 h-1.5 rounded-full ${dotColor} flex-shrink-0 mt-1"></div>
                <div class="flex-1 min-w-0 flex items-center justify-between gap-4">
                    <span class="text-[10px] font-mono text-zinc-400 flex-shrink-0 w-16 truncate">${bin.dustbinId}</span>
                    <div class="flex-1 min-w-0">
                        <p class="text-xs text-zinc-200 truncate">${bin.name}</p>
                        <p class="text-[9px] text-zinc-600 mt-0.5 truncate">${minutesAgo}m ago · ${locationText}</p>
                    </div>
                </div>
                <div class="text-[10px] font-mono text-right flex-shrink-0 w-16">
                    ${statusHtml}
                </div>
            `;
            
            item.className = 'flex items-start gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.04] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer group';
            list.appendChild(item);
        });
    }

    function initMap(dustbins) {
        // Only run map logic on the main dashboard page
        if (!document.getElementById("map") || !dustbins) return; 

        markers.forEach(marker => marker.setMap(null));
        markers = [];

        // Filter out bins that haven't sent a location yet
        const locatedBins = dustbins.filter(bin => bin.lat !== 0);

        if (!map && locatedBins.length > 0) {
            const mapCenter = { lat: locatedBins[0].lat, lng: locatedBins[0].lng };
            map = new google.maps.Map(document.getElementById("map"), {
                zoom: 13, center: mapCenter,
            });
        } else if (!map) {
             map = new google.maps.Map(document.getElementById("map"), {
                zoom: 13, center: { lat: 40.7829, lng: -73.9654 }, // Default center
            });
        }

        locatedBins.forEach(bin => {
            const marker = new google.maps.Marker({
                position: { lat: bin.lat, lng: bin.lng },
                map: map,
                title: `${bin.name} (${bin.status})`,
            });
            markers.push(marker);
        });
    }

});



// 5. NEW: Logic for the "Change Password" form (on change_password.html)
const changePasswordForm = document.getElementById('change-password-form');
if (changePasswordForm) {
     changePasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        
        if (newPassword !== confirmNewPassword) {
            alert('New password and confirmation do not match.');
            return;
        }

        try {
            const response = await fetch('/api/auth/change-password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ currentPassword, newPassword }) 
            });

            const data = await response.json();
            
            if (response.ok) {
                alert(data.message + ' You will be logged out now. Please log in with your new password.');
                localStorage.removeItem('authToken');
                window.location.href = 'login.html';
            } else {
                // Display error from server (e.g., "Invalid current password.")
                alert(`Password change failed: ${data.message}`);
            }
        } catch (err) {
            console.error('Password change error:', err);
            alert('An unexpected error occurred. Please try again.');
        }
     });
}