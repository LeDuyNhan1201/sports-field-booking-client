const data = JSON.parse(localStorage.getItem("data"));
const currentUserID = JSON.parse(localStorage.getItem('current-user')).id;
const payButton = document.querySelector('.pay-button');

const validSportField = [];
const totalPriceMap = {};

let fieldAvailabilityIDs = [];
let flag = false;

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function convertDateFormat(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
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
                        <img src="${sportFieldData.images[0]}" alt="${sportFieldData.name}" class="w-28 h-28 rounded-md mr-4">
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
                                <p class="text-2xl font-semibold total-amount" data-sport-field-id="${order.sportFieldID}"></p>
                                <button class="text-red-500 delete-order-btn" data-sport-field-id="${order.sportFieldID}">
                                    🗑️
                                </button>
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

                
                // discount handle
                const sportFieldResponse = await fetch(`${SERVER_DOMAIN}/sports-field/${lastSportFieldID}`);
                if (!sportFieldResponse.ok) {
                    throw new Error("Failed to fetch booking items");
                }

                const sportFieldData = await sportFieldResponse.json();

                let discountedPrice = fieldAvailabilityData.price;
                if (sportFieldData.promotion) {
                    const discount = sportFieldData.promotion.discountPercentage;
                    discountedPrice = fieldAvailabilityData.price - (discount / 100 * fieldAvailabilityData.price);
                }

                scheduleList.innerHTML += `
                    <div class="flex justify-between w-full field-availability-item" data-sports-field="${order.sportFieldID}" data-availability-id="${fieldAvailabilityData.id}">
                        <div class="flex w-full items-end">
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
                        <div class="text-right">
                            ${sportFieldData.promotion ? `
                                <p class="text-gray-400 line-through">$${fieldAvailabilityData.price.toFixed(2)}</p>
                                <p class="text-lg font-semibold text-green-500">$${discountedPrice.toFixed(2)}</p>
                            ` : `
                                <p class="text-lg font-semibold">$${fieldAvailabilityData.price.toFixed(2)}</p>
                            `}
                        </div>
                        <button class="delete-field-availability-btn text-red-500 ml-2 cursor-pointer" data-id="${fieldAvailabilityData.id}">
                            🗑️
                        </button>
                    </div>
                `;

                totalPrice += discountedPrice;

                const price = parseFloat(discountedPrice);

                if (totalPriceMap[order.sportFieldID]) {
                    totalPriceMap[order.sportFieldID] += price;
                } else {
                    totalPriceMap[order.sportFieldID] = price;
                }

                fieldAvailabilityIDs.push({
                    fieldAvailabilityID: fieldAvailabilityData.id,
                    sportFieldID: order.sportFieldID
                })

            }

            document.getElementById('totalPrice').textContent = `$${totalPrice.toFixed(2)}`

            for (const sportFieldID in totalPriceMap) {
                document.querySelectorAll(`.total-amount[data-sport-field-id="${sportFieldID}"]`).forEach(totalElement => {
                    totalElement.textContent = `$${totalPriceMap[sportFieldID].toFixed(2)}`;
                });

                totalPriceMap[sportFieldID] = 0;
            }

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


    document.querySelectorAll('.delete-order-btn').forEach(orderDeleteButton => {
        orderDeleteButton.addEventListener('click', async () => {            
            const sportFieldID = orderDeleteButton.getAttribute('data-sport-field-id');

            const data = JSON.parse(localStorage.getItem("data")) || [];
            
            const validItems = data.filter(item => item.sportFieldID === sportFieldID);
            
            const fieldAvailabilityIDs = validItems.map(item => item.fieldAvailabilityID);

            try {
                await Promise.all(fieldAvailabilityIDs.map(async (item) => {
                    const response = await fetch(`${SERVER_DOMAIN}/field-availability/update-status/${item}?status=AVAILABLE`, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json",
                            'Authorization': 'Bearer ' + getAccessTokenFromCookie()
                        },
                    });

                    if (!response.ok) {
                        throw new Error(`Failed to update status for ID: ${item.fieldAvailabilityID} with status ${response.status}`);
                    }

                }));
                
                removeDataFromLocalStorage(sportFieldID, 'sportFieldID');
                alert('Delete successfully');
                location.reload();
            } catch (error) {
                console.error("Error updating field availabilities: ", error);
            }
        });
    });

    document.querySelectorAll('.delete-field-availability-btn').forEach(fieldDeleteButton => {
        fieldDeleteButton.addEventListener('click', async () => {
            const fieldAvailabilityID = fieldDeleteButton.getAttribute('data-id');
            try {
                const response = await fetch(`${SERVER_DOMAIN}/field-availability/update-status/${fieldAvailabilityID}?status=AVAILABLE`, {
                    method: "PUT",
                    headers: {
                        "Content-Type": "application/json",
                        'Authorization': 'Bearer ' + getAccessTokenFromCookie()
                    },
                });

                if (!response.ok) {
                    throw new Error(`Failed to update status for ID: ${item.fieldAvailabilityID} with status ${response.status}`);
                }

                removeDataFromLocalStorage(fieldAvailabilityID, 'fieldAvailabilityID');
                alert('Delete successfully');
                location.reload();
            } catch (error) {
                console.error("Error updating field availabilities: ", error);
            }
        });
    });

});

setTimeout(async () => {
    if (flag) {
        return;
    }
    const currentData = JSON.parse(localStorage.getItem("data")) || [];
    try {
        await Promise.all(currentData.map(async (item) => {
            const response = await fetch(`${SERVER_DOMAIN}/field-availability/update-status/${item.fieldAvailabilityID}?status=AVAILABLE`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + getAccessTokenFromCookie()
                },
            });

            if (!response.ok) {
                throw new Error(`Failed to update status for ID: ${item.fieldAvailabilityID} with status ${response.status}`);
            }

            return response;
        }));
    } catch (error) {
        console.error(`Error updating field availability for ID ${item.fieldAvailabilityID}: `, error);
    }
    localStorage.removeItem("data");
    flag = true;

}, 5 * 60 * 1000);

document.getElementById('paymentButton').addEventListener('click', async function () {
    const selectedPaymentMethod = document.querySelector('input[name="payment_method"]:checked');
    if (!selectedPaymentMethod) {
        alert("Vui lòng chọn phương thức thanh toán.");
        return;
    }

    const paymentMethod = selectedPaymentMethod.id;

    try {
        const bookingsData = await createBooking();
        if (bookingsData && bookingsData.length > 0) {
            await createBookingItems(bookingsData);
            
            const totalAmount = bookingsData.reduce((total, booking) => {
                const bookingItems = document.querySelectorAll(`.field-availability-item[data-sports-field="${booking.sportFieldID}"]`);
                const bookingTotal = Array.from(bookingItems).reduce((subtotal, item) => {
                    let priceElement = item.querySelector('.text-green-500');
                    let price;
                    if (priceElement) {
                        price = parseFloat(priceElement.textContent.replace('$', ''));
                    } else {
                        priceElement = item.querySelector('.font-semibold:not(.text-green-500)');
                        price = parseFloat(priceElement.textContent.replace('$', ''));
                    }
                    return subtotal + price;
                }, 0);
                return total + bookingTotal;
            }, 0);

            await processPayment(bookingsData[0].bookingID, paymentMethod, totalAmount);
        }
    } catch (error) {
        console.error("Lỗi khi thực hiện thanh toán:", error);
        alert("Có lỗi xảy ra. Vui lòng thử lại.");
    }
});

async function createBooking() {
    const bookingIDs = [];

    const sportFieldGroups = {};
    for (const item of fieldAvailabilityIDs) {
        if (!sportFieldGroups[item.sportFieldID]) {
            sportFieldGroups[item.sportFieldID] = [];
        }
        sportFieldGroups[item.sportFieldID].push(item);
    }    

    for (const sportFieldID in sportFieldGroups) {
        const fieldAvailabilityGroup = sportFieldGroups[sportFieldID];

        try {
            const response = await fetch(`${SERVER_DOMAIN}/booking/${fieldAvailabilityGroup[0].fieldAvailabilityID}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + getAccessTokenFromCookie()
                },
                body: JSON.stringify({ userID: currentUserID })
            });

            const data = await response.json();
            if (data && data.id) {
                bookingIDs.push({
                    bookingID: data.id,
                    sportFieldID: sportFieldID,
                    fieldAvailabilities: fieldAvailabilityGroup
                });
            } else {
                alert("Can't create booking");
            }
        } catch (error) {
            console.error("Error creating booking:", error);
            alert("An error occurred while creating booking");
        }
    }

    return bookingIDs;    
    // for (const item of fieldAvailabilityIDs) {        
    //     const { fieldAvailabilityID, sportFieldID } = item;

    //     if (!validSportField.includes(sportFieldID)) {
    //         validSportField.push(sportFieldID);

    //         const response = await fetch(`${SERVER_DOMAIN}/booking/${fieldAvailabilityID}`, {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //                 'Authorization': 'Bearer ' + getAccessTokenFromCookie()
    //             },
    //             body: JSON.stringify({ userID: currentUserID })
    //         });

    //         const data = await response.json();
    //         if (data && data.id) {
    //             return data.id;
    //         } else {
    //             alert(`Can't create booking`);
    //         }
    //     }
    // }
}

async function createBookingItems(bookingsData) {
    for (const bookingInfo of bookingsData) {
        const { bookingID, sportFieldID, fieldAvailabilities } = bookingInfo;

        for (const fieldAvailability of fieldAvailabilities) {
            const fieldAvailabilityID = fieldAvailability.fieldAvailabilityID;
            
            const item = document.querySelector(`.field-availability-item[data-sports-field="${sportFieldID}"][data-availability-id="${fieldAvailabilityID}"]`);

            const startTime = item.querySelector('.start-time').getAttribute('data-original');
            const endTime = item.querySelector('.end-time').getAttribute('data-original');
            const availableDate = item.querySelector('.available-date').getAttribute('data-original');

            let priceElement = item.querySelector('.text-green-500');
            let price;
            if (priceElement) {
                // have discount
                price = priceElement.textContent.replace('$', '');
            } else {
                // don't have discount
                priceElement = item.querySelector('.font-semibold:not(.text-green-500)');
                price = priceElement.textContent.replace('$', '');
            }
            
            try {
                await fetch(`${SERVER_DOMAIN}/booking-items`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + getAccessTokenFromCookie()
                    },
                    body: JSON.stringify({
                        orderId: bookingID,
                        sportFieldID: sportFieldID,
                        startTime: startTime,
                        endTime: endTime,
                        availableDate: convertDateFormat(availableDate),
                        price: parseFloat(price)
                    })
                });
            } catch (error) {
                alert("Error happens. Please try again");
                break;
            }
        }
    }
}


function processPayment(bookingID, paymentMethod, amount) {
    const paymentUrl = paymentMethod === "vnpay" ? `${SERVER_DOMAIN}/payment/vnpay` : `${SERVER_DOMAIN}/payment`;

    return fetch(paymentUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': paymentMethod === "vnpay" ? 'Bearer ' + getAccessTokenFromCookie() : undefined
        },
        body: JSON.stringify({ orderId: bookingID, amount: amount * 25000 })
    })
    .then(response => response.json())
    .then(paymentData => {
        if (paymentMethod === "vnpay") {
            if (paymentData.code === 'ok' && paymentData.paymentUrl) {
                window.location.href = paymentData.paymentUrl;
            } else {
                alert("URL payment does not exist");
            }
        } else if (paymentData) {
            alert("Cash payment successfully");
            localStorage.removeItem("data");
            window.location.reload();
        } else {
            alert("Payment error happens. Please try again");
        }
    });
}
function removeDataFromLocalStorage(id, key) {
    const storedData = JSON.parse(localStorage.getItem("data")) || [];

    const updatedData = storedData.filter(item => item[key] !== id);

    localStorage.setItem("data", JSON.stringify(updatedData));
}








