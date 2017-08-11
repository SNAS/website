// JS Goes here - ES6 supported

/******/ (function(modules) { // webpackBootstrap
    /******/ 	// The module cache
    /******/ 	var installedModules = {};

    /******/ 	// The require function
    /******/ 	function __webpack_require__(moduleId) {

        /******/ 		// Check if module is in cache
        /******/ 		if(installedModules[moduleId])
        /******/ 			return installedModules[moduleId].exports;

        /******/ 		// Create a new module (and put it into the cache)
        /******/ 		var module = installedModules[moduleId] = {
            /******/ 			exports: {},
            /******/ 			id: moduleId,
            /******/ 			loaded: false
            /******/ 		};

        /******/ 		// Execute the module function
        /******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

        /******/ 		// Flag the module as loaded
        /******/ 		module.loaded = true;

        /******/ 		// Return the exports of the module
        /******/ 		return module.exports;
        /******/ 	}


    /******/ 	// expose the modules object (__webpack_modules__)
    /******/ 	__webpack_require__.m = modules;

    /******/ 	// expose the module cache
    /******/ 	__webpack_require__.c = installedModules;

    /******/ 	// __webpack_public_path__
    /******/ 	__webpack_require__.p = "/";

    /******/ 	// Load entry module and return exports
    /******/ 	return __webpack_require__(0);
    /******/ })
/************************************************************************/
/******/ ([
    /* 0 */
    /***/ function(module, exports, __webpack_require__) {

        module.exports = __webpack_require__(1);


        /***/ },
    /* 1 */
    /***/ function(module, exports) {

        // JS Goes here - ES6 supported
        "use strict";

        /***/ }
    /******/ ]);

// Add "active" class to list-item-group when clicked.  Remove class when not active

jQuery(document).ready(function() {
    var previous_url = null;

    $("a.list-group-item").click(function (e) {
        // e.preventDefault();

        console.log("href clicked: ", $(this).attr("href"));

        // Load the content of the page referenced in the a-tags href
        if ($(this).attr("href").startsWith("#")) {
            return true;
        }

        history.pushState({page:$(this).attr("href")}, null, $(this).attr("href"));

        previous_url = $(this).attr("href");
        $("#docsContent").load($(this).attr("href"));
        $(window).animate({ scrollTop: 0 }, "slow");
        //$("#docsContent").html('hello');
        // $("#docsContent").load('install');

        //
        // Prevent browsers default behavior to follow the link when clicked
        $('#sidebar').find("a").removeClass('active');
        $(this).addClass('active');
        return false;
    });


    $(window).on('popstate', function(e) {
        if (e.originalEvent.state !== null) {
//            console.log("popstate current: ", e.originalEvent.state.page);
//            console.log("previous is : ", previous_url);
            $('#sidebar').find("#" + previous_url).removeClass('active');
            $('#sidebar').find("div.collapse").each(function() {
                $(this).collapse('hide');
            });

            previous_url = e.originalEvent.state.page;
            $("#" + e.originalEvent.state.page).addClass('active');

            var parent = ($('#sidebar').find("#" + e.originalEvent.state.page))[0].parentNode;
            while (!($(parent).hasClass("list-group"))) {
                console.log("parent is: ", parent);
                parent = parent.parentNode;
           }
           
            // Load the content of the page referenced in the a-tags href
           $("#docsContent").load(location.href);
        }
    });


    /*
     * Handle links in "docsContent" so that relative links are opened in right pane and external are opened
     *  in a new window.
     *
     *  NOTE: jQuery.load() is used to load the content in the #docsContent div.  In order to capture this event
     *      $on('click', ...) function needs to be used so that added elements after initial document load
     *      are handled.   See http://api.jquery.com/on/ "Delegated events" for more details.
     *
     *     Also see: https://stackoverflow.com/questions/14339309/jquery-click-event-handlers-dont-work-after-loading-html-page-with-load for details
    */
  // The below will handle click events for the <div id="docsContent"> <a> links
  $("div#docsContent").on('click',"a", function(e) {
    // $(document).on('click',"#docsContent a", function(e) {       // This is an alternate to the above.
    console.log("docs link clicked: ", $(this).attr("href"));

    var regex = /(^[a-zA-Z]+:\/\/)|(^\/)/i;
    var match = regex.exec($(this).attr("href"));

    if (match && match.length > 1) {

      if (match[1]) {
          console.log("1 history: ", window.history.state);
        // External link (e.g. http://blah)
        window.open($(this).attr("href"));

      } else if (match[2]) {
          console.log("2 history: ", window.history.state);

          // Absolute link (e.g. /demo)
        //window.open($(this).attr("href"));
        return true;
      }

    } else {
      // Relative link (e.g. getting_start)

        // Default action for local tag refs (e.g. #tag)
      if ($(this).attr("href").startsWith("#")) {
          console.log("3 history: ", window.history.state);
          // Prevent browsers default behavior to follow the link when clicked
          $('html, body').animate({
              scrollTop: $( $.attr(this, 'href') ).offset().top
          }, 500);
      } else {
          history.pushState({page:$(this).attr("href")}, null, $(this).attr("href"));
          previous_url = $(this).attr("href");

          console.log("4 history: ", window.history.state);

          $('#sidebar').find("a").removeClass('active');

          $("#"+$(this).attr("href")).addClass('active');
          // Prevent browsers default behavior to follow the link when clicked
          $("#docsContent").load($(this).attr("href"));
          $('html, body').animate({ scrollTop: 0 }, "slow");
      }
    }

    // Return false to disable the default action
    return false;
  } );
});
