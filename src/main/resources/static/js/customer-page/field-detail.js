let bookingDetail = document.getElementById("booking-detail");
let buttonOrder = document.getElementById("buttonOrder");
let buttonCloseBookingDetail = document.getElementById("buttonCloseBookingDetail");
let fieldDetailContainer = document.getElementById('sportsField.field-detail')
let currentDate = new Date();

const selectQuantityAvailabilities = document.getElementById("booking_detail.select_quantity_availabilities");
const selectPriceAvailabilities = document.getElementById("booking_detail.select_price_availabilities");

const prevDateButton = document.getElementById("booking_detail.previousDate");
const nextDateButton = document.getElementById("booking_detail.nextDate");
const currentDateElement = document.getElementById("booking_detail.currentDate");

let selectedAvailabilities = [];

function displayDate(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    if (currentDateElement) {
        currentDateElement.textContent = `${day}-${month}-${year}`;
    }
}

function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function convertDateFormat(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${year}-${month}-${day}`;
}

function isTimeWithinRange(startTime, endTime, rangeStart, rangeEnd) {
    const toMinutes = (time) => {
        const [hours, minutes] = time.split(":").map(Number);
        return hours * 60 + minutes;
    };

    const start = toMinutes(startTime);
    const end = toMinutes(endTime);
    const startMinutes = toMinutes(rangeStart);
    const endMinutes = toMinutes(rangeEnd);

    if (startMinutes <= endMinutes) {
        return start >= startMinutes && end <= endMinutes;
    }
}

displayDate(currentDate)

if (prevDateButton && nextDateButton) {
    prevDateButton.addEventListener('click', async () => {
        const now = new Date();
        currentDate.setDate(currentDate.getDate() - 1);
        displayDate(currentDate);

        if (currentDate < now) {
            currentDate = now;
            displayDate(currentDate);
        }
        try {
            const fieldRes = await fetch(`${SERVER_DOMAIN}/sports-field/${getSportFieldIdFromPath()}`);
            const field = await fieldRes.json();
            await appendBookingDetail(field);
        } catch (error) {
            console.error("Error fetching field data:", error);
        }
    });

    nextDateButton.addEventListener('click', async () => {
        currentDate.setDate(currentDate.getDate() + 1);
        displayDate(currentDate);

        try {
            const fieldRes = await fetch(`${SERVER_DOMAIN}/sports-field/${getSportFieldIdFromPath()}`);
            const field = await fieldRes.json();
            await appendBookingDetail(field);
        } catch (error) {
            console.error("Error fetching field data:", error);
        }
    });
}


async function loadDetail() {
    try {
        const fieldRes = await fetch(`${SERVER_DOMAIN}/sports-field/${getSportFieldIdFromPath()}`);

        const field = await fieldRes.json();

        console.log(field);

        await appendDetail(field);
        await tab_detail(field);
        await appendBookingDetail(field);
    } catch (error) {
        console.error("Error fetching detail:", error);
    }
}

async function appendDetail(field) {
    //information
    document.getElementById("field_detail.fieldName").textContent = field.name;
    document.getElementById("field_detail.location").textContent = field.location;
    document.getElementById("field_detail.phone").textContent = field.owner.mobileNumber;
    document.getElementById("field_detail.email").textContent = field.owner.email;
    document.getElementById("field_detail.category").textContent = field.category;
    document.getElementById("field_detail.ownerName").textContent = field.owner.firstName + " " + field.owner.lastName;
    document.getElementById("field_detail.ownerImage").src = field.owner.avatar;
    document.getElementById("field_detail.rating").textContent = field.rating;
    if (document.getElementById("field_detail.openingTime") && document.getElementById("field_detail.closingTime")) {
        document.getElementById("field_detail.openingTime").textContent = formatHour(field.openingTime);
        document.getElementById("field_detail.closingTime").textContent = formatHour(field.closingTime);
    }
    document.getElementById("field_detail.image").src = field.images[0];

    // ảnh nhỏ phía dưới
    let imageItems = document.getElementById("field_detail.imageItems");
    for (let i = 0; i < 2; i++) {
        let imageElement = document.createElement("img");
        imageElement.src = field.images[i];
        imageElement.className = "rounded-lg w-12 h-12 mr-3 opacity-50 cursor-pointer";
        imageItems.appendChild(imageElement);
    }
    // button tab

    document.getElementById("field_detail.button_tab_detail").href = "/sports-field-booking/sports-field/" + field.id + "/details";
    document.getElementById("field_detail.button_tab_review").href = "/sports-field-booking/sports-field/" + field.id + "/reviews";
}

document.addEventListener("DOMContentLoaded", async function () {
    let id = fieldDetailContainer.getAttribute("fieldId");

    await loadDetail(id);
});

if (buttonOrder) {
    const endPath = window.location.pathname.split("/")[2];

    if (endPath.localeCompare("my-sports-field") === 0) {
        buttonOrder.addEventListener("click", () => {
            let editFieldContainer = fieldDetailContainer.querySelector("#new_field\\.container")
            editFieldContainer.classList.toggle('hidden')
        });
    } else {
        buttonOrder.addEventListener("click", async () => {
            try {
                const response = await fetch(`${SERVER_DOMAIN}/sports-field/${getSportFieldIdFromPath()}`);
                const field = await response.json();

                if (field.status === "OPEN" || field.status === "CLOSED") {
                    window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                    });
                    bookingDetail.style.display = "block";
                    window.document.body.style.overflow = "hidden";
                    bookingDetail.style.overflow = "auto";
                } else {
                    alert("Sân hiện không khả dụng");
                }
            } catch (error) {
                console.error("Error fetching field data:", error);
                alert("Có lỗi xảy ra khi tải thông tin sân.");
            }
        });
    }
}


if (buttonCloseBookingDetail) {
    buttonCloseBookingDetail.addEventListener("click", () => {
        bookingDetail.style.display = "none";
        window.document.body.style.overflow = "auto";
    });
}

async function tab_detail(field) {
    let tab_detail = document.getElementById("field_detail.tabDetail");

    if (tab_detail) {
        let statusContainer = document.getElementById("field_detail.tabDetail.status");
        let statusElements = statusContainer.querySelectorAll("div");
        switch (field.status) {
            case "OPEN":
                statusElements[0].classList.add("bg-yellow-100");
                statusElements[0].querySelector("span").classList.add("text-green-800");
                break;
            case "CLOSED":
                statusElements[1].classList.add("bg-yellow-100");
                statusElements[1].querySelector("span").classList.add("text-green-800");
                break;
            case "MAINTENANCE":
                statusElements[2].classList.add("bg-yellow-100");
                statusElements[2].querySelector("span").classList.add("text-green-800");
                break;
            default:
                statusElements[3].classList.add("bg-yellow-100");
                statusElements[3].querySelector("span").classList.add("text-green-800");
                break;
        }
    }
}

async function appendBookingDetail(field) {
    document.getElementById("booking_detail.status").textContent = field.status;
    document.getElementById("booking_detail.field_name").textContent = field.name;
    document.getElementById("booking_detail.field_category").textContent = field.category;
    document.getElementById("booking_detail.field_address").textContent = field.location;
    document.getElementById("booking_detail.field_image").src = field.images[0];

    let fieldAvailabilitiesElement = document.getElementById("booking_detail.field_availabilities");
    fieldAvailabilitiesElement.innerHTML = "";

    const sportFieldID = getSportFieldIdFromPath();

    try {
        const response = await fetch(`${SERVER_DOMAIN}/booking-items/sports-field/${sportFieldID}`);
        if (!response.ok) {
            throw new Error("Failed to fetch booking items");
        }

        const sportFieldResponse = await fetch(`${SERVER_DOMAIN}/sports-field/${sportFieldID}`);
        if (!sportFieldResponse.ok) {
            throw new Error("Failed to fetch booking items");
        }

        const bookingItems = await response.json();
        const sportFieldData = await sportFieldResponse.json();
        console.log(sportFieldData);
        

        field.fieldAvailabilities.forEach(async (fieldAvailability) => {
            const startTime = formatHour(fieldAvailability.startTime);
            const endTime = formatHour(fieldAvailability.endTime);

            if (isTimeWithinRange(startTime, endTime, formatHour(field.openingTime), formatHour(field.closingTime))) {
                let element = document.createElement("a");
                element.className = "flex flex-row justify-between mt-3 cursor-pointer p-2 select-none border-b-2 border-green-400 border-l-0 field_availability";
                element.dataset.availabilityId = fieldAvailability.id;

                const isOrdered = bookingItems.some(item => {
                    return formatHour(item.startTime) === startTime &&
                        formatHour(item.endTime) === endTime &&
                        convertDateFormat(item.availableDate) === convertDateFormat(currentDate.toISOString());
                });

                const fieldResponse = await fetch(`${SERVER_DOMAIN}/field-availability/${fieldAvailability.id}`);
                const result = await fieldResponse.json();
                const isBooked = result.status === "BOOKED";

                // Check promotion
                let discountInfo = "";
                let discountedPrice = fieldAvailability.price;

                if (sportFieldData.promotion && (convertDateFormat(currentDate) >= convertDateFormat(sportFieldData.promotion.startDate) && 
                                                convertDateFormat(currentDate) <= convertDateFormat(sportFieldData.promotion.endDate))) {
                    const discount = sportFieldData.promotion.discountPercentage;
                    discountedPrice = fieldAvailability.price - (discount / 100 * fieldAvailability.price);
                    discountInfo = `
                            <span class="text-lg flex-1">${startTime}</span>
                        <span class="text-lg flex-1 text-left">${endTime}</span>
                            <span class="text-gray-400 line-through">${fieldAvailability.price.toFixed(2)}</span>
                            <span class="text-green-500 font-semibold">${discountedPrice.toFixed(2)}</span>
                    `;
                } else {
                    discountInfo = `
                        <span class="text-lg flex-1">${startTime}</span>
                        <span class="text-lg flex-1 text-center">${endTime}</span>
                        <span class="text-lg flex-1 text-end">${fieldAvailability.price.toFixed(2)}</span>
                    `;
                }

                if (isOrdered || isBooked) {
                    element.innerHTML = `
                        <div class="flex flex-1 justify-between">
                            ${discountInfo}
                        </div>
                        <span class="flex w-1/2 justify-end text-lg font-semibold text-red-400">Ordered</span>
                    `;
                } else {
                    element.innerHTML = `
                        <div class="flex flex-1 justify-between">
                            ${discountInfo}
                        </div>
                        <span class="flex w-1/2 justify-end text-lg font-semibold text-green-400">Available</span>
                    `;
                }

                element.addEventListener("click", () => {
                    if (isOrdered || isBooked) {
                        alert('This field availability is not available');
                        return;
                    }

                    const itemIndex = selectedAvailabilities.findIndex(item => item.id === fieldAvailability.id && item.date === currentDate.toDateString());

                    if (element.style.borderLeft === "5px solid red") {
                        element.style.borderLeft = "none";
                        selectedAvailabilities.splice(itemIndex, 1);
                        selectQuantityAvailabilities.innerText = Number(selectQuantityAvailabilities.innerText) - 1;
                    
                        let newPrice = Number(selectPriceAvailabilities.innerText) - discountedPrice;
                    
                        selectPriceAvailabilities.innerText = Math.abs(newPrice) < 0.01 ? "0.00" : newPrice.toFixed(2);
                    } else {
                        element.style.borderLeft = "5px solid red";
                        selectedAvailabilities.push({ id: fieldAvailability.id, date: currentDate.toDateString() });
                        selectQuantityAvailabilities.innerText = Number(selectQuantityAvailabilities.innerText) + 1;
                    
                        let newPrice = Number(selectPriceAvailabilities.innerText) + discountedPrice;
                    
                        selectPriceAvailabilities.innerText = newPrice.toFixed(2);
                    }
                    
                });

                fieldAvailabilitiesElement.appendChild(element);
            }
        });

    } catch (error) {
        console.error("Error fetching booking items:", error);
    }
}


function getSportFieldIdFromPath() {
    const path = window.location.pathname;
    const segments = path.split("/");
    return segments[segments.length - 2]; // Assuming sportFieldId is the last part of the path
}


async function handleOrder() {
    const data = [];

    selectedAvailabilities.forEach(item => {
        data.push({
            sportFieldID: getSportFieldIdFromPath(),
            userID: JSON.parse(localStorage.getItem("current-user")).id,
            currentDate: item.date,
            fieldAvailabilityID: item.id,
        });
    });

    if (data.length > 0) {
        const existingData = JSON.parse(localStorage.getItem("data")) || [];
        const newData = data.filter(item => !existingData.some(existingItem =>
            existingItem.sportFieldID === item.sportFieldID &&
            existingItem.fieldAvailabilityID === item.fieldAvailabilityID &&
            existingItem.currentDate === item.currentDate
        ));

        if (newData.length === 0) {
            alert("You have already ordered this field availability.");
            return;
        }

        if (confirm("Are you sure you want to place the order for these time slots?")) {
            existingData.push(...newData);
            localStorage.setItem("data", JSON.stringify(existingData));

            try {
                await Promise.all(newData.map(async (item) => {
                    const response = await fetch(`${SERVER_DOMAIN}/field-availability/update-status/${item.fieldAvailabilityID}?status=BOOKED`, {
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

                console.log("All field availabilities updated successfully");
            } catch (error) {
                console.error("Error updating field availabilities: ", error);
            }
        }
    }
}


document.getElementById('orderButton').addEventListener('click', async (e) => {
    const selectedElements = Array.from(document.querySelectorAll('.field_availability'))
        .filter(element => element.style.borderLeft === "5px solid red"); console.log(selectedElements);

    if (selectedElements.length === 0) {
        e.preventDefault();
        alert("You haven't chosen the time slots yet!!");
        return;
    } else {
        await handleOrder();
    }
});

