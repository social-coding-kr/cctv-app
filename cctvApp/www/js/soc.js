'use strict';
angular.module('starter.controllers') 

.factory('soc', function($rootScope, $http, $localStorage) {
    
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
    
    // device 정보 출력
    obj.log("isWebView: " + ionic.Platform.isWebView());
    obj.log("isAndroid: " + ionic.Platform.isAndroid());
    obj.log("platform: " + ionic.Platform.platform());
    obj.log("version: " + ionic.Platform.version());    
    obj.log("window.localStorage: " + (window.localStorage !== undefined));
    obj.log("window.openDatabase: " + (window.openDatabase !== undefined));
    obj.log("navigator.geolocation: " + (navigator.geolocation !== undefined));
    obj.log("navigator.userAgent: " + JSON.stringify(navigator.userAgent));
    obj.log("navigator.platform: " + JSON.stringify(navigator.platform));    

    // 아래는 의미없는 정보
    //obj.log("navigator.appName: " + JSON.stringify(navigator.appName));
    //obj.log("navigator.appVersion: " + JSON.stringify(navigator.appVersion));
    //obj.log("navigator.appCodeName: " + JSON.stringify(navigator.appCodeName));

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
    
    // 추후에 자체 서버 관련 내용은 별도의 JS 파일로 빼는게 좋을듯
    obj.getCctvs = function(params) {
      return $http.get(obj.server.mainUrl + "map/cctvs", {params: params});
    }


    obj.mapProvider = google;        
    obj.mapProviderText = "Daum"; //실제프로바이더와 반대로 보여줌

    obj.mapContainer = {};
    obj.mapOptions = {};
    /*
    obj.initMap = function(container, options) {
        obj.mapContainer = container;
        obj.mapOptions = options;
		    return new obj.mapProvider.maps.Map(container, options); 
    }*/

    obj.changeMap = function() {
      obj.log("changeMap");
      if(obj.mapProvider === google) {
        obj.mapProvider = daum;
        obj.mapProviderText = "Google";
      } else {
        obj.mapProvider = google;
        obj.mapProviderText = "Daum";
      }       
      
    }
    

    

    
    // Map 공통
    var markerImageSrc = 'img/map-pin_17x30.png'; // 마커이미지의 주소입니다  
    var markerImageSize = new obj.mapProvider.maps.Size(15, 26); // 마커이미지의 크기입니다
    var markerImageOption = {offset: new obj.mapProvider.maps.Point(7, 26)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다			
      
    // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
    var markerImage = new obj.mapProvider.maps.MarkerImage(markerImageSrc, markerImageSize, markerImageOption);
    
    obj.getMarkerImage = function(options) {
      // 추후 options에 따라 다른 마커 이미지를 반환
      if(obj.mapProvider === google) {
        return markerImageSrc; 
      } else {
        return markerImage;
      }
    }


    // config
    obj.config = {};
    obj.config.isDevelOptionEnabled = true;
    
    // 스트링을 다시 비교해야 하는게 마음에 안든다
    obj.config.isDevelModeVisible = $localStorage.get('develModeVisible', 'true') == 'true';
    obj.log("load develModeVisible: "  + obj.config.isDevelModeVisible
      + ", " + typeof(obj.config.isDevelModeVisible));    

    obj.config.onChangeDevelModeVisible = function() {
      obj.log("change develModeVisible: " + obj.config.isDevelModeVisible
        + ", " + typeof(obj.config.isDevelModeVisible));
      $localStorage.set('develModeVisible', obj.config.isDevelModeVisible);
    }
    
    // config
    
    obj.MapTestOnSelect = function(args) {
    }
    
    obj.MapTestOnDeselect = function(args) {
    }
    

    return obj;
})
;
