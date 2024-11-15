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

        if (newPassword !== confirmPassword) {
            alert("Mật khẩu mới và mật khẩu xác nhận không khớp.");
            return;
        }

        try {
            // veriry passwordencoder of current password is correct or not
            const verifyResponse = await fetch(`${SERVER_DOMAIN}/users/${JSON.parse(currentUser).id}/verify-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + getAccessTokenFromCookie()
                },
                body: JSON.stringify(currentPassword)
            });

            if (!verifyResponse.ok) {
                alert("Mật khẩu cũ hiện tại không đúng.");
                return;
            }

            const updateResponse = await fetch(`${SERVER_DOMAIN}/users/${JSON.parse(currentUser).id}/change-password`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    'Authorization': 'Bearer ' + getAccessTokenFromCookie()
                },
                body: JSON.stringify(newPassword)
            });
            console.log(updateResponse);
            
            if (updateResponse.ok) {
                alert("Mật khẩu đã được cập nhật thành công.");
                window.location.reload();
            } else {
                alert("Đã xảy ra lỗi khi cập nhật mật khẩu.");
            }
        } catch (error) {
            console.error("Error:", error);
            alert("Lỗi kết nối đến máy chủ.");
        }
    });
});
