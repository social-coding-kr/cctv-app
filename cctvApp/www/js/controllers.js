angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, $ionicPopup, $ionicPlatform, 
$location, $cordovaToast, $ionicHistory, $http, oauthService, soc, cctvReportFactory) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });
  
  $scope.$watch(function() {return $rootScope.facebook_data.picture; },
    function() {
      //var picture = eval($rootScope.facebook_data.picture);
      $scope.user_email = $rootScope.facebook_data.email;
      //$scope.user_profile = picture.url;
    }
  );
  
  $scope.user_email = 'please sign-in';
  $scope.user_profile = 'img/ionic.png';

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    //$scope.modal.show();
    oauthService.login();
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };
  
  // 신고하기버튼 click에 대한 bool값
  $rootScope.reportClicked = false;
  $rootScope.nowReportClicked = function() {
    $rootScope.reportClicked = true;
    return $rootScope.reportClicked;
  };
  $rootScope.nowReportUnclicked = function() {
    $rootScope.reportClicked = false;
    return $rootScope.reportClicked;    
  };
  
  //위치정보 제공 동의 팝업
  $scope.locationInfoConfirm = function() {
    cctvReportFactory.startReport();
    /*
    $ionicPopup.show({title :'<span class="cctv-app-font">위치정보 제공에 동의하십니까?</span>',
                      buttons: [{ 
                        text: '동의',
                        type: 'button-positive',
                        onTap: function(e) {
                          $rootScope.centerOnMe();
                          $rootScope.reportClicked = true;
                        }
                      }, {
                        text: '거부',
                        type: 'button-default',
                        onTap: function(e) {
                          $rootScope.reportClicked = false;
                        }
                      }]
                      });
    */
  }
  
  // 안드로이드 뒤로가기 버튼동작
  $rootScope.secondBackButton = false; // 두 번째 back button 클릭을 알려주는 변수
  $ionicPlatform.registerBackButtonAction(function() {
    if($location.url() === '/app/map') { // 홈 화면일 경우
      // 토스트로 종료를 예고할 경우
      if($rootScope.secondBackButton === true) { // 두 번째 back button 클릭일 경우
        navigator.app.clearCache();
        navigator.app.clearHistory();
        navigator.app.exitApp();
      } else {  
        // 종료 토스트 알려줌


        $cordovaToast
        .show('뒤로 버튼을 한번 더 누르시면 종료됩니다.', 'long', 'bottom')
        .then(function(success) {
          // success
        }, function (error) {
        // error
        });
        // 다음 touch가 두 번째 back button 클릭이 됨
        $rootScope.secondBackButton = true;
        $timeout(function(){$rootScope.secondBackButton = false;}, 2000);
      }
    } 
    // 신고화면에서 back button controll
    else if($location.url() === '/app/takePicture') { // takePicture.html에서 클릭 시
      // alert('등록화면값 true 지도화면으로 이동');
      $rootScope.cancellButtonClicked();
    } 
    // backButtonTest에서의 컨트롤
    else if($location.url() === '/app/backButtonTest') {
      alert('back button clicked');
    }
    // default controll
    else {
      // alert($ionicHistory.backTitle()); // 전 페이지를 alert message로 알려줌(디버깅 용도)
      if($ionicHistory.backTitle() === null || $ionicHistory.backTitle() === 'Home') { // 사이드메뉴에 있는 항목일 경우
        navigator.app.backHistory();
        $ionicHistory.clearHistory();
        // map으로 갈경우 앱상의 back button을 없애줌
        $rootScope.AnotherPageToMap();
      } else {
        navigator.app.backHistory();
      }
    }
  }, 101);
})

.controller('PlaylistsCtrl', function($scope) {
  $scope.playlists = [
    { title: 'Reggae', id: 1 },
    { title: 'Chill', id: 2 },
    { title: 'Dubstep', id: 3 },
    { title: 'Indie', id: 4 },
    { title: 'Rap', id: 5 },
    { title: 'Cowbell', id: 6 }
  ];
})

.controller('PlaylistCtrl', function($scope, $stateParams) {
})

;
