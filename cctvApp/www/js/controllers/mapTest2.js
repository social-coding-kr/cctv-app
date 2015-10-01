'use strict';

angular.module('starter.controllers')

.controller('MapTest2Ctrl',
  function($scope, soc) {

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
    var bound1 = map.getBounds();

    maps.event.addListenerOnce(map, 'idle', function() {
      soc.log("Map Loaded!");
      
      // Create the search box and link it to the UI element.
      var input = document.getElementById('pac-input');
      var searchBox = new maps.places.SearchBox(input);
      map.controls[maps.ControlPosition.TOP_LEFT].push(input);

      soc.log("map.controls");
      searchBox.addListener('places_changed', function() {
        var places = searchBox.getPlaces();
        soc.log("places.length: " + places.length);
        
        if (places.length == 0) {
          return;
        }

        // For each place, get the icon, name and location.
        var bounds = new maps.LatLngBounds();
        
        places.forEach(function(place) {

          if (place.geometry.viewport) {
            // Only geocodes have viewport.
            bounds.union(place.geometry.viewport);
          }
          else {
            bounds.extend(place.geometry.location);
          }
        });
        map.fitBounds(bounds);
      });      

      refreshMapInfo(map);
      // requestCctvs();
    });
  }
)
