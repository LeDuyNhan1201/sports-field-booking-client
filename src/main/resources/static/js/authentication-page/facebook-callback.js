window.onload = async () => {
    showLoading(true);
    try {
        const response = await fetchCustom({
            url: SERVER_DOMAIN + '/auth/social/callback',
            method: 'GET',
            queryParams: {
                code: new URLSearchParams(window.location.search).get('code'),
                provider: 'facebook'
            }
        });

        const data = await response.json();
        console.log(data);
        if (!response.ok) {
            const message = data.message || 'Sign in failed';
            popupError(message);
        } else {
            const {accessToken, refreshToken} = data.tokensResponse;

            const decodeToken = (token) => {
                const payload = JSON.parse(atob(token.split('.')[1]));
                return payload.exp * 1000; // chuyển đổi sang milliseconds
            };

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

}