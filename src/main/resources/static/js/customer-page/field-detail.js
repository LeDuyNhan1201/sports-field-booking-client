let bookingDetail = document.getElementById("booking-detail");
let buttonOrder = document.getElementById("buttonOrder");
let buttonCloseBookingDetail = document.getElementById("buttonCloseBookingDetail");
let container = document.getElementById("field-detail");
let id = container.getAttribute("fieldId");

const selectQuantityAvailabilities = document.getElementById('booking_detail.select_quantity_availabilities');
const selectPriceAvailabilities = document.getElementById('booking_detail.select_price_availabilities');

// có nên đẩy hàm này vô ultils luôn k
function extractTime(isoString) {
    const date = new Date(isoString);
    const hours = String(date.getUTCHours()).padStart(2, "0");
    const minutes = String(date.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
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
    field.fieldAvailabilities.forEach((fieldAvailability) => {
        let element = document.createElement("a");
        element.className = "flex flex-row justify-between mt-3 cursor-pointer p-2 select-none border-b-2 border-green-400 border-l-0 field_availability";
        element.innerHTML = `
                <div class="flex flex-1 justify-between">
                    <span class="text-lg flex-1">${extractTime(fieldAvailability.startTime)}</span>
                    <span class="text-lg flex-1 text-center">${extractTime(fieldAvailability.endTime)}</span>
                    <span class="text-lg flex-1 text-end">${fieldAvailability.price} $</span>
                    </div>
                <span class="flex w-1/2 justify-end text-lg font-semibold text-green-400">${fieldAvailability.status}</span>
            `;

        element.addEventListener("click", () => {
            if(element.style.borderLeft == '5px solid red') {                
                element.style.borderLeft = 'none'
                selectQuantityAvailabilities.innerText = Number(selectQuantityAvailabilities.innerText) - 1;
                selectPriceAvailabilities.innerText = (Number(selectPriceAvailabilities.innerText) - fieldAvailability.price).toFixed(2);                
            }
            else {
                element.style.borderLeft = "5px solid red"
                selectQuantityAvailabilities.innerText = Number(selectQuantityAvailabilities.innerText) + 1;
                selectPriceAvailabilities.innerText = (Number(selectPriceAvailabilities.innerText) + fieldAvailability.price).toFixed(2);
            }
            console.log(element.style.borderLeft);
            
        });

        fieldAvailabilitiesElement.appendChild(element);
    });
}
