const currentUser = localStorage.getItem('current-user');
const loginSection = document.getElementById('login-section');
const userInfoSection = document.getElementById('user-info');
const userImage = document.getElementById('user-image');
const usernameElement = document.getElementById('username');

if (localStorage.getItem('current-user') !== null) {
    console.log('Current user:', JSON.parse(localStorage.getItem('current-user')));

    if (currentUser) {
        const user = JSON.parse(currentUser)
        console.log("test cai", user)

        loginSection.classList.add('hidden')
        userInfoSection.classList.remove('hidden')
        userImage.src = user.image || 'default-avatar.png'
        usernameElement.textContent = user.username
   } else {
        loginSection.classList.remove('hidden')
        userInfoSection.classList.add('hidden')
   }
}

function switchLanguage(lang) {
    console.log('Switching language to ' + lang);
    window.location.href = CLIENT_DOMAIN + '/settings/switch-language?lang=' + lang + '&returnUrl=' + window.location.pathname.replace('/sports-field-booking', '');
}

document.getElementById('btn-sign-out').addEventListener('click', async (event) => {
    event.preventDefault();
//    showLoading(true);

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
    }
//    finally {
//        showLoading(false);
//    }
});