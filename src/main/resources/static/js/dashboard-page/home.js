const userAvatar = document.getElementById('avatar');
const usernameElement = document.getElementById('username');
const currentUser = localStorage.getItem('current-user');


if (localStorage.getItem('current-user') !== null) {
    const defaultAvatarUrl = document.getElementById('avatar').getAttribute('src');

    if (currentUser) {
        const user = JSON.parse(currentUser)

        userAvatar.src = user.avatar || defaultAvatarUrl
        usernameElement.textContent = user.username || "John doe"

    }
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
                "accessToken": getAccessTokenFromCookie(),
                "refreshToken": getRefreshTokenFromCookie()
            }
        });

        if (!response.ok) showError("Failed to refresh token");

        localStorage.removeItem('current-user');
        window.location.href = CLIENT_DOMAIN + "/sign-out";

    } catch (error) {
        console.error('Error refreshing token:', error);
    }
    finally {
        showLoading(false);
    }
});



