'use strict';
angular.module('starter.controllers')

.config(function($compileProvider){
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
})

.controller('takePictureCtrl', function($scope, Camera, $ionicPopup, $window, $location, $rootScope) {
  $scope.basicPhoto = 'https://cloud.githubusercontent.com/assets/13172195/9220177/5be109da-411b-11e5-948d-34937938703f.PNG';
  $rootScope.lastCctvPhoto = $scope.basicPhoto;
  $rootScope.lastHangBoardPhoto = $scope.basicPhoto;
  
  $scope.getPhoto = function() {
    Camera.getPicture().then(function(imageURI) {
      console.log(imageURI);
      if($rootScope.lastCctvPhoto === $scope.basicPhoto) {
        $rootScope.lastCctvPhoto = imageURI;
      } else {
        $rootScope.lastHangBoardPhoto = imageURI;
      }
    }, function(err) {
      console.err(err);
    }, {
      quality: 75,
      targetWidth: 320,
      targetHeight: 320, 
      saveToPhotoAlbum: false
    });
  };
  
  $scope.photoLocation = function() {
    alert($rootScope.lastCctvPhoto);
    alert($rootScope.lastHangBoardPhoto);
  };
  
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

.controller('selectPurposeCtrl', function($rootScope, $scope, $location) {
  $rootScope.purposeForReport = [{text :'방범용', checked : false}, 
                                {text :'재난 방지용', checked : false}];
                    
  $scope.select = function() {
    $location.path('/app/confirmReport');
  }
})

.controller('confirmReportCtrl', function($scope, $location, $timeout, $window, $ionicPopup) {
  
  $scope.report = function() {
    var successPopup = $ionicPopup.show({title :'성공적으로 등록되었습니다.'});
    $timeout(function(){
      successPopup.close();
      $location.path('/app/map');
      $window.location.reload();
    }, 1000);
  }
  
  $scope.cancel =function() {
    var cancelPopup = $ionicPopup.show({title :'등록을 취소했습니다.'});
    $timeout(function(){
      cancelPopup.close();
      $location.path('/app/map');
      $window.location.reload();
    }, 1000);
  }
})

.factory('Camera', ['$q', function($q) {
    
    return {
        getPicture: function(options) {
            var q = $q.defer();
          
            navigator.camera.getPicture(function(result) {
            // Do any magic you need
            q.resolve(result);
            }, function(err) {
                q.reject(err);
            }, options);
            return q.promise;
        }
    }
}]);