document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const itemsPerPage = 2;
    let totalItems = 0;
    let isSearch = false;

    loadCategories(currentPage - 1, itemsPerPage);

    const categoryModal = document.getElementById('categoryModal');
    const categoryOverlay = document.getElementById('categoryOverlay');
    const closeCategoryModalBtn = document.getElementById('closeCategoryModalBtn');
    const saveCategoryButton = document.getElementById('saveCategoryButton');
    const categoryForm = document.getElementById('categoryForm');
    const categoryModalTitle = document.getElementById('categoryModalTitle');

    let isEditing = false;
    let currentCategoryId = null;

    document.getElementById('add-category-button').addEventListener('click', () => {
        isEditing = false;
        currentCategoryId = null;
        categoryModalTitle.textContent = 'Add Category';
        categoryForm.reset();
        categoryModal.classList.remove('hidden');
    });

    closeCategoryModalBtn.addEventListener('click', () => {
        categoryModal.classList.add('hidden');
    });

    categoryOverlay.addEventListener('click', () => {
        categoryModal.classList.add('hidden');
    });

    saveCategoryButton.addEventListener('click', async () => {
        const categoryData = {
            name: document.getElementById('categoryName').value,
        };

        const method = isEditing ? 'PUT' : 'POST';
        await fetchData('category', method, currentCategoryId, categoryData);
        categoryModal.classList.add('hidden');
        loadCategories(currentPage - 1, itemsPerPage);
    });

    async function loadCategories(OFFSET = 0, LIMIT = 10000) {
        try {
            const categories = await fetchData('category', 'GET', null, null, OFFSET, LIMIT);
            const allCategories = await fetchData('category');

            if (!Array.isArray(categories)) {
                console.error('Invalid categories data format');
                return;
            }

            totalItems = allCategories.length;
            updatePagination();
            renderCategories(categories);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }

    function renderCategories(categories) {
        const categoriesTableBody = document.querySelector('tbody');
        const categoryQuantity = document.getElementById('category-quantity');
        categoryQuantity.textContent = totalItems;
        categoriesTableBody.innerHTML = '';
        categories.forEach(category => {
            const row = document.createElement('tr');
            row.className = 'border-b';

            row.innerHTML = `
            <td class="p-4">${category.id}</td>
            <td class="p-4">${category.name}</td>
            <td class="p-4">
                <button class="edit-button text-blue-500 hover:text-blue-700">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="text-red-500 hover:text-red-700">
                    <i class="fas fa-trash-alt"></i>
                </button>
            </td>
        `;

            categoriesTableBody.appendChild(row);

            row.querySelector('.edit-button').addEventListener('click', () => {
                isEditing = true;
                currentCategoryId = category.id;
                console.log(category.id);
                categoryModalTitle.textContent = 'Edit Category';
                document.getElementById('categoryName').value = category.name;
                categoryModal.classList.remove('hidden');
            });

            row.querySelector('.text-red-500').addEventListener('click', async () => {
                await fetchData('category', 'DELETE', category.id);
                loadCategories(currentPage - 1, itemsPerPage);
            });
        });
    }

    function updatePagination() {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const paginationContainer = document.querySelector('.inline-flex');
        const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);

        document.getElementById('show-item-of-page-category').textContent = `Showing ${startItem} to ${endItem} of ${totalItems}`;

        paginationContainer.innerHTML = '';

        if (totalPages <= 1) {
            return;
        }

        if (currentPage < 1) {
            currentPage = 1;
            loadCategories(currentPage - 1, itemsPerPage);
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
            loadCategories(currentPage - 1, itemsPerPage);
        }

        if (currentPage > 1) {
            const prevButton = createPaginationButton('Previous', () => {
                currentPage--;
                if (isSearch) {
                    searchCategories();
                } else {
                    loadCategories(currentPage - 1, itemsPerPage);
                }
            });
            paginationContainer.appendChild(prevButton);
        }

        for (let i = 1; i <= totalPages; i++) {
            const pageButton = createPaginationButton(i, () => {
                currentPage = i;
                if (isSearch) {
                    searchCategories();
                } else {
                    loadCategories(currentPage - 1, itemsPerPage);
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
                    searchCategories();
                } else {
                    loadCategories(currentPage - 1, itemsPerPage);
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

    // document.getElementById('search-btn').addEventListener('click', () => {
    //     isSearch = true;
    //     currentPage = 1;
    //     searchCategories();
    // });

    document.getElementById('search').addEventListener('input', () => {
        const keyword = document.getElementById('search').value;
        if (keyword.trim() === '') {
            isSearch = false;
            loadCategories(currentPage - 1, itemsPerPage);
        } else {
            isSearch = true;
            currentPage = 1;
            searchCategories();
        }
    });

    async function searchCategories() {
        const keyword = document.getElementById('search').value || '';

        const queryParamSearchCurrentPage = new URLSearchParams({
            keyword,
            offset: currentPage - 1,
            limit: itemsPerPage
        });

        const queryParams = new URLSearchParams({
            keyword,
        });
        try {

            const response = await fetch(`${SERVER_DOMAIN}/category/search?${queryParamSearchCurrentPage}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAccessTokenFromCookie()}`
                }
            });

            const allCategorySearch = await fetch(`${SERVER_DOMAIN}/category/search?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${getAccessTokenFromCookie()}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                const allCategorySearchJson = await allCategorySearch.json();
                totalItems = allCategorySearchJson.items.length;
                renderCategories(data.items);
                updatePagination();
            } else {
                console.error('Failed to search categories:', response.status);
            }
        } catch (error) {
            console.error('Error during search:', error.message || error);
        }
    }
});