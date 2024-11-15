const promotionModal = document.getElementById('promotionModal');
const promotionOverlay = document.getElementById('promotionOverlay');
const closePromotionModalBtn = document.getElementById('closePromotionModalBtn');
const editButtons = document.querySelectorAll('.edit-button');


closePromotionModalBtn.addEventListener('click', function () {
    promotionModal.classList.add('hidden');
});

promotionOverlay.addEventListener('click', function () {
    promotionModal.classList.add('hidden');
});

editButtons.forEach(button => {
    button.addEventListener('click', function () {
        promotionModal.classList.remove('hidden');
        
        document.querySelector('.modal-title').textContent = 'Edit Promotion';
        
        // promotion information
    });
});