//Menu

$(function () {
    $("#menu").load("menu.html");
});

//Menu

//Tracking Code

const trackingCode = sessionStorage.getItem('trackingCode');
document.getElementById('trackingCode').innerText = trackingCode;
sessionStorage.removeItem('trackingCode');

//Tracking Code

//Footer

$(function () {
    $("#footer").load("footer.html");
});

//Footer