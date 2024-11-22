function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}
let OFFSET = 0;
const LIMIT = 1000;

document.addEventListener('DOMContentLoaded', () => {
    const notificationIcon = document.getElementById('notification-icon');
    const notificationDropdown = document.getElementById('notification-dropdown');

    notificationIcon.addEventListener('click', (event) => {
        event.stopPropagation();
        notificationDropdown.classList.toggle('opacity-0');
        notificationDropdown.classList.toggle('invisible');
        notificationDropdown.classList.toggle('opacity-100');
        notificationDropdown.classList.toggle('visible');
    });

    document.addEventListener('click', (event) => {
        if (!notificationIcon.contains(event.target) && !notificationDropdown.contains(event.target)) {
            notificationDropdown.classList.add('opacity-0');
            notificationDropdown.classList.add('invisible');
            notificationDropdown.classList.remove('opacity-100');
            notificationDropdown.classList.remove('visible');
        }
    });
});

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = getCookie('accessToken');
        if (!token) {
            throw new Error('No auth token found');
        }

        const response = await fetch(`${SERVER_DOMAIN}/notification?offset=${OFFSET}&limit=${LIMIT}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        console.log(data);
        const notificationContainer = document.querySelector('.flex.flex-col');
        notificationContainer.innerHTML = '';

        if (data.items.length === 0) {
            const noNotificationsMessage = document.createElement('p');
            noNotificationsMessage.className = 'text-center p-2 text-sm';
            noNotificationsMessage.textContent = 'No notifications available';
            notificationContainer.appendChild(noNotificationsMessage);
            updateNotificationCount(0);
            return;
        }

        const unreadNotifications = data.items.filter(notification => !notification.read);
        const unreadCount = unreadNotifications.length;
        updateNotificationCount(unreadCount);

        data.items.slice(0, 3).forEach(notification => {
            const notificationElement = createNotificationElement(notification, token);
            notificationContainer.appendChild(notificationElement);
        });

        let viewAllLink;
        if (data.items.length > 2) {
            viewAllLink = document.createElement('a');
            viewAllLink.href = '#';
            viewAllLink.id = 'view-all-notification';
            viewAllLink.className = 'text-center p-2 hover:bg-gray-100 text-sm';
            viewAllLink.textContent = 'View All Notifications';
            viewAllLink.addEventListener('click', (event) => {
                event.stopPropagation();
                toggleViewAllNotifications(token, notificationContainer, viewAllLink);
            });
            notificationContainer.appendChild(viewAllLink);
        }

    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
});

let isViewAllOpen = false;

async function toggleViewAllNotifications(token, notificationContainer, viewAllLink) {
    if (isViewAllOpen) {
        notificationContainer.innerHTML = '';
        const notificationElements = document.querySelectorAll('.notification-item');
        notificationElements.forEach(el => notificationContainer.appendChild(el));
        viewAllLink.textContent = 'View All Notifications';
    } else {
        await displayAllNotifications(token, notificationContainer);
        viewAllLink.textContent = 'Hide Notifications';
    }
    isViewAllOpen = !isViewAllOpen;
}

async function displayAllNotifications(token, notificationContainer) {
    let hasMore = true;

    notificationContainer.innerHTML = '';

    while (hasMore) {
        const allResponse = await fetch(`${SERVER_DOMAIN}/notification?offset=${OFFSET}&limit=${LIMIT}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!allResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const allData = await allResponse.json();
        allData.items.forEach(notification => {
            const notificationElement = createNotificationElement(notification, token);
            notificationElement.classList.add('notification-item');
            notificationContainer.appendChild(notificationElement);
        });

        hasMore = allData.items.length === limit;
        offset += limit;
    }
}

function createNotificationElement(notification, token) {
    const notificationElement = document.createElement('a');
    if (notification.type === 'COMMENT_FEEDBACK') {
        notificationElement.href = `${CLIENT_DOMAIN}/sports-field/${notification.review.sportsField.id}/reviews`;
    } else if (notification.type === 'ORDER_STATUS_UPDATE') {
        notificationElement.href = `${CLIENT_DOMAIN}/my-booking?bookingId=${notification.booking.id}`;
    } else if (notification.type === 'PROMOTION') {
        notificationElement.href = `${CLIENT_DOMAIN}/sports-field/${notification.sportField.id}/details`;
    } else {
        notificationElement.href = `${CLIENT_DOMAIN}/sports-field`;
    }
    notificationElement.className = `flex items-center p-2 hover:bg-gray-100 border-b border-gray-300 ${!notification.read ? 'bg-gray-200' : ''}`;
    const { iconUrl, iconAlt, message } = getNotificationDetails(notification);

    notificationElement.innerHTML = `
        <img src="${iconUrl}" class="w-8 h-8 mr-2" alt="${iconAlt}">
        <div class="flex-1 text-sm">
            <span>${message}</span>
            <span class="font-bold">${notification.id}</span>
        </div>
        ${!notification.read ? '<div class="w-2 h-2 bg-green-500 rounded-full ml-2"></div>' : ''}
    `;

    notificationElement.addEventListener('click', async (event) => {
        if (!notification.read) {
            event.preventDefault();
            await markNotificationAsRead(notification.id, token);
            notification.read = true;

            const currentUnreadCount = parseInt(document.querySelector('#notification-count').textContent, 10);
            updateNotificationCount(Math.max(0, currentUnreadCount - 1));
            notificationElement.classList.remove('bg-gray-200');
            notificationElement.classList.add('read');

            // Redirect to the appropriate page after marking as read
            window.location.href = notificationElement.href;
        }
    });

    return notificationElement;
}

async function markNotificationAsRead(notificationId, token) {
    await fetch(`${SERVER_DOMAIN}/notification/${notificationId}/read`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

async function markAllNotificationsAsRead(token) {
    await fetch(`${SERVER_DOMAIN}/notification/read-all`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

function updateNotificationCount(count) {
    const notificationCountElement = document.querySelector('#notification-count');

    if (count > 0) {
        notificationCountElement.textContent = count;
        notificationCountElement.classList.remove('hidden');
    } else {
        notificationCountElement.classList.add('hidden');
    }
}

function getNotificationDetails(notification) {
    let iconUrl = '/sports-field-booking/image/default.png';
    let iconAlt = 'notification';
    let message = notification.message;

    switch (notification.type) {
        case 'PROMOTION':
            iconUrl = '/sports-field-booking/image/promotion.jpg';
            iconAlt = 'promotion';
            message = `Promotion: ${notification.message}`;
            break;
        case 'ORDER_STATUS_UPDATE':
            iconUrl = '/sports-field-booking/image/order.png';
            iconAlt = 'order-notification';
            message = `New Order: ${notification.message}`;
            break;
        case 'YARD_STATUS_UPDATE':
            iconUrl = '/sports-field-booking/image/sport-field-status-update.png';
            iconAlt = 'yard-status-update';
            message = `Yard Status Update: ${notification.message}`;
            break;
        case 'COMMENT_FEEDBACK':
            iconUrl = '/sports-field-booking/image/message.png';
            iconAlt = 'reply';
            message = `Reply: ${notification.message}`;
            break;
        default:
            iconUrl = '/sports-field-booking/image/default.png';
            iconAlt = 'notification';
            message = notification.message;
            break;
    }

    return { iconUrl, iconAlt, message };
}