const fieldAvailable = document.querySelectorAll(".field_availability");


fieldAvailable.forEach((e) => {
    
});

function checkSlotsSelectQuantity() {
    var quantity = 0
    fieldAvailable.forEach((e)=>{
        if(e.style.borderLeft != "none") {
            quantity += 1
        }
    })
    slotsSelectQuantity.innerHTML = quantity
}
