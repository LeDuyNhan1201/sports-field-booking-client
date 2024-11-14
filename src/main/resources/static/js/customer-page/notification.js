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

        const unreadCount = data.items.filter(notification => !notification.isRead).length;

        const notificationCountElement = document.querySelector('#notification-count');
        if (unreadCount > 0) {
            notificationCountElement.textContent = unreadCount;
            notificationCountElement.classList.remove('hidden');
        } else {
            notificationCountElement.classList.add('hidden');
        }

        data.items.slice(0, 3).forEach(notification => {
            const notificationElement = createNotificationElement(notification);
            notificationContainer.appendChild(notificationElement);
        });

        if (data.items.length > 3) {
            const viewAllLink = document.createElement('a');
            viewAllLink.href = '#';
            viewAllLink.className = 'text-center p-2 hover:bg-gray-100 text-sm';
            viewAllLink.textContent = 'View All Notifications';
            viewAllLink.addEventListener('click', async () => {
                const allResponse = await fetch(`http://localhost:8888/sports-field-booking/api/v1/notification?offset=0&limit=1000`, {
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
                notificationContainer.innerHTML = '';
                allData.items.forEach(notification => {
                    const notificationElement = createNotificationElement(notification);
                    notificationContainer.appendChild(notificationElement);
                });
            });
            notificationContainer.appendChild(viewAllLink);
        }

    } catch (error) {
        console.error('Error fetching notifications:', error);
    }
});

function createNotificationElement(notification) {
    const notificationElement = document.createElement('a');
    notificationElement.href = '#';
    notificationElement.className = 'flex items-center p-2 hover:bg-gray-100 border-b border-gray-300';

    const { iconUrl, iconAlt, message } = getNotificationDetails(notification);

    notificationElement.innerHTML = `
        <img src="${iconUrl}" class="w-8 h-8 mr-2" alt="${iconAlt}">
        <div class="flex-1 text-sm">
            <span>${message}</span>
            <span class="font-bold">${notification.id}</span>
        </div>
    `;
    return notificationElement;
}

function getNotificationDetails(notification) {
    let iconUrl = '/sports-field-booking/image/default.png';
    let iconAlt = 'notification';
    let message = notification.message;

    switch (notification.type) {
        case 'BOOKING_REMINDER':
            iconUrl = '/sports-field-booking/image/sport-field-icon.png';
            iconAlt = 'booking-reminder';
            message = `Booking Reminder: ${notification.message}`;
            break;
        case 'PAYMENT_REMINDER':
            iconUrl = '/sports-field-booking/image/message.png';
            iconAlt = 'payment-reminder';
            message = `Payment Reminder: ${notification.message}`;
            break;
        case 'PROMOTION':
            iconUrl = '/sports-field-booking/image/promotion.jpg';
            iconAlt = 'promotion';
            message = `Promotion: ${notification.message}`;
            break;
        case 'ORDER_STATUS_UPDATE':
            iconUrl = '/sports-field-booking/image/order.png';
            iconAlt = 'order-status-update';
            message = `Order Status Update: ${notification.message}`;
            break;
        case 'PAYMENT_STATUS_UPDATE':
            iconUrl = '/sports-field-booking/image/payment-status-update.png';
            iconAlt = 'payment-status-update';
            message = `Payment Status Update: ${notification.message}`;
            break;
        case 'YARD_STATUS_UPDATE':
            iconUrl = '/sports-field-booking/image/sport-field-status-update.png';
            iconAlt = 'yard-status-update';
            message = `Yard Status Update: ${notification.message}`;
            break;
        default:
            iconUrl = '/sports-field-booking/image/default.png';
            iconAlt = 'notification';
            message = notification.message;
            break;
    }

    return { iconUrl, iconAlt, message };
}