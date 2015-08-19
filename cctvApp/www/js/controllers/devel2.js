'use strict';
angular.module('starter.controllers')

.controller('DevelCtrl2', function($scope, soc, $cordovaToast, $location, $window, $http) {
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
  
  $scope.latlngResult = "none";
  
  $scope.get_latlng = function() {

    var apiUrl = "http://openapi.map.naver.com/api/geocode";
    var request = "?key=c3cdd592f9b2a05e8430c939808ba40b&encoding=utf-8&coord=latlng&output=json&query=경기도 성남시 분당구 정자동 178-1";
    request = apiUrl + request + "&callback=JSON_CALLBACK";     
    
    $http.jsonp(request)
      .then(function(response) {
          $scope.latlngResult = JSON.stringify(response);
        }, function(response) {
          $scope.latlngResult = "error";
          soc.log("error: " + JSON.stringify(response));
        }
      );
      
    /* 아래 방식으로는 크로스도메인 오류로 데이터를 받지 못한다
    $http.get(apiUrl + request)
      .then(function(response) {
          $scope.latlngResult = JSON.stringify(response);
        }, function(response) {
          $scope.latlngResult = "error";
          soc.log("error: " + JSON.stringify(response));
        }
      );
    */
  }
})
