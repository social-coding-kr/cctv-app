'use strict';
angular.module('starter.controllers')

.controller('reportCtrl', function($scope) {
    
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
}])

.controller('cameraCtrl', function($scope, Camera) {

  $scope.getPhoto = function() {
    Camera.getPicture().then(function(imageURI) {
      console.log(imageURI);
      $scope.lastPhoto = imageURI;
    }, function(err) {
      console.err(err);
    }, {
      quality: 75,
      targetWidth: 320,
      targetHeight: 320,
      saveToPhotoAlbum: false
    });
  };

})

.config(function($compileProvider){
  $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|tel):/);
});