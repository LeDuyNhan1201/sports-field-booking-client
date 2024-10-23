document.getElementById('forgotBtn').addEventListener('click', async () => {
    event.preventDefault();
    showLoading(true);

    const email = document.getElementById('email').value;
    // code handle

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
});
