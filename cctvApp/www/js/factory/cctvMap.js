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

    return {
        map: null,
        geocoder: null,
        mapLoaded: false,

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
        
        createMap: function(container) {
            maps = google.maps;
            
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
        setCctvs: function(response) {
            var This = this;
            // 동일한 cctvId의 위치는 바뀌지 않는다고 가정한다
            // 기존 리스트에 이미 존재하는 마커를 새 리스트에 가지고 온다
            
            var cctvs = response.data.cctvs;
            var cctvList = new hashMap();
            
            for(var i in cctvs) {
                
                var cctv = cctvs[i];
                var oldCctv = this.cctvList.get(cctv.cctvId);
                
                if(oldCctv) {
                    // 맵에 이미 존재하면 기존 마커를 가져온다
                    cctv.marker = oldCctv.marker;
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
                    
                    cctv.marker = new maps.Marker({
                       position: new maps.LatLng(cctv.latitude, cctv.longitude),
                       icon: markerIcon
                    });
                    
                    cctv.marker.addListener('click', function() {
                        if(This.onMarkerClick) This.onMarkerClick(cctv);
                    });
                    
                    // 마커의 클릭 이벤트 설정
                }
                
                cctvList.put(cctv.cctvId, cctv);
                

            }
            // 마커 setMap(null) 을 하지 안아도 되는지 확인 필요
            delete this.cctvList;
            this.cctvList = cctvList;
            
            this.refreshMarkers();            
            
            soc.log(cctvList.size());
        },
        refreshMarkers: function() {
            var values = this.cctvList.values();
            // 설정값에 따른 마커 표시여부
            for(var i in values) {
                var cctv = values[i];
                this.refreshMarker(cctv);
            }
        },
        refreshMarker: function(cctv) {
            if(this.filterHide[cctv.source] == true) {
                cctv.marker.setMap(null);
            } else {
                cctv.marker.setMap(this.map);
            }
        },
        hideMarkers: function() {
            var values = this.cctvList.values();
            for(var i in values) {
                var cctv = values[i];
                cctv.marker.setMap(null);
            }
        }, 
        showMarkers: function() {
            var values = this.cctvList.values();
            for(var i in values) {
                var cctv = values[i];
                cctv.marker.setMap(this.map);
            }
        },
        refreshMap: function() {
            var This = this;
            if(this.mapLoaded == false) return;
            $timeout(function() {
                maps.event.trigger(This.map, 'resize'); // 맵타일을 못불러오는 오류를 방지한다
            }, 50);
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
