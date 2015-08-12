'use strict';
angular.module('starter.controllers') 

// Devloper용 Controller
// devel.html에서 사용한다
.controller('DevelCtrl', function($scope, soc, $http, 
  $cordovaFile, $cordovaFileTransfer, $cordovaFileOpener2, $cordovaInAppBrowser) {
    
    
    // navigator object 확인    
    //soc.log("navigator.geolocation : " + JSON.stringify(navigator.geolocation));
    //soc.log("navigator.camera : " + JSON.stringify(navigator.camera));
    
    
  $scope.test_button1_text = 'Rest API 테스트'; // 초기값 

  $scope.test_button1_click = function() {

    $http.get(soc.server.main_url + "cctv/validate?latitude=1&longitude=1")
      .then(function(response) {
        $scope.cctvs = response.data.cctvs;
        soc.log(JSON.stringify(response));      
        $scope.test_button1_text = "Rest API 성공";  // 클릭했을때 변경      
      }, function(response) {
        soc.log(JSON.stringify(response));      
        $scope.test_button1_text = "Rest API 실패";  // 클릭했을때 변경      
      });
    } 

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
      soc.log("uninstall Success");
    }, function(error) {
      soc.log("uninstall Failed. " + error.code);
    });
  }

  $scope.update_apk = function(devel_name) {
    var target = "cctvApp.apk"
    var uri = encodeURI("http://147.46.215.152:9000/" + devel_name + "/" + target);
    soc.log(cordova);
    soc.log(cordova.file.externalDataDirectory);
    var localPath = cordova.file.externalDataDirectory + target;
    
    soc.log("from: " + uri);
    soc.log("to: " + localPath);
    
    function webintent_on_success() { 
      soc.log("Success Android Intent");
    }

    function webintent_on_error(error) {
      soc.log('Failed to open URL via Android Intent.' + error.code);
    }

    function install_apk(entry) {
      $cordovaFileOpener2.open(
        entry.toURL(),
        'application/vnd.android.package-archive'
        ).then(webintent_on_success, webintent_on_error);
    }

    function download_on_error(error) {
      soc.log('Failed Download File.' + error.code);
    }
    
    soc.log("4444");    
    
    $cordovaFileTransfer.download(uri, localPath, {}, false)
      .then(
        install_apk,
        download_on_error
      );
    
    soc.log("5555");        
  }

  $scope.open_web = function(url) {
    window.plugins.webintent.startActivity({
      action: window.plugins.webintent.ACTION_VIEW,
      url: url
    },
    function() {},
    function() {
      alert('Failed to open URL via Android Intent.');
      soc.log("Failed to open URL via Android Intent. URL: " + url)
    }
  );
    /*
      var options = {
      location: 'yes',
      clearcache: 'yes',
      toolbar: 'no'
    };
  
    $cordovaInAppBrowser.open(url, '_blank', options)
        .then(function(event) {
          soc.log("success");
        })
        .catch(function(event) {
          soc.log("success" + event.code);
        });


      $cordovaInAppBrowser.close();
*/
  }
})