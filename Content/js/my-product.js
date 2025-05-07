//Menu

$(function () {
    $("#menu").load("menu.html");
});

//Menu

//My Product Info

document.addEventListener('DOMContentLoaded', async function () {
    const username = localStorage.getItem('username'); 
    const productTableBody = document.getElementById('productTableBody');
    const overlay = document.getElementById('Overlay');

    if (!overlay || !productTableBody) {
        console.error("Required elements (overlay, productTableBody) are missing from the DOM.");
        return;
    }

    if (!username) {
        console.error("Username is missing. Redirecting to login page.");
        window.location.href = 'login.html'; 
        return;
    }

    showOverlay();

    try {
        const products = await getUserProducts(username); 

        const today = new Date();

        products.forEach((product, index) => {
            const productName = product.productName || '';
            const requestDate = product.requestDate ? product.requestDate.split('T')[0] : '';
            const startDateStr = product.startDate ? product.startDate.split('T')[0] : '';
            const endDateStr = product.endDate ? product.endDate.split('T')[0] : '';
            const usernameProduct = product.usernameProduct || ''; 
            const passwordProduct = product.passwordProduct || ''; 

            const startDate = startDateStr ? new Date(startDateStr) : null;
            const endDate = endDateStr ? new Date(endDateStr) : null;

            const row = document.createElement('tr');
            row.innerHTML = `
                <th scope="row">${index + 1}</th>
                <td>${productName}</td>
                <td>${requestDate}</td>
                <td>${startDateStr}</td>
                <td>${endDateStr}</td>
                <td>${usernameProduct}</td>
                <td>${passwordProduct}</td>
            `;

            if (startDate && endDate) {
                if (today < endDate) {
                    row.classList.add('table-success'); 
                } else {
                    row.classList.add('table-danger'); 
                }
            }

            productTableBody.appendChild(row);
        });

        hideOverlay();

        $('#productTable').DataTable({
            "language": {
                "search": "Search:",
                "infoEmpty": "Showing 0 to 0 of 0 entries",
                "lengthMenu": "Show _MENU_",
                "emptyTable": "No data available in table",
                "zeroRecords": "No matching records found",
                "infoFiltered": "(filtered from max total entries)"
            },
            "pagingType": "numbers",
            "pageLength": 10, 
            "lengthMenu": [[5, 10, 20, -1], [5, 10, 20, "All"]],
        });
    } catch (error) {
        console.error('Error loading products:', error.message);
        hideOverlay();
    }

    function showOverlay() {
        overlay.style.display = 'flex';
    }

    function hideOverlay() {
        overlay.style.display = 'none';
    }
});


//My Product Info

//Footer

$(function () {
    $("#footer").load("footer.html");
});

//Footer
