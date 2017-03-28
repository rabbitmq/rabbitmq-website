/*!
 * Javscript snippets for rabbitmq.com.
 *
 */


/* A tiny bit of hand-crafted javascript. We could use jquery, but we
   don't include it at the moment. Requiring 25K more just to
   make this function prettier is insane.

   The purpose of this function is to decorate all the foreign links on
   the site to inclue tracking code. We want to know how many times
   our packages were downloaded, how many times people clicked on our
   mailto:// and what remote links were popular.

   A bit of google tracking documentation:
   http://www.google.com/support/analytics/bin/answer.py?hl=en&answer=55529
   http://code.google.com/apis/analytics/docs/gaJS/gaJSApiBasicConfiguration.html#_gat.GA_Tracker_._trackPageview
   http://www.google.com/support/googleanalytics/bin/answer.py?hl=en&answer=55527

   In order to achieve that, we iterate through all the links and set
   "onClick" method to run google tracking code.
*/

function decorate_links() {
    /* 'location' should contain something like http://host[:port] */
    var location = document.location.protocol + "//" + document.location.host;
    var links = document.getElementsByTagName("a");
    for(var i=0; i<links.length; i++) {
        var link = links[i];

        /* When we count a pageview:
           - When link relates to "/releases", "/debian", "/javadoc"
           or "/examples" as this directories don't have a tracking
           code and should be treated as remote content.
        */
        if (link.href.match("^" + location + "/(releases|debian|javadoc|examples)/") ) {
            link.onclick = function () {
                /* Google analytics don't know how to present remote links,
                   so we need to pretend they are local. For example:
                   /remote/http//www.rabbitmq.com/releases/rabbitmq-server/v1.8.0/rabbitmq-server-1.8.0.zip
                */
                var url = "/remote/" + this.href.replace("://","/");
                _gaq.push(['_trackPageview', url]);

                /* Give a tiny bit of time for GA to complete tracking. */
                setTimeout('document.location = "' + this.href + '"', 100);
                return false;
            }
        }
    }
};

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

registerOnLoadHandler(function() {
    try{
        decorate_links();
    }catch(err){};
});


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
