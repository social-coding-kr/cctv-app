'use strict';
angular.module('starter.controllers')

.controller('BonhunTestCtrl', function($scope, soc, $http, $ionicModal) {
    $scope.res_status = 'not_yet';
    $scope.res_cctvs = [];
    $scope.res_cctv_cur = {};
    
    $scope.something = '';
    
    $ionicModal.fromTemplateUrl('templates/cctvdetail.html', {
        scope: $scope
    }).then(function(modal) {
        $scope.datail = modal;
    });
    // Triggered in the login modal to close it
    $scope.closeDetail = function() {
        $scope.datail.hide();
    };
    
    $scope.change_status = function() {
        $scope.res_status = 'changed';
    };
    
    $scope.req_cctvs = function() {
        $http.get(soc.server.mainUrl + "map/cctvs")
          .then(function(response) {
              $scope.res_status = 'success';
              $scope.res_cctvs = response.data.cctvs;
              $scope.res_cctv_cur = $scope.res_cctvs[0];
          }, function(response) {
              $scope.res_status = 'failed';
          });
    };
    
    $scope.req_cctv_detail = function(idx) {
        $scope.res_cctv_cur = $scope.res_cctvs[idx];
        
        $http.get(soc.server.mainUrl + "cctv/" + $scope.res_cctvs[idx].cctvId)
            .then(function(response) {
                $scope.something = 'success';
            }, function(response) {
                $scope.something = 'failed';
            });

          
        $scope.datail.show();
    };
})