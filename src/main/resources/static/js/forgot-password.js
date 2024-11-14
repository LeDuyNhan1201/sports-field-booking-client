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

document.getElementById('resetBtn').addEventListener('click', () => {
    console.log(123);
    
})