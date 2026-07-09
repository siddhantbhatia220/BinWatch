// This is your CORRECTED and EXTENDED auth.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const changePasswordForm = document.getElementById('change-password-form'); // Target the new form

    // --- LOGIN LOGIC ---
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Use the API endpoint
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    
                    // Save the JWT TOKEN in the browser's memory
                    localStorage.setItem('authToken', data.token); 
                    
                    // Redirect to the main dashboard
                    window.location.href = 'index.html'; 
                } else {
                    const data = await response.json();
                    alert(`Login failed: ${data.message}`);
                }
            } catch (err) {
                console.error('Login error:', err);
                alert('An error occurred. Please check the console.');
            }
        });
    }

    // --- REGISTRATION LOGIC ---
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            try {
                // Use the API endpoint
              const response = await fetch('/api/auth/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                if (response.status === 201) {
                    alert('Registration successful! Please log in.');
                    window.location.href = 'login.html';
                } else {
                    const data = await response.json();
                    alert(`Registration failed: ${data.message}`);
                }
            } catch (err) {
                console.error('Registration error:', err);
                alert('An error occurred. Please check the console.');
            }
        });
    }

    // --- NEW: CHANGE PASSWORD LOGIC ---
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            // Get the token from local storage
            const token = localStorage.getItem('authToken'); 
            if (!token) {
                 alert('You must be logged in to change your password.');
                 window.location.href = 'login.html';
                 return;
            }

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
});