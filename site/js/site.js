/*
 * Handler for the onblur event of the search input text box
 */
function handle_SearchBoxBlur() {
    var ele = document.getElementById('search-query');
    if (ele) {
        ele.className = '';
        ele.value = ele.value || 'Search RabbitMQ';
    }
}

/*
 * Handler for the onfocus event of the search input text box
 */
function handle_SearchBoxFocus() {
    var ele = document.getElementById('search-query');
    if (ele) {
        ele.className = 'focus';
        if (ele.value == 'Search RabbitMQ') {
            ele.value = '';
        }
    }
}

/*
 * Registers a function to handle the window.onload event 
 * without replacing any existing handler
 */
function registerOnLoadHandler(handler) {
	var fun = window.onload ? window.onload : function() {};
	window.onload = function() { fun(); handler(); };
}

function onDOMReady(callback) {
    if(document.readyState === "interactive" || document.readyState === "complete") {
        callback();
    }
    else {
        document.addEventListener("DOMContentLoaded", callback);
    };
};


/* Mobile menu */
function showHide() {
    var mobileMenu = document.getElementById('mainNav');
    if (mobileMenu.style.display === 'block') {
        mobileMenu.style.display = 'none';
    } else {
        mobileMenu.style.display = 'block';
    }
};
