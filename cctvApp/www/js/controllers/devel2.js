'use strict';
angular.module('starter.controllers')

.controller('DevelCtrl2', function($scope, soc, $cordovaToast, $location, $window) {
  $scope.test_button2_text = '눌러봐'; // 초기값 

  $scope.test_button2_click = function() {
    soc.log("개발자용2 화면에서 로그를 남겼습니다.");

  $cordovaToast
    .show('Here is a message', 'long', 'bottom')
    .then(function(success) {
      // success
    }, function (error) {
      // error
    });

      $location.path('/app/map');
      $window.location.reload();
  }
  

})
