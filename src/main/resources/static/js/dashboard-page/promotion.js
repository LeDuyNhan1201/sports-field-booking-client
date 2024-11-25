document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const itemsPerPage = 2;
    let totalItems = 0;
    let isSearch = false;

    loadPromotions(currentPage - 1, itemsPerPage);

    const promotionModal = document.getElementById('promotionModal');
    const promotionOverlay = document.getElementById('promotionOverlay');
    const closePromotionModalBtn = document.getElementById('closePromotionModalBtn');
    const savePromotionButton = document.getElementById('savePromotionButton');
    const promotionForm = document.getElementById('promotionForm');
    const promotionModalTitle = document.getElementById('promotionModalTitle');

    let isEditing = false;
    let currentPromotionId = null;

    document.getElementById('add-promotion-button').addEventListener('click', () => {
        isEditing = false;
        currentPromotionId = null;
        promotionModalTitle.textContent = 'Add Promotion';
        promotionForm.reset();
        promotionModal.classList.remove('hidden');
    });

    closePromotionModalBtn.addEventListener('click', () => {
        promotionModal.classList.add('hidden');
    });

    promotionOverlay.addEventListener('click', () => {
        promotionModal.classList.add('hidden');
    });

    savePromotionButton.addEventListener('click', async () => {
        const promotionData = {
            name: document.getElementById('promotionName').value,
            description: document.getElementById('promotionDescription').value,
            discountPercentage: document.getElementById('discountPercentage').value,
            startDate: document.getElementById('startDate').value,
            endDate: document.getElementById('endDate').value,
            status: document.getElementById('promotionStatus').value,
            isConfirmed: true
        };

        const method = isEditing ? 'PUT' : 'POST';
        await fetchData('promotions', method, currentPromotionId, promotionData);
        promotionModal.classList.add('hidden');
        loadPromotions(currentPage - 1, itemsPerPage);
    });

    async function loadPromotions(OFFSET = 0, LIMIT = 10000) {
        try {
            const promotions = await fetchData('promotions', 'GET', null, null, OFFSET, LIMIT);
            const allPromotions = await fetchData('promotions');

            if (!Array.isArray(promotions)) {
                console.error('Invalid promotions data format');
                return;
            }

            totalItems = allPromotions.length;
            updatePagination();
            renderPromotions(promotions);
        } catch (error) {
            console.error('Error loading promotions:', error);
        }
    }

    function renderPromotions(promotions) {
        const promotionsTableBody = document.querySelector('tbody');
        const promotionQuantity = document.getElementById('promotion-quantity');
        promotionQuantity.textContent = totalItems;
        promotionsTableBody.innerHTML = '';
        promotions.forEach(promotion => {
            const row = document.createElement('tr');
            row.className = 'border-b';

            row.innerHTML = `
                <td class="p-4">${promotion.id}</td>
                <td class="p-4">${promotion.name}</td>
                <td class="p-4">${promotion.description}</td>
                <td class="p-4">${promotion.discountPercentage}%</td>
                <td class="p-4">${promotion.startDate}</td>
                <td class="p-4">${promotion.endDate}</td>
                <td class="p-4">
                    <span class="${promotion.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-200 text-red-600'} py-1 px-3 rounded-full text-xs">
                        ${promotion.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                </td>
                <td class="p-4">
                    <button class="edit-button text-blue-500 hover:text-blue-700">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="text-red-500 hover:text-red-700">
                        <i class="fas fa-trash-alt"></i>
                    </button>
                </td>
            `;

            promotionsTableBody.appendChild(row);

            row.querySelector('.edit-button').addEventListener('click', () => {
                isEditing = true;
                currentPromotionId = promotion.id;
                promotionModalTitle.textContent = 'Edit Promotion';
                document.getElementById('promotionName').value = promotion.name;
                document.getElementById('promotionDescription').value = promotion.description;
                document.getElementById('discountPercentage').value = promotion.discountPercentage;
                document.getElementById('startDate').value = promotion.startDate;
                document.getElementById('endDate').value = promotion.endDate;
                document.getElementById('promotionStatus').value = promotion.status;
                promotionModal.classList.remove('hidden');
            });

            row.querySelector('.text-red-500').addEventListener('click', async () => {
                await fetchData('promotions', 'DELETE', promotion.id);
                loadPromotions(currentPage - 1, itemsPerPage);
            });
        });
    }

    function updatePagination() {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const paginationContainer = document.querySelector('.inline-flex');
        const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        document.getElementById('show-item-of-page-promotion').textContent = `Showing ${startItem} to ${endItem} of ${totalItems}`;

        paginationContainer.innerHTML = '';

        if (currentPage > 1) {
            const prevButton = createPaginationButton('Previous', () => {
                currentPage--;
                if (isSearch) {
                    searchPromotions(currentPage);
                } else {
                    loadPromotions(currentPage - 1, itemsPerPage);
                }
            });
            paginationContainer.appendChild(prevButton);
        }

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = createPaginationButton(i, () => {
                currentPage = i;
                if (isSearch) {
                    searchPromotions(currentPage);
                } else {
                    loadPromotions(currentPage - 1, itemsPerPage);
                }
            });
            if (i === currentPage) {
                pageButton.classList.add('bg-blue-600', 'text-white');
            }
            paginationContainer.appendChild(pageButton);
        }

        if (currentPage < totalPages) {
            const nextButton = createPaginationButton('Next', () => {
                currentPage++;
                if (isSearch) {
                    searchPromotions(currentPage);
                } else {
                    loadPromotions(currentPage - 1, itemsPerPage);
                }
            });
            paginationContainer.appendChild(nextButton);
        }
    }

    function createPaginationButton(text, onClick) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = 'px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-200';
        button.addEventListener('click', onClick);
        return button;
    }

    document.getElementById('search-btn').addEventListener('click', () => {
        isSearch = true;
        searchPromotions();
    });

    document.getElementById('search').addEventListener('input', () => {
        const keyword = document.getElementById('search').value;
        if (keyword.trim() === '') {
            isSearch = false;
            loadPromotions(currentPage - 1, itemsPerPage);
        } else {
            isSearch = true;
            searchPromotions();
        }
    });

    async function searchPromotions(page = 1) {
        const keyword = document.getElementById('search').value || '';
        const status = document.getElementById('status').value || '';
        const startDate = document.getElementById('startDate').value || '';
        const endDate = document.getElementById('endDate').value || '';

        const queryParamSearchCurrentPage = new URLSearchParams({
            keyword,
            status,
            startDate,
            endDate,
            offset: currentPage - 1,
            limit: itemsPerPage
        });

        const queryParams = new URLSearchParams({
            keyword,
            status,
            startDate,
            endDate
        });
        try {

            const response = await fetch(`${SERVER_DOMAIN}/promotions/search?${queryParamSearchCurrentPage}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const allPromotionSearch = await fetch(`${SERVER_DOMAIN}/promotions/search?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            if (response.ok) {
                const data = await response.json();
                const allPromotionSearchJson = await allPromotionSearch.json();
                totalItems = allPromotionSearchJson.items.length;
                console.log(totalItems);
                renderPromotions(data.items);
                updatePagination();
            } else {
                console.error('Failed to search promotions:', response.status);
            }
        } catch (error) {
            console.error('Error during search:', error.message || error);
        }
    }
});