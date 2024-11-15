const addUserBtn = document.getElementById('addUserBtn');
const userModal = document.getElementById('userModal');
const closeUserModalBtn = document.getElementById('closeUserModalBtn');
const overlay = document.getElementById('overlay');
const editButtons = document.querySelectorAll('.edit-button');

addUserBtn.addEventListener('click', () => {
    userModal.classList.remove('hidden');
});

closeUserModalBtn.addEventListener('click', () => {
    userModal.classList.add('hidden');
});

overlay.addEventListener('click', () => {
    userModal.classList.add('hidden');
});

function replaceUserImage() {
    alert('Replace user image');
}

function clearUserImage() {
    document.getElementById('userImagePreview').src = 'https://placehold.co/800x600';
}

editButtons.forEach(button => {
    button.addEventListener('click', function () {
        userModal.classList.remove('hidden');
        
    });
});

