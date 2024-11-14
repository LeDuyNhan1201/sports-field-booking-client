    const radioButtons = document.querySelectorAll('input[name="role"]');
    const labels = document.querySelectorAll('label');
    const passwordField = document.getElementById('password');
    const repeatPasswordField = document.getElementById('repeatPassword');
    const togglePassword = document.getElementById('togglePassword');
    const repeatTogglePassword = document.getElementById('toggleRepeatPassword');
    const passwordIcon = document.getElementById('passwordIcon');
    const repeatPasswordIcon = document.getElementById('repeatPasswordIcon');


    radioButtons.forEach(radio => {
        radio.addEventListener('change', () => {
            // Reset all borders to gray
            labels.forEach(label => {
                label.classList.remove('border-green-500');
                label.classList.add('border-gray-300');
            });
            console.log(radio.value);

            // Add green border to the selected label
            if (radio.value === 'user') {
                document.getElementById('userLabel').classList.remove('border-gray-300');
                document.getElementById('userLabel').classList.add('border-green-500');
            } else if (radio.value === 'owner') {
                document.getElementById('ownerLabel').classList.remove('border-gray-300');
                document.getElementById('ownerLabel').classList.add('border-green-500');
            } 
        });
    });

    togglePassword.addEventListener('click', () => {
        const isPasswordHidden = passwordField.type === 'password';

        passwordField.type = isPasswordHidden ? 'text' : 'password';

        const eyePath = passwordIcon.getAttribute('data-eye-path');
        const hiddenPath = passwordIcon.getAttribute('data-hidden-path');

        passwordIcon.src = isPasswordHidden ? eyePath : hiddenPath;
    });

    repeatTogglePassword.addEventListener('click', () => {
        const isRepeatPasswordHidden = repeatPasswordField.type === 'password';

        repeatPasswordField.type = isRepeatPasswordHidden ? 'text' : 'password';

        const eyePath = passwordIcon.getAttribute('data-eye-path');
        const hiddenPath = passwordIcon.getAttribute('data-hidden-path');

        repeatPasswordIcon.src = isRepeatPasswordHidden ? eyePath : hiddenPath;
    });

    document.addEventListener('DOMContentLoaded', () => {
        const rememberMeCheckbox = document.getElementById('rememberMe');
        const toggleBackground = rememberMeCheckbox.nextElementSibling;
        const dot = toggleBackground.querySelector('.dot');


        rememberMeCheckbox.addEventListener('change', () => {
            if (rememberMeCheckbox.checked) {
                console.log('Remember Password: true');
                toggleBackground.classList.add('bg-green-500');
            } else {
                console.log('Remember Password: false');
                toggleBackground.classList.remove('bg-green-500');
            }
        });
    });