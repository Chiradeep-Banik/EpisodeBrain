var episodeBrain = angular.module('episodeBrain', []);

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




    $scope.watchList = {};



    $scope.addWebsite = function(){
      getCurrentTabUrl(function(url) {
        var currentURL = url;
        var addButton = $("#add");
        var website = {};

          var cleanURL = getCleanURL(currentURL);

          if(!isInWatchList(cleanURL)){

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

      // Most methods of the Chrome extension APIs are asynchronous. This means that
      // you CANNOT do something like this:
      //
      // var url;
      // chrome.tabs.query(queryInfo, function(tabs) {
      //   url = tabs[0].url;
      // });
      // alert(url); // Shows "undefined", because chrome.tabs.query is async.
    }

    function isInWatchList(url){
      for(website in $scope.watchList){
        if(website.name == url){
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
          $scope.watchList = result.watchList;
          $scope.$apply();
      });
    }

    function addToWatchList(url){

    }

    $scope.saveChanges = function () {
        chrome.storage.sync.set({'watchList': $scope.watchList}, function() {
          console.log('Settings saved');
        });
      
    }

    function getEpisodeFromPage(){
      var strings = $("h1,h2");

      strings.each(function(idx){
        var content = strings[idx].innerHTML;

        if(content.includes("episode")){
          return content;
        }
      });

      return false;
    }

    function startCounter(){

    }

    function getCleanURL(fullUrl){
      var cleanURL = fullUrl.split("/"); 

      return cleanURL[2];
    }

    function isSelectedWebsite(){
      getCurrentTabUrl(function(url){
        var currentURL = getCleanURL(url);
         console.log(watchList.indexOf(currentURL) > -1);
      });
    }


    //document.addEventListener('DOMContentLoaded', function() {
    //});

}]);


