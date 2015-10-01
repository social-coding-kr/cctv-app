/* global myLat */
/* global myLng */

'use strict';
angular.module('starter.controllers')

.config(function($compileProvider){
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel|data):/);
})

// 신고시에 사용할 변수들에 대한 정의
.controller('generalReportCtrl', function($rootScope, $window, $cordovaToast, $location, soc) {
  // UserId
  $rootScope.userId = 'TestingId_ClubSandwich';
  // 현재 주소를 나타내는 변수
  $rootScope.currentAddress = soc.currentAddress;
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
                                  userId: $rootScope.userId};
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
  // 현재위치를 나타내는 변수들
  $scope.currentLat = myLat;
  $scope.currentLng = myLng;
  
  // 좌표주소변환
  var currentCoord = $scope.currentLng + "," + $scope.currentLat;
  $scope.pointToAdress = function(currentCoord) {
    soc.getAdressFromPoint(currentCoord);
    // soc.log("currentCoord :" + currentCoord);
  }
  
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
        //allowEdit        : true, // 사용자의 직접적인 편집 불허
        destinationType  : navigator.camera.DestinationType.NATIVE_URI,
				sourceType       : navigator.camera.PictureSourceType.CAMERA, 
				correctOrientation: true
      };
      // 사진을 찍는 함수
      navigator.camera.getPicture(
        function(imageURI) {
          if($rootScope.lastCctvPhoto === $rootScope.basicCctvPhoto) {
            $rootScope.cctvPhotoTaken = true;
            $rootScope.lastCctvPhoto = imageURI;
            $scope.$apply();
          } else {
			      $rootScope.lastHangBoardPhoto = imageURI;
			      $scope.$apply();
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
    $scope.pointToAdress(currentCoord);
    $ionicPopup.show({title :'CCTV 안내판을 찍겠습니까?',
                      buttons: [{ 
                        text: '<i class="icon ion-checkmark"></i>',
                        type: 'button-balanced',
                        onTap: function(e) {
                          $scope.getPhoto();
                          $location.path('/app/selectPurpose');
                        }
                      }, {
                        text: '<i class="icon ion-close"></i>',
                        type: 'button-assertive',
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
.controller('confirmReportCtrl', function($rootScope, $scope, $window, $cordovaFile, $http, soc) {
  // 현재위치를 나타내는 변수들
  var ex_lat = myLat;
  var ex_lng = myLng;

  // 등록 확정시 post service로 보낼 변수들 갱신
  $rootScope.cctvReportingInfo = {latitude: ex_lat, 
                                  longitude: ex_lng, 
                                  purpose: $rootScope.purpose, //undefined
                                  cctvImage: $rootScope.lastCctvPhoto, 
                                  noticeImage: $rootScope.lastHangBoardPhoto, 
                                  userId: $rootScope.userId};
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

  // CAMERA로부터 전달받은 NATIVE FILE PATH 를 전달하여 바이너리 데이터를 가져옮.
  $scope.CCTV_IMAGE_BINARY_DATA = undefined;
  $scope.CCTV_IMAGE_LOADING_STATUS = undefined;
  $scope.NOTICE_IMAGE_BINARY_DATA = undefined;
  $scope.NOTICE_IMAGE_LOADING_STATUS = undefined;

      if ($rootScope.lastCctvPhoto !== undefined)
      {
        var cctv_fullpath = $rootScope.lastCctvPhoto;
        var cctv_file_name = cctv_fullpath.replace(/^.*[\\\/]/, '');
        var cctv_file_path = cctv_fullpath.split('/' + cctv_file_name)[0];
        
        $cordovaFile.readAsBinaryString(cctv_file_path, cctv_file_name).then(
            function (success_file_binary)
            {
              $scope.CCTV_IMAGE_LOADING_STATUS = 'SUCCESS';
              $scope.CCTV_IMAGE_BINARY_DATA = success_file_binary;
            },
            function (error)
            {
              $scope.CCTV_IMAGE_LOADING_STATUS = 'ERROR';
              $scope.CCTV_IMAGE_BINARY_DATA = undefined;
              // file_path + ' ,' + file_name + ' error : '+error;
            }
        );
      }

      if ($rootScope.lastHangBoardPhoto !== undefined)
      {
        var notice_fullpath = $rootScope.lastHangBoardPhoto;
        var notice_file_name = notice_fullpath.replace(/^.*[\\\/]/, '');
        var notice_file_path = notice_fullpath.split('/' + notice_file_name)[0];

        $cordovaFile.readAsBinaryString(notice_file_path, notice_file_name).then(
            function (success_file_binary)
            {
              $scope.NOTICE_IMAGE_LOADING_STATUS = 'SUCCESS';
              $scope.NOTICE_IMAGE_BINARY_DATA = success_file_binary;
            },
            function (error)
            {
              $scope.NOTICE_IMAGE_LOADING_STATUS = 'ERROR';
              $scope.NOTICE_IMAGE_BINARY_DATA = undefined;
              // file_path + ' ,' + file_name + ' error : '+error;
            }
        );
      }

  $scope.registerUpload = function(){
    var uploadUrl = "http://147.46.215.152:8099/cctv";/*9030 for test, 8099/cctv for register*/
    var formdata = new FormData();
    formdata.append('latitude', ex_lat);
    formdata.append('longitude', ex_lng);
    formdata.append('purpose', $rootScope.purpose);
    formdata.append('cctvImage', $scope.CCTV_IMAGE_BINARY_DATA);
    formdata.append('noticeImage', $scope.NOTICE_IMAGE_BINARY_DATA);
    formdata.append('userId', $rootScope.userId);

    $http.post(uploadUrl, formdata, {
      transformRequest: angular.identity,
      headers: {'Content-Type': undefined}
    })
    .success(function(response){
      soc.log("등록 성공 :" + formdata);
      soc.log("response :" + JSON.stringify(response));
    })
    .error(function(response){
      soc.log("등록 실패 :" + formdata);
      soc.log("response :" + JSON.stringify(response));
    });
  }
});
