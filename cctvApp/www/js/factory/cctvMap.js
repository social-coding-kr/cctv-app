'use strict';
angular.module('starter.controllers')

.factory('cctvMapFactory', ['$q', 'soc', '$rootScope', 'locationFactory', '$ionicPopup', '$http',
    '$location', '$cordovaToast', '$timeout', '$ionicPlatform',
function($q, soc, $rootScope, locationFactory, $ionicPopup, $http, $location,
    $cordovaToast, $timeout, $ionicPlatform) {

    var maps;
    var defaultLocation = {
        latitude: 37.5665,
        longitude: 126.97864
    };
    
    var lastRequestCenter = null;

    return {
        map: null,
        geocoder: null,
        mapLoaded: false,

        cctvHideHighZoom: 13,
        filterHide: {
            PUBLIC: false,
            PRIVATE: false,
        },
        
        onMapLoaded: null,
        onMapZoomChanged: null,
        onMapCenterChanged: null,
        onMapDragStart: null,
        onMapDragEnd: null,
        onMapClick: null,
        onWatchStart: null,
        onWatchEnd: null,
        onMarkerClick: null,

        cctvList: null,
        currentPositionMark: new google.maps.Circle({
                            center: new google.maps.LatLng(defaultLocation.latitude, defaultLocation.longitude),
                            radius: 10,
                            strokeWeight: 3,
                            strokeColor: '#EE0000',
                            strokeOpacity: 0.5,
                            fillColor: '#CC0000',
                            fillOpacity: 0.9
                        }),

        last: {
            zoom: null,  
            center: null,
            bounds: null,
            requestCenter: null,
        },
        
        mapOptions: {
            center: new google.maps.LatLng(defaultLocation.latitude, defaultLocation.longitude),
            zoom: 16,
            maxZoom: 19,
            minZoom: 9, // 서울시 전체가 들어오는 레벨임
            // 아래는 Control 옵션
            disableDefaultUI: true,
            zoomControl: true,
            /*
            zoomControlOptions: {
                position: google.maps.ControlPosition.RIGHT_CENTER,
            },*/
            scaleControl: true,
            streetViewControl: true,
            mapTypeControl: true,
        },
        
        clear: function() {
        },
        
        createMap: function(container, position) {
            maps = google.maps;
            
            //soc.log(position);
            //soc.log(JSON.stringify(position));
            if(position) {
                if(position.lng && position.lat)
                this.mapOptions.center = new maps.LatLng(position.lat, position.lng);
            }
            
            var This = this;
            this.map = new maps.Map(container, this.mapOptions);
            this.geocoder = new maps.Geocoder();

            maps.event.addListenerOnce(this.map, 'idle', function() { 
                This.mapLoaded = true;
                
                This.last.zoom = This.map.getZoom();
                This.last.center = This.map.getCenter();
                This.last.bounds = This.map.getBounds();
                
                // 등록된 이벤트 핸들러를 호출
                if(This.onMapLoaded) This.onMapLoaded();    
            });
            
            maps.event.addListener(this.map, 'zoom_changed', function() {
                var zoom = This.map.getZoom();
                // 등록된 이벤트 핸들러를 호출
                if(This.onMapZoomChanged) This.onMapZoomChanged(zoom, This.last.zoom);    
                This.last.zoom = zoom;
            });
            
            maps.event.addListener(this.map, 'center_changed', function() { 
                var center = This.map.getCenter();
                
                var needRequest = false;

                if (lastRequestCenter == null) {
                    needRequest = true;
                }
                else {
                    if (This.map.getBounds().contains(lastRequestCenter) == false) {
                        needRequest = true;
                    }
                }

                if (needRequest == true) {
                    lastRequestCenter = center;
                    This.requestCctvs();
                }          
                
                // 등록된 이벤트 핸들러를 호출
                if(This.onMapCenterChanged) This.onMapCenterChanged(center, This.last.center);    
                This.last.center = center;
            });
            
            maps.event.addListener(this.map, 'dragstart', function() {
                This.endWatchPosition();
                if(This.onMapDragStart) This.onMapDragStart();
            });

            maps.event.addListener(this.map, 'dragend', function() {
                This.endWatchPosition();
                if(This.onMapDragEnd) This.onMapDragEnd();
            });
            
            maps.event.addListener(this.map, 'click', function(e) {
                if(This.onMapClick) This.onMapClick(e);
            });


            this.cctvList = new hashMap();
        },
        toggleFilter: function(key) {
            this.filterHide[key] = !this.filterHide[key];
            this.refreshMarkers(key);
        },
        getDefaultLocation: function() {
            return defaultLocation;      
        },
        
        requestCctvs: function() {
            if(!this.mapLoaded) return;
            
            var This = this;
            soc.log("request In");
            if (This.map.getZoom() <= this.cctvHideHighZoom) return;
            
            soc.log("request Start");
            var params = this.calculateRequestBounds();

            soc.getCctvs(params).then(
                function(response) {
                    This.setCctvs(response);
                },
                function(response) {
                    lastRequestCenter = null;
                    soc.log(response);
                    if (ionic.Platform.isWebView()) {
                        $cordovaToast.show("CCTV 정보를 불러오는데 실패했습니다", 'long', 'bottom');
                    }
                }
            );
        },

        calculateRequestBounds: function() {
            var center = this.map.getCenter();
            var bounds = this.map.getBounds();

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
        },
        
        setCctvs: function(response) {
            var This = this;
            // 동일한 cctvId의 위치는 바뀌지 않는다고 가정한다
            // 기존 리스트에 이미 존재하는 마커를 새 리스트에 가지고 온다
            
            if(response === null) {
                var markers = this.cctvList.values();
                for(var i in markers) {
                    markers[i].setMap(null);
                }
                delete this.cctvList;
                this.cctvList = new hashMap();
                return;
            }
            
            var cctvs = response.data.cctvs;
            var cctvList = new hashMap();
            
            for(var i in cctvs) {
                
                var cctv = cctvs[i];
                var oldMarker = this.cctvList.get(cctv.cctvId);
                
                var marker;
                if(oldMarker) {
                    // 맵에 이미 존재하면 기존 마커를 가져온다
                    marker = oldMarker;
                } else {
                    // 맵에 없으면 마커를 새로 생성한다
                    var markerIcon;
                    if(cctv.source == "PUBLIC") {
                        markerIcon = soc.data.image.publicMarker;
                    } else if(cctv.source == "PRIVATE") {
                        markerIcon = soc.data.image.privateMarker;
                    } else {
                        markerIcon = soc.data.image.defaultMarker;
                    }
                    //soc.log(this.cctv.cctvId);
                    var marker = new maps.Marker({
                       position: new maps.LatLng(cctv.latitude, cctv.longitude),
                       icon: markerIcon,
                       cctv: cctv,
                    });
                    
                    //soc.log(cctv.cctvId);
                    
                    marker.addListener('click', function() {
                        if(This.onMarkerClick) This.onMarkerClick(this.cctv);
                    });
                    
                    // 마커의 클릭 이벤트 설정
                }
                
                cctvList.put(cctv.cctvId, marker);
                
                This.refreshMap();
            }
            
            var markers = this.cctvList.values();
            for(var i in markers) {
                var marker = markers[i];
                if(!cctvList.containsKey(marker.cctv.cctvId)) {
                    //soc.log(cctv.cctvId);
                    marker.setMap(null);
                }
            }
            
            delete this.cctvList;
            this.cctvList = cctvList;
            
            this.refreshMarkers();            
            
            soc.log(cctvList.size());
        },
        refreshMarkers: function() {
            if(!this.mapLoaded) return;
            var cctvIds = this.cctvList.keys();
            // 설정값에 따른 마커 표시여부
            for(var i in cctvIds) {
                this.refreshMarker(cctvIds[i]);
            }
        },
        refreshMarker: function(cctvId) {
            if(!this.mapLoaded) return;
            var marker = this.cctvList.get(cctvId);
            var isHide = (this.filterHide[marker.cctv.source] == true);
            var onMap = marker.getMap();
            
            if(this.map.getZoom() <= this.cctvHideHighZoom) {
                marker.setMap(null);
                
            } else {
            
                if(isHide) {
                    if(onMap) marker.setMap(null);
                } else {
                    if(!onMap) marker.setMap(this.map);
                }
            }
        },
        hideMarkers: function() {
            if(!this.mapLoaded) return;
            var markers = this.cctvList.values();
            for(var i in markers) {
                markers[i].setMap(null);
            }
        }, 
        showMarkers: function() {
            if(!this.mapLoaded) return;
            var markers = this.cctvList.values();
            for(var i in markers) {
                markers[i].setMap(this.map);
            }
        },
        refreshMap: function() {
            var This = this;
            if(this.mapLoaded == false) return;
            $timeout(function() {
                maps.event.trigger(This.map, 'resize'); // 맵타일을 못불러오는 오류를 방지한다
            }, 100);
        },
        
        startWatchPosition: function() {
            var This = this;
            if(This.onWatchStart) This.onWatchStart();
            
            locationFactory.watchPositionSmart(locationFactory.defaultOptions).then(
                null, 
                function(error) { 
                    This.endWatchPosition();
                    if(This.onWatchEnd) { This.onWatchEnd(); }
                    soc.log(error); 
                },
                function(position) {
                    var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                    This.currentPositionMark.setMap(null);
                    This.currentPositionMark.setMap(This.map);
                    This.currentPositionMark.setCenter(latlng);
                    This.map.setCenter(latlng);
                    This.map.setHeading(position.coords.heading);
                    soc.log(JSON.stringify(position));
                });
        },
        
        endWatchPosition: function() {
            locationFactory.clearWatch();
            if(this.currentPositionMark) this.currentPositionMark.setMap(null);
            if(this.onWatchEnd) this.onWatchEnd();
            
        }
    };

}    
]);
