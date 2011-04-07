    google.load('search', '1', {language: 'en'});  /* use 'nocss: true' property to use custom css */
    google.setOnLoadCallback(function() {

    // create a search control
    var searchControl = new google.search.SearchControl();
    searchControl.setResultSetSize(google.search.Search.LARGE_RESULTSET);
    searchControl.setLinkTarget(google.search.Search.LINK_TARGET_SELF);


    // create site searchers
    var webSearch_RMQ = new google.search.WebSearch();
    webSearch_RMQ.setSiteRestriction('015404676280738692929:q_1m_zzsrm4', 'rabbitmq.com');
    webSearch_RMQ.setUserDefinedLabel('rabbitmq.com');

    var webSearch_LIST = new google.search.WebSearch();
    webSearch_LIST.setSiteRestriction('015404676280738692929:rbjjd9ottry', 'mailing-list');
    webSearch_LIST.setUserDefinedLabel('mailing list');

    var blogSearch = new google.search.BlogSearch();
    blogSearch.setUserDefinedLabel('blogosphere');
    blogSearch.setQueryAddition('rabbitmq');

    // add searchers
    searchControl.addSearcher(webSearch_RMQ);
    searchControl.addSearcher(webSearch_LIST);
    searchControl.addSearcher(blogSearch);

    // set tabbed layout
    var drawOptions = new google.search.DrawOptions();
    drawOptions.setDrawMode(google.search.SearchControl.DRAW_MODE_TABBED);
    drawOptions.setAutoComplete(true);

    // draw the search control
    searchControl.draw(document.getElementById("cse"), drawOptions);

    // extract and run the query
    var q = getQuery();
    if (q && q.length > 0) {
     searchControl.execute(q);
    }

  }, true);

  // return the querystring portion of the url
  function getQuery() {
    var url = '' + window.location;
    var queryStart = url.indexOf('?') + 1;
    if (queryStart > 0) {
        var parts = url.substr(queryStart).split('&');
        for(var i =0; i < parts.length; i++) {
            if (parts[i].length > 2 && parts[i].substr(0,2) == 'q=') {
                return decodeURIComponent(parts[i].split('=')[1].replace(/\+/g,' '));
            }
        }
    }
    return '';
  }

