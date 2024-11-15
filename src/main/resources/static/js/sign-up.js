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

document.addEventListener('DOMContentLoaded', async () => {
    const form = document.getElementById('sign-up-form');
    const mobileInput = document.getElementById('mobileNumber');
    const emailInput = document.getElementById('email');
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    const birthdateInput = document.getElementById('birthdate');

    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        const mobileValue = mobileInput.value;
        if (!/^0\d{9}$/.test(mobileValue)) {
            event.preventDefault();
            alert('Mobile phone number must start with 0 and 10 digits long.');
            return;
        }

        const emailValue = emailInput.value;
        if (!emailValue.endsWith('@gmail.com')) {
            event.preventDefault();
            alert('Email must be a valid gmail address (ending with @gmail.com).');
            return;
        }

        const birthdateValue = new Date(birthdateInput.value);
        const today = new Date();
        const age = today.getFullYear() - birthdateValue.getFullYear();
        const isBirthdayPassedThisYear = today.getMonth() > birthdateValue.getMonth() ||
            (today.getMonth() === birthdateValue.getMonth() && today.getDate() >= birthdateValue.getDate());

        if (age < 18 || (age === 18 && !isBirthdayPassedThisYear)) {
            alert('You must be at least 18 years old to sign up.');
            return;
        }

        let flag = true;
        requiredFields.forEach(field => {
            if (!field.value) {
                flag = false;
                alert(`The ${field.name} field is required.`);
            }
        });

        if (!flag) return;

        const acceptTerms = form.querySelector('input[name="acceptTerms"]').checked;
        if (!acceptTerms) {
            alert('You must accept the Terms of Use.');
            return;
        }

        const formData = {
            firstName: form.firstName.value,
            lastName: form.lastName.value,
            middleName: form.middleName.value,
            username: form.username.value,
            email: form.email.value,
            password: form.password.value,
            passwordConfirmation: form.repeatPassword.value,
            mobileNumber: form.mobileNumber.value,
            birthdate: form.birthdate.value,
            gender: form.gender.value,
            acceptTerms: acceptTerms
        };

        try {            
            const response = await fetch(`${SERVER_DOMAIN}/auth/sign-up`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            const responseData = await response.json();
            
            if (response.ok) {
                const userRoleData = {
                    userId: responseData.userId,
                    roleId: form.querySelector('input[name="role"]:checked').value
                };
                
                const userRoleResponse = await fetch(`${SERVER_DOMAIN}/userRole`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(userRoleData)
                });

                console.log(userRoleResponse);
                
                if (userRoleResponse.ok) {
                    alert('Sign-up successful, you can switch to login page and login!');
                    window.location.href = CLIENT_DOMAIN + '/auth';
                } else {
                    const roleErrorData = await userRoleResponse.json();
                    console.log(roleErrorData);
                    
                    alert(`Failed to assign role: ${roleErrorData.message}`);
                }
            } else {
                alert(`Sign-up failed: ${responseData.message}`);
            }
        } catch (error) {
            alert(`An error occurred: ${error.message}`);
        }
    });
});
