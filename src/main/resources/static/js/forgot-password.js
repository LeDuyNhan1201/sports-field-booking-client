document.getElementById('toggleNewPassword').addEventListener('click', () => {
    const newPasswordField = document.getElementById('newPassword');
    const newPasswordIcon = document.getElementById('newPasswordIcon');
    const isPasswordHidden = newPasswordField.type === 'password';

    newPasswordField.type = isPasswordHidden ? 'text' : 'password';

    const eyePath = newPasswordIcon.getAttribute('data-eye-path');
    const hiddenPath = newPasswordIcon.getAttribute('data-hidden-path');

    newPasswordIcon.src = isPasswordHidden ? eyePath : hiddenPath;
});

document.getElementById('toggleConfirmNewPassword').addEventListener('click', () => {
    const confirmNewPasswordField = document.getElementById('confirmNewPassword');
    const confirmNewPasswordIcon = document.getElementById('confirmNewPasswordIcon');
    const isPasswordHidden = confirmNewPasswordField.type === 'password';

    confirmNewPasswordField.type = isPasswordHidden ? 'text' : 'password';

    const eyePath = confirmNewPasswordIcon.getAttribute('data-eye-path');
    const hiddenPath = confirmNewPasswordIcon.getAttribute('data-hidden-path');

    confirmNewPasswordIcon.src = isPasswordHidden ? eyePath : hiddenPath;
});

document.getElementById('btnSendMail')
    .addEventListener('click', async (event) => {
    event.preventDefault();
    showLoading(true);

    const email = document.getElementById('email').value;

    try {
        const response = await fetchCustom({
            url: SERVER_DOMAIN + '/auth/send-forgot-password',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }, // Thêm headers nếu cần
            body: { email } // Chuyển object body thành JSON
        });

        const data = await response.json();
        console.log(data);

        if (!response.ok) {
            const message = data.message || 'Failed to send email';
            popupError(message); // Hiển thị lỗi qua popup
            validationForm("formForgot", data.errors); // Hiển thị lỗi validation
        } else {
            const seconds = data.retryAfter; // Lấy thời gian đếm ngược
            const btnSendMail = document.getElementById('btnSendMail');

            // Disable nút gửi email
            btnSendMail.disabled = true;
            let remainingSeconds = seconds;

            const interval = setInterval(() => {
                if (remainingSeconds > 0) {
                    btnSendMail.textContent = `Resend in ${remainingSeconds--}s`;
                    console.log(remainingSeconds);
                } else {
                    clearInterval(interval);
                    btnSendMail.disabled = false; // Kích hoạt lại nút gửi email
                    btnSendMail.textContent = 'Resend Email'; // Cập nhật lại text nút
                }
            }, 1000);
        }
    } catch (error) {
        console.error('Sent email error:', error);
        popupError(error.message); // Hiển thị lỗi không mong muốn
    } finally {
        showLoading(false); // Ẩn loader
    }
});

document.getElementById('resetBtn').addEventListener('click', async (event) => {
    event.preventDefault();
    showLoading(true);

    const email = document.getElementById('email').value;
    const verifyCode = document.getElementById('verifyCode').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    // code handle here

    try {
        let response = await fetchCustom({
            url: SERVER_DOMAIN + '/auth/forgot',
            method: 'POST',
            body: {
                email : email,
                code: verifyCode,
            }
        });

        let data = await response.json();
        console.log(data);

        if (!response.ok) {
            const message = data.message || 'Failed to send email';
            popupError(message); // Hiển thị lỗi qua popup
            if (data.errors) validationForm("formForgot", data.errors); // Hiển thị lỗi validation

        } else {
            response = await fetchCustom({
                url: SERVER_DOMAIN + '/auth/reset',
                method: 'POST',
                body: {
                    token: data.token,
                    password: newPassword,
                    passwordConfirmation: confirmNewPassword
                }
            });

            data = await response.json();
            console.log(data);

            if (!response.ok) {
                const message = data.message || 'Failed to send email';
                popupError(message); // Hiển thị lỗi qua popup
                if (data.errors) validationForm("formForgot", data.errors); // Hiển thị lỗi validation

            } else {
                window.location.href = CLIENT_DOMAIN + '/auth';
            }
        }

    } catch (error) {
        console.error('Sent email error:', error);
        alert('Failed to send email password');
    } finally {
        showLoading(false);
    }
    
})