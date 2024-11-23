document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const itemsPerPage = 4;
    let totalItems = 0;

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

        if (isEditing) {
            await fetchData('promotions', 'PUT', currentPromotionId, promotionData);
        } else {
            await fetchData('promotions', 'POST', null, promotionData);
        }

        promotionModal.classList.add('hidden');
        loadPromotions(currentPage - 1, itemsPerPage);
    });

    async function loadPromotions(OFFSET = 0, LIMIT = 10000) {
        const promotions = await fetchData('promotions', 'GET', null, null, OFFSET, LIMIT);
        const allPromotions = await fetchData('promotions');

        if (!Array.isArray(promotions)) {
            console.error('Promotions data is not an array');
            return;
        }

        totalItems = allPromotions.length;
        updatePagination();

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
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);
        document.getElementById('show-item-of-page-promotion').textContent = `Showing ${startItem} to ${endItem} of ${totalItems}`;

        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const paginationContainer = document.querySelector('.inline-flex');
        paginationContainer.innerHTML = '';

        if (currentPage > 1) {
            const prevButton = document.createElement('button');
            prevButton.id = 'previous-page-button-promotion';
            prevButton.className = 'px-3 py-2 mr-1 text-gray-700 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50';
            prevButton.textContent = 'Previous';
            prevButton.addEventListener('click', () => {
                if (currentPage > 1) {
                    currentPage--;
                    loadPromotions(currentPage - 1, itemsPerPage);
                }
            });
            paginationContainer.appendChild(prevButton);
        }

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = document.createElement('button');
            pageButton.className = 'px-3 py-2 mr-1 text-gray-700 bg-white border-t border-b border-gray-300 hover:bg-gray-50';
            pageButton.textContent = i;
            if (i === currentPage) {
                pageButton.className += ' bg-blue-600';
                pageButton.classList.add('text-white');
            }
            pageButton.addEventListener('click', () => {
                currentPage = i;
                loadPromotions(currentPage - 1, itemsPerPage);
            });
            paginationContainer.appendChild(pageButton);
        }

        if (currentPage < totalPages) {
            const nextButton = document.createElement('button');
            nextButton.id = 'next-page-button-promotion';
            nextButton.className = 'px-3 py-2 text-gray-700 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50';
            nextButton.textContent = 'Next';
            nextButton.addEventListener('click', () => {
                if (currentPage * itemsPerPage < totalItems) {
                    currentPage++;
                    loadPromotions(currentPage - 1, itemsPerPage);
                }
            });
            paginationContainer.appendChild(nextButton);
        }
    }
});