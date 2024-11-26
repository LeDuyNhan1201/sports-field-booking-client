async function fetchCategories() {
    try {
        const data = await fetch(`${SERVER_DOMAIN}/category?offset=0&limit=100`);
        const categories = await data.json()

        return categories.items;
    } catch (error) {
        console.error('Error fetching categories:', error);
        return [];
    }
}

