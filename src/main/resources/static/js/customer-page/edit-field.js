let editFieldContainer = fieldDetailContainer.querySelector("#new_field\\.container");
let fieldId = fieldDetailContainer.getAttribute("fieldId");

let fieldAvailabilitiesElement = editFieldContainer.querySelector("#new_field\\.availability\\.container");
let editAvailabilities = [];
let newImages = [null, null, null];

//input value
let editField_name = editFieldContainer.querySelector("#new_field\\.name");
let editField_location = editFieldContainer.querySelector("#new_field\\.location");
let editField_opacity = editFieldContainer.querySelector("#new_field\\.opacity");
let editField_category = editFieldContainer.querySelector("#new_field\\.category");

let currentEditSportsField = null;

//xác định trạng thái có thay đổi availability không
let changeAvailability = false;

// thêm các thuộc tính trong category select
async function loadCategory(currentCategory) {
    try {
        const data = await fetch(`${SERVER_DOMAIN}/category/all?offset=0&limit=100`);
        const categories = await data.json();
        appendCategory(categories, currentCategory);
    } catch (error) {
        console.error("Error fetching category data:", error);
    }
}

async function appendCategory(data, currentCategory) {
    let selectContainer = editFieldContainer.querySelector("#new_field\\.category");

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
editFieldContainer.querySelector("#new_field\\.closeModal").addEventListener("click", () => {
    editFieldContainer.classList.add("hidden");
});

//inner value
async function loadEditValue() {
    try {
        const fieldRes = await fetch(`${SERVER_DOMAIN}/sports-field/${fieldId}`);
        const field = await fieldRes.json();

        currentEditSportsField = field;
        await appendEditValue(field);
    } catch (error) {
        console.error("Error fetching detail:", error);
    }
}

async function appendEditValue(field) {
    editField_name.placeholder = field.name;
    editField_location.placeholder = field.location;
    editField_opacity.placeholder = field.opacity;

    editFieldContainer.querySelector("#new_field\\.button_remove_all_availabilities").classList.add("hidden");

    loadCategory(field.category);
    appendImagesEditField(field.images);
    appendFieldAvailabilityEditField(field.fieldAvailabilities);
}

// tải ảnh lên form
async function appendImagesEditField(images) {
    let inputImagesElement = editFieldContainer.querySelectorAll(".new_field\\.select_image");
    inputImagesElement.forEach((element, index) => {
        const newElement = document.createElement("div");
        newElement.className = "new_field.image";
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

document.addEventListener("DOMContentLoaded", async function () {
    await loadEditValue();
});

// Hàm xử lý tải lên file
function handleFileUpload(file, element, index) {
    if (file) {
        const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
        if (allowedTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = function (e) {
                newImages[index] = file;
                const newElement = document.createElement("div");
                newElement.className = "new_field.image";
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
    let button_select_image = document.getElementsByClassName("new_field.select_image");

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
                <input type="file" class="new_field.select_image hidden" />
            </label>
        `;
    element.replaceWith(selectImageElement);
}

//load field availability
async function appendFieldAvailabilityEditField(fieldAvailabilities) {
    fieldAvailabilities.forEach((availability, index) => {
        editAvailabilities.push({
            index: index + 1,
            openingTime: new Date(availability.startTime),
            closingTime: new Date(availability.endTime),
            price: availability.price,
        });

        appendAvailabilityElement(index, availability.startTime, availability.endTime, availability.price);
    });
}

//action thêm availability
editFieldContainer.querySelector("#new_field\\.button_add_availabilities").addEventListener("click", async () => {
    let openingTimeElementValue = editFieldContainer.querySelector("#new_field\\.availability\\.openingTime").value;
    let closingTimeElementValue = editFieldContainer.querySelector("#new_field\\.availability\\.closingTime").value;
    let priceElementValue = editFieldContainer.querySelector("#new_field\\.availability\\.price").value;

    if (openingTimeElementValue == "" || closingTimeElementValue == "") {
        alert("Vui lòng nhập giờ");
        return;
    }
    if (priceElementValue == "") {
        alert("Vui lòng nhập giá");
        return;
    }

    let openingTime = formatHourToDate(openingTimeElementValue);
    let closingTime = formatHourToDate(closingTimeElementValue);

    let duplicate = true;

    if (closingTime.getTime() < openingTime.getTime()) {
        console.log("Giờ mở cửa không thể lớn hơn giờ đóng cửa");
        return;
    }

    if (closingTime.getTime() == openingTime.getTime()) {
        console.log("Thời gian hoạt động phải lớn hơn không");
        return;
    }

    if (editAvailabilities.length > 0) {
        for (const availability of editAvailabilities) {
            if (availability.openingTime.getTime() === openingTime.getTime()) {
                console.log("Giờ mở cửa không thể trùng");
                duplicate = false;
                break;
            }

            if (availability.closingTime.getTime() === closingTime.getTime()) {
                console.log("giờ đóng cửa không thể trùng");
                duplicate = false;
                break;
            }

            if (isTimeBetween(openingTime.getTime(), availability.openingTime.getTime(), availability.closingTime.getTime())) {
                console.log("giờ mở cửa không hợp lệ");
                duplicate = false;
                break;
            }

            if (isTimeBetween(closingTime.getTime(), availability.openingTime.getTime(), availability.closingTime.getTime())) {
                console.log("giờ đóng cửa không hợp lệ");
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
            editAvailabilities.push(newAvailability);

            await createFieldAvailability(newAvailability, currentEditSportsField.id);

            //load lại element
            fieldAvailabilitiesElement.innerHTML = "";
            editAvailabilities.forEach((availability, index) => {
                appendAvailabilityElement(index, availability.openingTime, availability.closingTime, availability.price);
            });
        }
    }
});

// inner availability time vào  fieldAvailabilitiesElement
async function appendAvailabilityElement(index, startTime, endTime, price) {
    let element = document.createElement("div");
    element.className = "flex justify-between text-center items-center pb-1 px-1";
    element.innerHTML = `
        <span class="w-3">${index + 1}</span>
        <span class="flex-1">${formatHour(startTime)}</span>
        <span class="flex-1">${formatHour(endTime)}</span>
        <span class="flex-1">${price}</span>
        <i class="fa-solid fa-xmark w-3 cursor-pointer"></i>
    `;
    fieldAvailabilitiesElement.appendChild(element);

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
            console.log(editAvailabilities.length);

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
editFieldContainer.querySelector("#new_field\\.create_field").addEventListener("click", async () => {
    let name = editFieldContainer.querySelector("#new_field\\.name").value == "" ? currentEditSportsField.name : editFieldContainer.querySelector("#new_field\\.name").value;
    let location = editFieldContainer.querySelector("#new_field\\.location").value == "" ? currentEditSportsField.location : editFieldContainer.querySelector("#new_field\\.location").value;
    let opacity = editFieldContainer.querySelector("#new_field\\.opacity").value == "" ? currentEditSportsField.opacity : editFieldContainer.querySelector("#new_field\\.opacity").value;
    let category = editFieldContainer.querySelector("#new_field\\.category").value;

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

            newImages.forEach(async (image, index) => {
                if (image != null) {
                    await deleteImages(newSportsField.id, index);
                    await uploadPicture(image, newSportsField.id);
                }
            });

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
