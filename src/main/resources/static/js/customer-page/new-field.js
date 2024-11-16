let newImages = [];
let newAvailabilities = [];

let newFieldContainer = document.getElementById("new_field.container");

function appendSelectImage() {
    let button_select_image = document.getElementsByClassName("new_field.select_image");

    Array.from(button_select_image).forEach((element, index) => {
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
});

// Hàm xử lý tải lên file
function handleFileUpload(file, element, index) {
    if (file) {
        const allowedTypes = ["image/png", "image/jpg", "image/jpeg"];
        if (allowedTypes.includes(file.type)) {
            const reader = new FileReader();
            reader.onload = function (e) {
                const img = document.createElement("img");
                img.classList = "new_field.image w-48";
                img.src = e.target.result;

                newImages[index] = e.target.result;

                let form = element.parentElement.parentElement;
                form.replaceWith(img); // Thay thế form bằng ảnh
            };
            reader.readAsDataURL(file);
        } else {
            alert("Only PNG, JPG, and JPEG files are allowed.");
        }
    }
}
// Xử lý khi nhấn nút "Xóa ảnh"
document.getElementById("new_field.clear_image").addEventListener("click", () => {
    let imageElements = Array.from(document.getElementsByClassName("new_field.image"));

    imageElements.forEach((element) => {
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
    });

    appendSelectImage();
    newImages = [];
});

// thêm các thuộc tính trong category select

async function loadCategory() {
    try {
        const data = await fetch(`${SERVER_DOMAIN}/category`);
        const categories = await data.json();
        appendCategory(categories);
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

//action chọn availability

newFieldContainer.querySelector("#new_field\\.button_add_time").addEventListener("click", () => {
    let openingTime = newFieldContainer.querySelector("#new_field\\.availability\\.openingTime").value;
    let closingTime = newFieldContainer.querySelector("#new_field\\.availability\\.closingTime").value;
    if (openingTime == "" || closingTime == "") {
        console.log("Vui lòng nhập giờ");
        return
    } else {
        newAvailabilities.forEach((availability) => {
            if(availability.openingTime.getTime() == formatHourToDate(openingTime).getTime()){
                console.log("giờ mở cửa không thể trùng");
                return 0;
            }
        });        
        newAvailabilities.push({
            openingTime: formatHourToDate(openingTime),
            closingTime: formatHourToDate(closingTime),
        });
    }
    console.log(newAvailabilities);
});

//Thêm giờ mới

function appendAvailability() {
    let availabilityTimeContainer = newFieldContainer.querySelector('#new_field\\.availability\\.container')
    let element = document.createElement
}

// action thêm
document.getElementById("new_field.create_field").addEventListener("click", () => {
    let name = newFieldContainer.querySelector("#new_field\\.name").value;
    let location = newFieldContainer.querySelector("#new_field\\.location").value;
    let category = newFieldContainer.querySelector("#new_field\\.category").value;

    let data = [name, location, category, newImages];
});


