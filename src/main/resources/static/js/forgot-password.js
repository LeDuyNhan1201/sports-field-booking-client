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

document.getElementById('resetBtn').addEventListener('click', async () => {
    event.preventDefault();
    showLoading(true);

    const email = document.getElementById('email').value;
    // code handle here

    try {
        const response = await fetchCustom({
            url: SERVER_DOMAIN + '/auth/forgot-password',
            method: 'POST',
            // add code request
            body: { email }
        });

        if (!response.ok) {
            alert('Failed to send recovery password');
            return;
        }

        const data = await response.json(); 
        console.log(data);

        alert('Email sent. Please check your email address');

        window.location.href = '/auth/verify';

    } catch (error) {
        console.error('Sent email error:', error);
        alert('Failed to send email password');
    } finally {
        showLoading(false);
    }
    
})