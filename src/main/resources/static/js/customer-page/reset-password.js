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
            const response = await fetch(`${SERVER_DOMAIN}/users/${userId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            if (!response.ok) {
                alert("Lỗi khi tải thông tin người dùng.");
                return;
            }

            const data = await response.json();

            if (data.password !== currentPassword) {
                alert("Mật khẩu hiện tại không đúng.");
                return;
            }

            const updateResponse = await fetch(`${SERVER_DOMAIN}/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: userId,
                    password: newPassword
                })
            });

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
