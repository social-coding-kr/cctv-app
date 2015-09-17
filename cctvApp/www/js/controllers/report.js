/* global myLat */
/* global myLng */

'use strict';
angular.module('starter.controllers')

.config(function($compileProvider){
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|data):/);
})

// 신고시에 사용할 변수들에 대한 정의
.controller('generalReportCtrl', function($rootScope, $window, $cordovaToast, $location) {
  // 현재위치를 나타내는 변수들
  var ex_lat = myLat;
  var ex_lng = myLng;
  // 신고화면 도중 신고화면으로 넘어갈 때 바꿔줘야할 변수
  $rootScope.reportClicked = false; // true : 하단 등록확인버튼 보임, false : 하단 등록버튼 안보임
  // 사진 관련 변수들
  $rootScope.basicPhoto = 'img/basicHangBoard.PNG';
  $rootScope.basicCctvPhoto = 'img/basicCctvPhoto.PNG';
  $rootScope.cctvPhotoTaken = false;
  $rootScope.lastCctvPhoto = $rootScope.basicCctvPhoto;
  $rootScope.lastHangBoardPhoto = $rootScope.basicPhoto;
  // 목적 관련 변수들
  $rootScope.purposeForReport = [{text :'방범용', checked : false}, 
                                {text :'재난 방지용', checked : false}];
  // 등록 확정시 post service로 보낼 변수들
  $rootScope.cctvReportingInfo = {latitude: myLat, 
                                  longitude: myLng, 
                                  purpose: '', 
                                  cctvImage: $rootScope.lastCctvPhoto, 
                                  noticeImage: $rootScope.lastHangBoardPhoto, 
                                  userId: 'TestingId_ClubSandwich'};
  // 등록 및 취소 버튼 클릭 함수
  $rootScope.registerButtonClicked = function() {
    // 변수들 초기화
    $rootScope.cctvPhotoTaken = false;
    $rootScope.lastCctvPhoto = $rootScope.basicCctvPhoto;
    $rootScope.lastHangBoardPhoto = $rootScope.basicPhoto;
    if($rootScope.purposeForReport !== undefined) {
      for(var i = 0; i < $rootScope.purposeForReport.length; i++) {
        $rootScope.purposeForReport[i].checked = false;
      }
    }
    // 신고 확정됨
    $rootScope.reportClicked = false;
    // 등록 확정 토스트 메세지
    if($window.plugins != undefined) {
      $cordovaToast
      .show('성공적으로 등록되었습니다', 'long', 'bottom')
      .then(function(success) {
        // success
      }, function (error) {
        // error
      });
    } else {
      alert('성공적으로 등록되었습니다');
    }
    // 화면 전환
    $location.path('/app/map');
    $rootScope.AnotherPageToMap();
  }
  $rootScope.cancellButtonClicked = function() {
    // 변수들 초기화
    $rootScope.cctvPhotoTaken = false;
    $rootScope.lastCctvPhoto = $rootScope.basicCctvPhoto;
    $rootScope.lastHangBoardPhoto = $rootScope.basicPhoto;
    if($rootScope.purposeForReport !== undefined) {
      for(var i = 0; i < $rootScope.purposeForReport.length; i++) {
        $rootScope.purposeForReport[i].checked = false;
      }
    }
    // 신고 취소됨
    $rootScope.reportClicked = false;
    // 토스트 메세지
    if($window.plugins != undefined) {
      $cordovaToast
      .show('등록을 취소했습니다', 'long', 'bottom')
      .then(function(success) {
        // success
      }, function (error) {
        // error
      });
    } else {
      alert('등록을 취소했습니다');
    }
    // 화면 전환
    $location.path('/app/map');
    $rootScope.AnotherPageToMap();
  }
})

// 지도화면에서 cctv 사진을 찍는 화면으로 넘어갈 때 사용하는 컨트롤러
.controller('mapToTakePictureViewCtrl', function($scope, $location, $rootScope, $window, $cordovaToast) {
  // 등록버튼1 클릭
  $scope.registerButton1Clicked = function() {
    // 사진 찍는 화면으로 화면 전환
    $location.path('app/takePicture');
  }
  // 등록버튼2 클릭
  $scope.cancellButton1Clicked = function() {
    $rootScope.cancellButtonClicked();
  }
})

// cctv 및 안내판을 찍을 때 사용하는 컨트롤러
.controller('takePictureCtrl', function($scope, $ionicPopup, $window, $location, $rootScope, soc) {
  // 카메라 옵션
  var options = {
                  quality: 50,
                  allowEdit: false,
                  targetWidth: 100,
                  targetHeight: 100,
                  saveToPhotoAlbum: false
                };
  // 네이티브 카메라를 불러오는 함수
  $scope.getPhoto = function() {
    if($window.plugins != undefined) {
      // 카메라 옵션
      var COptions = {
        quality: 100,
        targetWidth: 240,
        targetHeight: 240, 
        saveToPhotoAlbum: false,
        //allowEdit        : true,
				//destinationType  : navigator.camera.DestinationType.DATA_URL, lcs
        destinationType  : navigator.camera.DestinationType.DATA_URL,
				sourceType       : navigator.camera.PictureSourceType.CAMERA, 
				correctOrientation: true
      };
      // 사진을 찍는 함수
      navigator.camera.getPicture(
        function(imageURI) {
          //soc.log(imageURI);
          //alert("Length: " + imageURI.length);
          if($rootScope.lastCctvPhoto === $rootScope.basicCctvPhoto) {
            $rootScope.cctvPhotoTaken = true;
            //$rootScope.lastCctvPhoto = "data:image/png;base64,"+imageURI; lcs
            //$rootScope.lastCctvPhoto = "data:image/png,"+imageURI;
            $rootScope.lastCctvPhoto = imageURI;
            //alert($rootScope.lastCctvPhoto);
            soc.log(JSON.stringify($rootScope.lastCctvPhoto));
            $scope.$apply();
          } else {
            //$rootScope.lastHangBoardPhoto = "data:image/png;base64,"+imageURI; lcs
			$rootScope.lastHangBoardPhoto = imageURI;
          }
        }, function(err) {
          soc.log(err);
        }, COptions);
        
    } else {
      
      alert('카메라 기능을 불러올 수 없는 기기입니다.');
      $rootScope.cctvPhotoTaken = true; // 사진이 찍혔다고 가정하고 다음 step으로 넘어감
      
    }
  };
  // 사진의 위치를 알려주는 함수(비활성화 버튼)
  $scope.photoLocation = function() {
    alert('기본 cctv :' + $scope.basicCctvPhoto);
    alert('최근 cctv :' + $rootScope.lastCctvPhoto);
    alert('안내판 :' + $rootScope.lastHangBoardPhoto);
  };
  // 안내판 유무에 관한 팝업, 안내판이 있다면 네이티브 카메라를 불러오는 함수
  $scope.hasHangBoard = function() {
    $ionicPopup.show({title :'CCTV 주변에 안내판이 설치되어 있습니까?',
                      buttons: [{ 
                        text: '네, 안내판을 찍습니다.',
                        type: 'button-positive',
                        onTap: function(e) {
                          $scope.getPhoto();
                          $location.path('/app/selectPurpose');
                        }
                      }, {
                        text: '안 보입니다.',
                        type: 'button-default',
                        onTap: function(e) {
                          $location.path('/app/confirmReport');
                        }
                      }]
                      });
  };
})

// 목적선택화면에 사용하는 컨트롤러
.controller('selectPurposeCtrl', function($rootScope, $scope, $location) {
  // 등록 확정화면으로 이동/목적을 설정
  $scope.select = function() {
    $location.path('/app/confirmReport');
  }
})

// 등록확정화면에 사용하는 컨트롤러
.controller('confirmReportCtrl', function($rootScope, $scope, $http) {
  // 현재위치를 나타내는 변수들
  var ex_lat = myLat;
  var ex_lng = myLng;

  // 등록 확정시 post service로 보낼 변수들 갱신
  $rootScope.cctvReportingInfo = {latitude: ex_lat, 
                                  longitude: ex_lng, 
                                  purpose: $rootScope.purpose, //undefined
                                  cctvImage: $rootScope.lastCctvPhoto, 
                                  noticeImage: $rootScope.lastHangBoardPhoto, 
                                  userId: 'TestingId_ClubSandwich'};
								  

								  
							
// Create Base64 Object
var Base64={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var n,r,i,s,o,u,a;var f=0;e=Base64._utf8_encode(e);while(f<e.length){n=e.charCodeAt(f++);r=e.charCodeAt(f++);i=e.charCodeAt(f++);s=n>>2;o=(n&3)<<4|r>>4;u=(r&15)<<2|i>>6;a=i&63;if(isNaN(r)){u=a=64}else if(isNaN(i)){a=64}t=t+this._keyStr.charAt(s)+this._keyStr.charAt(o)+this._keyStr.charAt(u)+this._keyStr.charAt(a)}return t},decode:function(e){var t="";var n,r,i;var s,o,u,a;var f=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(f<e.length){s=this._keyStr.indexOf(e.charAt(f++));o=this._keyStr.indexOf(e.charAt(f++));u=this._keyStr.indexOf(e.charAt(f++));a=this._keyStr.indexOf(e.charAt(f++));n=s<<2|o>>4;r=(o&15)<<4|u>>2;i=(u&3)<<6|a;t=t+String.fromCharCode(n);if(u!=64){t=t+String.fromCharCode(r)}if(a!=64){t=t+String.fromCharCode(i)}}t=Base64._utf8_decode(t);return t},_utf8_encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var n=0;n<e.length;n++){var r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r)}else if(r>127&&r<2048){t+=String.fromCharCode(r>>6|192);t+=String.fromCharCode(r&63|128)}else{t+=String.fromCharCode(r>>12|224);t+=String.fromCharCode(r>>6&63|128);t+=String.fromCharCode(r&63|128)}}return t},_utf8_decode:function(e){var t="";var n=0;var r=c1=c2=0;while(n<e.length){r=e.charCodeAt(n);if(r<128){t+=String.fromCharCode(r);n++}else if(r>191&&r<224){c2=e.charCodeAt(n+1);t+=String.fromCharCode((r&31)<<6|c2&63);n+=2}else{c2=e.charCodeAt(n+1);c3=e.charCodeAt(n+2);t+=String.fromCharCode((r&15)<<12|(c2&63)<<6|c3&63);n+=3}}return t}}

// Define the string
var string = 'Hello World!';

// Encode the String
var encodedString = Base64.encode(string);
console.log(encodedString); // Outputs: "SGVsbG8gV29ybGQh"

// Decode the String
var decodedString = Base64.decode(encodedString);
console.log(decodedString); // Outputs: "Hello World!"

var result;
getFileBlob($rootScope.cctvReportingInfo.cctvImage, result);

  // 등록 확정시
  $scope.registerButton2Clicked = function() {
    // 신고선택 변수(reportClicked) 초기화 및 화면전환
	
    //$rootScope.registerButtonClicked();
  };
  // 등록 취소시
  $scope.cancellButton2Clicked = function() {
    // 신고선택 변수(reportClicked) 초기화 및 화면전환
    $rootScope.cancellButtonClicked();
  };
  
});