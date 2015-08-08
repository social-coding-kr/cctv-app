'use strict';
angular.module('starter.controllers')

// Devloper용 Controller
// devel.html에서 사용한다
.controller('DevelCtrl', function($scope, $http) {
  $scope.test_button1_text = 'Rest API 테스트'; // 초기값 

  $scope.test_button1_click = function() {
    
  $http.get($scope.server.main_url + "cctv/validate?latitude=1&longitude=1")
    .then(function(response) {
      $scope.cctvs = response.data.cctvs;
      $scope.applog(JSON.stringify(response));      
      $scope.test_button1_text = "Rest API 성공";  // 클릭했을때 변경      
    }, function(response) {
      $scope.applog(JSON.stringify(response));      
      $scope.test_button1_text = "Rest API 실패";  // 클릭했을때 변경      
    });
  };
})