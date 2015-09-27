'use strict';

angular.module('starter.controllers')

.controller('MapTest2Ctrl',
    function($scope, soc) {
    
        var maps = google.maps;    
        
        var initMap = function() {
            var defaultLatLng = soc.getDefaultLocation();
        

            var mapContainer = document.getElementById('mapTestGoogle2');
            var mapOption = {
                center: new maps.LatLng(defaultLatLng.lat, defaultLatLng.lon),
                zoom: 15,
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
        
            maps.event.addListenerOnce(map, 'idle', function() {
                soc.log("Map Loaded!");
                refreshMapInfo(map);
                // requestCctvs();
            });        
    }
)
