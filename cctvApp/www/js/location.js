'use strict';
angular.module('starter.controllers')

.factory('locationFactory', ['$q', '$cordovaDiagnostic', '$cordovaGeolocation',
    '$cordovaDialogs', '$ionicPopup', '$rootScope',
function($q, $cordovaDiagnostic, $cordovaGeolocation, $cordovaDialogs, $ionicPopup, $rootScope) {
    

    
    function confirmLocationSetting() {
        // 위치정보를 사용할 수 없습니다 (켤래요?)
        $cordovaDialogs.confirm('내 위치정보를 사용하려면 단말기의 설정에서 위치서비스 사용을 허용해 주세요.', '위치서비스 사용', ['설정하기','취소'])
            .then(function(buttonIndex) {
            // no button = 0, 'OK' = 1, 'Cancel' = 2
            var btnIndex = buttonIndex;
            
            if(btnIndex == 1) {
                $cordovaDiagnostic.switchToLocationSettings();
            }
        });
    }
    
    function onGeolocationError(error) {
        // 위치 찾기 실패시 호출
        // 사용 기기에 따라 상황에 따른 에러코드가 다를수 있음

        var alertOptions = {};
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alertOptions = {
                    title: '위치찾기 실패',
                    template: '위치찾기 권한이 허용되지 않았습니다',
                };
                break;
            case error.POSITION_UNAVAILABLE:
                alertOptions = {
                    title: '위치찾기 실패',
                    template: '위치정보를 가져오는데 실패하였습니다',
                };
                break;
            case error.TIMEOUT:
                alertOptions = {
                    title: '위치찾기 시간 초과',
                    template: '위치정보를 가져오는데 실패하였습니다',
                };
                break;
            case error.UNKNOWN_ERROR:
                alertOptions = {
                    title: '위치찾기 실패',
                    template: '알려지지 않은 이유',
                };
                break;
        }

        var alertPopup = $ionicPopup.alert(alertOptions);

        $rootScope.reportClicked = false;
        alertPopup.then();
    }
    
    function onLocationSuccess(q, result) {
        q.resolve(result);                    
    }

    function onWatchLocationSuccess(q, result) {
        console.log("QQQQQ");
        q.notify(result);                    
    }
            
    function onLocationDisable(q, error) {
        confirmLocationSetting();
        q.reject(error);                    
    }
            
    function onLocationFailed(q, error) {
        onGeolocationError(error);
        q.reject(error);                    
    }    
    
    
    return {
        getCurrentPosition: function(options) {
            var q = $q.defer();
            if(ionic.Platform.isWebView() && ionic.Platform.isAndroid()) {
                $cordovaDiagnostic.isLocationEnabled().then(
                    function(enable) {
                        if(enable) onLocationEnable();
                        else onLocationDisable(q, enable);
                    }, function(error) {
                        onLocationDisable(q, error);
                    }
                );
            } else {
                onLocationEnable();
            }

            function onLocationEnable() {
                $cordovaGeolocation.getCurrentPosition(options).then(
                    function(result) {
                        onLocationSuccess(q, result);
                    }, function(error) {
                        onLocationFailed(q, error);
                    });
            }

            return q.promise;    
        },
        watchPosition: function(options) {
            var q = $q.defer();

            if(ionic.Platform.isWebView() && ionic.Platform.isAndroid()) {
                $cordovaDiagnostic.isLocationEnabled().then(
                    function(enable) {
                        if(enable) onLocationEnable();
                        else onLocationDisable(q, enable);
                    }, function(error) {
                        onLocationDisable(q, error);
                    }
                );
            } else {
                onLocationEnable();
            }
            function onLocationEnable() {
                var watchID = $cordovaGeolocation.watchPosition(options).then(
                    null,
                    function(error) {
                        onLocationFailed(q, error);
                    }, function(result) {
                        onWatchLocationSuccess(q, result);
                    });
                
                q.promise.cancel = function () {
                    navigator.geolocation.clearWatch(watchID);
                };                
                
                q.promise.clearWatch = function (id) {
                    $cordovaGeolocation.clearWatch(id || watchID);
                };
                
                q.promise.watchID = watchID;
            }
            
            return q.promise;    
        },
        clearWatch: function (watchID) {
            return $cordovaGeolocation.clearWatch(watchID);
        },
    }
}    
]);
