const modal = document.getElementById('sportFieldModal');
const overlay = document.getElementById('overlay');
const addSportFieldBtn = document.getElementById('addSportFieldBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const imagePreview = document.getElementById('imagePreview');
const imageInput = document.getElementById('imageInput');
const editButtons = document.querySelectorAll('.edit-button');
const deleteButtons = document.querySelectorAll('.delete-button');

addSportFieldBtn.addEventListener('click', function () {
    modal.classList.remove('hidden');
});

closeModalBtn.addEventListener('click', function () {
    modal.classList.add('hidden');
});

overlay.addEventListener('click', function () {
    modal.classList.add('hidden');
});

function replaceImage() {
    imageInput.click();
}

function clearImage() {
    imagePreview.src = 'https://placehold.co/800x600';
    imageInput.value = '';
}

function updateImagePreview() {
    const file = imageInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

editButtons.forEach(button => {
    button.addEventListener('click', function () {
        modal.classList.remove('hidden');
        
        document.querySelector('.modal-title').textContent = 'Edit Sport Field';
        
        // sport field information
    });
});

deleteButtons.forEach(button => {
    button.addEventListener('click', function () {
        if(confirm('Do you want to delete this sport field')) {
            alert('ok')
        }
    });
});


window.onload = function () {
    // Fetching data from an API
    fetchCustom({
        url: 'http://localhost:8888/sports-field-booking/api/v1/sports-field'
    })
        .then(response => {
            // Check if the response is ok (status in the range 200-299)
            if (!response.ok) showError('Network response was not ok');
            return response.json();
        })
        .then(data => {
            console.log(data); // Handle the data
            document.getElementById('data').innerHTML = JSON.stringify(data);
        })
        .catch(error => {
            console.error('There has been a problem with your fetch operation:', error);
        })
        .finally(() => {
            showLoading(false);
        });
};
