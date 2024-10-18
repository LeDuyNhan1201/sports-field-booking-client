var bookingDetail = document.getElementById("booking-detail");
var buttonOrder = document.getElementById("buttonOrder");
var fieldDetail = document.getElementById("field-detail");
var buttonCloseBookingDetail = document.getElementById("buttonCloseBookingDetail");

//review element
var buttonNewChildCmt = document.querySelectorAll(".buttonNewChildCmt");
var buttonCloseNewChildCmt = document.querySelectorAll(".buttonCloseNewChildCmt");

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

// action review

if (buttonNewChildCmt) {
    buttonNewChildCmt.forEach((e) => {
        e.addEventListener("click", () => {
            var newChildCmt = e.parentElement.parentElement.parentElement.querySelector(".newChildCmt");
            newChildCmt.style.display = "block";
        });
    });
}
if (buttonCloseNewChildCmt) {
    buttonCloseNewChildCmt.forEach((e) => {
        e.addEventListener("click", () => {
            var newChildCmt = e.parentElement.parentElement;
            newChildCmt.style.display ='none'
        });
    });
}
