document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/sports-field?colSort=rating&sortDirection=-1&offset=0&limit=100`);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();

        const ratingResponse = await fetch(`${SERVER_DOMAIN}/rating/average/all`);
        if (!ratingResponse.ok) {
            throw new Error('Network response was not ok');
        }

        const ratingData = await ratingResponse.json();

        const ratingSection = document.getElementById('ratingSection');
        if (ratingSection) {
            ratingSection.innerHTML = '';

            for (let field of data.items) {
                field.rating = ratingData[field.id] || 0;
            }

            data.items.sort((a, b) => {
                return b.rating - a.rating
            })

            const openFields = data.items
                .filter(field => field.status !== 'INACTIVE')
                .sort((a, b) => b.rating - a.rating)
                .slice(0, 3);

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
                fieldElement.className = 'bg-white shadow-lg rounded-lg overflow-hidden block transform transition-transform duration-300 hover:scale-105';
                fieldElement.innerHTML = `
                                       <img src="${imageUrl}" alt="Sport field image" class="w-full h-64 object-cover transition-transform duration-300 hover:scale-95" />
                                                <div class="p-4 transition-colors duration-300 hover:bg-gray-100">
                                                    <h4 class="font-bold text-xl hover:text-gray-800">${field.name}</h4>
                                                    <p class="text-gray-600 hover:text-gray-700">${priceText}</p>
                                                    <p class="text-gray-500 h-12 hover:text-gray-600">${field.location}</p>
                                                    <div class="mt-2 flex space-x-2">
                                                        <span class="hover:text-gray-700">⭐ ${field.rating.toFixed(2)}/5</span>
                                                    </div>
                                                </div>
                `;
                ratingSection.appendChild(fieldElement);
            });
        }

        const categories = await fetchData('category', 'GET', null, null, OFFSET, LIMIT);

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
        if (searchButton) {
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
                window.location.href = `${CLIENT_DOMAIN}/sports-field?${searchParams.toString()}`;
            });
        }

    } catch (error) {
        console.error('Error fetching sports fields data:', error);
    }
});