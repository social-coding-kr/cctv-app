'use strict';
angular.module('starter.controllers')

.factory('locationFactory', ['$q', '$cordovaDiagnostic', '$cordovaGeolocation',
    '$cordovaDialogs', '$ionicPopup', '$rootScope', 'soc',
function($q, $cordovaDiagnostic, $cordovaGeolocation, $cordovaDialogs, $ionicPopup, $rootScope, soc) {
    

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
    
    function popupGeolocationError(error) {
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
    
    function onLocationSuccess(id, result) {
        id.q.resolve(result);                    
    }

    function onWatchLocationSuccess(id, result) {
        id.q.notify(result);                    
    }
            
    function onLocationDisable(id, error) {
        if(id.smart) 
            confirmLocationSetting();
            
        id.q.reject(error);                    
    }
            
    function onLocationFailed(id, error) {
        if(id.smart)
            popupGeolocationError(error);
            
        id.q.reject(error);                    
    }    

    function realGetCurrentPosition(id, options) {
        $cordovaGeolocation.getCurrentPosition(options).then(
            function(result) {
                onLocationSuccess(id, result);
            }, function(error) {
                onLocationFailed(id, error);
            });
    }
    
    function getCurrentPositionProcess(id, options) {
        if(ionic.Platform.isWebView() && ionic.Platform.isAndroid()) {
            $cordovaDiagnostic.isLocationEnabled().then(
                function(enable) {
                    if(enable) realGetCurrentPosition(id, options);
                    else onLocationDisable(id, enable);
                }, function(error) {
                    onLocationDisable(id, error);
                }
            );
        } else {
            realGetCurrentPosition(id, options);
        }
    }

    function realWatchPosition(id, options) {
        var watchID = $cordovaGeolocation.watchPosition(options).then(
            null,
            function(error) {
                onLocationFailed(id, error);
            }, function(result) {
                onWatchLocationSuccess(id, result);
            });
                
            id.q.promise.cancel = function () {
                navigator.geolocation.clearWatch(watchID);
            };                
                
        id.q.promise.clearWatch = function (watchid) {
            $cordovaGeolocation.clearWatch(watchid || watchID);
        };
        
        id.q.promise.watchID = watchID;
    }

    function watchPositionProcess(id, options) {
        if(ionic.Platform.isWebView() && ionic.Platform.isAndroid()) {
            $cordovaDiagnostic.isLocationEnabled().then(
                function(enable) {
                    if(enable) realWatchPosition(id, options);
                    else onLocationDisable(id, enable);
                }, function(error) {
                    onLocationDisable(id, error);
                }
            );
        } else {
            realWatchPosition(id, options);
        }
    }
    
    
    function InternalData(q, smart) {
        return {
            q: q,
            smart: smart,
        };
    }
    
    return {
        defaultOptions: {
            timeout: soc.config.geoOptions.timeout,
            enableHighAccuracy: soc.config.geoOptions.enableHighAccuracy,
            maximumAge: 0,  // 현재위치를 캐시 저장하지 않는다
        },
        getCurrentPositionSmart: function(options) {
            // 위치찾기 시도시 위치서비스가 꺼져있으면 위치서비스 켜기 팝업을 띄운다
            var q = $q.defer();
            var id = InternalData(q, true);
            getCurrentPositionProcess(id, options);

            return q.promise;    
        }
        ,
        getCurrentPosition: function(options) {
            //위치찾기 시도시 위치서비스가 꺼져있으면 그냥 실패만 리턴한다
            var q = $q.defer();
            var id = InternalData(q, false);
            getCurrentPositionProcess(id, options);

            return q.promise;
        },
        watchPositionSmart: function(options) {
            // 위치추적 시도시 위치서비스가 꺼져있으면 위치서비스 켜기 팝업을 띄운다
            var q = $q.defer();
            var id = InternalData(q, true);
            watchPositionProcess(id, options);
            
            return q.promise;    
        },
        watchPosition: function(options) {
            // 위치추적 시도시 위치서비스가 꺼져있으면 그냥 실패만 리턴한다
            var q = $q.defer();
            var id = InternalData(q, false);
            watchPositionProcess(id, options);
            
            return q.promise;    
        }, 
        clearWatch: function (watchID) {
            return $cordovaGeolocation.clearWatch(watchID);
        },
    }
}    
]);
