// Set current date on page load
document.addEventListener('DOMContentLoaded', function () {
    const currentDate = new Date().toISOString().split('T')[0];
    document.getElementById('reportDate').value = currentDate;

    document.getElementById('reportDate').addEventListener('change', function () {
        const selectedDate = this.value;
        // Handle logic to load chart data for the selected date
        console.log("Load data for: " + selectedDate);
        // Update chart data accordingly based on selected date
    });
});

var ctx = document.getElementById('revenueChart').getContext('2d');
var revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
        datasets: [{
            label: 'Main Revenue',
            data: [200, 600, 620.83, 500, 700, 850, 1000],
            borderColor: '#4F46E5',
            fill: false,
            tension: 0.3
        },
        {
            label: 'Secondary Revenue',
            data: [150, 400, 560, 480, 620, 780, 920],
            borderColor: '#60A5FA',
            fill: false,
            tension: 0.3
        }]
    },
    options: {
        scales: {
            y: {
                beginAtZero: true
            }
        }
    }
});

var goalsCtx = document.getElementById('goalsChart').getContext('2d');
var goalsChart = new Chart(goalsCtx, {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [72, 18, 10],
            backgroundColor: ['#4F46E5', '#60A5FA', '#E5E7EB']
        }]
    },
    options: {
        cutout: '75%'
    }
});

document.addEventListener('DOMContentLoaded', function() {
    ['topBuyerList', 'topProductList'].forEach(function(listId) {
        var items = document.getElementById(listId).getElementsByTagName('li');
        for (var i = 4; i < items.length; i++) {
            items[i].classList.add('hidden');
        }
    });
});

function updateTopBuyer() {
    var inputVal = document.getElementById('topBuyerInput').value;
    var list = document.getElementById('topBuyerList').children;
    for (let i = 0; i < list.length; i++) {
        list[i].style.display = i < inputVal ? 'flex' : 'none';
    }
}

function updateTopProduct() {
    var inputVal = document.getElementById('topProductInput').value;
    var list = document.getElementById('topProductList').children;
    for (let i = 0; i < list.length; i++) {
        list[i].style.display = i < inputVal ? 'flex' : 'none';
    }
}

function showMore(listId, itemsToShow) {    
    var list = document.getElementById(listId);
    var items = list.getElementsByTagName('li');
    var currentVisibleItems = 0;

    for (var i = 0; i < items.length; i++) {
        if (!items[i].classList.contains('hidden')) {
            currentVisibleItems++;
        }
    }

    var nextVisibleItems = currentVisibleItems + itemsToShow;
    for (var i = currentVisibleItems; i < nextVisibleItems && i < items.length; i++) {
        items[i].classList.remove('hidden');
    }

    var seeMoreButton = document.getElementById(listId + 'SeeMore');
    
    console.log(seeMoreButton);
    
    if (nextVisibleItems >= items.length && seeMoreButton) {
        seeMoreButton.style.display = 'none';
    }
}
