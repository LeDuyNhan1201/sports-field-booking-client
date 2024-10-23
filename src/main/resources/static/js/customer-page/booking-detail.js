const fieldAvailable = document.querySelectorAll(".field_availability");
const slotsSelectQuantity = document.getElementById('slotsSelectQuantity');

fieldAvailable.forEach((e) => {
    e.addEventListener("click", () => {
        if(e.style.borderLeft != "none") {
            e.style.borderLeft = 'none'
        }
        else {
            e.style.borderLeft = "5px solid red"
        }
        checkSlotsSelectQuantity()
    });
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
