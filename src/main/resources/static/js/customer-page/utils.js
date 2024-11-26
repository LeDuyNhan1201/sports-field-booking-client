async function fetchData(endpoint, method = 'GET', id = null, body = null, OFFSET = 0, LIMIT = 10000) {
    try {
        const token = getAccessTokenFromCookie();
        if (!token) {
            throw new Error('Authorization token is missing');
        }

        let url = `${SERVER_DOMAIN}/${endpoint}`;
        if (id && (method === 'PUT' || method === 'DELETE')) {
            url += `/${id}`;
        } else if (method === 'GET') {
            url += `?offset=${OFFSET}&limit=${LIMIT}`;
        }

        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        };

        if (body) {
            options.body = JSON.stringify(body);
        }

        const response = await fetch(url, options);

        if (!response.ok) {
            throw new Error(`Failed to fetch data. Status: ${response.status}`);
        }

        const data = await response.json();

        if (method === 'GET' && (!data || !Array.isArray(data.items))) {
            throw new Error('Invalid data format: expected an array of items');
        }

        return data.items || data;
    } catch (error) {
        console.error('Error fetching data:', error);
        return [];
    }
}