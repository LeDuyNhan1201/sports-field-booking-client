let bookingDetail = document.getElementById("booking-detail");
let buttonOrder = document.getElementById("buttonOrder");
let buttonCloseBookingDetail = document.getElementById("buttonCloseBookingDetail");
let container = document.getElementById('field-detail')

async function loadDetail() {
    try {
        let container = document.getElementById('field-detail')
        let id = container.getAttribute('fieldId');

        const response = await fetch(`${SERVER_DOMAIN}/sports-field/${id}`);
        const data = await response.json();
        console.log(data);
        
        await appendDetail(data)

    } catch (error) {
        console.error('Error fetching detail:', error);
    }
}

async function appendDetail(data) {
    document.getElementById('field_detail.fieldName').textContent = data.name
    document.getElementById('field_detail.location').textContent = data.location
    document.getElementById('field_detail.phone').textContent = data.phone
    document.getElementById('field_detail.email').textContent = data.email

}
loadDetail()
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

