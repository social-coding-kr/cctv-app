'use strict';
angular.module('starter.controllers')

.controller('MapTestCtrl', 
    function($rootScope, $scope, $ionicLoading, $compile, $http, soc) {

    var map = L.map('map2');
    var curLoc = soc.sindaebang2Loc;
    var Seoul = new L.LatLng(curLoc.lat, curLoc.lon); // geographical point (longitude and latitude)
    map.setView(Seoul, 15);


    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);

    $scope.map = map;
    var markers = new L.FeatureGroup();
    markers.clearLayers();
    
        var locationMarker = function(Location, item) {
            var marker = L.marker(Location);
            markers.addLayer(marker);
            map.addLayer(markers);
            if(item) {
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
            
            if(!item.lat || !item.lon) {
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
                
            } else {
                showCctv(item);
            }
            
        }        

        //for(var i=dongjak.length-2; i<dongjak.length; i++) {
        for(var i=0; i<dongjak.length; i++) {
            var isLast = false;
            if(i == dongjak.length-1) isLast = true;
            
            addPoint(dongjak[i], isLast);
        }
    }
    
    $scope.convert_dongjak();

})