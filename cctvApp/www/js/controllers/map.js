'use strict';
angular.module('starter.controllers')

.controller('MapCtrl', function($scope, $ionicLoading, $compile, soc) {
  
      //function init() {
      	 var map = L.map('map');
      	 var curLoc = soc.getDefaultLocation();
         var Seoul = new L.LatLng(curLoc.lat, curLoc.lon); // geographical point (longitude and latitude)
         map.setView(Seoul, 15);
      	 
      	 
         L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
            maxZoom: 18
         }).addTo(map);
         map.attributionControl.setPrefix(''); // Don't show the 'Powered by Leaflet' text.

               
         //var marker = L.marker([37.555107, 126.970691]).addTo(map);
         //marker.bindPopup("<b>Hello world!</b><br>I am a popup.").openPopup();
        
         $scope.map = map;
      //}

      
    $scope.centerOnMe = function() {
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
          var Location = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
          $scope.map.setView(Location, 13);
          $scope.loading.hide();
        }, function(error) {
          alert('Unable to get location: ' + error.message);
        });
    };
      
    $scope.clickTest = function() {
        alert('Example of infowindow with ng-click')
    };
})