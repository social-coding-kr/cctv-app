'use strict';
angular.module('starter.controllers') 

// Devloper용 Controller
// devel.html에서 사용한다
.controller('DevelCtrl', function($scope, $http, 
  $cordovaFile, $cordovaFileTransfer, $cordovaFileOpener2) {
    
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

  $scope.app_installed = "앱 설치확인";
  $scope.check_installed = function() {
    $cordovaFileOpener2.appIsInstalled('com.socialcoding.cctvapp').then(function(res) {
      if (res.status === 0) {
          $scope.app_installed = "설치안됨";
      } else {
          $scope.app_installed = "설치됨";
      }
    });    
  }

  $scope.uninstall_apk = function() {
    $cordovaFileOpener2.uninstall('com.socialcoding.cctvapp').then(function() {
      $scope.applog("uninstall Success");
    }, function(error) {
      $scope.applog("uninstall Failed. " + error.code);
    });
  }

  $scope.update_apk = function(devel_name) {
    var target = "cctvApp.apk"
    var uri = encodeURI("http://147.46.215.152:9000/" + devel_name + "/" + target);
    $scope.applog(cordova);
    $scope.applog(cordova.file.externalDataDirectory);
    var localPath = cordova.file.externalDataDirectory + target;
    
    $scope.applog("from: " + uri);
    $scope.applog("to: " + localPath);
    
    function webintent_on_success() { 
      $scope.applog("Success Android Intent");
    }

    function webintent_on_error(error) {
      $scope.applog('Failed to open URL via Android Intent.' + error.code);
    }

    function install_apk(entry) {
      $cordovaFileOpener2.open(
        entry.toURL(),
        'application/vnd.android.package-archive'
        ).then(webintent_on_success, webintent_on_error);
    }

    function download_on_error(error) {
      $scope.applog('Failed Download File.' + error.code);
    }
    
    $scope.applog("4444");    
    
    $cordovaFileTransfer.download(uri, localPath, {}, false)
      .then(
        install_apk,
        download_on_error
      );
    
    $scope.applog("5555");        
  }

})