document.querySelector('.toggle-schedule-btn').addEventListener('click', () => {
    const scheduleList = this.prevElementSibling;
    scheduleList.classList.toggle('hidden');
})