// JS Goes here - ES6 supported

// Add "active" class to list-item-group when clicked.  Remove class when not active

// jQuery(document).ready(function() {
    $('.list-group-item').click(function(e) {
        e.preventDefault(); // prevent the default action to open link
        // console.log(e);

        //var $this = $(this);
        // var $alias = $this.data('alias'); // add data-alias="value"

        // $this.text() contains the value of the clicked link
        console.log("active click", $(this).text());

        $(this).addClass('active').siblings().removeClass('active');

    })


    $("a.list-group-item").click(function (e) {
        // e.preventDefault();

        console.log("href clicked: ", $(this).attr("href"));

        // Load the content of the page referenced in the a-tags href
        if ($(this).attr("href").startsWith("#")) {
            return true;
        }

        $("#docsContent").load($(this).attr("href"));
        //$("#docsContent").html('hello');
        // $("#docsContent").load('install');

        //
        // Prevent browsers default behavior to follow the link when clicked
        return false;
    });
// });