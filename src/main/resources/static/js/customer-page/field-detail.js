let bookingDetail = document.getElementById("booking-detail");
let buttonOrder = document.getElementById("buttonOrder");
let buttonCloseBookingDetail = document.getElementById("buttonCloseBookingDetail");
let container = document.getElementById("field-detail");
let id = container.getAttribute("fieldId");
async function loadDetail() {
    try {
        const fieldRes = await fetch(`${SERVER_DOMAIN}/sports-field/${id}`);
        const field = await fieldRes.json();

        await appendDetail(field);
        await tab_detail(field)
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
        switch(field.status) {
            case 'OPEN':
                statusElements[0].classList.add('bg-yellow-100')
                statusElements[0].querySelector('span').classList.add('text-green-800')
                break;
            case 'CLOSE':
                statusElements[1].classList.add('bg-yellow-100')
                statusElements[1].querySelector('span').classList.add('text-green-800')
                break;
            case 'MAINTENANCE':
                statusElements[2].classList.add('bg-yellow-100')
                statusElements[2].querySelector('span').classList.add('text-green-800')
                break;
            default:
                statusElements[3].classList.add('bg-yellow-100')
                statusElements[3].querySelector('span').classList.add('text-green-800')
                break;
        }
    }
}
