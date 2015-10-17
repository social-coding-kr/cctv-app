'use strict';
angular.module('starter.controllers')

.controller('develOptionsCtrl', function($scope, cordovaDiagnostic) {
    //$scope.cordovaDiagnostic = cordovaDiagnostic;

    $scope.refreshAllStatus = function() {

        cordovaDiagnostic.getLocationMode().then(
            function(mode) {
                $scope.LocationMode = mode;            
            }, function(error) {
                $scope.LocationMode = error;
            });
        
        cordovaDiagnostic.isLocationEnabled().then(
            function(enable) {
                $scope.LocationEnabled = enable;            
            }, function(error) {
                $scope.LocationEnabled = error;
            });

        cordovaDiagnostic.isGpsLocationEnabled().then(
            function(enable) {
                $scope.GpsLocationEnabled = enable;            
            }, function(error) {
                $scope.GpsLocationEnabled = error;
            });

        cordovaDiagnostic.isNetworkLocationEnabled().then(
            function(enable) {
                $scope.NetworkLocationEnabled = enable;            
            }, function(error) {
                $scope.NetworkLocationEnabled = error;
            });

    }
    
    $scope.switchToLocationSettings = function() {
        cordovaDiagnostic.switchToLocationSettings();
    }
})