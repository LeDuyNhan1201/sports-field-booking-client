let newImages = [];
let newAvailabilities = [];

let newFieldContainer = document.getElementById("new_field.container");
let newAvailabilitiesElement = newFieldContainer.querySelector("#new_field\\.availability\\.container");

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

document.addEventListener("DOMContentLoaded", function () {
    appendSelectImage();
    loadCategory();
    loadNewFieldAvailability();
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

                        newImages[index] = null;

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
// Xử lý khi xóa tất cả ảnh
newFieldContainer.querySelector("#new_field\\.clear_image").addEventListener("click", () => {
    let imageElements = Array.from(newFieldContainer.querySelectorAll(".new_field\\.image"));

    imageElements.forEach((element) => {
        changeImageElement(element);
    });

    newImages = [];
    appendSelectImage();
});

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

// thêm các thuộc tính trong category select

async function loadCategory() {
    try {
        const data = await fetch(`${SERVER_DOMAIN}/category?offset=0&limit=100`);
        const categories = await data.json();
        appendCategory(categories.items);
    } catch (error) {
        console.error("Error fetching category data:", error);
    }
}

async function appendCategory(data) {
    let selectContainer = newFieldContainer.querySelector("#new_field\\.category");

    data.forEach((category) => {
        let option = document.createElement("option");
        option.value = category.id;
        option.text = category.name.charAt(0).toUpperCase() + category.name.slice(1).toLowerCase();
        selectContainer.appendChild(option);
    });
}

//load field availability
function loadNewFieldAvailability() {
    newAvailabilitiesElement.innerHTML = "";
    newAvailabilities.forEach((availability, index) => {
        appendNewAvailabilityElement(index, availability.openingTime, availability.closingTime, availability.price);
    });
}

//action chọn availability
newFieldContainer.querySelector("#new_field\\.button_add_availabilities").addEventListener("click", () => {
    let openingTimeElementValue = newFieldContainer.querySelector("#new_field\\.availability\\.openingTime").value;
    let closingTimeElementValue = newFieldContainer.querySelector("#new_field\\.availability\\.closingTime").value;
    let priceElementValue = newFieldContainer.querySelector("#new_field\\.availability\\.price").value;

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

    if (newAvailabilities.length > 0) {
        for (const availability of newAvailabilities) {
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
        newAvailabilities.push({
            index: newAvailabilities.length,
            openingTime: openingTime,
            closingTime: closingTime,
            price: priceElementValue,
        });
        loadNewFieldAvailability();
    }
});

// thêm elementt
function appendNewAvailabilityElement(index, startTime, endTime, price) {
    let element = document.createElement("div");
    element.className = "flex justify-between text-center items-center pb-1 px-1";
    element.innerHTML = `
        <span class="w-3">${index + 1}</span>
        <span class="flex-1">${formatHour(startTime)}</span>
        <span class="flex-1">${formatHour(endTime)}</span>
        <span class="flex-1">${price}</span>
        <i class="fa-solid fa-xmark w-3 cursor-pointer"></i>
    `;
    newAvailabilitiesElement.appendChild(element);

    //hàm xóa 1 field availability
    element.querySelector("i").addEventListener("click", async () => {
        newAvailabilities = newAvailabilities.filter((item) => item.index !== index);

        newAvailabilities = newAvailabilities.map((item, newIndex) => ({
            index: newIndex,
            openingTime: item.openingTime,
            closingTime: item.closingTime,
            price: item.price,
        }));

        loadNewFieldAvailability();
    });
}

//xóa tất cả field availabilities

newFieldContainer.querySelector("#new_field\\.button_remove_all_availabilities").addEventListener("click", () => {
    newAvailabilitiesElement.innerHTML = ``;
    newAvailabilities = [];
});

// đóng modal

newFieldContainer.querySelector("#new_field\\.closeModal").addEventListener("click", () => {
    newFieldContainer.classList.add("hidden");
});

// action thêm

document.getElementById("new_field.create_field").addEventListener("click", async () => {
    let name = newFieldContainer.querySelector("#new_field\\.name").value;
    let location = newFieldContainer.querySelector("#new_field\\.location").value;
    let opacity = newFieldContainer.querySelector("#new_field\\.opacity").value;
    let category = newFieldContainer.querySelector("#new_field\\.category").value;

    const minOpeningTime = Math.min(...newAvailabilities.map((a) => a.openingTime));

    const maxClosingTime = Math.max(...newAvailabilities.map((a) => a.closingTime));

    let user = JSON.parse(localStorage.getItem("current-user"));

    let newSportsField = null;

    if (checkImages(newImages)) {
        if (confirm("Bạn có chắc chắn tạo sân này không")) {
            try {
                const response = await fetch(`${SERVER_DOMAIN}/sports-field`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + getAccessTokenFromCookie(),
                    },
                    body: JSON.stringify({
                        name: name,
                        location: location,
                        opacity: opacity,
                        closingTime: maxClosingTime,
                        openingTime: minOpeningTime,
                        categoryId: category,
                        rating: 0,
                        userId: user.id,
                        isConfirmed: true,
                    }),
                });
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error("Failed to create sports field:", response.status, errorText);
                } else {
                    newSportsField = await response.json();
                    newImages.forEach(async (image) => {
                        await uploadPicture(image, newSportsField.id);
                    });
                    newAvailabilities.forEach((availability) => {
                        createFieldAvailability(availability, newSportsField.id);
                    });
                    alert("Create sports field successfully");
                    document.location.reload(true);
                }
            } catch (error) {
                console.error("Error create sports field:", error);
            }
        }
    } else {
        alert("Vui lòng chọn đủ 3 ảnh");
    }
});

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

function checkImages(images) {
    console.log(images.length);

    if (images.length < 3) return false;

    for (const image of images) {
        if (image === null) {
            console.log("Có hình ảnh null");
            return false;
        }
    }
    return true;
}
