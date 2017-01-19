var watchList = {};

chrome.runtime.onMessage.addListener(function(request, sender) {
  if (request.action == "getSource") {
    var parsedDOM = parseDOM(request.source);
    findAndAddShow(parsedDOM);
  }
});


chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
  if (changeInfo.status == 'complete') {
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

      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        chrome.tabs.sendMessage(tabs[0].id, {action: "get_DOM"}, function(response) {
            var cleanURL = getCleanURL(tabs[0].url);
            var parsedDOM = parseDOM(response);
            var isConfirmedURL = checkUrl(cleanURL);

            //Website is in tracker
            if(isConfirmedURL){

              //Show needs to be added to tracker
              chrome.tabs.executeScript(null, {
                file: "domgrabber.js"
              }, function() {
                // If you try and inject into an extensions page or the webstore/NTP you'll get an error
                if (chrome.runtime.lastError) {
                  logMessage('There was an error injecting script : \n' + chrome.runtime.lastError.message);
                }
              });
            }
        });
      });
  }
});

function findAndAddShow(elDom){
	getCurrentTabUrl(function(url){
	  var cleanURL = getCleanURL(url);

      setTimeout(function(){
      	//Find H1, H2 elements and parse text
        
        	var potentialTitles = elDom.querySelectorAll("h1, h2, title");

          switch (cleanURL){

            case "vumoo.li":
              var episodeName = elDom.querySelector(".movie_title > span").innerText;
              var episodeNumber = elDom.querySelector("li:not(.hidden) > span.season-info:not(.air-date)").innerText;

              saveShow(episodeName, episodeNumber, url, cleanURL);
            break;

            case "niter.co":
              var titleText = elDom.querySelector("title").innerText.trim();
              var episodeName = titleText.match("[^Watch ](?:(?! \\dx\\d (?![^Online])).)*")[0];
              var seasonInfo = titleText.match("(\\d+)(?:x)(\\d+)");
              var episodeNumber = "Season " + seasonInfo[1] + " Episode " + seasonInfo[2];

              saveShow(episodeName, episodeNumber, url, cleanURL);
            break;

            case "solarmovie.sc":
              var titleText = elDom.querySelector("li.active > span").innerText.trim();
              var episodeName = titleText.match(".*(?= \-)")[0];
              var seasonInfo = titleText.match("Season\\s\\d+")[0];
              var episodeInfo = elDom.querySelector(".episode-item.active").innerText.trim().match("Episode\\s\\d+")[0];

              var episodeNumber = seasonInfo + " " + episodeInfo;

              saveShow(episodeName, episodeNumber, url, cleanURL);
            break;

            default:
              var potentialTitles = elDom.querySelectorAll("h1, h2, title");

              for(index in potentialTitles){
                  var episodeContext = {};
                  var titleText = potentialTitles[index].innerText;
                  
                  if(titleText && titleText.includes("Episode")){

                    var text = potentialTitles[index].innerText;
                    var episodeName = text.trim().match("[^Watch](?:(?!Episode).)*")[0];
                    var episodeNumber = text.match("\\Episode(\\:?)(\\s\\d+)")[0];

                    saveShow(episodeName, episodeNumber, url, cleanURL);
                    return true;

                   } else {
                        logMessage("No mention of episode context: " + index.innerHTML);
                   }
              }
  		      

              logMessage("Need to investigate further...");

              //Alternative Approach
              if(elDom.querySelector("video") != null){
                  for(index in potentialTitles){
                        var episodeContext = {};
                        var text = potentialTitles[index].innerText;
                        //User is watching a video
                        episodeName = text.match("(?:[^Watch].*(?=\\s\\-))")[0].trim();
                        episodeNumber = elDom.querySelector(".episode-item.active").innerText.trim();

                        saveShow(episodeName, episodeNumber, url, cleanURL);
                        return true;
                        
                  }
              }
            } 

      }, "5000");



	});
}

function saveShow(episodeName, episodeNumber, url, cleanURL){
  if(episodeName != "" && episodeNumber != ""){
    logMessage("You're watching " + episodeName +", and you're on " + episodeNumber);

    var episodeContext = {};

    episodeContext.name = episodeName;
    episodeContext.episode = episodeNumber;
    episodeContext.url = url;

    if(watchList.websites[cleanURL].shows == undefined){
      watchList.websites[cleanURL].shows = {};
    }

    watchList.websites[cleanURL].shows[episodeName] = episodeContext;

    chrome.storage.sync.set({'watchList': watchList}, function() {
      logMessage('Settings saved');
    });
  }
}


function logMessage(message){
	console.log("EpisodeBrain log: " + message);
}


function parseDOM(preDOM){
    var parser = new DOMParser()
    var el = parser.parseFromString(preDOM, "text/html");
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



