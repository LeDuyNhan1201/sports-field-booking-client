const currentUser = localStorage.getItem('current-user');
const loginSection = document.getElementById('login-section');
const userInfoSection = document.getElementById('user-info');
const userAvatar = document.getElementById('avatar');
const usernameElement = document.getElementById('username');
const fieldManagement = document.getElementById('field-management');

if (localStorage.getItem('current-user') !== null) {
    console.log('Current user:', JSON.parse(localStorage.getItem('current-user')));

    if (currentUser) {
        const user = JSON.parse(currentUser)
        console.log("test cai", user)

        loginSection.classList.add('hidden')
        userInfoSection.classList.remove('hidden')
        userAvatar.src = user.avatar || 'image/user-info/user-info.png'
        usernameElement.textContent = user.username

        if (user.roles && user.roles.includes('FIELD_OWNER')) {
           fieldManagement.classList.remove('hidden')
        }else {
           fieldManagement.classList.add('hidden')
        }
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
    }
   finally {
       showLoading(false);
   }
});