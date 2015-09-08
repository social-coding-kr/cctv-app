angular.module('starter.controllers', [])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $rootScope, $ionicPopup, $ionicPlatform, $location) {

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
    $ionicPopup.show({title :'위치정보 제공에 동의하십니까?',
                      buttons: [{ 
                        text: '네, 동의합니다',
                        type: 'button-positive',
                        onTap: function(e) {
                          $rootScope.centerOnMe();
                          $rootScope.reportClicked = true;
                        }
                      }, {
                        text: '아니오',
                        type: 'button-default',
                        onTap: function(e) {
                          $rootScope.reportClicked = false;
                        }
                      }]
                      });
  }
  
  // 안드로이드 뒤로가기 버튼동작
    $ionicPlatform.registerBackButtonAction(function() {
      if($location.url() === '/app/map') {
        $ionicPopup.show({title :'앱을 종료하시겠습니까?',
                      buttons: [{ 
                        text: '네, 종료하겠어요',
                        type: 'button-positive',
                        onTap: function(e) {
                          navigator.app.exitApp();
                        }
                      }, {
                        text: '아니오',
                        type: 'button-default',
                        onTap: function(e) {
                          // do nothing
                        }
                      }]
                      });
      } else if($rootScope.isTakePictureView === true) {
        // alert('등록화면값 true 지도화면으로 이동');
        $rootScope.cancellButtonClicked();
      } else if($location.url() === '/app/backButtonTest') {
        alert('back button clicked');
      } else {
        // alert('전 페이지로 이동');
        navigator.app.backHistory();
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
