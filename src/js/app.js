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
