document.getElementById('verifyBtn').addEventListener('click', async (event) => {
    event.preventDefault(); 
    showLoading(true); 

    const oldPassword = document.getElementById('old-password').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value; 
    // code handle

    if (newPassword !== confirmPassword) {
        alert('New password and confirmation password do not match!');
        showLoading(false);
        return;
    }

    try {
        const response = await fetchCustom({
            url: SERVER_DOMAIN + '/auth/verify-password-by-code', 
            method: 'POST',
            // code or email handle
            body: { oldPassword, newPassword }
        });

        if (!response.ok) {
            alert('Verify failed');
            return;
        }

        const data = await response.json();
        console.log(data);

        alert('Password has been changed successfully');

        window.location.href = '/auth/login';

    } catch (error) {
        console.error('Verify error:', error);
        alert('Verify password unsuccessfully');
    } finally {
        showLoading(false);
    }
});
