const currentRevenue = document.getElementById('currentRevenueTotal');
const previousRevenue = document.getElementById('previousRevenueTotal');

let currentRevenueTotal = 0;
let previousRevenueTotal = 0;

function convertToGMT7(dateString) {
    const utcDate = new Date(dateString);
    const timezoneOffset = 7 * 60;
    const localTime = new Date(utcDate.getTime() + timezoneOffset * 60 * 1000);
    return localTime.toISOString().replace('T', ' ').split('.')[0]
}

async function fetchCurrentWeekData() {
    const response = await fetch(`${SERVER_DOMAIN}/booking/current-week`);
    const data = await response.json();   
    const weeklyData = Array(7).fill(0);
 
    for (let item of data) {
        if (item.bookingItems && item.bookingItems.length > 0) {
            let totalPrice = 0;
            for (let bookingItem of item.bookingItems) {
                currentRevenueTotal += bookingItem.price

                const date = new Date(item.createdAt);
                const dayIndex = (date.getDay() + 6) % 7;
                
                weeklyData[dayIndex] += bookingItem.price;

                totalPrice += bookingItem.price;
            }
        } 
    }
    return weeklyData;
}

async function fetchPreviousWeekData() {
    const response = await fetch(`${SERVER_DOMAIN}/booking/previous-week`);
    const data = await response.json();
    const weeklyData = Array(7).fill(0);

    for (let item of data) {        
        if (item.bookingItems && item.bookingItems.length > 0) {
            let totalPrice = 0;
            for (let bookingItem of item.bookingItems) {                
                previousRevenueTotal += bookingItem.price

                const date = new Date(item.createdAt);
                const dayIndex = (date.getDay() + 6) % 7;

                weeklyData[dayIndex] += bookingItem.price;

                totalPrice += bookingItem.price;
            }
        } 
    }
    return weeklyData;
}

async function fetchCurrentMonthData() {
    const response = await fetch(`${SERVER_DOMAIN}/booking/current-month`);
    const data = await response.json();
    let total = 0;
    for (let item of data) {
        if (item.bookingItems && item.bookingItems.length > 0) {
            for (let bookingItem of item.bookingItems) {                
                total += bookingItem.price;
            }
        }
    }
    return total;
}

async function fetchPreviousMonthData() {
    const response = await fetch(`${SERVER_DOMAIN}/booking/previous-month`);    
    const data = await response.json();
    let total = 0;
    for (let item of data) {
        if (item.bookingItems && item.bookingItems.length > 0) {
            for (let bookingItem of item.bookingItems) {
                total += bookingItem.price;
            }
        }
    }
    return total;
}

async function updateRevenueChart() {
    const currentWeekData = await fetchCurrentWeekData();
    const previousWeekData = await fetchPreviousWeekData();

    currentRevenue.textContent = `$${currentRevenueTotal.toFixed(2)}`
    previousRevenue.textContent = `$${previousRevenueTotal.toFixed(2)}`

    revenueChart.data.datasets[0].data = currentWeekData;
    revenueChart.data.datasets[1].data = previousWeekData;
    revenueChart.update();

}

async function updateGoalsChart() {
    const currentMonthTotal = await fetchCurrentMonthData();
    const previousMonthTotal = await fetchPreviousMonthData();

    let percentageChange = 0;
    if (previousMonthTotal > 0) {
        percentageChange = ((currentMonthTotal - previousMonthTotal) / previousMonthTotal) * 100;
    } else if (currentMonthTotal > 0) {
        percentageChange = 100; // previous month doesn't have data
    }
    
    const total = currentMonthTotal + previousMonthTotal + Math.abs(percentageChange);

    const normalizedCurrentMonth = (currentMonthTotal / total) * 100;
    const normalizedPreviousMonth = (previousMonthTotal / total) * 100;
    const normalizedPercentageChange = normalizedCurrentMonth - normalizedPreviousMonth;
        
    console.log([normalizedCurrentMonth, normalizedPreviousMonth, normalizedPercentageChange]);
    
    goalsChart.data.datasets[0].data = [
        normalizedCurrentMonth,
        normalizedPreviousMonth,
    ];

    if (normalizedPercentageChange < 0) {
        goalsChart.data.datasets[0].data.push(normalizedPercentageChange);
    }

    const percentageElement = document.querySelector('#percentageChange');
    percentageElement.textContent = `${normalizedCurrentMonth.toFixed(2)}%`;

    const previousMonthElement = document.getElementById('previousMonth');
    previousMonthElement.textContent = `${normalizedPreviousMonth.toFixed(2)}%`;

    const comparisonElement = document.querySelector('#comparisonChange');
    comparisonElement.textContent =
        (normalizedCurrentMonth >= normalizedPreviousMonth ? '+' : '-') + normalizedPercentageChange.toFixed(2) + '%';
    comparisonElement.style.color = normalizedCurrentMonth < normalizedPreviousMonth ? 'red' : 'green';

    goalsChart.update();
}

async function fetchTopBuyers() {
    try {                
        const response = await fetch(`${SERVER_DOMAIN}/booking`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAccessTokenFromCookie()
            },
        });

        const bookings = await response.json();
        
        const userCount = new Map();
        bookings.items.forEach(booking => {
            const userName = booking.user.username;
            userCount.set(userName, (userCount.get(userName) || 0) + 1);
        });

        const sortedUsers = Array.from(userCount)
            .map(([userName, count]) => ({ userName, count }))
            .sort((a, b) => b.count - a.count);

        // render top buyer list
        const topBuyerList = document.getElementById('topBuyerList');
        topBuyerList.innerHTML = '';

        sortedUsers.forEach(({ userName, count }) => {
            const li = document.createElement('li');
            li.classList.add('mb-2', 'flex', 'justify-between');
            li.innerHTML = `
                <span>${userName}</span>
                <span>${count} order</span>
            `;
            topBuyerList.appendChild(li);
        });

        const items = topBuyerList.getElementsByTagName('li');
        for (let i = 4; i < items.length; i++) {
            items[i].classList.add('hidden');
        }

        const seeMoreButton = document.getElementById('topBuyerListSeeMore');
        seeMoreButton.style.display = items.length > 4 ? 'inline-block' : 'none';

    } catch (error) {
        console.error('Error fetching top buyers:', error);
    }
}

async function fetchTopProducts() {
    try {                
        const response = await fetch(`${SERVER_DOMAIN}/booking-items`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + getAccessTokenFromCookie()
            },
        });

        const bookingItems = await response.json();
        
        const sportsFieldCount = new Map();
        bookingItems.items.forEach(bookingItem => {
            const sportsFieldName = bookingItem.sportField.name;
            sportsFieldCount.set(sportsFieldName, (sportsFieldCount.get(sportsFieldName) || 0) + 1);
        });

        const sortedSportsField = Array.from(sportsFieldCount)
            .map(([sportsFieldName, count]) => ({ sportsFieldName, count }))
            .sort((a, b) => b.count - a.count);

        // render top product list
        const topProductList = document.getElementById('topProductList');
        topProductList.innerHTML = '';

        sortedSportsField.forEach(({ sportsFieldName, count }) => {            
            const li = document.createElement('li');
            li.classList.add('mb-2', 'flex', 'justify-between');
            li.innerHTML = `
                <span>${sportsFieldName}</span>
                <span>${count} order</span>
            `;
            topProductList.appendChild(li);
        });

        const items = topProductList.getElementsByTagName('li');
        for (let i = 4; i < items.length; i++) {
            items[i].classList.add('hidden');
        }

        const seeMoreButton = document.getElementById('topProductListSeeMore');
        seeMoreButton.style.display = items.length > 4 ? 'inline-block' : 'none';

    } catch (error) {
        console.error('Error fetching top buyers:', error);
    }
}


document.addEventListener('DOMContentLoaded', async function () {
    // const currentDate = new Date().toISOString().split('T')[0];
    // document.getElementById('reportDate').value = currentDate;

    // document.getElementById('reportDate').addEventListener('change', function () {
    //     const selectedDate = this.value;
    //     console.log("Load data for: " + selectedDate);
    // });
    await updateRevenueChart();
    await updateGoalsChart();
    await fetchTopBuyers();
    await fetchTopProducts();
});

var ctx = document.getElementById('revenueChart').getContext('2d');
var revenueChart = new Chart(ctx, {
    type: 'line',
    data: {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat','Sun'],
        datasets: [{
            label: 'Current Week Revenue',
            data: [],
            borderColor: '#4F46E5',
            fill: false,
            tension: 0.3
        },
        {
            label: 'Previous Week Revenue',
            data: [],
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
            data: [],
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

    if (!inputVal) {
        for (let i = 0; i < list.length; i++) {
            list[i].classList.toggle('hidden', i >= 4);
        }
        return;
    }

    for (let i = 0; i < list.length; i++) {
        list[i].classList.toggle('hidden', i >= inputVal);
    }
}



function updateTopProduct() {
    var inputVal = document.getElementById('topProductInput').value;
    var list = document.getElementById('topProductList').children;

    if (!inputVal) {
        for (let i = 0; i < list.length; i++) {
            list[i].classList.toggle('hidden', i >= 4);
        }
        return;
    }

    for (let i = 0; i < list.length; i++) {
        list[i].classList.toggle('hidden', i >= inputVal);
    }
}

function showMore(listId) {    
    var list = document.getElementById(listId);
    var items = list.getElementsByTagName('li');
    var inputVal = parseInt(document.getElementById('topBuyerInput').value) || 0;

    var itemsToShow = items.length - inputVal;
    if(itemsToShow > 4) {
        itemsToShow = 4;
    }
    var currentVisibleItems = 0;

    for (var i = 0; i < items.length; i++) {
        if (!items[i].classList.contains('hidden')) {
            currentVisibleItems++;
        }
    }

    var nextVisibleItems = currentVisibleItems + itemsToShow;
    console.log(currentVisibleItems);
    console.log(nextVisibleItems);

    for (var i = currentVisibleItems; i < nextVisibleItems && i < items.length; i++) {
        items[i].classList.remove('hidden');
    }

    var seeMoreButton = document.getElementById(listId + 'SeeMore');

    if (nextVisibleItems >= items.length && seeMoreButton) {
        seeMoreButton.style.display = 'none';
    } else if (seeMoreButton) {
        seeMoreButton.style.display = 'flex';
    }
}

