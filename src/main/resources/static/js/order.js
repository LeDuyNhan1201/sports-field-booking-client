function convertDateFormat(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

document.addEventListener('DOMContentLoaded', async () => {
    const data = JSON.parse(localStorage.getItem("data"));
    const currentUserID = JSON.parse(localStorage.getItem('current-user')).id;

    if (data && data.length > 0) {
        const filteredData = data.filter(order => order.userID === currentUserID);
        const orderContainer = document.querySelector('.order-list');
        let lastSportFieldID = null;
        let totalPrice = 0;
        let total = 0;

        if (filteredData.length > 0) {
            for (const order of filteredData) {
                total += parseFloat(order.total);

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
                    <div class="flex justify-between w-full">
                        <div class="flex w-full items-end">
                            <p class="text-lg pl-4">${formatTime(fieldAvailabilityData.startTime)} - ${formatTime(fieldAvailabilityData.endTime)}</p>
                            <p class="text-base pl-8 italic text-gray-400">${convertDateFormat(order.currentDate)}</p>
                        </div>
                        <p class="text-lg font-semibold text-right">$${fieldAvailabilityData.price}</p>
                    </div>
                `;
                totalPrice += parseFloat(fieldAvailabilityData.price);
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

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

