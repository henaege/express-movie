$(document).ready(function() {
    var tallestPoster = 0;
    $('.movies .col-xs-3').each(function() {
        var curElement = $(this);
        if (curElement.height() > tallestPoster) {
            tallestPoster = curElement.height();
        }
        console.log(curElement.height);
    })

});