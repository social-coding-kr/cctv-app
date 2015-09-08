'use strict';
angular.module('starter.controllers')

.config(function($compileProvider){
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})

// 신고시에 사용할 변수들에 대한 정의
.controller('generalReportCtrl', function($rootScope, $window, $cordovaToast, $location) { 
  // 신고화면 도중 신고화면으로 넘어갈 때 바꿔줘야할 변수
  $rootScope.reportClicked = false; // true : 하단 등록확인버튼 보임, false : 하단 등록버튼 안보임
  // 사진 및 사진 화면 관련 변수들
  $rootScope.isTakePictureView = false;
  $rootScope.basicPhoto = 'https://cloud.githubusercontent.com/assets/13172195/9220177/5be109da-411b-11e5-948d-34937938703f.PNG';
  $rootScope.basicCctvPhoto = 'https://cloud.githubusercontent.com/assets/13172195/9313406/cb8a09a8-455d-11e5-93fc-923d1d054b2e.PNG';
  $rootScope.cctvPhotoTaken = false;
  $rootScope.lastCctvPhoto = $rootScope.basicCctvPhoto;
  $rootScope.lastHangBoardPhoto = $rootScope.basicPhoto;
  // 목적 관련 변수들
  $rootScope.purposeForReport = [{text :'방범용', checked : false}, 
                                {text :'재난 방지용', checked : false}];
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
    $rootScope.loadingFromReport();
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
    $rootScope.isTakePictureView = false;
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
    $rootScope.loadingFromReport();
  }
})

// 지도화면에서 cctv 사진을 찍는 화면으로 넘어갈 때 사용하는 컨트롤러
.controller('mapToTakePictureViewCtrl', function($scope, $location, $rootScope, $window, $cordovaToast) {
  // 등록버튼1 클릭
  $scope.registerButton1Clicked = function() {
    // 사진 찍는 화면으로 화면 전환
    $rootScope.isTakePictureView = true;
    $location.path('app/takePicture');
  }
  // 등록버튼2 클릭
  $scope.cancellButton1Clicked = function() {
    $rootScope.cancellButtonClicked();
  }
})

// cctv 및 안내판을 찍을 때 사용하는 컨트롤러
.controller('takePictureCtrl', function($scope, Camera, $ionicPopup, $window, $location, $rootScope, soc) {
  // 네이티브 카메라를 불러오는 함수
  $scope.getPhoto = function() {
    if($window.plugins != undefined) {
      Camera.getPicture().then(function(imageURI) {
        console.log(imageURI);
        if($rootScope.lastCctvPhoto === $rootScope.basicCctvPhoto) {
          $rootScope.lastCctvPhoto = imageURI;
          $rootScope.cctvPhotoTaken = true;
        } else {
          $rootScope.lastHangBoardPhoto = imageURI;
        }
      }, function(err) {
        soc.log(err);
      }, {
        quality: 100,
        targetWidth: 320,
        targetHeight: 320, 
        saveToPhotoAlbum: false
      });
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
                          // 더 이상 cctv를 찍는 화면이 아님
                          $rootScope.isTakePictureView = false;
                        }
                      }, {
                        text: '안 보입니다.',
                        type: 'button-default',
                        onTap: function(e) {
                          $location.path('/app/confirmReport');
                          // 더 이상 cctv를 찍는 화면이 아님
                          $rootScope.isTakePictureView = false;
                        }
                      }]
                      });
  };
})
// 카메라 팩토리
.factory('Camera', ['$q', function($q) {
    return {
        getPicture: function(options) {
            var q = $q.defer();
            navigator.camera.getPicture(function(result) {
            q.resolve(result);
            }, function(err) {
                q.reject(err);
            }, options);
            return q.promise;
        }
    }
}])

// 목적선택화면에 사용하는 컨트롤러
.controller('selectPurposeCtrl', function($rootScope, $scope, $location) {
  // 등록 확정화면으로 이동하는 함수
  $scope.select = function() {
    $location.path('/app/confirmReport');
  }
})

// 등록확정화면에 사용하는 컨트롤러
.controller('confirmReportCtrl', function($rootScope, $scope, $location, $timeout, $cordovaToast, $window) {
  // 등록 확정시
  $scope.registerButton2Clicked = function() {
    // 신고선택 변수(reportClicked) 초기화 및 화면전환
    $rootScope.registerButtonClicked();
  };
  // 등록 취소시
  $scope.cancellButton2Clicked = function() {
    // 신고선택 변수(reportClicked) 초기화 및 화면전환
    $rootScope.cancellButtonClicked();
  };
});