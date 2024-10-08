window.onload = function() {
    // Fetching data from an API
    fetchCustom({
        url: 'http://localhost:8888/sports-field-booking/api/v1/sports-field'
    })
    .then(response => {
        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) showError('Network response was not ok');
        return response.json();
    })
    .then(data => {
        console.log(data); // Handle the data
        document.getElementById('data').innerHTML = JSON.stringify(data);
    })
    .catch(error => {
        console.error('There has been a problem with your fetch operation:', error);
    })
    .finally(() => {
        showLoading(false);
    });
};
