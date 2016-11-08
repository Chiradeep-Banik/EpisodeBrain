var episodeBrain = angular.module('episodeBrain', []);

var watchList = {};







// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {

//           console.log("this works");

//     if (request.action == "get_DOM"){


//       chrome.tabs.executeScript(null, {
//         file: "domgrabber.js"
//       }, function() {
//         // If you try and inject into an extensions page or the webstore/NTP you'll get an error
//         if (chrome.runtime.lastError) {
//           message.innerText = 'There was an error injecting script : \n' + chrome.runtime.lastError.message;
//         }
//       });

//     }
// });


episodeBrain.controller('episodeBrainController', ['$scope', function($scope) {
    window.$scope = $scope;

    window.onload = function(){
      $scope.loadWatchList();
    };


    /*var episodeBrain = {
        "websites": {
            "0" : {
                "name" : "ww7.watchdbz.xyz",
                "shows" : {
                  "0" : {
                    "name": "Naruto Shippuden",
                    "episode": "Episode 24"
                    "url": "http://www.crunchyroll.com/dragon-ball-super/episode-63-dont-disrespect-saiyan-cells-vegetas-heroic-battle-begins-722895"
                  },
                  "1" : {
                    "name": "Dragon Ball Z",
                    "episode": "Episode 30"
                  }
                }
            },
            "1" : {
                "name" : "www.crunchyroll.com",
                "shows" : {
                  "0" : {
                    "name": "Death Note",
                    "episode": "Episode 2"
                  },
                  "1" : {
                    "name": "7 Deadly Sins",
                    "episode": "Episode 300"
                  }
                }
            }
        }
    };*/


    $scope.addWebsite = function(){
      getCurrentTabUrl(function(url) {
        var currentURL = url;
        var addButton = $("#add");
        var website = {};

          var cleanURL = $scope.getCleanURL(currentURL);

          if(!$scope.isInWatchList(cleanURL)){

            website["name"] = cleanURL;

            if($scope.watchList.websites == undefined){
              $scope.watchList.websites = {};
            }

            $scope.watchList.websites[cleanURL] = website;

            $scope.saveChanges();

            $scope.$apply();

            console.log($scope.watchList);

          } else {

            console.log("Already in watch list!");

          }

      });
    }


    

    $scope.isInWatchList = function(url){
      for(website in $scope.watchList.websites){
          if($scope.watchList.websites[website].name == url){
            return true;
          } 
      }
      return false;
    }

    $scope.loadWatchList = function(){
      chrome.storage.sync.get('watchList', function (result) {
          if(typeof result.watchList == String){
            result.watchList = JSON.parse(result.watchList);
          }
          if(result.watchList == undefined){
            result.watchList = {};
          }
          $scope.watchList = result.watchList;
          $scope.$apply();
      });
    }

    $scope.saveChanges = function () {
        chrome.storage.sync.set({'watchList': $scope.watchList}, function() {
          console.log('Settings saved');
        });
      
    }


    function isSelectedWebsite(){
      getCurrentTabUrl(function(url){
        var currentURL = getCleanURL(url);
         console.log(watchList.indexOf(currentURL) > -1);
      });
    }

    $scope.getCleanURL = function(fullUrl){
      var cleanURL = fullUrl.split("/"); 

      return cleanURL[2];

    }


    $scope.addEpisode = function(){
      var strings = $("h1,h2");

      strings.each(function(idx){
        var content = strings[idx].text();

        if(content.includes("episode")){
          console.log(content);
        }
      });

      //console.log("nothing found dude");
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










    //document.addEventListener('DOMContentLoaded', function() {
    //});

}]);


