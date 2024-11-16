function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const token = getCookie('accessToken');
        if (!token) {
            throw new Error('No auth token found');
        }

        const response = await fetch(`http://localhost:8888/sports-field-booking/api/v1/notification?offset=0&limit=3`, {
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
            viewAllLink.addEventListener('click', () => toggleViewAllNotifications(token, notificationContainer, viewAllLink));
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
    let offset = 0;
    const limit = 20;
    let hasMore = true;

    notificationContainer.innerHTML = '';

    while (hasMore) {
        const allResponse = await fetch(`http://localhost:8888/sports-field-booking/api/v1/notification?offset=${offset}&limit=${limit}`, {
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

    await markAllNotificationsAsRead(token);
    updateNotificationCount(0);
}

function createNotificationElement(notification, token) {
    const notificationElement = document.createElement('a');
    if (notification.type === 'COMMENT_FEEDBACK') {
        notificationElement.href = `http://localhost:3333/sports-field-booking/sports-field/${notification.review.sportField.id}/reviews`;
    }
    if (notification.type === 'ORDER_STATUS_UPDATE') {
        notificationElement.href = `http://localhost:3333/sports-field-booking/my-booking?bookingId=${notification.booking.id}`;
    }
    else {
        notificationElement.href = `http://localhost:3333/sports-field-booking/sports-field/${notification.review.sportField.id}/details`;
    }
    notificationElement.className = `flex items-center p-2 hover:bg-gray-100 border-b border-gray-300 ${!notification.read ? 'bg-gray-200' : ''}`;
    const { iconUrl, iconAlt, message } = getNotificationDetails(notification);

    notificationElement.innerHTML = `
        <img src="${iconUrl}" class="w-8 h-8 mr-2" alt="${iconAlt}">
        <div class="flex-1 text-sm">
            <span>${message}</span>
            <span class="font-bold">${notification.id}</span>
        </div>
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
        }
    });

    return notificationElement;
}

async function markNotificationAsRead(notificationId, token) {
    await fetch(`http://localhost:8888/sports-field-booking/api/v1/notification/${notificationId}/read`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    });
}

async function markAllNotificationsAsRead(token) {
    await fetch(`http://localhost:8888/sports-field-booking/api/v1/notification/read-all`, {
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