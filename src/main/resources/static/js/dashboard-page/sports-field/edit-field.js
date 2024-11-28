let editFieldContainer = document.getElementById("edit_field.container");

let fieldId = 0;

let fieldAvailabilitiesElement = editFieldContainer.querySelector("#edit_field\\.availability\\.container");
let editAvailabilities = [];
let newEditImages = [null, null, null];

//input value
let editField_name = editFieldContainer.querySelector("#edit_field\\.name");
let editField_location = editFieldContainer.querySelector("#edit_field\\.location");
let editField_opacity = editFieldContainer.querySelector("#edit_field\\.opacity");
let editField_category = editFieldContainer.querySelector("#edit_field\\.category");
let editField_promotion = editFieldContainer.querySelector("#edit_field\\.promotion");

let currentEditSportsField = null;

//xác định trạng thái có thay đổi availability không
let changeAvailability = false;

// thêm các thuộc tính trong category select
async function loadEditCategory(currentCategory) {
    try {
        const data = await fetch(`${SERVER_DOMAIN}/category?offset=0&limit=100`);
        const categories = await data.json();

        await appendEditCategory(categories.items, currentCategory);
    } catch (error) {
        console.error("Error fetching category data:", error);
    }
}

async function appendEditCategory(data, currentCategory) {
    let selectContainer = editFieldContainer.querySelector("#edit_field\\.category");

    selectContainer.innerHTML = "";
    data.forEach((category) => {
        let option = document.createElement("option");
        option.value = category.id;
        option.text = category.name.charAt(0).toUpperCase() + category.name.slice(1).toLowerCase();
        if (category.name.localeCompare(currentCategory)) option.selected = true;
        selectContainer.appendChild(option);
    });
}

// đóng modal
editFieldContainer.querySelector("#edit_field\\.closeModal").addEventListener("click", () => {
    editFieldContainer.classList.add("hidden");
    const url = new URL(window.location.href);
    url.search = "";
    window.history.pushState({}, "", url.toString());
});

//inner value
async function loadEditValue(id) {
    try {
        const fieldRes = await fetch(`${SERVER_DOMAIN}/sports-field/${id}`);
        const field = await fieldRes.json();

        fieldId = id;

        currentEditSportsField = field;
        editAvailabilities = [];

        await appendEditValue(field);
    } catch (error) {
        console.error("Error fetching detail:", error);
    }
}

//box duyệt sân và sửa status
async function statusElement(field) {
    if (JSON.parse(localStorage.getItem("current-user")).roles[0] === "ADMIN") {
        editFieldContainer.querySelector("#edit_field\\.button\\.openStatus").classList.remove("hidden");
        editFieldContainer.querySelector("#edit_field\\.promotion").parentElement.classList.remove("hidden")
        if (field.status == "PENDING") {
            editFieldContainer.querySelector("#edit_field\\.acceptStatus").classList.remove("hidden");
        } else {
            editFieldContainer.querySelector("#edit_field\\.acceptStatus").classList.add("hidden");
        }
    }
}

function appendTooltipEditStatus() {
    addTooltip(editFieldContainer.querySelector("#edit_field\\.button\\.bannedStatus"), "Khóa sân")
    addTooltip(editFieldContainer.querySelector("#edit_field\\.button\\.maintenanceStatus"), "Bảo trì sân")
    addTooltip(editFieldContainer.querySelector("#edit_field\\.button\\.openStatus"), "Mở hoạt động sân")
}

async function appendEditValue(field) {    
    editField_name.placeholder = field.name;
    editField_location.placeholder = field.location;
    editField_opacity.placeholder = field.opacity;
    editField_promotion.placeholder = field.promotion ? field.promotion.id : "";

    editFieldContainer.querySelector("#edit_field\\.button_remove_all_availabilities").classList.add("hidden");

    await loadEditCategory(field.category);

    appendImagesEditField(field.images);
    appendFieldAvailabilityEditField(field.fieldAvailabilities);

    statusElement(field);

    appendTooltipEditStatus()
}

// tải ảnh lên form
async function appendImagesEditField(images) {
    let inputImagesElement = editFieldContainer.querySelectorAll(".edit_field\\.select_image");
    inputImagesElement.forEach((element, index) => {
        const newElement = document.createElement("div");
        newElement.className = "edit_field.image";

        newElement.innerHTML = `
            <img 
                src="${images[index]}" 
                alt="Hover Image" 
                class="w-48"
            />
            <div 
                id="tooltip" 
                class="absolute hidden bg-black text-white text-sm px-2 py-1 rounded shadow-lg pointer-events-none"
            ></div>
        `;
        let form = element.parentElement.parentElement;
        form.replaceWith(newElement);

        addTooltip(newElement.querySelector("img"), "Nhấn phải chuột để xóa ảnh");

        //xóa 1 ảnh
        newElement.addEventListener("mousedown", function (event) {
            if (event.button === 2) {
                event.preventDefault();

                changeImageElement(newElement);
                appendSelectImage();
            }
        });
    });
}

// Xử lý khi xóa tất cả ảnh
editFieldContainer.querySelector("#edit_field\\.clear_image").addEventListener("click", () => {
    let imageElements = Array.from(editFieldContainer.querySelectorAll(".edit_field\\.image"));

    imageElements.forEach((element) => {
        changeImageElement(element);
    });

    newEditImages = [];
    appendSelectImage();
});
// Hàm xử lý tải lên file
function handleFileUpload(file, element, index) {
    if (file) {
        const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
        if (allowedTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = function (e) {
                newEditImages[index] = file;
                const newElement = document.createElement("div");
                newElement.className = "edit_field.image";
                newElement.innerHTML = `
                    <img 
                        src="${e.target.result}" 
                        alt="Hover Image" 
                        class="w-48"
                    />
                    <div 
                        id="tooltip" 
                        class="absolute hidden bg-black text-white text-sm px-2 py-1 rounded shadow-lg pointer-events-none"
                    ></div>
                `;

                addTooltip(newElement.querySelector("img"), "Nhấn phải chuột để xóa ảnh");

                let form = element.parentElement.parentElement;
                form.replaceWith(newElement); // Thay thế form bằng ảnh
                //xóa 1 ảnh
                newElement.addEventListener("mousedown", function (event) {
                    if (event.button === 2) {
                        event.preventDefault();

                        changeImageElement(newElement);
                        appendSelectImage();
                    }
                });
            };
            reader.readAsDataURL(file);
        } else {
            alert("Only PNG, JPG, and JPEG files are allowed.");
        }
    }
}
// đưa ảnh vào form
function appendSelectImage() {
    let button_select_image = document.getElementsByClassName("edit_field.select_image");

    Array.from(button_select_image).forEach((element) => {
        let parentDiv = element.parentElement.parentElement.parentElement;
        let index = parentDiv.id[parentDiv.id.length - 1];

        // Xử lý sự kiện chọn file qua input
        element.addEventListener("change", (e) => {
            const file = e.target.files[0];
            handleFileUpload(file, element, index);
        });

        // Xử lý sự kiện kéo và thả (là thẻ label được dùng để thay thành ảnh)
        let dropZone = element.parentElement;

        // Hiệu ứng
        dropZone.addEventListener("dragover", (e) => {
            e.preventDefault();
            dropZone.classList.add("border-blue-600");
        });

        dropZone.addEventListener("dragleave", () => {
            dropZone.classList.remove("border-blue-600");
        });

        dropZone.addEventListener("drop", (e) => {
            e.preventDefault();
            dropZone.classList.remove("border-blue-600");

            const file = e.dataTransfer.files[0];
            handleFileUpload(file, element, index);
        });
    });
}

// thay thế image bằng element cũ
function changeImageElement(element) {
    let selectImageElement = document.createElement("div");
    selectImageElement.className = "flex items-center justify-center w-full";
    selectImageElement.innerHTML = `
            <label class="flex flex-col rounded-lg border-2 border-dashed w-full h-60 p-5 group text-center">
                <div class="h-full w-full text-center flex flex-col items-center justify-center items-center">
                    <i class="fa-solid fa-upload text-3xl text-gray-400"></i>
                    <p class="pointer-none text-gray-500">
                        <span class="text-sm">Drag and drop</span> files here <br />
                        or <a href="" id="" class="text-blue-600 hover:underline">select a file</a>
                    </p>
                </div>
                <input type="file" class="edit_field.select_image hidden" />
            </label>
        `;
    element.replaceWith(selectImageElement);
}

//load field availability
async function appendFieldAvailabilityEditField(fieldAvailabilities) {    
    fieldAvailabilitiesElement.innerHTML = "";
    fieldAvailabilities.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
    fieldAvailabilities.forEach((availability, index) => {
        availability = {
            id: availability.id,
            index: index + 1,
            openingTime: new Date(availability.startTime),
            closingTime: new Date(availability.endTime),
            price: availability.price,
        };
        editAvailabilities.push(availability);
        appendAvailabilityElement(availability, index);
    });
}

//action thêm availability
editFieldContainer.querySelector("#edit_field\\.button_add_availabilities").addEventListener("click", async () => {
    let openingTimeElementValue = editFieldContainer.querySelector("#edit_field\\.availability\\.openingTime").value;
    let closingTimeElementValue = editFieldContainer.querySelector("#edit_field\\.availability\\.closingTime").value;
    let priceElementValue = editFieldContainer.querySelector("#edit_field\\.availability\\.price").value;

    if (openingTimeElementValue === "" || closingTimeElementValue === "") {
        alert("Vui lòng nhập giờ");
        return;
    }
    if (priceElementValue === "") {
        alert("Vui lòng nhập giá");
        return;
    }

    let openingTime = formatHourToDate(openingTimeElementValue);
    let closingTime = formatHourToDate(closingTimeElementValue);

    let duplicate = true;

    if (closingTime.getTime() < openingTime.getTime()) {
        alert("Giờ mở cửa không thể lớn hơn giờ đóng cửa")
        return;
    }

    if (closingTime.getTime() === openingTime.getTime()) {
        alert("Thời gian hoạt động phải lớn hơn không")
        return;
    }

    if (editAvailabilities.length > 0) {
        for (const availability of editAvailabilities) {
            if (availability.openingTime.getTime() === openingTime.getTime()) {
                alert("Giờ mở cửa không thể trùng")
                duplicate = false;
                break;
            }

            if (availability.closingTime.getTime() === closingTime.getTime()) {
                alert("giờ đóng cửa không thể trùng")
                duplicate = false;
                break;
            }

            if (isTimeBetween(openingTime.getTime(), availability.openingTime.getTime(), availability.closingTime.getTime())) {
                alert("giờ mở cửa không hợp lệ")
                duplicate = false;
                break;
            }

            if (isTimeBetween(closingTime.getTime(), availability.openingTime.getTime(), availability.closingTime.getTime())) {
                alert("giờ đóng cửa không hợp lệ")
                duplicate = false;
                break;
            }
        }
    }

    if (duplicate) {
        let newAvailability = {
            index: editAvailabilities.length,
            openingTime: openingTime,
            closingTime: closingTime,
            price: priceElementValue,
        };
        if (confirm("Bạn có chắc chắn tạo giờ này khong")) {
            let newFieldAvailability = await createFieldAvailability(newAvailability, currentEditSportsField.id);

            newAvailability = {
                id: newFieldAvailability.id,
                index: editAvailabilities.length,
                openingTime: openingTime,
                closingTime: closingTime,
                price: priceElementValue,
            };

            editAvailabilities.push(newAvailability);

            //load lại element
            fieldAvailabilitiesElement.innerHTML = "";
            editAvailabilities.forEach((availability, index) => {
                appendAvailabilityElement(availability, index);
            });
        }
    }
});

// inner availability time vào  fieldAvailabilitiesElement
async function appendAvailabilityElement(availability, index) {
    let element = document.createElement("div");
    element.className = "flex justify-between text-center items-center pb-1 px-1 cursor-pointer";
    element.innerHTML = `
        <span class="w-3">${index + 1}</span>
        <span class="flex-1">${formatHour(availability.openingTime)}</span>
        <span class="flex-1">${formatHour(availability.closingTime)}</span>
        <span class="flex-1 text-yellow-800">${availability.price} $</span>
        <i class="fa-solid text-red-500 fa-xmark w-3 cursor-pointer"></i>
    `;
    fieldAvailabilitiesElement.appendChild(element);

    //mở detail banned time
    element.querySelectorAll("span").forEach((e) => {
        e.addEventListener("click", () => {
            loadFieldAvailabilityBanned(availability);
        });
    });

    //hàm xóa 1 field availability
    element.querySelector("i").addEventListener("click", async () => {
        editAvailabilities = editAvailabilities.filter((item) => item.index !== index);
        changeAvailability = true;

        editAvailabilities = editAvailabilities.map((item, newIndex) => ({
            index: newIndex,
            openingTime: item.openingTime,
            closingTime: item.closingTime,
            price: item.price,
        }));

        if (confirm("Bạn có chắc chắn muốn xóa mục này?")) {
            if (editAvailabilities.length < 2) {
                alert("Thông tin booking không thể rỗng");
            } else {
                await deleteAvailability(currentEditSportsField.id, index);

                alert("Create sports field successfully");
                document.location.reload(true);
            }
        } else {
            console.log("Hủy");
        }
    });
}

// action sửa
editFieldContainer.querySelector("#edit_field\\.create_field").addEventListener("click", async () => {
    let name = editFieldContainer.querySelector("#edit_field\\.name").value == "" ? currentEditSportsField.name : editFieldContainer.querySelector("#edit_field\\.name").value;
    let location = editFieldContainer.querySelector("#edit_field\\.location").value == "" ? currentEditSportsField.location : editFieldContainer.querySelector("#edit_field\\.location").value;
    let opacity = editFieldContainer.querySelector("#edit_field\\.opacity").value == "" ? currentEditSportsField.opacity : editFieldContainer.querySelector("#edit_field\\.opacity").value;
    let category = editFieldContainer.querySelector("#edit_field\\.category").value;

    let newSportsField = null;

    try {
        const response = await fetch(`${SERVER_DOMAIN}/sports-field`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + getAccessTokenFromCookie(),
            },
            body: JSON.stringify({
                id: currentEditSportsField.id,
                name: name,
                location: location,
                opacity: opacity,
                categoryId: category,
                isConfirmed: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to create sports field:", response.status, errorText);
        } else {
            newSportsField = await response.json();

            for (const image of newEditImages) {
                const index = newEditImages.indexOf(image);
                if (image != null) {
                    await deleteImages(newSportsField.id, index);
                    await uploadPicture(image, newSportsField.id);
                }
            }

            alert("Create sports field successfully");
            document.location.reload(true);
        }
    } catch (error) {
        console.error("Error create sports field:", error);
    }
});

//kiểm tra số lượng ảnh
function checkImages(images) {
    if (images.length < 3) return false;

    for (const image of images) {
        if (image === null) {
            console.log("Có hình ảnh null");
            return false;
        }
    }
    return true;
}

// xóa tất cả ảnh

async function deleteImages(sportFieldId, index) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/sports-field/delete-images/${index}/${sportFieldId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + getAccessTokenFromCookie(),
            },
        });

        console.log(response);
    } catch (error) {
        console.error("Error deleting existing avatar:", error);
    }
}

//upload ảnh
async function uploadPicture(file, sportsFieldId) {
    if (file) {
        const CHUNK_SIZE = 1024 * 1024;
        let chunkStartByte = 0;
        const fileMetadataId = crypto.randomUUID();

        while (chunkStartByte < file.size) {
            const chunk = file.slice(chunkStartByte, chunkStartByte + CHUNK_SIZE);
            const chunkHash = await calculateFileHash(chunk);

            const formData = new FormData();
            formData.append("file", chunk);
            const request = {
                fileMetadataId: fileMetadataId,
                chunkHash: chunkHash,
                startByte: chunkStartByte,
                totalSize: file.size,
                contentType: file.type,
                ownerId: sportsFieldId,
                fileMetadataType: "SPORTS_FIELD_IMAGE",
            };

            formData.append("request", new Blob([JSON.stringify(request)], { type: "application/json" }));

            try {
                const response = await fetch(`${SERVER_DOMAIN}/sports-field/images`, {
                    method: "POST",
                    body: formData,
                });

                if (response.ok) {
                    const data = await response.json();
                    chunkStartByte = data.results;
                } else {
                    console.error("Error uploading chunk:", response);
                    throw new Error("Upload failed");
                }
            } catch (error) {
                console.error("Error uploading chunk:", error);
                break;
            }
        }
    }
}

//thêm field availability
async function createFieldAvailability(availabilityValue, sportsFieldId) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/field-availability/create`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + getAccessTokenFromCookie(),
            },
            body: JSON.stringify({
                price: availabilityValue.price,
                endTime: availabilityValue.closingTime,
                startTime: availabilityValue.openingTime,
                sportsFieldId: sportsFieldId,
                isConfirmed: true,
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Failed to create field availability:", response.status, errorText);
        } else {
            return await response.json();
        }
    } catch (error) {
        console.error("Error create field availability:", error);
    }
}

// xóa availability

async function deleteAvailability(sportFieldId, index) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/sports-field/delete-availabilities/${index}/${sportFieldId}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + getAccessTokenFromCookie(),
            },
        });

        console.log(response);
    } catch (error) {
        console.error("Error deleting existing avatar:", error);
    }
}

editFieldContainer.querySelector("#edit_field\\.button\\.acceptStatus").addEventListener("click", async () => {
    if (confirm("Bạn có chắc duyệt sân này không")) {
        await updateStatus("OPEN");
    }
});

editFieldContainer.querySelector("#edit_field\\.button\\.bannedStatus").addEventListener("click", async (e) => {
    if (confirm("Bạn có chắc khóa sân này không")) {
        if (currentEditSportsField.status == "INACTIVE") {
            alert("Sân này đang khóa");
        } else {
            await updateStatus("INACTIVE");
        }
    }    
});
editFieldContainer.querySelector("#edit_field\\.button\\.maintenanceStatus").addEventListener("click", async () => {
    if (confirm("Bạn có chắc bảo trì sân này không")) {
        if (currentEditSportsField.status == "MAINTENANCE") {
            alert("Sân này đang bảo trì");
        } else {
            await updateStatus("MAINTENANCE");
        }
    }
});

editFieldContainer.querySelector("#edit_field\\.button\\.openStatus").addEventListener("click", async () => {
    if (confirm("Bạn có chắc bảo trì sân này không")) {
        if (currentEditSportsField.status == "OPEN" || currentEditSportsField.status == "CLOSED") {
            alert("Sân này đang hoạt động");
        } else {
            await updateStatus("OPEN");
        }
    }
});

async function updateStatus(status) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/sports-field/status/${fieldId}?status=${status}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + getAccessTokenFromCookie(),
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Error update status sports field:", response.status, errorText);
        } else {
            alert("Thay đổi trạng thái thành công");
            window.location.reload(true);
        }
    } catch (error) {
        console.error("Error update status sports field:", error);
    }
}

editFieldContainer.querySelector("#edit_field\\.promotion").addEventListener("blur", async (e) => {
    await updatePromotion(e.target.vale)
});
editFieldContainer.querySelector("#edit_field\\.promotion").addEventListener("keydown", async (e) => {
    if (e.key === "Enter") {
        await updatePromotion(e.target.value)
    }
});

async function updatePromotion(value) {
    const response = await fetch(`${SERVER_DOMAIN}/sports-field/promotion/${currentEditSportsField.id}?promotionId=${value}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + getAccessTokenFromCookie(),
        },
    });

    if (!response.ok) {
        alert("Mã giảm giá không hợp lệ")
        
    } else {
        alert("Thay đổi giảm giá thành");
        window.location.reload(true);
    }
}
