// src/main/resources/static/js/booking-history.js

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

async function fetchBookingHistory() {
    try {
        const token = getCookie('accessToken');
        if (!token) {
            throw new Error('No auth token found');
        }

        const selectElement = document.getElementById('booking-type-select');
        const bookingType = selectElement.value;
        const endpoint = bookingType === 'my-upcoming' ? 'my-upcoming' : 'my-bookings';

        const response = await fetch(`http://localhost:8888/sports-field-booking/api/v1/booking/${endpoint}`, {
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

        const tableBody = document.getElementById('booking-history-body');
        const noBookingsMessage = document.getElementById('no-bookings-message');
        const bookingHistoryTable = document.getElementById('booking-history-table');

        if (!tableBody) {
            throw new Error('Table body element not found');
        }

        tableBody.innerHTML = '';

        const bookings = data.items;
        if (!Array.isArray(bookings) || bookings.length === 0) {
            noBookingsMessage.style.display = 'block';
            bookingHistoryTable.style.display = 'none';
        } else {
            noBookingsMessage.style.display = 'none';
            bookingHistoryTable.style.display = 'table';

            bookings.forEach(booking => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td class="border px-4 py-2">${booking.id}</td>
                    <td class="border px-4 py-2">${booking.user.username}</td>
                    <td class="border px-4 py-2">${booking.sportField.name}</td>
                    <td class="border px-4 py-2">${booking.startTime}</td>
                    <td class="border px-4 py-2">${booking.endTime}</td>
                    <td class="border px-4 py-2">${booking.status}</td>
                `;
                tableBody.appendChild(row);
            });
        }
    } catch (error) {
        console.error('Error fetching booking history:', error);
    }
}

function setupBookingTypeSelector() {
    const selectElement = document.getElementById('booking-type-select');

    // Retrieve the selected value from local storage
    const savedBookingType = localStorage.getItem('bookingType');
    if (savedBookingType) {
        selectElement.value = savedBookingType;
    }

    selectElement.addEventListener('change', () => {
        // Save the selected value to local storage
        localStorage.setItem('bookingType', selectElement.value);
        fetchBookingHistory();
    });

    fetchBookingHistory(); // Initial fetch
}

window.onload = setupBookingTypeSelector;