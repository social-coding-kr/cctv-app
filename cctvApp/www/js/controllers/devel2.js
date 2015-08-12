'use strict';
angular.module('starter.controllers')

.controller('DevelCtrl2', function($scope, soco) {
  $scope.test_button2_text = '눌러봐'; // 초기값 

  $scope.test_button2_click = function() {
    soco.log("개발자용2 화면에서 로그를 남겼습니다. javascript에서 string 줄바꿈은 도대체 어떻게 하는 걸까요?");

  }
  

})
