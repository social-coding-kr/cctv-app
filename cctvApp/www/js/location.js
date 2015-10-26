'use strict';
angular.module('starter.controllers')

.factory('locationFactory', ['$q', '$cordovaDiagnostic', '$cordovaGeolocation',
    '$cordovaDialogs', '$ionicPopup', '$rootScope', 'soc', '$cordovaToast',
function($q, $cordovaDiagnostic, $cordovaGeolocation, $cordovaDialogs, $ionicPopup, $rootScope, soc, $cordovaToast) {
    
    var watch = null;
    function confirmLocationSetting() {
        // 위치정보를 사용할 수 없습니다 (켤래요?)
        $cordovaDialogs.confirm('내 위치정보 사용을 위해 단말기 설정에서 위치서비스 사용을 허용한 후 다시 시도해주세요.', '위치서비스 사용', ['설정하기','취소'])
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
                    template: '알수없는 이유로 위치정보를 가져오는데 실패하였습니다',
                };
                break;
        }

        if(ionic.Platform.isWebView()) {
            $cordovaToast.show(alertOptions.template, 'long', 'bottom');
        } else {
            var alertPopup = $ionicPopup.alert(alertOptions);
            alertPopup.then();
        }

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
        watch = $cordovaGeolocation.watchPosition(options);
        watch.then(
            null,
            function(error) {
                onLocationFailed(id, error);
            }, function(result) {
                onWatchLocationSuccess(id, result);
            });
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
        watch: null,
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
            if(watch) return;
            
            // 위치추적 시도시 위치서비스가 꺼져있으면 위치서비스 켜기 팝업을 띄운다
            var q = $q.defer();
            var id = InternalData(q, true);
            watchPositionProcess(id, options);
            soc.log("ON watch: " + JSON.stringify(watch));               
            
            return q.promise;    
        },
        watchPosition: function(options) {
            if(watch) return;
            
            // 위치추적 시도시 위치서비스가 꺼져있으면 그냥 실패만 리턴한다
            var q = $q.defer();
            var id = InternalData(q, false);
            watch = watchPositionProcess(id, options);
            soc.log("ON watch: " + JSON.stringify(watch));            
            
            return q.promise;    
        }, 
        clearWatch: function () {
            if(watch==null) return;

            soc.log("OFF watch: " + JSON.stringify(watch));            
            watch.clearWatch();
            watch = null;
        },
    }
}    
]);
