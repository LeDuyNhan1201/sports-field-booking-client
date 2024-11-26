const currentUser = localStorage.getItem('current-user');

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
        }
        else if (user.roles && user.roles.includes('FIELD_OWNER')) {
            sportFieldMenu.classList.remove('hidden')
            promotionMenu.classList.remove('hidden')
            dashBoardMenu.classList.remove('hidden')
            orderMenu.classList.remove('hidden')
        }

    } else {
        loginSection.classList.remove('hidden');
        userInfoSection.classList.add
    }
}

