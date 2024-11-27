const currentUser = localStorage.getItem('current-user');
const userAvatar = document.getElementById('avatar');
const usernameElement = document.getElementById('username');

if (localStorage.getItem('current-user') !== null) {
    const defaultAvatarUrl = document.getElementById('avatar').getAttribute('src');

    if (currentUser) {
        const user = JSON.parse(currentUser)

        userAvatar.src = user.avatar || defaultAvatarUrl
        usernameElement.textContent = user.username || "John doe"

    }
}

if (localStorage.getItem('current-user') !== null) {
    if (currentUser) {
        const user = JSON.parse(currentUser)
        const dashBoardMenu = document.getElementById('dashboard-menu')
        const promotionMenu = document.getElementById('promotion-menu')
        const userMenu = document.getElementById('user-menu')
        const orderMenu = document.getElementById('order-menu')
        const sportFieldMenu = document.getElementById('sport-field-menu')
        const categoryMenu = document.getElementById('category-menu')

        if (user.roles && user.roles.includes('ADMIN')) {
            userMenu.classList.remove('hidden')
            categoryMenu.classList.remove('hidden')
            sportFieldMenu.classList.remove('hidden')
            promotionMenu.classList.remove('hidden')
        }
        else if (user.roles && user.roles.includes('FIELD_OWNER')) {
            sportFieldMenu.classList.remove('hidden')
            dashBoardMenu.classList.remove('hidden')
            orderMenu.classList.remove('hidden')
        }

    }
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

