const ORDER_PER_PAGE = 8;
let currentPage = 1;

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
        renderOrders(data, page);
        setupPagination(data.items.length);
    } else {
        console.error("Failed to fetch orders");
    }
}

async function renderOrders(orders, page = 1) {
    const offset = (page - 1) * ORDER_PER_PAGE;
    const limit = ORDER_PER_PAGE;

    const ordersToRender = orders.items.slice(offset, offset + limit);
    const tbody = document.querySelector("tbody");
    tbody.innerHTML = "";

    for (const order of ordersToRender) {
        let totalPrice = 0;
        if (order.bookingItems && order.bookingItems.length > 0) {
            for (const bookingItem of order.bookingItems) {
                totalPrice += bookingItem.price;
            }
        }

        const image = await loadImage(order.user.id);

        let statusClass = "py-1 px-3 rounded-full text-xs";

        switch(order.status) {
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
                    <img src="${image}" alt="User Avatar" class="w-8 h-8 rounded-full mr-2">
                    <span>${order.user.username}</span>
                </td>
                <td class="p-4">${order.user.username}</td>
                <td class="p-4">${new Date(order.createdAt).toLocaleDateString()}</td>
                <td class="p-4">$${totalPrice.toFixed(2)}</td>
                <td class="p-4">
                    <span class="${statusClass}">${order.status}</span>
                </td>
                <td class="p-4">
                    <button class="delete-button text-red-500 hover:text-red-700" data-id=${order.id}>
                        <i class="fas fa-trash-alt"></i>
                    </button>
                    <button class="detail-button text-blue-500 hover:text-blue-700" data-id=${order.id}>
                        <i class="fas fa-edit"></i>
                    </button>
                </td>
            </tr>
        `;
        tbody.insertAdjacentHTML("beforeend", row);
    }
    await deleteOrder();
    await detailOrder();
}

function setupPagination(pagination) {    
    const totalPages = Math.ceil(pagination / ORDER_PER_PAGE);

    console.log(parseInt(Math.min(currentPage * ORDER_PER_PAGE, pagination)));
    
    const paginationInfo = document.getElementById("pagination-info");
    paginationInfo.textContent = `Hiển thị từ ${(currentPage - 1) * ORDER_PER_PAGE + 1} đến ${parseInt(Math.min(currentPage * ORDER_PER_PAGE, pagination))
        } trên ${pagination}`;

    const paginationControls = document.getElementById("pagination-controls");
    paginationControls.innerHTML = "";
    
    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.textContent = i;
        button.className = `px-3 py-2 ${i === currentPage ? "bg-blue-500 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
            } border border-gray-300`;

        button.addEventListener("click", () => {
            currentPage = i;
            fetchOrders(currentPage);
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
            fetchOrders(currentPage);
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
            fetchOrders(currentPage);
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
            `;
            bookingItemsContainer.appendChild(itemElement);
        });

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


window.addEventListener('DOMContentLoaded', async () => {
    await fetchOrders();
});
