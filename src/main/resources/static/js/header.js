if (localStorage.getItem('current-user') !== null) {
    console.log('Current user:', JSON.parse(localStorage.getItem('current-user')));
    document.getElementById('current-user').innerHTML = JSON.parse(localStorage.getItem('current-user')).email;
    document.getElementById('btn-sign-out').style.display = 'block';
} else {
    document.getElementById('current-user').innerHTML = 'Guest';
    document.getElementById('btn-sign-out').style.display = 'none';
}

function switchLanguage(lang) {
    console.log('Switching language to ' + lang);
    window.location.href = CLIENT_DOMAIN + '/settings/switch-language?lang=' + lang + '&returnUrl=' + window.location.pathname.replace('/sports-field-booking', '');
}

document.getElementById('btn-sign-out').addEventListener('click', async (event) => {
    event.preventDefault();
    showLoading(true);

    try {
        const response = await fetchCustom({
            url: SERVER_DOMAIN + '/auth/sign-out',
            method: 'POST',
            body: {
                "accessToken" : getAccessTokenFromCookie(),
                "refreshToken" : getRefreshTokenFromCookie()
            }
        });

        if (!response.ok) showError("Failed to refresh token");

        localStorage.removeItem('current-user');
        window.location.href = CLIENT_DOMAIN + "/sign-out";

    } catch (error) {
        console.error('Error refreshing token:', error);
    } finally {
        showLoading(false);
    }
});