document.addEventListener('DOMContentLoaded', () => {
    loadPromotions();

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
            await updatePromotion(currentPromotionId, promotionData);
        } else {
            await addPromotion(promotionData);
        }

        promotionModal.classList.add('hidden');
        loadPromotions();
    });

    async function loadPromotions() {
        const promotions = await fetchData('promotions', 0, 5);
        const allPromotions = await fetchData('promotions');

        if (!Array.isArray(promotions)) {
            console.error('Promotions data is not an array');
            return;
        }

        const promotionsTableBody = document.querySelector('tbody');
        const promotionQuantity = document.getElementById('promotion-quantity');
        promotionQuantity.textContent = allPromotions.length;
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
                await deletePromotion(promotion.id);
                loadPromotions();
            });
        });
    }

    async function addPromotion(promotionData) {
        try {
            const response = await fetch(`${SERVER_DOMAIN}/promotions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${getAccessTokenFromCookie()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(promotionData)
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error adding promotion:', error);
        }
    }

    async function updatePromotion(id, promotionData) {
        try {
            const response = await fetch(`${SERVER_DOMAIN}/promotions/${id}`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${getAccessTokenFromCookie()}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(promotionData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Failed to update promotion:', errorData);
                return;
            }

            console.log('Promotion updated successfully');
        } catch (error) {
            console.error('Error updating promotion:', error);
        }
    }




    async function deletePromotion(id) {
        try {
            const response = await fetch(`${SERVER_DOMAIN}/promotions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${getAccessTokenFromCookie()}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
        } catch (error) {
            console.error('Error deleting promotion:', error);
        }
    }
});