var episodeBrain = angular.module('episodeBrain', ['xeditable']);




episodeBrain.controller('episodeBrainController', ['$scope', '$window', function($scope, $window) {
    window.$scope = $scope;
  
   //Let chrome open links from extension
   $('body').on('click', 'a', function(){
      chrome.tabs.create({url: $(this).attr('href')});
      return false;
   });


    /*

    SAMPLE DATASET 
    _______________

    var episodeBrain = {
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
    };


    */


    $scope.addWebsite = function(){
      getCurrentTabUrl(function(url) {
        var website = {};
        var currentURL = url;
        var addButton = $("#add");
        var cleanURL = $scope.getCleanURL(currentURL);

        if(!$scope.isInWatchList(cleanURL)){

          website["name"] = cleanURL;
          website.shows = {};

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


    $scope.loadWatchList();


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
    }

    $scope.removeShow = function(website, show){
      var websiteName = website.name;
      var showName = show.name;


      delete $scope.watchList.websites[websiteName].shows[showName];

      $scope.saveChanges();

      $scope.$apply();
    }

    $scope.removeWebsite = function(website){
      var websiteName = website.name;

      delete $scope.watchList.websites[websiteName];

      $scope.saveChanges();
      $scope.$apply();
    }

    $scope.isEmpty = function(){
      if($scope.watchList){
        return angular.equals($scope.watchList.websites, {});
      }
    }

    $scope.changeEditState = function(newState, website){
      $scope.watchList.websites[website].editing = newState;
    };

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


    //On extension load...
    //$scope.loadWatchList();

}]);


episodeBrain.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; 

});
