angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, $ionicPopup, $ionicPlatform, $location, $cordovaToast, $ionicHistory, $http, oauthService, soc, cctvReportFactory) {

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
  
  $rootScope.report = cctvReportFactory;

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

;
