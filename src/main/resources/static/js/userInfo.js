const editBtn = document.getElementById('editBtn');
const saveBtn = document.getElementById('saveBtn');
const inputFields = document.querySelectorAll('input');
const displayFields = document.querySelectorAll('span[id$="Display"]');

editBtn.addEventListener('click', () => {
    inputFields.forEach(input => input.classList.remove('hidden'));
    displayFields.forEach(display => display.classList.add('hidden'));
    saveBtn.classList.remove('hidden');

    document.getElementById('changePictureInput').classList.add('hidden');
});

saveBtn.addEventListener('click', () => {
   inputFields.forEach(input => input.classList.add('hidden'));
   displayFields.forEach(display => display.classList.remove('hidden'));
   saveBtn.classList.add('hidden');
});

document.getElementById('deleteAccountBtn').addEventListener('click', function () {
    if (confirm('Do you want to delete your account?')) {
       alert('Your account has been deleted'); // logic
    }
});