const CLIENT_DOMAIN = 'http://localhost:3333/sports-field-booking';
const SERVER_DOMAIN = 'http://localhost:8888/sports-field-booking/api/v1';

function showLoading(isLoading) {
    const loading = document.getElementById("loading");
    loading.classList.toggle("hidden", !isLoading);
}

function popupError(message = "Đã xảy ra lỗi!", timeout = 3000) {
    const error = document.getElementById("error");
    error.textContent = message; // Cập nhật nội dung
    error.classList.remove("hidden"); // Hiện popup

    // Tự ẩn sau timeout (mặc định 3 giây)
    setTimeout(() => {
        error.classList.add("hidden");
    }, timeout);
}

function validationForm(formId, errors) {
    const form = document.getElementById(formId);
    const errorFields = form.querySelectorAll('.errorFields');
    if (errors) {
        errorFields.forEach(field => {
            const fieldName = field.id.replace('Error', '');
            showValidationError(errors, fieldName);
        });
    } else {
        errorFields.forEach(field => {
            field.innerText = '';
        });
    }
}

function showValidationError(errors, field) {
    const error = errors[field];
    const errorElement = document.getElementById(`${field}Error`);
    if (error) {
        errorElement.textContent
        toggleFieldError(errorElement, true, error);
    }
    else toggleFieldError(errorElement, false);
}

function toggleFieldError(errorElement, show, message = "") {
    errorElement.textContent = message; // Cập nhật thông báo lỗi
    errorElement.classList.toggle("hidden", !show); // Ẩn/hiện
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

function getAcceptLanguageFromCookie() {
    const cookies = document.cookie.split('; ').reduce((acc, cookie) => {
        const [name, value] = cookie.split('=');
        acc[name] = value;
        return acc;
    }, {});

    return cookies.acceptLanguage || null;
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
        'Accept-Language': getAcceptLanguageFromCookie(),
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
        console.log('Refreshing token...');
        await refreshToken();
    }, refreshTime);
}

function triggerRefreshToken() {
    window.onload = function() {
        const accessToken = getAccessTokenFromCookie();
        if (accessToken) scheduleTokenRefresh(accessToken);
    };
}

function formatDate(dateString) {
    const date = new Date(dateString);

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    return `${hours}:${minutes} ${day}-${month}-${year}`;
}

function formatHour(dateString) {
    const date = new Date(dateString);

    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');

    return `${hours}:${minutes}`;
}

function parseTimeToHours(timeStr) {
    const [hours, minutes] = timeStr.split(':').map(Number);
    return hours + minutes / 60;
}

function formatHourToDate(time) {
    let [hours, minutes] = time.split(":").map(Number);

    let date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date
}

function isTimeBetween(targetTime, startTime, endTime) {
    return targetTime >= startTime && targetTime <= endTime;
}

async function calculateFileHash(fileChunk) {
    const buffer = await fileChunk.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function addTooltip(element, tooltipText) {
    // Tạo tooltip
    const tooltip = document.createElement('div');
    tooltip.textContent = tooltipText;
    tooltip.className = 'absolute hidden bg-gray-500 text-white text-sm px-2 py-1 rounded shadow-lg pointer-events-none';

    // Thêm tooltip vào cùng parent
    element.parentElement.appendChild(tooltip);

    // Hiển thị tooltip khi hover
    element.addEventListener('mouseenter', (event) => {
        tooltip.classList.remove('hidden');
        updateTooltipPosition(event);
    });

    // Cập nhật vị trí tooltip khi di chuyển chuột
    element.addEventListener('mousemove', (event) => {
        updateTooltipPosition(event);
    });

    // Ẩn tooltip khi chuột rời ảnh
    element.addEventListener('mouseleave', () => {
        tooltip.classList.add('hidden');
    });

    // Hàm cập nhật vị trí của tooltip
    function updateTooltipPosition(event) {
        const elementRect = event.target.getBoundingClientRect();
        const tooltipWidth = tooltip.offsetWidth;
        const tooltipHeight = tooltip.offsetHeight;
    
        // Tính toán vị trí để tooltip nằm giữa phần tử
        const tooltipX = elementRect.left - (elementRect.width / 2) - (tooltipWidth / 2);
        const tooltipY = elementRect.top + (elementRect.height / 2) - (tooltipHeight / 2);
    
        // Gán vị trí cho tooltip
        tooltip.style.left = `${tooltipX}px`;
        tooltip.style.top = `${tooltipY}px`;
    }
    
}

function formatDateInputValue(dateString) {
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();

    // Định dạng theo chuẩn YYYY-MM-DD
    return `${year}-${month}-${day}`;
}

function switchLanguage(lang) {
    console.log('Switching language to ' + lang);
    window.location.href = CLIENT_DOMAIN + '/settings/switch-language?lang=' + lang + '&returnUrl=' + window.location.pathname.replace('/sports-field-booking', '');
}
