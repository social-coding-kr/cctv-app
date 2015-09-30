'use strict';
angular.module('starter.controllers')

.controller('CctvLawCtrl', function($scope, soc, $cordovaToast, $location, $window, $http) {

        $scope.init = function () {
            $scope.LAW_SWITCH_01 = true;
            $scope.LAW_SWITCH_02 = false;
            $scope.LAW_SWITCH_03 = false;
            $scope.LAW_SWITCH_04 = false;
            $scope.LAW_SWITCH_05 = false;
        };


})
