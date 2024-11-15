document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`http://localhost:8888/sports-field-booking/api/v1/sports-field?colSort=rating&sortDirection=-1&offset=0&limit=3`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const ratingSection = document.querySelector('.grid.grid-cols-1.sm\\:grid-cols-2.lg\\:grid-cols-3.gap-6');
        if (ratingSection) {
            ratingSection.innerHTML = '';
            data.items.forEach(field => {
                const prices = field.fieldAvailabilities.map(availability => availability.price);
                const minPrice = prices.length > 0 ? Math.min(...prices) : null;
                const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

                let priceText;
                if (minPrice !== null && maxPrice !== null) {
                    priceText = minPrice === maxPrice ? `${minPrice}$` : `${minPrice}$ - ${maxPrice}$`;
                } else {
                    priceText = "Chưa có giá";
                }
                const fallbackImageUrl = '/sports-field-booking/image/manxanh.png';

                const imageUrl = field.imageUrl || fallbackImageUrl;

                const fieldElement = document.createElement('a');
                fieldElement.href = `/sports-field/${field.id}/details`;
                fieldElement.className = 'bg-white shadow-lg rounded-lg overflow-hidden block';
                fieldElement.innerHTML = `
                <img src="${imageUrl}" alt="Sport field image" class="w-400 h-300 object-cover" />
                <div class="p-4">
                    <h4 class="font-bold text-xl">${field.name}</h4>
                    <p class="text-gray-600">${priceText}</p>
                    <p class="text-gray-500">${field.location}</p>
                    <div class="mt-2 flex space-x-2">
                        <span>⭐ ${field.rating}/5</span>
                    </div>
                </div>
            `;
                ratingSection.appendChild(fieldElement);
            });
        }

    } catch (error) {
        console.error('Error fetching sports fields data:', error);
    }
});
