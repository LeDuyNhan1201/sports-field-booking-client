const ORDER_PER_PAGE = 8;
let currentPage = 1;
let isSearch = false;
let totalItems = 0;

const orderQuantity = document.getElementById('order-quantity');

async function loadImage(id) {
    try {
        const avatarResponse = await fetch(`${SERVER_DOMAIN}/file/metadata-by-user?userId=${id}`);
        const avatarData = await avatarResponse.json();

        return avatarData.results || "/sports-field-booking/image/user-info/user-info.png";
    } catch (error) {
        return "/sports-field-booking/image/user-info/user-info.png";
    }
}

async function fetchOrders(page) {
    const response = await fetch(`${SERVER_DOMAIN}/booking`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            "Authorization": "Bearer " + getAccessTokenFromCookie()
        }
    });

    if (response.ok) {
        const data = await response.json();
        totalItems = data.items.length        
        renderOrders(data, page);
        setupPagination(data.items.length);
    } else {
        console.error("Failed to fetch orders");
    }
}

async function renderOrders(orders, page = 1) {
    orderQuantity.textContent = totalItems;

    const offset = (page - 1) * ORDER_PER_PAGE;
    const limit = ORDER_PER_PAGE;

    const ordersToRender = orders.items.slice(offset, offset + limit);
    const tbody = document.querySelector("tbody");

    tbody.innerHTML = "";
    
    for (const order of ordersToRender) {
        let totalPrice = 0;
        if (order.bookingItems && order.bookingItems.length > 0) {
            for (const bookingItem of order.bookingItems) {                
                const startTimeHour = formatHour(bookingItem.startTime);
                const endTimeHour = formatHour(bookingItem.endTime);

                const startTimeInHours = parseTimeToHours(startTimeHour);
                const endTimeInHours = parseTimeToHours(endTimeHour);

                const durationInHours = (endTimeInHours - startTimeInHours);
                const itemTotalPrice = durationInHours * bookingItem.price;

                totalPrice += itemTotalPrice;
            }
        }

        // const image = await loadImage(order.user.id);

        let statusClass = "py-1 px-3 rounded-full text-xs";

        switch (order.status) {
            case 'ACCEPTED':
                statusClass += " bg-green-300 text-green-600";
                break;
            case 'REJECTED':
                statusClass += " bg-red-300 text-red-600";
                break;
            case 'CANCELED':
                statusClass += " bg-orange-300 text-orange-600";
                break;
            case 'PENDING':
                statusClass += " bg-yellow-300 text-yellow-600";
                break;
            case 'RESCHEDULED':
                statusClass += " bg-purple-300 text-purple-600";
                break;
            case 'REFUND_REQUESTED':
                statusClass += " bg-yellow-300 text-yellow-600";
                break;
        }
        const row = `
            <tr class="border-b">
                <td class="p-4">${order.id}</td>
                <td class="p-4 flex items-center">
                    <span>${order.user.username}</span>
                </td>
                <td class="p-4">${new Date(order.createdAt).toLocaleDateString()}</td>
                <td class="p-4">$${totalPrice.toFixed(2)}</td>
                <td class="p-4 status-cell" data-id="${order.id}">
                    <span class="${statusClass}">${order.status}</span>
                </td>
                <td class="p-4">
                    <button class="delete-button text-red-500 hover:text-red-700" data-id=${order.id}>
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button class="detail-button text-blue-500 hover:text-blue-700 ml-8" data-id=${order.id}>
                        <i class="fa-solid fa-circle-info"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML("beforeend", row);
    }
    await attachStatusHandlers();
    await deleteOrder();
    await detailOrder();
}

async function attachStatusHandlers() {
    const statusCells = document.querySelectorAll(".status-cell");
    const statuses = await fetchBookingStatus();

    statusCells.forEach((cell) => {
        cell.addEventListener("dblclick", (e) => {
            const orderId = cell.getAttribute("data-id");
            const currentStatus = cell.querySelector("span").textContent;

            const select = document.createElement("select");
            select.className = "border p-1 rounded";
            statuses.forEach((status) => {
                const option = document.createElement("option");
                option.value = status;
                option.textContent = status;
                if (status === currentStatus) option.selected = true;
                select.appendChild(option);
            });

            // Replace span with select
            cell.innerHTML = "";
            cell.appendChild(select);

            // Save new status on blur or change
            const saveStatus = async () => {
                const newStatus = select.value;
                // Replace select with span
                cell.innerHTML = `<span class="py-1 px-3 rounded-full text-xs">${newStatus}</span>`;
                // Apply new class
                const span = cell.querySelector("span");
                span.className = `py-1 px-3 rounded-full text-xs ${newStatus === "ACCEPTED"
                        ? "bg-green-300 text-green-600"
                        : newStatus === "REJECTED"
                            ? "bg-red-300 text-red-600"
                            : newStatus === "CANCELED"
                                ? "bg-orange-300 text-orange-600"
                                : newStatus === "PENDING"
                                    ? "bg-yellow-300 text-yellow-600"
                                    : newStatus === "RESCHEDULED"
                                        ? "bg-purple-300 text-purple-600"
                                        : "bg-yellow-300 text-yellow-600"
                    }`;

                await updateOrderStatus(orderId, newStatus);
            };

            select.addEventListener("change", saveStatus);

            select.focus();
        });
    });
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/booking/update-status/${orderId}?newStatus=${newStatus}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getAccessTokenFromCookie()}`
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to update order status: ${response.status}`);
        }

        const updatedOrder = await response.json();

        if (updatedOrder) {
            alert('Order updated successfully')
            window.location.reload();
        }
    } catch (error) {
        console.error('Error updating order status:', error);
        throw error;
    }
}

async function fetchBookingStatus() {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/booking/booking-status`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const listStatus = await response.json();
        return listStatus;
    } catch (error) {
        console.error("Failed to fetch booking statuses:", error);
        return [];
    }
}

function setupPagination(pagination) {
    const totalPages = Math.ceil(pagination / ORDER_PER_PAGE);

    const paginationInfo = document.getElementById("pagination-info");
    paginationInfo.textContent = `Show from page ${(currentPage - 1) * ORDER_PER_PAGE + 1} to ${parseInt(Math.min(currentPage * ORDER_PER_PAGE, pagination))
        } in ${pagination}`;

    const paginationControls = document.getElementById("pagination-controls");
    paginationControls.innerHTML = "";

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.className = `px-3 py-2 ${i === currentPage ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            } border border-gray-300`;

        button.addEventListener("click", () => {
            currentPage = i;
            if (isSearch) {
                searchOrders(currentPage);
            } else {
                fetchOrders(currentPage);
            }
        });

        paginationControls.appendChild(button);
    }

    if (currentPage > 1) {
        const prevButton = document.createElement("button");
        prevButton.textContent = "Trước";
        prevButton.className =
            "px-3 py-2 border border-gray-300 rounded-l-md bg-white text-gray-700 hover:bg-gray-50";
        prevButton.addEventListener("click", () => {
            currentPage--;
            if (isSearch) {
                searchOrders(currentPage)
            } else {
                fetchOrders(currentPage);
            }
        });
        paginationControls.prepend(prevButton); // add to front of paginations
    }

    if (currentPage < totalPages) {
        const nextButton = document.createElement("button");
        nextButton.textContent = "Sau";
        nextButton.className =
            "px-3 py-2 border border-gray-300 rounded-r-md bg-white text-gray-700 hover:bg-gray-50";
        nextButton.addEventListener("click", () => {
            currentPage++;
            if (isSearch) {
                searchOrders(currentPage)
            } else {
                fetchOrders(currentPage);
            }
        });
        paginationControls.appendChild(nextButton);
    }
}

async function deleteOrder() {
    const deleteButtons = document.querySelectorAll('.delete-button');

    deleteButtons.forEach(item => {
        item.addEventListener('click', async () => {
            const orderId = item.getAttribute("data-id");

            if (confirm("Are you want to delete this order?")) {
                try {
                    const response = await fetch(`${SERVER_DOMAIN}/booking/delete-booking/${orderId}`, {
                        method: 'DELETE',
                        headers: {
                            'Content-Type': 'application/json',
                            "Authorization": "Bearer " + getAccessTokenFromCookie()
                        },
                        body: {
                            orderId: orderId
                        }
                    });

                    if (response.ok) {
                        alert("Order deleted successfully");
                        fetchOrders();
                    } else {
                        alert(`Failed to delete order ${orderId}.`);
                    }
                } catch (error) {
                    console.error("Error deleting order:", error);
                    alert("An error occurred while deleting the order.");
                }
            }
        })
    })
}

async function detailOrder() {
    const detailButtons = document.querySelectorAll('.detail-button');

    detailButtons.forEach(item => {
        item.addEventListener('click', async () => {
            const orderId = item.getAttribute("data-id");

            viewBookingDetails(orderId)
        })
    })
}

async function viewBookingDetails(bookingId) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/booking/${bookingId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + getAccessTokenFromCookie()
            }
        });

        if (!response.ok) {
            console.error('Failed to fetch booking details:', response.status);
            return;
        }

        const booking = await response.json();

        const modal = document.getElementById('booking-detail-modal');
        const detailNo = document.getElementById('detail-no');
        const detailUser = document.getElementById('detail-user');
        const bookingItemsContainer = document.getElementById('booking-items-container');
        const detailTotalPrice = document.getElementById('detail-total-price');
        const detailStatus = document.getElementById('detail-status');

        detailNo.textContent = booking.id;
        detailUser.textContent = booking.user.username;
        detailStatus.textContent = booking.status;

        bookingItemsContainer.innerHTML = '';

        let totalPrice = 0;

        for (const item of booking.bookingItems) {
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

            const ratingValue = await loadRating(item.id);

            const startTimeHour = formatHour(startTime);
            const endTimeHour = formatHour(endTime);

            const startTimeInHours = parseTimeToHours(startTimeHour);
            const endTimeInHours = parseTimeToHours(endTimeHour);

            const durationInHours = (endTimeInHours - startTimeInHours);
            const itemTotalPrice = durationInHours * item.price;
            totalPrice += itemTotalPrice;

            const itemElement = document.createElement('div');
            itemElement.classList.add('border', 'p-4', 'rounded', 'bg-gray-100', 'mb-2');
            itemElement.innerHTML = `
                <div class="flex justify-between">
                    <span class="font-semibold">Item:</span>
                    <span>${item.sportField.name}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-semibold">Date:</span>
                    <span>${date}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-semibold">Start Time:</span>
                    <span>${formattedStartTime}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-semibold">End Time:</span>
                    <span>${formattedEndTime}</span>
                </div>
                <div class="flex justify-between">
                    <span class="font-semibold">Total Price:</span>
                    <span>${itemTotalPrice.toFixed(2)} đ</span>
                </div>
                ${booking.status === 'ACCEPTED' ? `
                    <div class="booking-item flex justify-between" booking-item-id=${item.id} sports-field-id=${item.sportField.id}>
                        <span class="font-semibold mt-2">Star rating:</span>
                        <fieldset class="rating">
                            ${[5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, 0.5].map(rating => `
                                <input type="radio" id="star${rating}-${item.id}" name="rating-${item.id}" value="${rating}" ${rating === ratingValue ? "checked" : ""} 
                                    ${ratingValue !== null ? "disabled" : ""} />
                                <label for="star${rating}-${item.id}" class="${rating % 1 === 0.5 ? 'half' : 'full'}" title="${rating}" style="pointer-events: none;"></label>
                            `).join('')}
                        </fieldset>
                    </div>` : ''}
            `;
            bookingItemsContainer.appendChild(itemElement);
        }

        console.log(totalPrice);
        detailTotalPrice.textContent = totalPrice.toFixed(2) + ' đ';


        modal.classList.remove('hidden');

        const closeModalButton = document.getElementById('close-modal-button');
        closeModalButton.classList.add('hover:bg-red-500', 'hover:text-white', 'transition', 'duration-200');
        closeModalButton.addEventListener('click', () => {
            modal.classList.add('hidden');
        });
    } catch (error) {
        console.error('Error fetching booking details:', error);
    }
}

async function searchOrders(page = 1) {
    const keyword = document.getElementById('search').value || '';
    const status = document.getElementById('status').value || '';
    const startDate = document.getElementById('from-date').value || '';
    const endDate = document.getElementById('to-date').value || '';
    const userId = JSON.parse(currentUser).id;

    const queryParams = new URLSearchParams({
        keyword,
        status,
        startDate,
        endDate,
        userId
    });

    try {
        const response = await fetch(`${SERVER_DOMAIN}/booking/search?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                "Authorization": "Bearer " + getAccessTokenFromCookie()
            }
        });

        if (response.ok) {
            const data = await response.json();   
            totalItems = data.items.length;         
            renderOrders(data, page);
            setupPagination(data.items.length);
        } else {
            console.error('Failed to search orders:', response.status);
        }
    } catch (error) {
        console.error('Error during search:', error);
    }
}

document.getElementById('search').addEventListener('input', () => {
    isSearch = true;
    searchOrders();
});

document.getElementById('search-btn').addEventListener('click', () => {
    isSearch = true;
    searchOrders();
});

window.addEventListener('DOMContentLoaded', async () => {
    const fromDateInput = document.getElementById('from-date');
    const toDateInput = document.getElementById('to-date');
    const statusSelect = document.getElementById('status');
    const today = new Date();
    const currentYear = today.getFullYear();

    fromDateInput.value = new Date(currentYear, 0, 2).toISOString().split('T')[0];
    toDateInput.value = new Date(currentYear, 11, 32).toISOString().split('T')[0];

    isSearch = false;

    try {
        const statusResponse = await fetch(`${SERVER_DOMAIN}/booking/booking-status`);
        if (!statusResponse.ok) {
            throw new Error(`Failed to fetch booking statuses: ${statusResponse.status}`);
        }
        const listStatus = await statusResponse.json();

        listStatus.forEach((status) => {
            const option = document.createElement('option');
            option.value = status;
            option.textContent = status;
            statusSelect.appendChild(option);
        });

        await searchOrders();
    } catch (error) {
        console.error("Error during initialization:", error);
    }
});


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
