let currentOffset = 0;
const limit = 12;
//nếu có cách lấy attribute hay nào đó hay hơn lấy path này ok
let currentTab = "list";
let searchValue = " ";
let sortDirection = -1;
let minPrice = 1;
let maxPrice = 10000;

let sportsFieldContainer = document.getElementById("sportsField.container");

let colSort = document.getElementById("sportsField.select_colSort").value;
let currentCategory = sportsFieldContainer.querySelector("#sportsField\\.select_category").value;

let sportFieldList = document.getElementById("sportsField.list");
let sportFieldGrid = document.getElementById("sportsField.grid");

let buttonNewField = sportsFieldContainer.querySelector("#sportsField\\.button_new_sportField");

async function loadSportFieldList(tab, offset, searchValue) {
    try {
        let response;

        // xử lý do quản lý sân
        let user = JSON.parse(localStorage.getItem("current-user"));
        if (user.roles[0] === "FIELD_OWNER") {
            if (!searchValue) searchValue = " ";
            response = await fetch(
                `${SERVER_DOMAIN}/sports-field/search?userId=${user.id}&text=${searchValue}&colSort=${colSort}&sortDirection=${sortDirection}&offset=${offset}&limit=${limit}&maxPrice=${maxPrice}&minPrice=${minPrice}&categoryId=${currentCategory}&onlyActiveStatus=0`
            );

            // xử lý khi user không có quyền
        } else {
            // xử lý cho danh sách sân
            if (!searchValue) searchValue = " ";
            response = await fetch(
                `${SERVER_DOMAIN}/sports-field/search?userId=0&text=${searchValue}&colSort=${colSort}&sortDirection=${sortDirection}&offset=${offset}&limit=${limit}&maxPrice=${maxPrice}&minPrice=${minPrice}&categoryId=${currentCategory}&onlyActiveStatus=0`
            );
        }
        const data = await response.json();

        if (data.items.length > 0) {
            currentOffset = offset;
            changeCurrentPageColor(currentOffset);

            if (tab === "grid") await appendFieldGrid(data.items);
            else await appendFieldList(data.items);
        }
    } catch (error) {
        console.error("Error fetching sport field:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    loadSportFieldList(currentTab, 0, searchValue);
    loadCategory();
    sportsFieldQuantityAll();
});

async function appendFieldGrid(data) {
    sportFieldList.className = "hidden w-full text-left border-collapse";
    sportFieldGrid.style.display = "grid";

    sportFieldGrid.innerHTML = "";
    data.forEach((field) => {
        const fieldElement = document.createElement("div");
        fieldElement.innerHTML = `
            <div
                class='bg-white shadow-lg rounded-lg overflow-hidden block cursor-pointer'
            >
                <img src="${field.images[0]}" alt="Sport field image" class="w-20 h-20 rounded-full" />
                <div class="p-4">
                    <h4 class="font-bold text-xl">${field.name}</h4>
                    <p class="text-red-600">${Math.min(...field.fieldAvailabilities.map((a) => a.price))}$ - ${Math.max(...field.fieldAvailabilities.map((a) => a.price))}$</p>
                    <textarea class="text-gray-500 w-full resize-none overflow-hidden" rows='1' readonly >${field.location}</textarea>
                    <div class="mt-2 flex space-x-2">
                        <span>⭐ ${field.rating}/5</span>
                    </div>
                </div>
            </div>
            `;
        fieldElement.addEventListener("click", () => {
            editField(field.id);
        });
        sportFieldGrid.appendChild(fieldElement);
    });
}
async function appendFieldList(data) {
    try {
        sportFieldGrid.style.display = "none";
        sportFieldList.className = "w-full text-left border-collapse";

        let sportFieldTable = sportFieldList.querySelector("tbody");
        sportFieldTable.innerHTML = "";
        data.forEach((field, index) => {
            const fieldElement = document.createElement("tr");
            fieldElement.className = "border-b";
            fieldElement.innerHTML = `
                    <td class="p-4">${index + 1 + currentOffset * 12}</td>
                    <td class="p-4">${field.name}</td>
                    <td class="p-4">
                        <img src="${field.images[0]}" alt="Stadium Image" class='w-20 h-20 rounded-full' />
                    </td>
                    <td class="p-4">${field.location}</td>
                    <td class="p-4">${field.category}</td>
                    <td class="p-4">${field.owner.firstName + " " + field.owner.lastName}</td>
                    <td class="p-4">${formatHour(field.openingTime)}</td>
                    <td class="p-4">${formatHour(field.closingTime)}</td>
                    <td class="p-4 w-44 text-red-500">${
                        Math.min(...field.fieldAvailabilities.map((a) => a.price)) == Math.max(...field.fieldAvailabilities.map((a) => a.price))
                            ? Math.max(...field.fieldAvailabilities.map((a) => a.price)) + "$"
                            : Math.min(...field.fieldAvailabilities.map((a) => a.price)) + "$ - " + Math.max(...field.fieldAvailabilities.map((a) => a.price))+"$"
                    }</td>
                    <td class="p-4">
                        <span class="bg-green-100 text-green-600 py-1 px-3 rounded-full text-xs"
                            th:text="#{dashboard.sportfield_status.active}">${field.status}</span>
                    </td>
                    <td class="p-4">
                        <i class="fa-solid fa-share-from-square text-green-500 cursor-pointer"></i>
                    </td>
            `;
            fieldElement.querySelector("i").addEventListener("click", () => {
                editField(field.id);
            });
            sportFieldTable.appendChild(fieldElement);
        });
    } catch (error) {
        console.error("Error fetching sport field:", error);
    }
}

//chang tab
document.getElementById("sportsField.button-tab-grid").addEventListener("click", () => {
    currentTab = "grid";
    loadSportFieldList(currentTab, currentOffset, searchValue);
});
document.getElementById("sportsField.button-tab-list").addEventListener("click", () => {
    currentTab = "list";
    loadSportFieldList(currentTab, currentOffset, searchValue);
});

//action next page
document.getElementById("sportsField.nextPage").addEventListener("click", () => {
    let newOffset = currentOffset + 1;
    loadSportFieldList(currentTab, newOffset, searchValue);
});
document.getElementById("sportsField.backPage").addEventListener("click", () => {
    let newOffset = currentOffset - 1;
    loadSportFieldList(currentTab, newOffset, searchValue);
});

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
    let selectContainer = sportsFieldContainer.querySelector("#sportsField\\.select_category");

    data.forEach((category) => {
        let option = document.createElement("option");
        option.value = category.id;
        option.text = category.name.charAt(0).toUpperCase() + category.name.slice(1).toLowerCase();
        if (currentCategory == category.id) option.selected = true;
        selectContainer.appendChild(option);
    });
    selectContainer.addEventListener("change", () => {
        actionSearch();
    });
}

// load max min price
async function appendPrice(sportsField) {
    let minPriceElement = sportsFieldContainer.querySelector("#sportsField\\.minPrice");
    let maxPriceElement = sportsFieldContainer.querySelector("#sportsField\\.maxPrice");
    let minPriceValueElement = sportsFieldContainer.querySelector("#sportsField\\.minPrice\\.value");
    let maxPriceValueElement = sportsFieldContainer.querySelector("#sportsField\\.maxPrice\\.value");

    let maxSportFieldPrice = Math.max(...sportsField.map((field) => field.fieldAvailabilities.map((avail) => avail.price)).flat());

    minPriceElement.max = maxSportFieldPrice;
    maxPriceElement.max = maxSportFieldPrice;

    minPriceElement.value = 1;
    maxPriceElement.value = maxSportFieldPrice;

    maxPriceValueElement.textContent = maxSportFieldPrice + "$";

    minPriceElement.addEventListener("input", (e) => {
        if (Number(e.target.value) > maxPriceElement.value) {
            minPriceElement.value = maxPriceElement.value;
        }
        minPriceValueElement.textContent = Number(minPriceElement.value).toFixed(0) + "$";
        minPrice = Number(minPriceElement.value).toFixed(0);
    });
    maxPriceElement.addEventListener("input", (e) => {
        if (Number(e.target.value) < minPriceElement.value) {
            maxPriceElement.value = minPriceElement.value;
        }
        maxPriceValueElement.textContent = Number(maxPriceElement.value).toFixed(0) + "$";
        maxPrice = Number(maxPriceElement.value).toFixed(0);
    });
}

//search
document.getElementById("sportsField.button_search").addEventListener("click", function (e) {
    actionSearch();
});

document.getElementById("sportsField.search_value").addEventListener("keydown", function (e) {
    if (e.key === "Enter") {
        actionSearch();
    }
});

async function actionSearch() {
    //xóa search Param
    const url = new URL(window.location.href);
    url.search = "";
    window.history.pushState({}, "", url.toString());

    searchValue = document.getElementById("sportsField.search_value").value;
    currentCategory = sportsFieldContainer.querySelector("#sportsField\\.select_category").value;
    currentOffset = 0;
    loadSportFieldList(currentTab, currentOffset, searchValue);
}

//select column sort
document.getElementById("sportsField.select_colSort").addEventListener("change", function (e) {
    colSort = this.value;
    actionSearch();
});

//select sort direction

document.getElementById("sportsField.button_sortDirection").addEventListener("click", function (e) {
    if (e.target.classList.contains("rotate-180")) {
        e.target.classList.remove("rotate-180");
        e.target.style.transform = "rotate(0deg)";
    } else {
        e.target.classList.add("rotate-180");
        e.target.style.transform = "rotate(180deg)";
    }
    sortDirection = sortDirection * -1;
    actionSearch();
});

// sport field quantityAll
async function sportsFieldQuantityAll() {
    try {
        let response;
        let userId = 0;
        let user = JSON.parse(localStorage.getItem("current-user"));
        if (user.roles[0] === "FIELD_OWNER") {
            userId = user.id;
            sportsFieldContainer.querySelector("#sportsField\\.button_new_sportField").classList.remove("hidden");
        }
        response = await fetch(
            `${SERVER_DOMAIN}/sports-field/search?userId=${userId}&text= &colSort=name&sortDirection=1&offset=0&limit=1000&maxPrice=1000&minPrice=1&categoryId=0&onlyActiveStatus=0`
        );
        const data = await response.json();
        document.getElementById("sportsField.quantity.value").textContent = data.items.length;

        await appendPrice(data.items);
        loadPage(data.items);
    } catch (error) {
        console.error("Error fetching sport field:", error);
    }
}

// mở modal thêm sân mới

buttonNewField.addEventListener("click", () => {
    sportsFieldContainer.querySelector("#new_field\\.container").classList.remove("hidden");
});
async function editField(id) {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set("id", id);
    window.history.pushState({}, "", currentUrl);

    sportsFieldContainer.querySelector("#edit_field\\.container").classList.remove("hidden");
    await loadEditValue(id);
}

function loadPage(data) {
    let pageComponent = sportsFieldContainer.querySelector("#sportsField\\.page");

    let pageNumber = 1;
    for (let i = 1; i < data.length; i += limit) {
        let element = document.createElement("span");
        element.className = "text-lg text-center cursor-pointer mx-2 sportsField.page";
        element.innerHTML = pageNumber;

        pageComponent.appendChild(element);
        let currentPage = pageNumber - 1;
        element.addEventListener("click", () => {
            loadSportFieldList(currentTab, currentPage, searchValue);
            changeCurrentPageColor(currentPage);
        });
        pageNumber += 1;
    }

    changeCurrentPageColor(0);
}

function changeCurrentPageColor(pageValue) {
    const pages = sportsFieldContainer.querySelectorAll(".sportsField\\.page");
    pages.forEach((page, index) => {
        if (index == pageValue) {
            page.className = "text-lg text-center cursor-pointer text-red-500 font-bold mx-2  sportsField.page";
        } else {
            page.className = "text-lg text-center cursor-pointer mx-2 sportsField.page";
        }
    });
}
