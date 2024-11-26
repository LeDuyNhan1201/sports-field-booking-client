document.getElementById('btnSignIn')
    .addEventListener('click', async (event) => {
    event.preventDefault();
    showLoading(true);

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetchCustom({
            url: SERVER_DOMAIN + '/auth/sign-in',
            method: 'POST',
            body: { email, password }
        });

        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            const message = data.message || 'Sign in failed';
            popupError(message);
            validationForm("formSignIn", data.errors);

        } else {
            const { accessToken, refreshToken } = data.tokensResponse;

            // Lấy thời gian hết hạn từ token
            const decodeToken = (token) => {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.exp * 1000; // chuyển đổi sang milliseconds
            };

            // console.log("expire in minutes: ", (accessTokenExpiry - Date.now()) / 1000 / 60);
            // console.log("expire in minutes: ", (refreshTokenExpiry - Date.now()) / 1000 / 60);
            // Lưu cookie với thời gian hết hạn từ token
            const accessTokenExpiry = new Date(decodeToken(accessToken));
            const refreshTokenExpiry = new Date(decodeToken(refreshToken));
            setCookie('accessToken', accessToken, '/', 'localhost', accessTokenExpiry.toUTCString(), 'Strict');
            setCookie('refreshToken', refreshToken, '/', 'localhost', refreshTokenExpiry.toUTCString(), 'Strict');

            localStorage.setItem('current-user', JSON.stringify(data.userInfo));

            window.location.href = CLIENT_DOMAIN;
        }

    } catch (error) {
        console.error('Error signing in:', error);
        popupError(error.message);

    } finally {
       showLoading(false);
    }
});

document.getElementById('btnGoogle')
    .addEventListener('click', async (event) => {
        event.preventDefault();
        showLoading(true);

        try {
            const response = await fetchCustom({
                url: SERVER_DOMAIN + '/auth/social',
                method: 'GET',
                queryParams: { provider: 'google' }
            });

            if (!response.ok) {
                const message = data.message || 'Sign in failed';
                popupError(message);
            }

            const data = await response.json();
            console.log(data);
            const { url } = data;

            window.location.href = url;

        } catch (error) {
            console.error('Error signing in:', error);
            popupError(error.message);

        } finally {
            showLoading(false);
        }
    });

// document.getElementById('refresh-btn').addEventListener('click', async (event) => {
//     event.preventDefault();
//     await refreshToken();
// });

document.querySelectorAll('label');
const passwordField = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const passwordIcon = document.getElementById('passwordIcon');

togglePassword.addEventListener('click', () => {
    const isPasswordHidden = passwordField.type === 'password';
    passwordField.type = isPasswordHidden ? 'text' : 'password';

    const eyePath = passwordIcon.getAttribute('data-eye-path');
    const hiddenPath = passwordIcon.getAttribute('data-hidden-path');

    passwordIcon.src = isPasswordHidden ? eyePath : hiddenPath;
});

document.getElementById('formSignIn').addEventListener('keydown', async (event) => {
    if (event.key === 'Enter') {
        event.preventDefault();

        document.getElementById('btnSignIn').click();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const rememberMeCheckbox = document.getElementById('rememberMe');
    const toggleBackground = rememberMeCheckbox.nextElementSibling;
    const dot = toggleBackground.querySelector('.dot');

    rememberMeCheckbox.addEventListener('change', () => {
        if (rememberMeCheckbox.checked) {
            console.log('Remember Password: true');
            toggleBackground.classList.add('bg-green-500');
        } else {
            console.log('Remember Password: false');
            toggleBackground.classList.remove('bg-green-500');
        }
    });
});
