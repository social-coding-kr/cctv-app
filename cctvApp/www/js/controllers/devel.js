'use strict';
angular.module('starter.controllers')

// Devloper용 Controller
// devel.html에서 사용한다
.controller('DevelCtrl', function($scope, $http) {
  $scope.test_button1_text = '눌러봐'; // 초기값 

  $scope.test_button1_click = function() {
    $scope.test_button1_text = "잘했어";  // 클릭했을때 변경

  $http.get("http://147.46.215.152:8099/cctv/validate?latitude=1&longitude=1")
    .then(function(response) {
      $scope.cctvs = response.data.cctvs;
      $scope.applog(JSON.stringify(response));      
    }, function(response) {
      $scope.applog(JSON.stringify(response));      
    });
  };
})