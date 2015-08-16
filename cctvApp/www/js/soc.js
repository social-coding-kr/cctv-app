'use strict';
angular.module('starter.controllers') 

.factory('soc', function($rootScope) {
    
    // initialize    
    //$rootScope.soc = {};
    //var obj = $rootScope.soc;
    
    var obj = {};
    
    obj.log = function(message) {
      console.log("SOC_LOG : " + message); 
      obj.log.num += 1;
      obj.log.output += 
        "  [ SOC_LOG : " + obj.log.num + " ] " + message;
      var item = "[ " + obj.log.num + " ] " + message;
      obj.log.items = [item].concat(obj.log.items);
      //obj.log.items.push(item)
    }
    
    obj.log.clear = function() {
      obj.log.items = [];
      obj.log.num = 0;
      obj.log.output = "CLEAR... ";
    }
    obj.log.clear();
    // log      

    // server
    obj.server = {};
    obj.server.main_url = "http://147.46.215.152:8099/";

    // server
    obj.getDefaultLocation = function() {
      return {
        lat: 37.555107,
        lon: 126.970691
      }
    }
    
    // GPS 정보
    obj.currentLocation = {
        lat: 37.555107,
        lon: 126.970691
    };
    
    obj.getCurrentLocation = function() {
      return obj.currentLocation;
    }
    
    obj.setCurrentLocation = function(lat, lon) {
      obj.currentLocation.lat = lat;
      obj.currentLocation.lon = lon;
    }
    


    // config
    obj.config = {};
    obj.config.isDevelOptionEnabled = true;
    obj.config.isDevelModeVisible = obj.config.isDevelOptionEnabled;    
    
    // config

    return obj;
/*
    return {
        log : obj.log,
        server : obj.server,
        config : obj.config,
        _tail : null
    }
*/
})
;
