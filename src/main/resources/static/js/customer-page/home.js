document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/sports-field?colSort=rating&sortDirection=-1&offset=0&limit=100`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const ratingSection = document.getElementById('ratingSection');
        if (ratingSection) {
            ratingSection.innerHTML = '';
            const openFields = data.items.filter(field => field.status !== 'INACTIVE').slice(0, 3);
            openFields.forEach(field => {
                const prices = field.fieldAvailabilities.map(availability => availability.price);
                const minPrice = prices.length > 0 ? Math.min(...prices) : null;
                const maxPrice = prices.length > 0 ? Math.max(...prices) : null;

                let priceText;
                if (minPrice !== null && maxPrice !== null) {
                    priceText = minPrice === maxPrice ? `${minPrice}$` : `${minPrice}$ - ${maxPrice}$`;
                } else {
                    priceText = "No price available";
                }
                const fallbackImageUrl = '/sports-field-booking/image/default-sport-field.png';

                const imageUrl = field.images[0] || fallbackImageUrl;

                const fieldElement = document.createElement('a');
                fieldElement.href = `/sports-field-booking/sports-field/${field.id}/details`;
                fieldElement.className = 'bg-white shadow-lg rounded-lg overflow-hidden block';
                fieldElement.innerHTML = `
                <img src="${imageUrl}" alt="Sport field image" class="w-full h-64 object-cover" />
                <div class="p-4">
                    <h4 class="font-bold text-xl">${field.name}</h4>
                    <p class="text-gray-600">${priceText}</p>
                    <p class="text-gray-500 h-12">${field.location}</p>
                    <div class="mt-2 flex space-x-2">
                        <span>⭐ ${field.rating}/5</span>
                    </div>
                </div>
            `;
                ratingSection.appendChild(fieldElement);
            });
        }

        const categories = await fetchCategories();
        const categorySection = document.querySelector('#categorySection');
        if (categorySection) {
            categorySection.innerHTML = '';
            categories.slice(0, 4).forEach(category => {
                const categoryElement = document.createElement('a');
                categoryElement.href = `#`;
                const imageUrl = category.imageUrl || '/sports-field-booking/image/category/ball.png';
                categoryElement.className = 'bg-white shadow-lg rounded-lg overflow-hidden block relative w-60 h-40';
                categoryElement.innerHTML = `
                <div class="absolute top-0 left-0 bg-green-500 w-3/5 h-full rounded-r-full"></div>
                <img src="${imageUrl}" alt="${category.name}" class="w-16 h-16 mt-8 ml-4 relative z-10" />
                <span class="pd-4 block mt-4 text-lg font-bold ml-4 relative z-10">${category.name}</span>
            `;
                categorySection.appendChild(categoryElement);
            });
        }

        const categorySelect = document.querySelector('#categorySelect');
        if (categorySelect) {
            categorySelect.innerHTML = '';
            categories.forEach(category => {
                const optionElement = document.createElement('option');
                optionElement.value = category.id;
                optionElement.textContent = category.name;
                categorySelect.appendChild(optionElement);
            });
        }

        const searchButton = document.querySelector('#searchButton');
        searchButton.addEventListener('click', () => {
            const selectedCategory = categorySelect.value;
            const location = document.querySelector('#locationInput').value.trim();
            const minPrice = document.querySelector('#minPriceInput').value.trim();
            const maxPrice = document.querySelector('#maxPriceInput').value.trim();

            if ((!minPrice || parseFloat(minPrice) <= 0) || (!maxPrice || parseFloat(maxPrice) <= 0)) {
                alert('Please enter valid values for both minimum and maximum price!');
                return;
            }

            if (parseFloat(maxPrice) < parseFloat(minPrice)) {
                alert('Maximum price cannot be less than minimum price!');
                return;
            }

            const searchParams = new URLSearchParams({
                categoryId: selectedCategory,
                location: location,
                minPrice: minPrice,
                maxPrice: maxPrice,
                colSort: 'rating',
                sortDirection: '-1',
                offset: '0',
                limit: '100'
            });
            console.log(searchParams.toString());
            window.location.href = `${CLIENT_DOMAIN}/sports-field?${searchParams.toString()}`;
        });

    } catch (error) {
        console.error('Error fetching sports fields data:', error);
    }
});