// src/main/resources/static/js/my-booking.js

const BASE_URL = 'http://localhost:8888/sports-field-booking/api/v1/booking';

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

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

        const response = await fetch(`${BASE_URL}/${endpoint}`, {
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

                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border px-4 py-2 text-center">${index + 1}</td>
                    <td class="border px-4 py-2 text-center">${booking.user.username}</td>
                    <td class="border px-4 py-2 text-center">${booking.sportField.name}</td>
                    <td class="border px-4 py-2 text-center">${totalPrice.toFixed(2)} đ</td>
                    <td class="border px-4 py-2 text-center">${booking.status}</td>
                    <td class="border px-4 py-2 text-center">
                        <button class="view-details-button bg-blue-500 text-white px-2 py-1 rounded" data-booking-id="${booking.id}">View Details</button>
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

        const response = await fetch(`${BASE_URL}/${bookingId}/cancel`, {
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

function viewBookingDetails(bookingId) {
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) {
        console.error('Booking not found:', bookingId);
        return;
    }

    const modal = document.getElementById('booking-detail-modal');
    const detailNo = document.getElementById('detail-no');
    const detailUser = document.getElementById('detail-user');
    const detailSportField = document.getElementById('detail-sport-field');
    const bookingItemsContainer = document.getElementById('booking-items-container');
    const detailTotalPrice = document.getElementById('detail-total-price');
    const detailStatus = document.getElementById('detail-status');

    detailNo.textContent = bookings.findIndex(b => b.id === bookingId) + 1;
    detailUser.textContent = booking.user.username;
    detailSportField.textContent = booking.sportField.name;
    detailStatus.textContent = booking.status;

    bookingItemsContainer.innerHTML = '';

    let totalPrice = 0;

    booking.bookingItems.forEach((item, index) => {
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

        const itemElement = document.createElement('div');
        itemElement.classList.add('border', 'p-4', 'rounded', 'bg-gray-100', 'mb-2');
        itemElement.innerHTML = `
            <div class="flex justify-between">
                <span class="font-semibold">Item ${index + 1}:</span>
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
        `;
        bookingItemsContainer.appendChild(itemElement);
    });

    detailTotalPrice.textContent = totalPrice.toFixed(2) + ' đ';

    modal.classList.remove('hidden');

    const closeModalButton = document.getElementById('close-modal-button');
    closeModalButton.addEventListener('click', () => {
        modal.classList.add('hidden');
    });
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

        fetchBookingHistory();
    } else {
        console.warn("Element with id 'booking-type-select' not found.");
    }
}

window.onload = setupBookingTypeSelector;