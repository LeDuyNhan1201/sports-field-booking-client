const currentUser = localStorage.getItem('current-user');
const loginSection = document.getElementById('login-section');
const userInfoSection = document.getElementById('user-info');
const userAvatar = document.getElementById('avatar');
const usernameElement = document.getElementById('username');
const fieldManagement = document.getElementById('field-management');

async function loadUserAvatar() {
    try {
        const avatarResponse = await fetch(`${SERVER_DOMAIN}/file/metadata-by-user?userId=${JSON.parse(currentUser).id}`);
        const avatarData = await avatarResponse.json();
        
        userAvatar.src = avatarData.results ? avatarData.results : '/sports-field-booking/image/user-info/user-info.png';
    } catch (error) {                
        userAvatar.src = '/sports-field-booking/image/user-info/user-info.png';
    }
}

if (localStorage.getItem('current-user') !== null) {
    if (currentUser) {
        const user = JSON.parse(currentUser)
        console.log('test: ' + user.birthdate);

        loginSection.classList.add('hidden')
        userInfoSection.classList.remove('hidden')
        
        usernameElement.textContent = user.username

        if (user.roles && user.roles.includes('FIELD_OWNER')) {
            fieldManagement.classList.remove('hidden')
        } else {
            fieldManagement.classList.add('hidden')
        }

        if (user.roles && user.roles.includes('ADMIN')) {
            window.location.href = CLIENT_DOMAIN + '/dashboard';
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

document.getElementById('btnSignOut')
    .addEventListener('click', async (event) => {
    event.preventDefault();
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
        else window.location.href = `${CLIENT_DOMAIN}/auth`;

        localStorage.removeItem('current-user');
    } catch (error) {
        console.error('Error refreshing token:', error);
    }
    finally {
    }
});

window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('paymentStatus');

    if (paymentStatus) {
        sessionStorage.setItem('paymentStatus', paymentStatus);

        if (paymentStatus === 'success') {
            alert("Thanh toán thành công");
            history.replaceState(null, '', window.location.pathname);

            localStorage.removeItem('data');
    
            sessionStorage.removeItem('paymentStatus');
        } else {
            alert("Thanh toán thất bại. Vui lòng thử lại.");
        }
    }

    loadUserAvatar();

    triggerRefreshToken();
});