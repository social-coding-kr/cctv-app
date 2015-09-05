'use strict';
angular.module('starter.controllers')

.controller('MapTestCtrl',
    function($rootScope, $scope, $ionicLoading, $compile, $http, soc) {

        //var mapProvider = "OSM";
        var mapProvider = "Naver";
        //var mapProvider = "Daum";
        //var mapProvider = "VWorld";


        var mapDefualtZoom = 15;
        var mapOptions;

        if (mapProvider == "Naver") {
            mapDefualtZoom = 9;
            mapOptions = {
                crs: L.Proj.CRS.TMS.Naver
            };
        }
        else if (mapProvider == "Daum") {
            mapDefualtZoom = 9;
            mapOptions = {
                crs: L.Proj.CRS.TMS.Daum
            };
        }

        var map = L.map('map2', mapOptions);
        var curLoc = soc.sindaebang2Loc;
        var Seoul = new L.LatLng(curLoc.lat, curLoc.lon); // geographical point (longitude and latitude)
        map.setView(Seoul, mapDefualtZoom);


        // 지도는 잘 나오는데
        // vWorld API키 등록도 하지 않았는데 어떻게 나오는 거지 
        if (mapProvider == "Naver") {
            L.Proj.TileLayer.TMS.provider('NaverMap.Street').addTo(map);
        }
        else if (mapProvider == "Daum") {
            L.Proj.TileLayer.TMS.provider('DaumMap.Street').addTo(map);
        }
        else if (mapProvider == "VWorld") {
            L.tileLayer.provider('VWorld.Street').addTo(map);
        }
        else { // OSM
            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
                maxZoom: 18
            }).addTo(map);
        }



        $scope.map = map;
        var markers = new L.FeatureGroup();
        markers.clearLayers();

        /* divIcon - CSS 사용
        var simpleIcon = L.divIcon({
            className: 'css-simple-marker',
            iconSize: [20, 20]
        }*/

        // icon - Image 사용
        var simpleIcon = L.icon({
            iconUrl: 'img/cctv_temp_icon.png',
            iconSize: [20, 20],
            iconAnchor: [10, 10],
            popupAnchor: [0, -10],
            shadowSize: [0, 0]
        });

        var locationMarker = function(Location, item) {

            //var marker = L.marker(Location);
            var marker = L.marker(Location, {
                icon: simpleIcon
            });
            markers.addLayer(marker);

            if (item) {
                marker.bindPopup(
                    item.연번 + ", " + item.용도 + ", " + item.주소
                );
            }
            //soc.log(JSON.stringify(Location));
        }

        var dongjak = [];
        $http.get("data/cctv/dongjak.json")
            .then(function(response) {
                dongjak = response.data;
                soc.log("SUCCESS LOAD DONGJAK");
                //soc.log(JSON.stringify(response));
            }, function(response) {
                soc.log("FAILED LOAD DONGJAK");
                soc.log(JSON.stringify(response));
            });

        $scope.convert_dongjak = function() {

            var addPoint = function(item, isLast) {

                var showCctv = function(item) {
                    var Location = new L.LatLng(item.lat, item.lon);
                    locationMarker(Location, item);
                }

                if (!item.lat || !item.lon) {
                    var onSuccess = function(point, opts) {
                        soc.log(JSON.stringify(point));
                        item.lat = point.y;
                        item.lon = point.x;
                        //soc.log(JSON.stringify(item));

                        if (opts) {
                            soc.log(JSON.stringify(dongjak));
                        }
                        showCctv(item);
                    }

                    //soc.log(item.연번 + " " + item.주소);
                    soc.getPointFromAddress(item.주소, onSuccess, null, isLast);

                }
                else {
                    showCctv(item);
                }

            }

            //for(var i=dongjak.length-2; i<dongjak.length; i++) {
            for (var i = 0; i < dongjak.length; i++) {
                var isLast = false;
                if (i == dongjak.length - 1) isLast = true;

                addPoint(dongjak[i], isLast);
            }

            // makers 그룹은 변환 후 한번만 추가해 주는 것이 성능에 도움이 됩니다.
            map.addLayer(markers);
        }

        $scope.convert_dongjak();

    })