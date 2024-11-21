function sortTable(n) {
    var table, rows, switching, i, x, y, shouldSwitch, dir, switchcount = 0;
    table = document.querySelector("table");
    switching = true;
    dir = "asc";

    while (switching) {
        switching = false;
        rows = table.rows;
        for (i = 1; i < (rows.length - 1); i++) {
            shouldSwitch = false;

            x = rows[i].getElementsByTagName("TD")[n];
            y = rows[i + 1].getElementsByTagName("TD")[n];

            if (dir == "asc") {
                if (x.innerHTML.toLowerCase() > y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            } else if (dir == "desc") {
                if (x.innerHTML.toLowerCase() < y.innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
            switchcount++;
        } else {
            if (switchcount == 0 && dir == "asc") {
                dir = "desc";
                switching = true;
            }
        }
    }
}

async function loadUserAvatar() {
    try {
        const avatarResponse = await fetch(`${SERVER_DOMAIN}/file/metadata-by-user?userId=${JSON.parse(currentUser).id}`);
        const avatarData = await avatarResponse.json();
        
        userAvatar.src = avatarData.results ? avatarData.results : '/sports-field-booking/image/user-info/user-info.png';
    } catch (error) {                
        userAvatar.src = '/sports-field-booking/image/user-info/user-info.png';
    }
}

window.addEventListener('DOMContentLoaded', () => {
    loadUserAvatar();
});


