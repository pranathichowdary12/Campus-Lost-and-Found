// Get the registration form
const registerForm = document.getElementById('registerForm');

// Registration functionality
if (registerForm) {

    registerForm.addEventListener('submit', async function (event) {

        // Prevent page refresh
        event.preventDefault();

        // Get values from input fields
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        const message = document.getElementById('registerMessage');

        // Check password match
        if (password !== confirmPassword) {
            message.textContent = 'Passwords do not match!';
            message.style.color = 'red';
            return;
        }

        // Check password length
        if (password.length < 6) {
            message.textContent = 'Password must contain at least 6 characters.';
            message.style.color = 'red';
            return;
        }

        try {

            // Send registration data to backend
            const response = await fetch(
                'https://campus-lost-and-found-tt3q.onrender.com/api/auth/register',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        name: name,
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                message.textContent = 'Registration successful!';
                message.style.color = 'green';

                // Clear the form
                registerForm.reset();

            } else {

                message.textContent = data.message || 'Registration failed.';
                message.style.color = 'red';

            }

        } catch (error) {

            console.error('Registration Error:', error);

            message.textContent = 'Unable to connect to the server.';
            message.style.color = 'red';

        }

    });

}

// Get the login form
const loginForm = document.getElementById('loginForm');

// Login functionality
if (loginForm) {

    loginForm.addEventListener('submit', async function (event) {

        event.preventDefault();

        // Get login details
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        const message = document.getElementById('loginMessage');

        try {

            // Send login request to backend
            const response = await fetch(
                'https://campus-lost-and-found-tt3q.onrender.com/api/auth/login',
                {
                    method: 'POST',

                    headers: {
                        'Content-Type': 'application/json'
                    },

                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                }
            );

            const data = await response.json();

            if (response.ok) {

                // Save JWT token
                localStorage.setItem('token', data.token);

                // Save user information
                localStorage.setItem(
                    'user',
                    JSON.stringify(data.user)
                );

                message.textContent = 'Login successful!';
                message.style.color = 'green';

                // Redirect based on role
                setTimeout(() => {

                    if (data.user.role === 'admin') {
                        window.location.href = 'admin-dashboard.html';
                    } else {
                        window.location.href = 'student-dashboard.html';
                    }

                }, 1000);

            } else {

                message.textContent = data.message || 'Invalid login details.';
                message.style.color = 'red';

            }

        } catch (error) {

            console.error('Login Error:', error);

            message.textContent = 'Unable to connect to the server.';
            message.style.color = 'red';

        }

    });

}