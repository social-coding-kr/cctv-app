'use strict';
angular.module('starter.controllers')

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $compile, soc, $ionicViewService) {

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
    
    function MyLocationMarker(Location) {
        var marker = L.marker(Location);
        markers.addLayer(marker);
        map.addLayer(markers);
        marker.bindPopup('You are here.')
            .openPopup();
    }

    $rootScope.centerOnMe = function() {
        //soc.log("hahaha" + JSON.stringify($scope.map));
        if(!$scope.map) {
          return;
        }

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });

        navigator.geolocation.getCurrentPosition(function(pos) {
        //soc.log(JSON.stringify($scope.map));
            markers.clearLayers();
            var Location = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
            MyLocationMarker(Location);
            $scope.map.setView(Location, 15);
            $ionicLoading.hide();
        }, function(error) {
            alert('Unable to get location: ' + error.message);
        });
    };
    
    $ionicViewService.nextViewOptions({
        disableBack: true
    });
    
    $rootScope.loadingFromReport = function() {
        if($rootScope.confirmVal === true) {
            // alert($rootScope.confirm);
            $ionicViewService.nextViewOptions({
                disableBack: true
            });
            $rootScope.centerOnMe();
            $rootScope.confirmVal = false;
        } else {
            // do nothing
        }
    };
        
    $rootScope.loadingFromReport();
})