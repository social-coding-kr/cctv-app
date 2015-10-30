'use strict';

angular.module('starter.controllers')

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $window, $http, soc,
    $cordovaGeolocation, $ionicHistory, $ionicPopup, $timeout, $interval, $ionicPlatform, 
    $cordovaToast, $cordovaNetwork, $cordovaKeyboard, locationFactory, $ionicModal, 
    cctvMapFactory, cctvReportFactory, cctvImageFactory) {

    $ionicPlatform.ready(function() {

        $scope.cctvMap = cctvMapFactory;
        $scope.cctvImageFactory = cctvImageFactory;
        var mapContainer = document.getElementById('map');

        $scope.detail = {
            noDataText: "(데이터 제공 안됨)",
        };

        $scope.testButtonClick = function() {
            $scope.cctvMap.refreshMap();
        };

        $scope.cctvMap.createMap(mapContainer, soc.stored.get("lastPosition"));

        $scope.$on("$ionicView.afterEnter", function() {
            $scope.cctvMap.refreshMap();
        });

    
        $scope.onMapLoaded = function() {
            soc.log("map Loaded");
            // cctv 목록 요청한다
            $scope.cctvMap.requestCctvs();
        }
        
        var zoomHideHigh = $scope.cctvMap.cctvHideHighZoom;
        $scope.onMapZoomChanged = function(zoom, prevZoom) {
            //soc.log("zoom: " + zoom + ", prevZoom: " + prevZoom);
            //cctv 목록 요청한다
            //soc.log(zoom + ", " + prevZoom);
            if(zoom == prevZoom) return;

            if(zoom <= zoomHideHigh) {
                $scope.cctvMap.setCctvs(null);
                if (zoom == zoomHideHigh || zoom == zoomHideHigh-1) {
                    
                    if (zoom < prevZoom) {
                        if (ionic.Platform.isWebView()) {
                            $cordovaToast.show("지도를 확대하면 CCTV가 표시됩니다", 'long', 'bottom');
                        }
                        else {
                            soc.log("지도확대");
                        }
                    }
                }
                //$scope.cctvMap.refreshMarkers();
            } else {
                //$scope.cctvMap.showMarkers();
                $scope.cctvMap.requestCctvs();                            
            }
            //$scope.cctvMap.refreshMap();
        };

        $scope.onMapCenterChanged = function(center, prevCenter) {
            //soc.log("center: " + center + ", prevCenter: " + prevCenter);
         
            //soc.log("lastPosition: " +  JSON.stringify(center.lng()) + ", " + JSON.stringify(prevCenter));
            soc.stored.set("lastPosition", { lng: center.lng(), lat: center.lat() } );
        };

        $scope.onMapClick = function(e) {
            $scope.hideCctvInfo();
            $scope.$apply();
        };

        $scope.showCctvInfo = function(cctv, detail) {
            //cctv.detail = detail;
            $scope.cctvSelected = null;
            
            var currentCoord = cctv.longitude + "," + cctv.latitude;
            soc.log("[[cctv]] : " + JSON.stringify(cctv.cctvId) + ", " + JSON.stringify(cctv.source));
            soc.log("[[detail]]" + JSON.stringify(detail));
            $scope.cctvSelected = detail;
            soc.getAdressFromPoint(currentCoord, $scope.cctvSelected);
            //$scope.cctvMap.refreshMap();
        }

        $scope.hideCctvInfo = function() {
            $scope.cctvSelected = null;
            //$scope.cctvMap.refreshMap();
        }


        // 위치 추적 취소는 드래그이벤트 or 다른 메뉴 버튼 서치버튼 터치시
        $scope.watch = {
            running: false,
            toggle: function() {
                
                if(cctvReportFactory.getStatus() == cctvReportFactory.statusFindPosition 
                || cctvReportFactory.getStatus() == cctvReportFactory.statusFoundPosition) {
                    return;
                }
                
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
                    $scope.showCctvInfo(cctv, res.data);
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
            checkAddress : function () {
                $scope.isSearchBarActive = $scope.search.address.length >0? true : false;
            },
            blur: function() {/*
                if (ionic.Platform.isWebView()) {
                    $cordovaKeyboard.close();
                }*/
            },
            moveAddress: function() {
                if (! $scope.search.address > 0) { return; }
                cctvMapFactory.endWatchPosition();
                $scope.cctvSelected = null;
                
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

        $scope.$on('modal.shown', function() {
            console.log('Modal is shown!');
            if ($scope.cctvDetailModal.isShown()) {
                //cctvImageFactory.refreshThumbImage();
            }
        });
        var imageResizedCctvId = null;
        $scope.showCctvDetail = function() {
            $scope.cctvDetailModal.show();
            if (imageResizedCctvId != $scope.cctvSelected.cctv.cctvId && $scope.cctvSelected.cctv.source == 'PRIVATE') {
                cctvImageFactory.refreshInfoImage();
                imageResizedCctvId = $scope.cctvSelected.cctv.cctvId;
            }
        };

        $scope.closeCctvDetail = function() {
            $scope.cctvDetailModal.hide();
        };

        $scope.initCctvSelect = function() {
            if ($scope.cctvSelected !== null) {
                $scope.cctvSelected = null;
            }
        };

        $scope.cctvMap.onMapCenterChanged   = $scope.onMapCenterChanged;
        $scope.cctvMap.onMapZoomChanged     = $scope.onMapZoomChanged;
        $scope.cctvMap.onMapLoaded          = $scope.onMapLoaded;
        $scope.cctvMap.onMapClick           = $scope.onMapClick;
        $scope.cctvMap.onWatchStart         = $scope.watch.onWatchStart;
        $scope.cctvMap.onWatchEnd           = $scope.watch.onWatchEnd;
        $scope.cctvMap.onMarkerClick        = $scope.onMarkerClick;

    });
});
