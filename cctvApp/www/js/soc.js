'use strict';
angular.module('starter.controllers') 

.factory('soc', function($rootScope, $http) {
    
    // initialize    
    //$rootScope.soc = {};
    //var obj = $rootScope.soc;
    
    var obj = {};
    
    obj.log = function(message) {
      console.log("SOC_LOG : " + message); 
      obj.log.num += 1;
      var logItem = "[ " + obj.log.num + " ] " + message;
      obj.log.items = [logItem].concat(obj.log.items);
    }
    
    obj.log.clear = function() {
      obj.log.items = [];
      obj.log.num = 0;
      obj.log.output = "CLEAR... ";
    }
    obj.log.clear();
    // log      
    obj.log("isWebView: " + ionic.Platform.isWebView());
    obj.log("isAndroid: " + ionic.Platform.isAndroid());

    

    // server
    obj.server = {};
    obj.server.mainUrl = "http://147.46.215.152:8099/";

    // server
    obj.getDefaultLocation = function() {
      return {
        lat: 37.555107,
        lon: 126.970691
      }
    }
    
    obj.dongjakLoc = { lat: 37.51245, lon: 126.9395 };
    obj.sindaebang2Loc = { lat: 37.498926, lon: 126.925838 };

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
    
    obj.getPointFromAddress = function(addr, cbThen, cbError, opts) {
      var apiUrl = ionic.Platform.isWebView() 
        ? "http://openapi.map.naver.com/api/geocode" : "/api/geocode";
      var apiKey = "c3cdd592f9b2a05e8430c939808ba40b";
      var options = "?key=" + apiKey 
        + "&encoding=utf-8&coord=latlng&output=json&query="
        + addr;
      var request = apiUrl + options;     

      $http.get(request)
        .then(function(response) {
          if(response.data.error) {
            obj.log("Error: " + response.data.error.msg);
            return;
          }
          
          //obj.log("RECV: " + JSON.stringify(response));
          var result = response.data.result;
          if(result.total > 1) { 
            obj.log("error: 검색된 개수가 여러개임"); 
            if(cbError) cbError(result, opts);
            return;
          }
          
          if(cbThen) { obj.log("Then!!!"); cbThen(result.items[0].point, opts); }
        }, function(response) {
          obj.log("ErrOr: " + JSON.stringify(response));
        }
      );
    }

    // config
    obj.config = {};
    obj.config.isDevelOptionEnabled = true;
    obj.config.isDevelModeVisible = obj.config.isDevelOptionEnabled;    
    
    // config

    return obj;
})
;
