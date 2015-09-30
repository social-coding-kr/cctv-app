'use strict';

angular.module('starter.controllers')

.controller('MapTest2Ctrl',
  function($scope, soc) {
    $scope.search = {};

    var maps = google.maps;

    var initMap = function() {
      var defaultLatLng = soc.getDefaultLocation();


      var mapContainer = document.getElementById('mapTestGoogle2');
      var mapZoomControlOption = {
        position: maps.ControlPosition.RIGHT_TOP,
        style: maps.ZoomControlStyle.LARGE,
      };
      var mapOption = {
        center: new maps.LatLng(defaultLatLng.lat, defaultLatLng.lon),
        zoomControlOptions: mapZoomControlOption,
        zoom: 15,
        maxZoom: 19,
        minZoom: 14,
      };
      var map = new maps.Map(mapContainer, mapOption);

      return map;
    }


    var refreshMapInfo = function(map) {
      $scope.mapInfoCenter = map.getCenter().toString();
      var bounds = map.getBounds();
      $scope.mapInfoSW = bounds.getSouthWest().toString();
      $scope.mapInfoNE = bounds.getNorthEast().toString();
      $scope.mapInfoZoomLevel = map.getLevel();
    }

    var map = initMap();
    var geocoder = new google.maps.Geocoder();

    maps.event.addListenerOnce(map, 'idle', function() {
      soc.log("Map Loaded!");
      refreshMapInfo(map);
      // requestCctvs();
    });
    
    // 주소 검색
    $scope.searchAddress = function() {
      soc.log($scope.search.address);
      geocoder.geocode({'address': $scope.search.address}, function(results, status) {

        if (status === google.maps.GeocoderStatus.OK) {
          map.setCenter(results[0].geometry.location);
        } else {
          alert('Geocode was not successful for the following reason: ' + status);
        }
      });      
    }
  }
  
  
)
