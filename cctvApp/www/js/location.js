'use strict';
angular.module('starter.controllers')

.factory('locationFactory', ['$q', '$cordovaDiagnostic', '$cordovaGeolocation',
    '$cordovaDialogs', '$ionicPopup', '$rootScope',
function($q, $cordovaDiagnostic, $cordovaGeolocation, $cordovaDialogs, $ionicPopup, $rootScope) {
    
    return {
        getCurrentPosition: function(options) {
            var q = $q.defer();
            if(ionic.Platform.isWebView() && ionic.Platform.isAndroid()) {
                $cordovaDiagnostic.isLocationEnabled().then(
                    function(enable) {
                        if(enable) onLocationEnable();
                        else onLocationDisable(enable);
                    }, onLocationDisable);
            } else {
                onLocationEnable();
            }
                
                            
            function onLocationEnable() {
                $cordovaGeolocation.getCurrentPosition(options).then(
                    function(result) {
                        onLocationSuccess(result);
                    }, function(error) {
                        onLocationFailed(error);
                    });
            }
            
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
            
            function onLocationSuccess(result) {
                q.resolve(result);                    
            }
            
            function onLocationDisable(error) {
                confirmLocationSetting();
                q.reject(error);                    
            }
            
            function onLocationFailed(error) {
                onGeolocationError(error);
                q.reject(error);                    
            }

            // 위치 찾기 실패시 호출
            function onGeolocationError(error) {
                // 사용 기기에 따라 상황에 따른 에러코드가 다를수 있음

                var alertOptions = {};
                switch (error.code) {
                    case error.PERMISSION_DENIED:
                        return;
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


            return q.promise;    
        },
        watchPosition: function() {
            
        }
    };
}    
]);
