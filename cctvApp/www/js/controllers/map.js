'use strict';
angular.module('starter.controllers')

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $http, soc, $cordovaGeolocation) {

    var map = L.map('map');
    var curLoc = soc.getDefaultLocation();
    var Seoul = new L.LatLng(curLoc.lat, curLoc.lon); // geographical point (longitude and latitude)
    map.setView(Seoul, 15);
      	 
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);
    
    map.attributionControl.setPrefix(''); // Don't show the 'Powered by Leaflet' text.
    $scope.map = map;
    var markers = new L.FeatureGroup();
    
/*    var dongjak = [];
    $http.get("data/cctv/dongjak.json")
        .then(function(response) {
            dongjak = response.data;
            soc.log("SUCCESS LOAD DONGJAK");
            //soc.log(JSON.stringify(response));
        }, function(response) {
            soc.log("FAILED LOAD DONGJAK");
            soc.log(JSON.stringify(response));
        });
*/
    
    function MyLocationMarker(Location) {
        var marker = L.marker(Location);
        markers.addLayer(marker);
        map.addLayer(markers);
        marker.bindPopup('You are here.')
            .openPopup();
    }

    $rootScope.centerOnMe = function() {
        if(!$scope.map) {
          return;
        }

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });
        
        markers.clearLayers();
        if(ionic.Platform.isWebView() == true) {
        // 플러그인 사용
            var posOptions = {timeout: 10000, enableHighAccuracy: true, maximumAge: 60000};
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function (pos) {
                 var Location = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
                 MyLocationMarker(Location);
                 $scope.map.setView(Location, 15);
                }, function(err) {
                    alert('Unable to get location: ' + error.message);
                });
        } else {
	        // html5 기존 함수 사용
	        navigator.geolocation.getCurrentPosition(function(pos) {
            var Location = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
            MyLocationMarker(Location);
            $scope.map.setView(Location, 15);
            }, function(error) {
                alert('Unable to get location: ' + error.message);
            });    
        }

        $ionicLoading.hide();
    };
})