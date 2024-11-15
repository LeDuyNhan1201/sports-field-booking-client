async function fetchCategories() {
    try {
        const response = await fetch(`${SERVER_DOMAIN}/category/all?colSort=rating&sortDirection=-1&offset=0&limit=4`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}