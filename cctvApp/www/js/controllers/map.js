'use strict';

//나의 위치정보를 담을 전역변수
var myLat;
var myLng;

angular.module('starter.controllers')

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $window, $http, soc,
    $cordovaGeolocation, $ionicHistory, $ionicPopup, $timeout, $interval, $ionicPlatform, 
    $cordovaToast, $cordovaNetwork, $cordovaKeyboard, locationFactory, $ionicModal, cctvMapFactory) {

    $ionicPlatform.ready(function() {
        $rootScope.AnotherPageToMap = function() {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
        };

        $scope.cctvMap = cctvMapFactory;
        var mapContainer = document.getElementById('map');

        $scope.testButtonClick = function() {
            $scope.cctvMap.refreshMap();
        };

        $scope.cctvMap.createMap(mapContainer);

        $scope.$on("$ionicView.afterEnter", function() {
            $scope.cctvMap.refreshMap();
        });

        var lastRequestCenter = null;

        $scope.onMapLoaded = function() {
            soc.log("map Loaded");
            // cctv 목록 요청한다
            requestCctvs();
        }

        $scope.onMapZoomChanged = function(zoom, prevZoom) {
            //soc.log("zoom: " + zoom + ", prevZoom: " + prevZoom);
            //cctv 목록 요청한다
            soc.log(zoom + ", " + prevZoom);
            
            var zoomHideHigh = 13;
            if (zoom <= zoomHideHigh) {
                if (zoom == zoomHideHigh) {
                    $scope.cctvMap.hideMarkers();
                    if (zoom < prevZoom) {
                        if (ionic.Platform.isWebView()) {
                            $cordovaToast.show("지도를 확대하면 CCTV가 표시됩니다", 'long', 'bottom');
                        }
                        else {
                            soc.log("지도확대");
                        }
                    }
                }
            } else {
                $scope.cctvMap.showMarkers();
                requestCctvs();                
            }
        };

        $scope.onMapCenterChanged = function(center, prevCenter) {
            //soc.log("center: " + center + ", prevCenter: " + prevCenter);
            // cctv 목록 요청한다
            var needRequest = false;

            if (lastRequestCenter == null) {
                needRequest = true;
            }
            else {
                if ($scope.cctvMap.map.getBounds().contains(lastRequestCenter) == false) {
                    needRequest = true;
                }
            }

            if (needRequest == true) {
                lastRequestCenter = center;
                requestCctvs();
            }
        };

        $scope.onMapClick = function(e) {
            soc.log("ha");
            $scope.hideCctvInfo();
            $scope.$apply();
        };

        $scope.showCctvInfo = function(detail) {
            soc.log(detail);
            $scope.cctvSelected = detail;
            $scope.cctvMap.refreshMap();
        }

        $scope.hideCctvInfo = function() {
            $scope.cctvSelected = null;
            $scope.cctvMap.refreshMap();
        }


        function requestCctvs() {
            var params = calculateRequestBounds();

            soc.getCctvs(params).then(
                function(response) {
                    $scope.cctvMap.setCctvs(response);
                },
                function(response) {
                    lastRequestCenter = null;
                    soc.log(response);
                    if (ionic.Platform.isWebView()) {
                        $cordovaToast.show("CCTV 정보를 불러오는데 실패했습니다", 'long', 'bottom');
                    }
                }
            );
        };

        function calculateRequestBounds() {
            var center = $scope.cctvMap.map.getCenter();
            var bounds = $scope.cctvMap.map.getBounds();

            var northEast = bounds.getNorthEast();
            var southWest = bounds.getSouthWest();

            var centerLng = center.lng();
            var centerLat = center.lat();

            var east = northEast.lng();
            var north = northEast.lat();
            var west = southWest.lng();
            var south = southWest.lat();

            var width = east - west;
            var height = north - south;

            return {
                east: (centerLng + width + 0.000005).toFixed(6),
                west: (centerLng - width - 0.000005).toFixed(6),
                north: (centerLat + height + 0.000005).toFixed(6),
                south: (centerLat - height - 0.000005).toFixed(6)
            };
        };

        // 위치 추적 취소는 드래그이벤트 or 다른 메뉴 버튼 서치버튼 터치시
        $scope.watch = {
            running: false,
            toggle: function() {
                if ($scope.watch.running) {
                    $scope.cctvMap.endWatchPosition();
                }
                else {
                    $scope.cctvMap.startWatchPosition();
                }
            },
            onWatchStart: function() {
                $scope.watch.running = true;
                //$scope.$apply();
            },
            onWatchEnd: function() {
                $scope.watch.running = false;
                if (!$scope.$$phase) {
                    // 좋지 않은 방식인데 중요한 부분이라 어쩔수 없이 넣음
                    // 다른 방법이 생기면 삭제
                    $scope.$apply();
                }
            },
        };

        $scope.cctv_log_string = 'nothing';
        $scope.hideCctvInfo();
        $ionicModal.fromTemplateUrl('templates/cctvdetail.html', {
            scope: $scope
        }).then(function(modal) {
            $scope.cctvDetailModal = modal;
        });

        $scope.onMarkerClick = function(cctv) {
            soc.getCctvDetail(cctv.cctvId).then(
                function(res) {
                    soc.log(JSON.stringify(res));
                    //$scope.cctvSelected = res.data;
                    $scope.showCctvInfo(res.data);
                },
                function(err) {
                    soc.log(JSON.stringify(err));
                }
            );
        }

        // 주소검색
        $scope.search = {
            keyEvent: function(event) {
                $scope.onUsingSearch = true;
                if (event.keyCode == 13) {
                    // EnterKey 입력되었을때 주소 검색을 실행한다
                    // 웹에서는 엔터키, 모바일에서는 소프트키보드의 돋보기키에 해당한다
                    // 모바일에서 돋보기키를 클릭했을때 소프트키보드가 닫혀야 함
                    document.activeElement.blur(); // ActiveElement인 소프트키보드를 닫는다
                    $scope.search.moveAddress();
                    $scope.search.blur();
                }
            },
            blur: function() {
                if (ionic.Platform.isWebView()) {
                    $cordovaKeyboard.close();
                }
            },
            moveAddress: function() {
                cctvMapFactory.endWatchPosition();
                var geocoder = $scope.cctvMap.geocoder;
                geocoder.geocode({
                    'address': $scope.search.address,
                }, function(results, status) {
                    if (status === google.maps.GeocoderStatus.OK) {
                        $scope.cctvMap.map.setCenter(results[0].geometry.location);
                    }
                    else {
                        var searchErrorMsg = "검색결과가 없습니다";
                        if (ionic.Platform.isWebView()) {
                            $cordovaToast.show(searchErrorMsg, 'long', 'bottom');
                        }
                    }
                });
            },
        };


        $scope.showCctvDetail = function() {
            $scope.cctvDetailModal.show();
        };

        $scope.closeCctvDetail = function() {
            $scope.cctvDetailModal.hide();
        };

        $scope.initCctvSelect = function() {
            if ($scope.cctvSelected !== null) {
                $scope.cctvSelected = null;
            }
        };

        $scope.cctvMap.onMapCenterChanged = $scope.onMapCenterChanged;
        $scope.cctvMap.onMapZoomChanged = $scope.onMapZoomChanged;
        $scope.cctvMap.onMapLoaded = $scope.onMapLoaded;
        $scope.cctvMap.onMapClick = $scope.onMapClick;
        $scope.cctvMap.onWatchStart = $scope.watch.onWatchStart;
        $scope.cctvMap.onWatchEnd = $scope.watch.onWatchEnd;
        $scope.cctvMap.onMarkerClick = $scope.onMarkerClick;

    });
});
