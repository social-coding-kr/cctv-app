'use strict';
angular.module('starter.controllers')

.controller('DevelCtrl2', function($scope, soc, $cordovaToast, $location, $window, $http, $cordovaGeolocation) {
  $scope.test_button2_text = '눌러봐'; // 초기값 

  $scope.test_button2_click = function() {
    soc.log("개발자용2 화면에서 로그를 남겼습니다.");

    if (ionic.Platform.isWebView()) {
      soc.log("window.cordova: " + ($window.cordova != undefined));
      soc.log("window.cordova.plugins: " + ($window.cordova.plugins != undefined));
      if ($window.cordova.plugins)
        soc.log("window.cordova.plugins.diagnostic: " + ($window.cordova.plugins.diagnostic != undefined));
      soc.log("toast: " + ($window.plugins.toast != undefined));
      soc.log("camera: " + ($window.plugins.camera != undefined));
      soc.log("diagnostic: " + ($window.plugins.diagnostic != undefined));
      soc.log("HAHAHA: " + ($window.plugins.HAHAHA != undefined));

      //soc.log("isLocationEnabled exist: " + $window.plugins.diagnostic.isLocationEnabled != undefined);

      var Diagnostic = $window.cordova.plugins.diagnostic;
      
      Diagnostic.isLocationEnabled(
        function(enabled) {
          soc.log("isLocationEnabled: " + enabled === true);
        },
        function(argument) {
          soc.log("isLocationEnabled: " + "ERROR");
        }
      );
/*
      function isGpsEnabled() {
        Diagnostic.isGpsLocationEnabled(
          function(result) {
            if (result == false) {
              alert("사용할수 없음");
            
              //if ($scope.openConfigLocation === false) {
                //switchToLocationSettings();
              //}
            } else {
              alert("사용할수 있음");
            
              //$interval.cancel(intervalPromisse);
              //getLocation();
                        
            }
          }, function() {
            alert("error");
          });
      }
*/
/*
      function switchToLocationSettings() {
        Diagnostic.switchToLocationSettings(function(result) {
          if (result) {
            $scope.openConfigLocation = true;
          }
        }, function() {
          alert("error");
        });
      }

      function getLocation() {

        var watchOptions = {
          frequency: 100000,
          enableHighAccuracy: true
        };

        var watch = $cordovaGeolocation.watchPosition(watchOptions);
        watch.then(
          null,
          function(err) {
            console.log(err);
          },
          function(position) {
            var lat = position.coords.latitude;
            var lng = position.coords.longitude;
            //Application.setPosition([lat, lng]);
            alert("found " + lat + "," + lng);
            $ionicLoading.hide();
          });


      }
      
      isGpsEnabled();
      var intervalPromisse = $interval(function(){
          isGpsEnabled();
      },4000);      
*/      
    }
  }
  
  $scope.latlngResult = "none";

  $scope.get_latlng = function() {

    var apiUrl = ionic.Platform.isWebView() ? "http://openapi.map.naver.com/api/geocode" : "/api/geocode";
    //var apiUrl = "http://openapi.map.naver.com/api/geocode";
    //var apiUrl = "/api/geocode";
    var request = "?key=c3cdd592f9b2a05e8430c939808ba40b&encoding=utf-8&coord=latlng&output=json&query=경기도 성남시 분당구 정자동 178-1";
    request = apiUrl + request;

    /*
    $http.jsonp(request + "&callback=JSON_CALLBACK")
      .then(function(response) {
          $scope.latlngResult = JSON.stringify(response.data);
          soc.log(JSON.stringify(response.data));
        }, function(response) {
          $scope.latlngResult = "error";
          soc.log("error: " + JSON.stringify(response));
        }
      );
    */

    // 웹에서는 아래 방식으로는 크로스도메인 오류로 데이터를 받지 못한다

    $http.get(request)
      .then(function(response) {
        $scope.latlngResult = JSON.stringify(response);
      }, function(response) {
        $scope.latlngResult = "error";
        soc.log("error: " + JSON.stringify(response));
      });

  }
})
