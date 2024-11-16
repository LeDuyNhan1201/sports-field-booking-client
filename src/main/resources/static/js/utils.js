const CLIENT_DOMAIN = 'http://localhost:3333/sports-field-booking';
const SERVER_DOMAIN = 'http://localhost:8888/sports-field-booking/api/v1';

function showLoading(isLoading) {
    // Lấy phần tử loading từ DOM
    let loadingElement = document.getElementById('loading');
    // Hiển thị hoặc ẩn loading tùy thuộc vào giá trị của isLoading
    loadingElement.style.display = isLoading ? 'block' : 'none';
}

function checkAccessToken() {
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
    }, {});

    if (!cookies.accessToken) window.location.href = CLIENT_DOMAIN + "/auth";
}

function setCookie(name, value, path = '/', domain = 'localhost', expires = '', sameSite = 'Strict') {
    document.cookie = `${name}=${value}; path=${path}; domain=${domain}; expires=${expires}; SameSite=${sameSite}`;
}

function getAccessTokenFromCookie() {
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
    }, {});

    return cookies.accessToken || null;
}

function getRefreshTokenFromCookie() {
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
    }, {});

    return cookies.refreshToken || null;
}

function showError(message) {
    window.location.href = CLIENT_DOMAIN + "/errors?message=" + message;
}

async function refreshToken() {
    try {
        const response = await fetchCustom({
            url: SERVER_DOMAIN + '/auth/refresh',
            method: 'POST',
            credentials: 'include',
            body: {
                "refreshToken": getRefreshTokenFromCookie()
            },
            withAuth: true,
        });

        if (!response.ok) console.log("Failed to refresh token");

        const data = await response.json();
        console.log(data);
        const { accessToken } = data

        const decodeToken = (token) => {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000; // chuyển đổi sang milliseconds
        };

        // Lưu accessToken mới vào cookie
        const accessTokenExpiry = new Date(decodeToken(accessToken));
        setCookie('accessToken', accessToken, '/', 'localhost', accessTokenExpiry.toUTCString(), 'Strict');

        // Đặt lại bộ đếm thời gian để kiểm tra token hết hạn
        scheduleTokenRefresh(accessToken);
        console.log('Token refreshed');

    } catch (error) {
        console.error('Error refreshing token:', error.message);
        window.location.href = CLIENT_DOMAIN + "/auth";
    }
}

async function fetchCustom({
                                 url,
                                 method = 'GET',
                                 pathVariables = [],
                                 queryParams = {},
                                 body = null,
                                 withAuth = false,
                             }) {
    // Append path variables to the URL
    let endpoint = url;
    pathVariables.forEach((variable) => {
        endpoint += `/${encodeURIComponent(variable)}`;
    });

    // Append query parameters to the URL
    const queryString = new URLSearchParams(queryParams).toString();
    if (queryString) endpoint += `?${queryString}`;

    // Prepare headers
    const headers = {
        'Content-Type': 'application/json',
        'Accept': '*/*',
    };

    if (withAuth) {
        const accessToken = getAccessTokenFromCookie();

        if (!accessToken) window.location.href = CLIENT_DOMAIN + "/auth";

        headers['Authorization'] = `Bearer ${accessToken}`;
    }

    // Prepare fetch options
    const options = { method, headers, };

    // Include body if the request method allows it and if a body is provided
    if (body && ['POST', 'PUT', 'PATCH'].includes(method.toUpperCase())) options.body = JSON.stringify(body);

    // Make the fetch request
    return await fetch(endpoint, options);
}

function getExpirationFromToken(token) {
    // Kiểm tra xem token có hợp lệ không
    if (!token) {
        // Nếu không có token, chuyển hướng đến trang login
        window.location.href = CLIENT_DOMAIN + "/auth"; // Thay đổi đường dẫn nếu cần
        return;
    }

    // Giả sử đây là JWT, tách payload và lấy thời gian hết hạn (exp) từ token
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Tính thời gian hết hạn
    const expirationTime = payload.exp * 1000; // chuyển từ giây sang milliseconds

    // Kiểm tra thời gian hiện tại so với thời gian hết hạn
    if (Date.now() >= expirationTime) window.location.href = CLIENT_DOMAIN + "/auth";

    return expirationTime;
}

function scheduleTokenRefresh(token) {
    const expirationTime = getExpirationFromToken(token);
    const timeLeft = expirationTime - Date.now();

    // Đặt một khoảng thời gian an toàn, ví dụ 1 phút trước khi token hết hạn
    const refreshTime = Math.max(timeLeft - 60000, 0);

    setTimeout(async () => {
        await refreshToken();
    }, refreshTime);
}

function triggerRefreshToken() {
    window.onload = function() {
        const accessToken = getAccessTokenFromCookie();
        if (accessToken) scheduleTokenRefresh(accessToken);
    };
}

triggerRefreshToken();


function formatDate(dateString) {
    const date = new Date(dateString);

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}-${month}-${year}`;
}

function formatHourToDate(time) {
    let [hours, minutes] = time.split(":").map(Number);

    let date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date
}