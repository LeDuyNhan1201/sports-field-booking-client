let offset = 0;
const limit = 12;

async function loadSportFieldGrid() {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/sports-field?offset=${offset}&limit=${limit}`);
        const data = await response.json();
        await appendField(data.items);
    } catch (error) {
        console.error("Error fetching sport field:", error);
    }
}

async function appendField(data) {
    let sportFieldList = document.getElementById("sport-field-list");

    data.forEach(field => {
        const fieldElement = document.createElement('div');
        fieldElement.innerHTML = `
                <img src="https://placehold.co/400x200" alt="Sport field image" class="w-400 h-300 object-cover" />
                <div class="p-4">
                    <h4 class="font-bold text-xl">Manchester City Academy</h4>
                    <p class="text-gray-600">24.000/đ</p>
                    <p class="text-gray-500">Best fields in the world</p>
                    <div class="mt-2 flex space-x-2">
                        <span>⭐ 4.2/5</span>
                    </div>
                </div>
                <a
                href="/sports-field-booking/sports-field/${field.id}/details"
                class='bg-white shadow-lg rounded-lg overflow-hidden block cursor-pointer'
                xmlns:th="http://www.w3.org/1999/xhtml"
                >Detail</a>
            `;            
        sportFieldList.appendChild(fieldElement);
    });
}
loadSportFieldGrid();
