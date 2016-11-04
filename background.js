var episodeBrain = angular.module('episodeBrain', []);

// Define the `PhoneListController` controller on the `phonecatApp` module
episodeBrain.controller('episodeBrainController', function episodeBrainController($scope) {
  $scope.watchList = watchList;
});