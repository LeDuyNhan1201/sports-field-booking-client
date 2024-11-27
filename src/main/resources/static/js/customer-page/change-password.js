document.addEventListener("DOMContentLoaded", function () {
    const currentPasswordInput = document.getElementById("current-password");
    const newPasswordInput = document.getElementById("new-password");
    const confirmPasswordInput = document.getElementById("confirm-password");
    const changePasswordForm = document.querySelector("form");

    changePasswordForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const currentPassword = currentPasswordInput.value;
        const newPassword = newPasswordInput.value;
        const confirmPassword = confirmPasswordInput.value;

        try {
            const response = await fetchCustom({
                url: `${SERVER_DOMAIN}/users/${JSON.parse(currentUser).id}/password`,
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                withAuth: true,
                body: {
                    oldPassword: currentPassword ,
                    newPassword: newPassword,
                    passwordConfirmation: confirmPassword
                }
            });

            const data = await response.json();
            console.log(data);

            if (!response.ok) {
                const message = data.message || 'Failed to send email';
                popupError(message); // Hiển thị lỗi qua popup
                validationForm("formForgot", data.errors); // Hiển thị lỗi validation

            } else {
                alert('Password has been changed successfully');
            }
        } catch (error) {
            console.error("Error:", error);
            popupError(error.message);
        }
    });
});
