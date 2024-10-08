document.getElementById('sign-in-form').addEventListener('submit', async (event) => {
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

        if (!response.ok) alert('Login failed');

        const data = await response.json();
        console.log(data);
        const { accessToken, refreshToken } = data.tokensResponse;

        // Lấy thời gian hết hạn từ token
        const decodeToken = (token) => {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000; // chuyển đổi sang milliseconds
        };

        const accessTokenExpiry = new Date(decodeToken(accessToken));
        const refreshTokenExpiry = new Date(decodeToken(refreshToken));

        console.log("expire in minutes: ", (accessTokenExpiry - Date.now()) / 1000 / 60);
        console.log("expire in minutes: ", (refreshTokenExpiry - Date.now()) / 1000 / 60);
        // Lưu cookie với thời gian hết hạn từ token
        document.cookie = `accessToken=${accessToken}; path=/; domain=localhost; expires=${accessTokenExpiry.toUTCString()}`;
        document.cookie = `refreshToken=${refreshToken}; path=/; domain=localhost; expires=${refreshTokenExpiry.toUTCString()}`;

        localStorage.setItem('current-user', JSON.stringify(data.userInfo));

        alert('Login successful!');
        window.location.href = CLIENT_DOMAIN;

    } catch (error) {
        alert(error.message);
    } finally {
        showLoading(false);
    }
});

document.getElementById('refresh-btn').addEventListener('click', async (event) => {
    event.preventDefault();
    await refreshToken();
});