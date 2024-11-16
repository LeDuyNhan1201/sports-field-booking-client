let bookingDetail = document.getElementById("booking-detail");
let buttonOrder = document.getElementById("buttonOrder");
let buttonCloseBookingDetail = document.getElementById("buttonCloseBookingDetail");
let container = document.getElementById("field-detail");
let id = container.getAttribute("fieldId");
let currentDate = new Date();

const selectQuantityAvailabilities = document.getElementById('booking_detail.select_quantity_availabilities');
const selectPriceAvailabilities = document.getElementById('booking_detail.select_price_availabilities');

const prevDateButton = document.getElementById("booking_detail.previousDate");
const nextDateButton = document.getElementById("booking_detail.nextDate");
const currentDateElement = document.getElementById("booking_detail.currentDate");

let selectedAvailabilities = [];

// có nên đẩy hàm này vô ultils luôn k
function extractTime(isoString) {
    const date = new Date(isoString);
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
}

function displayDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    if (currentDateElement) {
        currentDateElement.textContent = `${day}-${month}-${year}`;
    }
}

function convertDateFormat(isoString) {
    const date = new Date(isoString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

function isTimeWithinRange(startTime, endTime, rangeStart, rangeEnd) {
    const toMinutes = (time) => {
        const [hours, minutes] = time.split(':').map(Number);
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
        
        if(currentDate < now) {
            currentDate = now;
            displayDate(currentDate);
        }else {
            try {
                const fieldRes = await fetch(`${SERVER_DOMAIN}/sports-field/${id}`);
                const field = await fieldRes.json();
                await appendBookingDetail(field);
            } catch (error) {
                console.error("Error fetching field data:", error);
            }
        }
    });

    nextDateButton.addEventListener('click', async () => {
        currentDate.setDate(currentDate.getDate() + 1);
        displayDate(currentDate);

        try {
            const fieldRes = await fetch(`${SERVER_DOMAIN}/sports-field/${id}`);
            const field = await fieldRes.json();
            await appendBookingDetail(field);
        } catch (error) {
            console.error("Error fetching field data:", error);
        }
    });
}


async function loadDetail() {
    try {
        const fieldRes = await fetch(`${SERVER_DOMAIN}/sports-field/${id}`);
        const field = await fieldRes.json();

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
        document.getElementById("field_detail.openingTime").textContent = extractTime(field.openingTime);
        document.getElementById("field_detail.closingTime").textContent = extractTime(field.closingTime);
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
loadDetail();
if (buttonOrder) {
    buttonOrder.addEventListener("click", () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth",
        });
        bookingDetail.style.display = "block";
        window.document.body.style.overflow = "hidden";
        bookingDetail.style.overflow = "auto";
    });
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
            case "CLOSE":
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

    field.fieldAvailabilities.forEach((fieldAvailability) => {
        let element = document.createElement("a");
        element.className = "flex flex-row justify-between mt-3 cursor-pointer p-2 select-none border-b-2 border-green-400 border-l-0 field_availability";
        element.dataset.availabilityId = fieldAvailability.id;

        if (isTimeWithinRange(extractTime(fieldAvailability.startTime),extractTime(fieldAvailability.endTime),extractTime(field.openingTime),extractTime(field.closingTime))) {
            element.innerHTML = `
                    <div class="flex flex-1 justify-between">
                        <span class="text-lg flex-1">${extractTime(fieldAvailability.startTime)}</span>
                        <span class="text-lg flex-1 text-center">${extractTime(fieldAvailability.endTime)}</span>
                        <span class="text-lg flex-1 text-end">${fieldAvailability.price}</span>
                    </div>
                    <span class="flex w-1/2 justify-end text-lg font-semibold text-green-400">Available</span>
                    `;

            const selectedItem = selectedAvailabilities.find(item => item.id === fieldAvailability.id && item.date === currentDate.toDateString());
            
            if (selectedItem) {
                element.style.borderLeft = "5px solid red";
            }

            element.addEventListener("click", () => {
                // if (!fieldAvailability.is_available) {
                //     alert("This sport field has already been ordered");
                //     return;
                // }
                
                const itemIndex = selectedAvailabilities.findIndex(item => item.id === fieldAvailability.id && item.date === currentDate.toDateString());

                if (element.style.borderLeft == '5px solid red') {
                    element.style.borderLeft = 'none'
                    selectedAvailabilities.splice(itemIndex, 1);
                    selectQuantityAvailabilities.innerText = Number(selectQuantityAvailabilities.innerText) - 1;
                    selectPriceAvailabilities.innerText = (Number(selectPriceAvailabilities.innerText) - fieldAvailability.price).toFixed(2);
                } else {
                    element.style.borderLeft = "5px solid red"
                    selectedAvailabilities.push({ id: fieldAvailability.id, date: currentDate.toDateString() });
                    selectQuantityAvailabilities.innerText = Number(selectQuantityAvailabilities.innerText) + 1;
                    selectPriceAvailabilities.innerText = (Number(selectPriceAvailabilities.innerText) + fieldAvailability.price).toFixed(2);
                }
            });

            fieldAvailabilitiesElement.appendChild(element);
        }
    });
}

function getSportFieldIdFromPath() {
    const path = window.location.pathname;
    const segments = path.split('/');
    return segments[segments.length - 2]; // Assuming sportFieldId is the last part of the path
}


function handleOrder() {
    const data = [];

    selectedAvailabilities.forEach(item => {
        data.push({
            sportFieldID: getSportFieldIdFromPath(),
            userID: JSON.parse(localStorage.getItem('current-user')).id,
            currentDate: item.date,
            fieldAvailabilityID: item.id,
        });
    });   

    if (data.length > 0) {
        const existingData = JSON.parse(localStorage.getItem("data")) || [];

        const newData = data.filter(item =>
            !existingData.some(existingItem =>
                existingItem.sportFieldID === item.sportFieldID &&
                existingItem.fieldAvailabilityID === item.fieldAvailabilityID &&
                existingItem.currentDate === item.currentDate
            )
        );

        if (newData.length === 0) {
            alert("You have ordered this field availability");
            return;
        } 
        if (confirm("Are you sure you want to place the order for these time slots")) {
            existingData.push(...newData);
            localStorage.setItem("data", JSON.stringify(existingData));
        }   
   }
}


document.getElementById('orderButton').addEventListener('click', (e) => {
    const selectedElements = Array.from(document.querySelectorAll('.field_availability'))
        .filter(element => element.style.borderLeft === "5px solid red"); console.log(selectedElements);

    if (selectedElements.length === 0) {
        e.preventDefault();
        alert("You haven't chosen the time slots yet!!");
        return;
    } else {
        handleOrder();
    }
});

