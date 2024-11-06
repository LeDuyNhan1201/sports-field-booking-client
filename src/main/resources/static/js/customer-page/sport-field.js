let currentOffset = 0;
const limit = 12;
let currentTab = "grid";

let page = document.getElementById("sportsField.page");
let sportFieldList = document.getElementById("sportsField.list");
let sportFieldGrid = document.getElementById("sportsField.grid");

async function loadSportFieldList(type, offset) {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/sports-field?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        if(data.items.length){
            if (type === "grid") await appendFieldGrid(data.items);
            else await appendFieldList(data.items);
            currentOffset = offset
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
        data.forEach((field) => {
            const fieldElement = document.createElement("tr");
            fieldElement.className = "border-b";
            fieldElement.innerHTML = `
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
loadSportFieldList(currentTab, 0);

document.getElementById("sportsField.button-tab-grid").addEventListener("click", () => {
    currentTab = "grid";
    loadSportFieldList(currentTab, currentOffset);
});
document.getElementById("sportsField.button-tab-list").addEventListener("click", () => {
    currentTab = "list";
    loadSportFieldList(currentTab, currentOffset);
});

//change page

async function loadPage(offset) {
    page.textContent = offset + 1;
}

document.getElementById("sportsField.nextPage").addEventListener("click", () => {
    loadSportFieldList(currentTab, currentOffset + 1);
});
document.getElementById("sportsField.backPage").addEventListener("click", () => {    
    loadSportFieldList(currentTab, currentOffset -1);
});
