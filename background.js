

    document.addEventListener('DOMContentLoaded', function() {
		var works = function(){
			chrome.storage.sync.get('watchList', function (result) {
		          if(typeof result.watchList == String){
		            JSON.parse(result.watchList);
		          }
		          alert(result.watchList);
			});
		};

    });

