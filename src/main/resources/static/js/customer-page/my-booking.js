let bookings = [];

async function fetchBookingHistory() {
    try {
        const token = getCookie('accessToken');
        if (!token) {
            throw new Error('No auth token found');
        }

        const selectElement = document.getElementById('booking-type-select');
        const bookingType = selectElement.value;
        const endpoint = bookingType === 'my-upcoming' ? 'my-upcoming' : 'my-bookings';

        const response = await fetch(`${SERVER_DOMAIN}/booking/${endpoint}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const data = await response.json();

        console.log('Data fetched from API:', data);

        const tableBody = document.getElementById('my-booking-body');
        const noBookingsMessage = document.getElementById('no-bookings-message');
        const bookingHistoryTable = document.getElementById('my-booking-table');

        if (!tableBody) {
            throw new Error('Table body element not found');
        }

        tableBody.innerHTML = '';

        bookings = data.items;
        if (!Array.isArray(bookings) || bookings.length === 0) {
            noBookingsMessage.style.display = 'block';
            bookingHistoryTable.style.display = 'none';
        } else {
            noBookingsMessage.style.display = 'none';
            bookingHistoryTable.style.display = 'table';

            bookings.forEach((booking, index) => {
                const totalPrice = booking.bookingItems.reduce((sum, item) => {
                    const startTime = new Date(item.startTime);
                    const endTime = new Date(item.endTime);
                    const durationInHours = (endTime - startTime) / (1000 * 60 * 60);
                    return sum + (durationInHours * item.price);
                }, 0);

                let statusClass = 'font-bold ';
                switch (booking.status) {
                    case 'PENDING':
                        statusClass += 'text-orange-500';
                        break;
                    case 'REJECTED':
                        statusClass += 'text-red-500';
                        break;
                    case 'CANCELED':
                        statusClass += 'text-gray-500';
                        break;
                    case 'ACCEPTED':
                        statusClass += 'text-green-500';
                        break;
                }

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border px-4 py-2 text-center">${index + 1}</td>
                    <td class="border px-4 py-2 text-center">${booking.user.username}</td>
                    <td class="border px-4 py-2 text-center">${totalPrice.toFixed(2)} đ</td>
                    <td class="border px-4 py-2 text-center ${statusClass}">${booking.status}</td>
                    <td class="border px-4 py-2 text-center">
                        <button class="view-details-button bg-blue-500 text-white px-2 py-1 rounded hover:bg-blue-700" data-booking-id="${booking.id}">View Detail</button>
                        ${bookingType === 'my-upcoming' && booking.status === 'PENDING' ? `<button class="cancel-button bg-red-500 text-white px-2 py-1 rounded" data-booking-id="${booking.id}">Cancel</button>` : ''}
                    </td>
                `;
                tableBody.appendChild(row);
            });

            document.querySelectorAll('.view-details-button').forEach(button => {
                button.addEventListener('click', (event) => {
                    const bookingId = event.target.getAttribute('data-booking-id');
                    viewBookingDetails(bookingId);
                });
            });

            document.querySelectorAll('.cancel-button').forEach(button => {
                button.addEventListener('click', async (event) => {
                    const bookingId = event.target.getAttribute('data-booking-id');
                    const confirmCancel = confirm('Are you sure you want to cancel this booking?');
                    if (confirmCancel) {
                        await cancelBooking(bookingId);
                    }
                });
            });
        }
    } catch (error) {
        console.error('Error fetching booking history:', error);
    }
}

async function cancelBooking(bookingId) {
    try {
        const token = getCookie('accessToken');
        if (!token) {
            throw new Error('No auth token found');
        }

        const response = await fetch(`${SERVER_DOMAIN}/booking/${bookingId}/cancel`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        alert('Booking cancelled successfully.');
        fetchBookingHistory();
    } catch (error) {
        console.error('Error cancelling booking:', error);
    }
}

async function viewBookingDetails(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
        console.error('Booking not found:', bookingId);
        return;
    }

    const newUrl = `${window.location.origin}${window.location.pathname}?bookingId=${bookingId}`;
    window.history.pushState({ path: newUrl }, '', newUrl);

    const modal = document.getElementById('booking-detail-modal');
    const detailNo = document.getElementById('detail-no');
    const detailUser = document.getElementById('detail-user');
    const bookingItemsContainer = document.getElementById('booking-items-container');
    const detailTotalPrice = document.getElementById('detail-total-price');
    const detailStatus = document.getElementById('detail-status');

    detailNo.textContent = bookings.findIndex(b => b.id === bookingId) + 1;
    detailUser.textContent = booking.user.username;
    detailStatus.textContent = booking.status;

    bookingItemsContainer.innerHTML = '';

    let totalPrice = 0;

    booking.bookingItems.forEach(async (item, index) => {
        const startTime = new Date(item.startTime);
        const endTime = new Date(item.endTime);
        const date = startTime.toLocaleDateString('en-US');
        const formattedStartTime = startTime.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
        const formattedEndTime = endTime.toLocaleString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: false
        });
    
        const durationInHours = (endTime - startTime) / (1000 * 60 * 60);
        const itemTotalPrice = durationInHours * item.price;
        totalPrice += itemTotalPrice;
    
        const ratingValue = await loadRating(item.id);
    
        const itemElement = document.createElement('div');
        itemElement.classList.add('border', 'p-4', 'rounded', 'bg-gray-100', 'mb-2');
        itemElement.innerHTML = `
            <div class="flex justify-between">
                <span class="font-semibold">Item ${index + 1}:</span>
            </div>
            <div class="flex justify-between">
                <span class="font-semibold">Sport Field:</span>
                <span class="text-gray-700">${item.sportField.name}</span>
            </div>
            <div class="flex justify-between">
                <span class="font-semibold">Date:</span>
                <span class="text-gray-700">${date}</span>
            </div>
            <div class="flex justify-between">
                <span class="font-semibold">Start Time:</span>
                <span class="text-gray-700">${formattedStartTime}</span>
            </div>
            <div class="flex justify-between">
                <span class="font-semibold">End Time:</span>
                <span class="text-gray-700">${formattedEndTime}</span>
            </div>
            <div class="flex justify-between">
                <span class="font-semibold">Total Price:</span>
                <span class="text-gray-700">${itemTotalPrice.toFixed(2)} đ</span>
            </div>
            <div class="booking-item flex justify-between" booking-item-id=${item.id} sports-field-id=${item.sportField.id}>
                <span class="font-semibold mt-2">Star rating:</span>
                <fieldset class="rating">
                    ${[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5].map(rating => `
                        <input type="radio" id="star${rating}-${item.id}" name="rating-${item.id}" value="${rating}" ${
                            rating === ratingValue ? "checked" : ""} 
                            ${ratingValue !== null ? "disabled" : ""} />
                        <label for="star${rating}-${item.id}" class="${rating % 1 === 0.5 ? 'half' : 'full'}" title="${rating}"></label>
                    `).join('')}
                </fieldset>
            </div>
        `;
        bookingItemsContainer.appendChild(itemElement);
    });

    detailTotalPrice.textContent = totalPrice.toFixed(2) + ' đ';

    modal.classList.remove('hidden');

    const closeModalButton = document.getElementById('close-modal-button');
    closeModalButton.classList.add('hover:bg-red-500', 'hover:text-white', 'transition', 'duration-200');
    closeModalButton.addEventListener('click', () => {
        modal.classList.add('hidden');
        const newUrl = `${window.location.origin}${window.location.pathname}`;
        window.history.pushState({ path: newUrl }, '', newUrl);
        fetchBookingHistory();
    });
}

async function fetchBookingById(bookingId) {
    try {
        const token = getCookie('accessToken');
        if (!token) {
            throw new Error('No auth token found');
        }

        const response = await fetch(`${SERVER_DOMAIN}/booking/${bookingId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok ' + response.statusText);
        }

        const booking = await response.json();
        bookings = [booking];


        const selectElement = document.getElementById('booking-type-select');
        if (booking.status === 'PENDING') {
            selectElement.value = 'my-upcoming';
        } else {
            selectElement.value = 'my-bookings';
        }

        viewBookingDetails(bookingId);
    } catch (error) {
        console.error('Error fetching booking by ID:', error);
    }
}

function setupBookingTypeSelector() {
    const selectElement = document.getElementById('booking-type-select');

    if (selectElement) {
        const savedBookingType = localStorage.getItem('bookingType');
        if (savedBookingType) {
            selectElement.value = savedBookingType;
        }

        selectElement.addEventListener('change', () => {
            localStorage.setItem('bookingType', selectElement.value);
            fetchBookingHistory();
        });

        const urlParams = new URLSearchParams(window.location.search);
        const bookingId = urlParams.get('bookingId');
        if (bookingId) {
            fetchBookingById(bookingId);
        } else {
            fetchBookingHistory();
        }
    } else {
        console.warn("Element with id 'booking-type-select' not found.");
    }
}

setupBookingTypeSelector();

async function createRating(ratingPoint, userId, sportsFieldId, bookingItemId) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/rating/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + getAccessTokenFromCookie()
            },
            body: JSON.stringify({
                rating_point: ratingPoint,
                userId: userId,
                sportsFieldId: sportsFieldId,
                bookingItemId: bookingItemId
            })
        });

        console.log(response);
        
        if (!response.ok) {
            throw new Error(`Failed to create rating: ${response.statusText}`);
        }

        console.log({
            rating_point: ratingPoint,
            userId: userId,
            sportsFieldId: sportsFieldId,
            bookingItemId: bookingItemId
        });
        

        alert('Your rating has been submitted!');
        window.location.reload();
    } catch (error) {
        alert('Failed to submit rating. Please try again.');
        window.location.reload();
    }
}

async function loadRating(itemId) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/rating/booking-item/${itemId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + getAccessTokenFromCookie()
            }
        });

        const rating = await response.json();
        console.log("Rating loaded:", rating);

        if (rating && rating.rating_point) {
            return rating.rating_point;
        } else {
            return null;
        }
    } catch (error) {
        console.error("Error loading rating:", error);
        return null;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('click', async function (event) {
        if (event.target.matches('input[type="radio"]')) {
            console.log("Star clicked:", event.target.value);

            const ratingPoint = event.target.value;
            const userId = JSON.parse(currentUser).id;

            const bookingItem = event.target.closest('.booking-item');
            if (bookingItem) {
                const bookingItemId = bookingItem.getAttribute('booking-item-id');
                const sportsFieldId = bookingItem.getAttribute('sports-field-id');

                console.log({ ratingPoint, userId, sportsFieldId, bookingItemId });

                await createRating(ratingPoint, userId, sportsFieldId, bookingItemId);
            }
        }
    });
});

