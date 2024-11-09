const data = JSON.parse(localStorage.getItem("data"));
const currentUserID = JSON.parse(localStorage.getItem('current-user')).id;
const payButton = document.querySelector('.pay-button');

const validSportField = [];
let fieldAvailabilityIDs = [];

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function convertDateFormat(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

document.addEventListener('DOMContentLoaded', async () => {
    if (data && data.length > 0) {
        const filteredData = data.filter(order => order.userID === currentUserID);
        const orderContainer = document.querySelector('.order-list');
        let lastSportFieldID = null;
        let totalPrice = 0;

        if (filteredData.length > 0) {
            for (const order of filteredData) {
                if (order.sportFieldID !== lastSportFieldID) {
                    let sportFieldData;
                    try {
                        const response = await fetch(`${SERVER_DOMAIN}/sports-field/${order.sportFieldID}`);
                        sportFieldData = await response.json();
                    } catch (error) {
                        console.error("Error fetching sports field data:", error);
                        continue;
                    }

                    const orderElement = document.createElement("div");
                    orderElement.classList.add("flex", "items-center", "border-b", "pb-4", "mb-4");

                    orderElement.innerHTML = `
                        <img src="${sportFieldData.image}" alt="${sportFieldData.name}" class="w-28 h-28 rounded-md mr-4">
                        <div class="flex w-full">
                            <div class="flex-grow">
                                <h4 class="text-2xl font-bold">${sportFieldData.name}</h4>
                                <p class="text-lg text-green-500">${sportFieldData.location}</p>
                                <p class="text-lg text-gray-500">${formatTime(sportFieldData.openingTime)} - ${formatTime(sportFieldData.closingTime)}</p>

                                <button class="toggle-schedule-btn flex items-center text-blue-500 mt-2">
                                    <span class="mr-2">See Available Times</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fill-rule="evenodd" d="M5.292 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 111.414 1.414l-4 4a1 1 01-1.414 0l-4-4a1 1 010-1.414z" clip-rule="evenodd" />
                                    </svg>
                                </button>

                                <div class="schedule-list hidden mt-2" style="width: 110%;"></div>
                            </div>
                            <div class="ml-auto text-right">
                                <p class="text-2xl font-semibold total-amount"></p>
                                <div class="flex items-center justify-end space-x-2 mt-6">
                                    <span class="text-yellow-500 text-lg">⭐ ${sportFieldData.rating}/5</span>
                                </div>
                            </div>
                        </div>
                    `;
                    orderContainer.appendChild(orderElement);
                    lastSportFieldID = order.sportFieldID;
                }

                let fieldAvailabilityData;
                try {
                    const response = await fetch(`${SERVER_DOMAIN}/field-availability/${order.fieldAvailabilityID}`);
                    fieldAvailabilityData = await response.json();
                } catch (error) {
                    console.error("Error fetching field availability data:", error);
                    continue;
                }

                const currentOrderElement = document.querySelector('.order-list').lastChild;
                const scheduleList = currentOrderElement.querySelector('.schedule-list');

                scheduleList.innerHTML += `
                    <div class="flex justify-between w-full field-availability-item">
                        <div class="flex w-full items-end container-${fieldAvailabilityData.id}" data-id="${fieldAvailabilityData.id}">
                            <p class="text-lg pl-4 start-time" data-original="${fieldAvailabilityData.startTime}">
                                ${formatTime(fieldAvailabilityData.startTime)}
                            </p>
                            <span class="text-lg"> - </span>
                            <p class="text-lg end-time" data-original="${fieldAvailabilityData.endTime}">
                                ${formatTime(fieldAvailabilityData.endTime)}
                            </p>
                            <p class="text-base pl-8 italic text-gray-400 available-date" data-original="${order.currentDate}">
                                ${convertDateFormat(order.currentDate)}
                            </p>                        
                        </div>
                        <p class="text-lg font-semibold text-right price">$${fieldAvailabilityData.price}</p>
                    </div>
                `;
                totalPrice += parseFloat(fieldAvailabilityData.price);
                fieldAvailabilityIDs.push({
                    fieldAvailabilityID: fieldAvailabilityData.id,
                    sportFieldID: order.sportFieldID
                })
            }

            document.getElementById('totalPrice').textContent = `$${totalPrice.toFixed(2)}`;
            document.querySelectorAll('.total-amount').forEach(totalElement => {
                totalElement.textContent = `$${totalPrice.toFixed(2)}`;
            });

            document.querySelectorAll('.toggle-schedule-btn').forEach(button => {
                button.addEventListener('click', (event) => {
                    const scheduleList = event.currentTarget.nextElementSibling;
                    scheduleList.classList.toggle('hidden');
                });
            });
        } else {
            orderContainer.innerHTML = "<p>No orders found.</p>";
        }
    } else {
        document.querySelector('.order-list').innerHTML = "<p>No orders found.</p>";
    }
});

document.getElementById('paymentButton').addEventListener('click', async function () {
    const selectedPaymentMethod = document.querySelector('input[name="payment_method"]:checked');
    if (!selectedPaymentMethod) {
        alert("Vui lòng chọn phương thức thanh toán.");
        return;
    }

    const paymentMethod = selectedPaymentMethod.id;

    try {
        const bookingID = await createBooking();
        if (bookingID) {
            await createBookingItems(bookingID);
            await processPayment(bookingID, paymentMethod);
        }
    } catch (error) {
        console.error("Lỗi khi thực hiện thanh toán:", error);
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
});

async function createBooking() {
    for (const item of fieldAvailabilityIDs) {
        const { fieldAvailabilityID, sportFieldID } = item;

        if (!validSportField.includes(sportFieldID)) {
            validSportField.push(sportFieldID);

            const response = await fetch(`${SERVER_DOMAIN}/booking/${fieldAvailabilityID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getAccessTokenFromCookie()
                },
                body: JSON.stringify({ userID: currentUserID })
            });

            const data = await response.json();
            if (data && data.id) {
                return data.id;
            } else {
                alert(`Không thể tạo đơn đặt chỗ cho sân với ID ${fieldAvailabilityID}. Vui lòng thử lại.`);
            }
        }
    }
}

async function createBookingItems(bookingID) {
    const fieldAvailabilityElements = document.querySelectorAll('.field-availability-item');
    console.log(fieldAvailabilityElements);
    
    
    for (const item of fieldAvailabilityElements) {        
        const container = item.querySelector('[data-id]');
        const fieldAvailabilityID = container ? container.getAttribute('data-id') : null;
        const startTime = item.querySelector('.start-time').getAttribute('data-original');
        const endTime = item.querySelector('.end-time').getAttribute('data-original');
        const availableDate = item.querySelector('.available-date').getAttribute('data-original');
        const price = item.querySelector('.price').textContent.replace('$', '');

        try {
            const response = await fetch(`${SERVER_DOMAIN}/booking-items`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getAccessTokenFromCookie()
                },
                body: JSON.stringify({
                    orderId: bookingID,
                    fieldAvailabilityId: fieldAvailabilityID,
                    startTime: startTime,
                    endTime: endTime,
                    availableDate: availableDate,
                    price: parseFloat(price)
                })
            });     
        } catch (error) {
            alert("Có lỗi xảy ra khi tạo đơn đặt chỗ. Vui lòng thử lại.");
            break;
        }
    }
}


async function processPayment(bookingID, paymentMethod) {
    const amount = parseFloat(document.getElementById('totalPrice').textContent.replace('$', '')) * 25000;
    const paymentUrl = paymentMethod === "vnpay" ? `${SERVER_DOMAIN}/payment/vnpay` : `${SERVER_DOMAIN}/payment`;

    const response = await fetch(paymentUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': paymentMethod === "vnpay" ? 'Bearer ' + getAccessTokenFromCookie() : undefined
        },
        body: JSON.stringify({ orderId: bookingID, amount: amount })
    });

    const paymentData = await response.json();

    if (paymentMethod === "vnpay") {
        if (paymentData.code === 'ok' && paymentData.paymentUrl) {
            window.location.href = paymentData.paymentUrl;
        } else {
            alert("Không tìm thấy URL thanh toán. Vui lòng thử lại.");
        }
    } else if (paymentData) {
        alert("Thanh toán tiền mặt thành công!");
        localStorage.removeItem("data");
        window.location.reload();
    } else {
        alert("Có lỗi xảy ra trong quá trình thanh toán tiền mặt. Vui lòng thử lại.");
    }
}









