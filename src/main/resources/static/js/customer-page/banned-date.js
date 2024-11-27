let currentAvailability = null;
let bannedDateElement = editFieldContainer.querySelector("#edit-field\\.banned-time\\.list");
//xử lý mở
async function loadFieldAvailabilityBanned(availability) {
    let currentAvailabilityAccess = [];
    fieldAvailabilityDateBanned.classList.toggle("hidden");
    editFieldContainer.querySelector("#edit-field\\.banned-time\\.start-time").textContent = formatHour(availability.openingTime);
    editFieldContainer.querySelector("#edit-field\\.banned-time\\.end-time").textContent = formatHour(availability.closingTime);

    editFieldContainer.querySelector("#edit-field\\.banned-time\\.new-time").min = formatDateInputValue(new Date())

    currentAvailability = availability;

    try {
        const data = await fetch(`${SERVER_DOMAIN}/field-availability-access/sports-field?sportsFieldID=${currentEditSportsField.id}`);
        const fieldAvailabilityAccess = await data.json();
        
        fieldAvailabilityAccess.forEach((item) => {
            if(formatHour(availability.openingTime) === formatHour(item.startDate)){
                currentAvailabilityAccess.push(item)             
            }
        });        
        await appendAvailabilityAccess(currentAvailabilityAccess);
    } catch (error) {
        console.error("Error get field availability access:", error);
    }
}
//xử lý đóng banned date
editFieldContainer.querySelector("#edit-field\\.banned-time\\.closeModal").addEventListener("click", () => {
    fieldAvailabilityDateBanned.classList.toggle("hidden");
});

//append availability access

async function appendAvailabilityAccess(data) {
    if (data.length > 0) {
        bannedDateElement.innerHTML = "";
        data.forEach((item, index) => {
            let element = document.createElement("div");
            element.className = "flex items-center mt-1 px-1";

            element.innerHTML = `
                <span class="text-sm text-gray-400" >${index + 1}</span>
                <input
                    type="date"
                    min="${formatDateInputValue(new Date())}"
                    id="edit-field.banned-time.new-time"
                    value="${formatDateInputValue(item.startDate)}"
                    class="font-bold block px-2 p-2 bg-white w-full border-1 text-green-500 border-green-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
                <i class="fa-solid fa-xmark w-3 text-red-500 cursor-pointer"></i>
            `;
            bannedDateElement.appendChild(element);
        });
    }
    else {
        bannedDateElement.innerHTML = `<span class="text-sm italic text-gray-300">Hiện tại không có ngày khóa<span/>`
    }
}

editFieldContainer.querySelector("#edit-field\\.banned-time\\.button-add").addEventListener("click", async () => {
    let date = editFieldContainer.querySelector("#edit-field\\.banned-time\\.new-time").value;

    if (date && date != null) {
        let newEndTime = new Date(`${date}T${formatHour(currentAvailability.closingTime)}`);
        let newStartTime = new Date(`${date}T${formatHour(currentAvailability.openingTime)}`);

        const response = await fetch(`${SERVER_DOMAIN}/field-availability-access/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + getAccessTokenFromCookie(),
            },
            body: JSON.stringify({
                endTime: newEndTime,
                startTime: newStartTime,
                sportsFieldId: currentEditSportsField.id,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to create sports field:", response.status, errorText);
        } else {
            alert("Thêm thành công");
            await loadFieldAvailabilityBanned(currentAvailability);
        }
    } else {
        alert("Vui lòng chọn ngày");
    }
});
