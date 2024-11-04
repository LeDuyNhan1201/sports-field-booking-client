let currentOffset = 0;
const limit = 12;
let currentTab = "grid";
let searchValue = ' ';
let colSort = document.getElementById('sportsField.select_colSort').value;
let sortDirection = -1

let page = document.getElementById("sportsField.page");
let sportFieldList = document.getElementById("sportsField.list");
let sportFieldGrid = document.getElementById("sportsField.grid");

async function loadSportFieldList(type, currentOffset, searchValue) {
    try {
        let response;
        if(searchValue === '') {
            response = await fetch(`${SERVER_DOMAIN}/sports-field?colSort=${colSort}&sortDirection=${sortDirection}&offset=${currentOffset}&limit=${limit}`);
        }else{
            response = await fetch(`${SERVER_DOMAIN}/sports-field/search/${searchValue}?colSort=${colSort}&sortDirection=${sortDirection}&offset=${currentOffset}&limit=${limit}`);
        }
        const data = await response.json();
        if(data.items.length){
            if (type == "grid") await appendFieldGrid(data.items);
            else await appendFieldList(data.items);
            loadPage(currentOffset);
        }

        
    } catch (error) {
        console.error("Error fetching sport field:", error);
    }
}

async function appendFieldGrid(data) {
    sportFieldList.className = "hidden w-full text-left border-collapse";
    sportFieldGrid.style.display = "grid";

    sportFieldGrid.innerHTML = "";
    data.forEach((field) => {
        const fieldElement = document.createElement("div");
        fieldElement.innerHTML = `
            <a
                href="/sports-field-booking/sports-field/${field.id}/details"
                class='bg-white shadow-lg rounded-lg overflow-hidden block cursor-pointer'
                xmlns:th="http://www.w3.org/1999/xhtml"
            >
                <img src="${field.images[0]}" alt="Sport field image" class="w-full h-[260px]" />
                <div class="p-4">
                    <h4 class="font-bold text-xl">${field.name}</h4>
                    <p class="text-red-600">24.000/đ</p>
                    <textarea class="text-gray-500 w-full resize-none overflow-hidden" rows='1' readonly >${field.location}</textarea>
                    <div class="mt-2 flex space-x-2">
                        <span>⭐ ${field.rating}/5</span>
                    </div>
                </div>
            </a>
            `;
        sportFieldGrid.appendChild(fieldElement);
    });
}
async function appendFieldList(data) {
    try {
        sportFieldGrid.style.display = "none";
        sportFieldList.className = "w-full text-left border-collapse";

        let sportFieldTable = sportFieldList.querySelector("tbody");
        sportFieldTable.innerHTML = ''
        data.forEach((field, index) => {
            const fieldElement = document.createElement("tr");
            fieldElement.className = "border-b";
            fieldElement.innerHTML = `
                    <td class="p-4">${index +1 + currentOffset*12}</td>
                    <td class="p-4">${field.name}</td>
                    <td class="p-4">
                        <img src="${field.images[0]}" alt="Stadium Image" class='h-10 w-10' />
                    </td>
                    <td class="p-4">${field.location}</td>
                    <td class="p-4">${field.category}</td>
                    <td class="p-4">5000</td>
                    <td class="p-4">${field.owner.firstName + ' ' + field.owner.lastName}</td>
                    <td class="p-4">08:00 AM</td>
                    <td class="p-4">10:00 PM</td>
                    <td class="p-4">
                        <span class="bg-green-100 text-green-600 py-1 px-3 rounded-full text-xs"
                            th:text="#{dashboard.sportfield_status.active}">${field.status}</span>
                    </td>
                    <td class="p-4">
                        <a  href="/sports-field-booking/sports-field/${field.id}/details">
                            <i class="fa-solid fa-share-from-square text-green-500"></i>
                        </a>
                    </td>
            `;
            sportFieldTable.appendChild(fieldElement);
        });
    } catch (error) {
        console.error("Error fetching sport field:", error);
    }
}
loadSportFieldList(currentTab, 0, searchValue);

document.getElementById("sportsField.button-tab-grid").addEventListener("click", () => {
    currentTab = "grid";
    loadSportFieldList(currentTab, currentOffset, searchValue);
});
document.getElementById("sportsField.button-tab-list").addEventListener("click", () => {
    currentTab = "list";
    loadSportFieldList(currentTab, currentOffset, searchValue);
});

//change page

async function loadPage(offset) {
    page.textContent = offset + 1;
}

//action next page
document.getElementById("sportsField.nextPage").addEventListener("click", () => {
    currentOffset += 1;
    loadSportFieldList(currentTab, currentOffset, searchValue);
});
document.getElementById("sportsField.backPage").addEventListener("click", () => {    
    currentOffset -= 1;
    loadSportFieldList(currentTab, currentOffset, searchValue);
});


//search
document.getElementById('sportsField.button_search').addEventListener('click', function(e) {
    actionSearch()
})

document.getElementById("sportsField.search_value").addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        actionSearch()
    }
});

async function actionSearch() {    
    searchValue = document.getElementById('sportsField.search_value').value;
    loadSportFieldList(currentTab, 0, searchValue);
}

//select column sort
document.getElementById('sportsField.select_colSort').addEventListener('change', function(e){
    colSort = this.value;
    actionSearch()
})

//select sort direction

document.getElementById("sportsField.button_sortDirection").addEventListener("click", function(e) {
    if (e.target.classList.contains("rotate-180")) {
        e.target.classList.remove("rotate-180");
        e.target.style.transform = "rotate(0deg)";
    } else {
        e.target.classList.add("rotate-180");
        e.target.style.transform = "rotate(180deg)";
    }
    sortDirection = sortDirection * -1;
    actionSearch()
});

// sport field quantityAll
async function sportsFieldQuantityAll() {
    try {

        response = await fetch(`${SERVER_DOMAIN}/sports-field?colSort=name&sortDirection=1&offset=0&limit=100`);
        const data = await response.json();
        
        document.getElementById('sportsField.quantity.value').textContent = data.items.length

    } catch (error) {
        console.error("Error fetching sport field:", error);
    }
}
sportsFieldQuantityAll()