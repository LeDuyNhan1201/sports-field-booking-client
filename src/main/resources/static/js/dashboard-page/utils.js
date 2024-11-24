function sortTable(n) {
    let table, rows, switching, i, x, y, shouldSwitch, dir, switchCount = 0;
    table = document.querySelector("table");
    switching = true;
    dir = "asc";

    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;

            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];

            if (dir === "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir === "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchCount++;
        } else {
            if (switchCount === 0 && dir === "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

async function loadUserAvatar() {
    try {
        const avatarResponse = await fetch(`${SERVER_DOMAIN}/file/metadata-by-user?userId=${JSON.parse(currentUser).id}`);
        const avatarData = await avatarResponse.json();

        userAvatar.src = avatarData.results ? avatarData.results : '/sports-field-booking/image/user-info/user-info.png';
    } catch (error) {
        userAvatar.src = '/sports-field-booking/image/user-info/user-info.png';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadUserAvatar();
});

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