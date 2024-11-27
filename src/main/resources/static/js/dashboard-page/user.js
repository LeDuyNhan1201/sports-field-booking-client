document.addEventListener('DOMContentLoaded', () => {
    let currentPage = 1;
    const itemsPerPage = 10;
    let totalItems = 0;
    let isSearch = false;

    loadUsers(currentPage - 1, itemsPerPage);

    const userModal = document.getElementById('userModal');
    const overlay = document.getElementById('overlay');
    const closeUserModalBtn = document.getElementById('closeUserModalBtn');
    const saveUserButton = document.getElementById('saveUserBtn');
    const userForm = document.querySelector('form');
    const userModalTitle = document.querySelector('#userModal h2');

    let isEditing = false;
    let currentUserId = null;

    document.getElementById('addUserBtn').addEventListener('click', () => {
        isEditing = false;
        currentUserId = null;
        userModalTitle.textContent = 'Add User';
        userForm.reset();
        userModal.classList.remove('hidden');
    });

    closeUserModalBtn.addEventListener('click', () => {
        userModal.classList.add('hidden');
    });

    overlay.addEventListener('click', () => {
        userModal.classList.add('hidden');
    });

    saveUserButton.addEventListener('click', async () => {
        const userData = {
            firstName: document.getElementById('firstName').value,
            middleName: document.getElementById('middleName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            gender: document.getElementById('gender').value,
            birthdate: document.getElementById('birthdate').value,
            status: document.getElementById('status').value,
        };

        const method = isEditing ? 'PUT' : 'POST';
        await fetchData('users', method, currentUserId, userData);
        userModal.classList.add('hidden');
        loadUsers(currentPage - 1, itemsPerPage);
    });

    async function loadUsers(OFFSET = 0, LIMIT = 10000) {
        try {
            const users = await fetchData('users', 'GET', null, null, OFFSET, LIMIT);
            const allUsers = await fetchData('users');

            if (!Array.isArray(users)) {
                console.error('Invalid users data format');
                return;
            }

            totalItems = allUsers.length;
            updatePagination();
            renderUsers(users);
        } catch (error) {
            console.error('Error loading users:', error);
        }
    }

    function renderUsers(users) {
        const usersTableBody = document.querySelector('tbody');
        usersTableBody.innerHTML = '';
        users.forEach(async (user) => {
            const image = await loadImage(user.id);
            const row = document.createElement('tr');
            row.className = 'border-b';
            console.log(user);
            row.innerHTML = `
                <td class="p-4">${user.id}</td>
                <td class="p-4">
                    <img src="${image}" alt="User Image" />
                </td>
                <td class="p-4">${user.birthdate}</td>
                <td class="p-4">${user.email}</td>
                <td class="p-4">${user.firstName}</td>
                <td class="p-4">${user.middleName}</td>
                <td class="p-4">${user.lastName}</td>
                <td class="p-4">${user.gender}</td>
                <td class="p-4">${user.mobileNumber}</td>
                <td class="p-4">${user.username}</td>
                <td class="p-4">
                    <span class="${user.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-200 text-red-600'} py-1 px-3 rounded-full text-xs">
                        ${user.status === 'ACTIVE' ? 'ACTIVE' : 'BANNED'}
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
            usersTableBody.appendChild(row);
            row.querySelector('.edit-button').addEventListener('click', () => {
                isEditing = true;
                currentUserId = user.id;
                userModalTitle.textContent = 'Edit User';
                document.getElementById('userImagePreview').src = image;
                document.getElementById('firstName').value = user.firstName;
                document.getElementById('middleName').value = user.middleName;
                document.getElementById('lastName').value = user.lastName;
                document.getElementById('email').value = user.email;
                document.getElementById('phone').value = user.mobileNumber;
                document.getElementById('gender').value = user.gender;
                document.getElementById('birthdate').value = user.birthdate;
                document.getElementById('status').value = user.status;
                userModal.classList.remove('hidden');
            });
            row.querySelector('.text-red-500').addEventListener('click', async () => {
                await fetchData('users', 'DELETE', user.id);
                loadUsers(currentPage - 1, itemsPerPage);
            });
        });
    }

    function updatePagination() {
        const totalPages = Math.ceil(totalItems / itemsPerPage);
        const paginationContainer = document.querySelector('.inline-flex');
        const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);
        document.getElementById('show-item-of-page-user').textContent = `Showing ${startItem} to ${endItem} of ${totalItems}`;
        paginationContainer.innerHTML = '';
        if (currentPage < 1) {
            currentPage = 1;
            loadUsers(currentPage - 1, itemsPerPage);
        } else if (currentPage > totalPages) {
            currentPage = totalPages;
            loadUsers(currentPage - 1, itemsPerPage);
        }
        if (currentPage > 1) {
            const prevButton = createPaginationButton('Previous', () => {
                currentPage--;
                if (isSearch) {
                    searchUsers();
                } else {
                    loadUsers(currentPage - 1, itemsPerPage);
                }
            });
            paginationContainer.appendChild(prevButton);
        }
        for (let i = 1; i <= totalPages; i++) {
            const pageButton = createPaginationButton(i, () => {
                currentPage = i;
                if (isSearch) {
                    searchUsers();
                } else {
                    loadUsers(currentPage - 1, itemsPerPage);
                }
            });
            paginationContainer.appendChild(pageButton);
        }
        if (currentPage < totalPages) {
            const nextButton = createPaginationButton('Next', () => {
                currentPage++;
                if (isSearch) {
                    searchUsers();
                } else {
                    loadUsers(currentPage - 1, itemsPerPage);
                }
            });
            paginationContainer.appendChild(nextButton);
        }
    }
});