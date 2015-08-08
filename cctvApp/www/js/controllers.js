angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout) {

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

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
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


// Devloper용 Controller
// devel.html에서 사용한다
.controller('DevelCtrl', function($scope, $http) {
  $scope.test_button1_text = '눌러봐'; // 초기값 
  $scope.cctvs;

  $scope.test_button1_click = function() {
    $scope.test_button1_text = "잘했어";  // 클릭했을때 변경

  $http.get("http://147.46.215.152:8099/cctv/validate?latitude=1&longitude=1")
    .then(function(response) {
      $scope.cctvs = response.data.cctvs;
      $scope.applog(JSON.stringify(response));      
    }, function(response) {
      //$scope.cctv_validate = response;
      $scope.applog(JSON.stringify(response));      
    });
  };
})

.controller('DevelCtrl2', function($scope) {
  $scope.test_button2_text = '눌러봐'; // 초기값 

  $scope.test_button2_click = function() {
    $scope.applog("개발자용2 화면에서 로그를 남겼습니다. javascript에서 string 줄바꿈은 도대체 어떻게 하는 걸까요?");

  }
})

;
