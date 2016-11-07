var watchList = {};



chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {

  	if(watchList.websites == undefined){
      chrome.storage.sync.get('watchList', function (result) {
          if(typeof result.watchList == String){
            result.watchList = JSON.parse(result.watchList);
          }
          if(result.watchList == undefined){
            result.watchList = {
            	websites:{}
            };
          }
          watchList = result.watchList;
      });
  	}

	

	chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
	  chrome.tabs.sendMessage(tabs[0].id, {action: "get_DOM"}, function(response) {
				  var cleanURL = getCleanURL(tabs[0].url);
				  var parsedDOM = parseDOM(response);
			      var isConfirmedURL = checkUrl(cleanURL);

			      //Website is in tracker
			      if(isConfirmedURL){
			        //Show needs to be added to tracker
			        findAndAddShow(parsedDOM);
			      }
			  
	  });
	});


  }
});

function findAndAddShow(elDom){
      console.log("counting down...");
      setTimeout(function(){
      	//Find H1, H2 elements and parse text
        //alert("I will find your elements dude.");



      }, "5000"/*300000*/);
}

function parseDOM(preDOM){
    var parser = new DOMParser()
    var el = parser.parseFromString(preDOM, "text/xml");
    return el;
}

function checkUrl(cleanURL){
    return watchList.websites[cleanURL] != undefined;
} 

function getCleanURL(fullUrl){
      var cleanURL = fullUrl.split("/"); 

      return cleanURL[2];
}


function getCurrentTabUrl(callback) {
  // Query filter to be passed to chrome.tabs.query - see
  // https://developer.chrome.com/extensions/tabs#method-query
  var queryInfo = {
    active: true,
    currentWindow: true
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    // chrome.tabs.query invokes the callback with a list of tabs that match the
    // query. When the popup is opened, there is certainly a window and at least
    // one tab, so we can safely assume that |tabs| is a non-empty array.
    // A window can only have one active tab at a time, so the array consists of
    // exactly one tab.
    var tab = tabs[0];

    // A tab is a plain object that provides information about the tab.
    // See https://developer.chrome.com/extensions/tabs#type-Tab
    var url = tab.url;

    // tab.url is only available if the "activeTab" permission is declared.
    // If you want to see the URL of other tabs (e.g. after removing active:true
    // from |queryInfo|), then the "tabs" permission is required to see their
    // "url" properties.
    console.assert(typeof url == 'string', 'tab.url should be a string');

    callback(url);
  });
}



