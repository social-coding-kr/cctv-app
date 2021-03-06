'use strict';
angular.module('starter.controllers') 

.factory('soc', function($rootScope, $http, $localStorage) {
    
    // initialize    
    
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
        lat: 37.5665,
        lon: 126.97864
      };
    };
    
    obj.dongjakLoc = { lat: 37.51245, lon: 126.9395 };
    obj.sindaebang2Loc = { lat: 37.498926, lon: 126.925838 };

    // GPS 정보
    obj.currentLocation = {
        lat: 37.5665,
        lon: 126.97864
    };
    
    obj.getCurrentLocation = function() {
      return obj.currentLocation;
    };
    
    obj.setCurrentLocation = function(lat, lon) {
      obj.currentLocation.lat = lat;
      obj.currentLocation.lon = lon;
    };
    
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
    
    // 좌표 주소 변환
    obj.getAdressFromPoint = function(coord, selectedCctv) {
      var apiUrl = ionic.Platform.isWebView()
        ? "http://openapi.map.naver.com/api/reversegeocode" : "/api/reversegeocode";
      var apiKey = "c3cdd592f9b2a05e8430c939808ba40b";
      var options = "?key=" + apiKey 
        + "&encoding=utf-8&coord=latlng&output=json&query="
        + coord;
      var request = apiUrl + options;  
      obj.log(request);
      
      $http.get(request).then(
        function(response) { // on success
          var result = response.data.result;
          // obj.log("좌표주소 변환 결과 :" + JSON.stringify(response));
          // obj.log("주소 :" + JSON.stringify(response.data.result.items[0].address));
          
          // selectedCctv 여부에 따라 변수 분리, 다음에 처리구조를 반드시 수정
          if(selectedCctv) {
            selectedCctv.cctv.address = response.data.result.items[0].address;
          } else {
            $rootScope.currentAddress = response.data.result.items[0].address;
          }
        }, function(response) { // on fail
          // obj.log("response :" + JSON.stringify(response));
        }
      );
    };
    
    // 추후에 자체 서버 관련 내용은 별도파일로 빼는게 좋을듯
    obj.getCctvs = function(params) {
      return $http.get(obj.server.mainUrl + "map/cctvs", {params: params});
    };
    
    obj.getCctvDetail = function(cctvId) {
      return $http.get(obj.server.mainUrl + "cctv/" + cctvId);
    };

    var dataUrl = "http://147.46.215.152:9000/data/";
    obj.data = {
      image: {
        defaultMarker:  dataUrl + "img/marker2.png",
        publicMarker:   dataUrl + "img/marker1.png",
        privateMarker:  dataUrl + "img/marker2.png",
      },
    };

    obj.stored = {
      get: function(key) { 
        var value = $localStorage.get("stored." + key); 
        
        if(value === undefined) 
          return undefined;
        else 
          return JSON.parse(value); 
      },
      set: function(key, value) { 
        return $localStorage.set("stored." + key, JSON.stringify(value)); 
        
      },
    }; 
    

    // config
    obj.config = {};
    obj.config.isDevelOptionEnabled = false;
    
    // 스트링을 다시 비교해야 하는게 마음에 안든다
    obj.config.isDevelModeVisible = $localStorage.get('develModeVisible', 'true') == 'true';
    obj.log("load develModeVisible: "  + obj.config.isDevelModeVisible
      + ", " + typeof(obj.config.isDevelModeVisible));    

    obj.config.onChangeDevelModeVisible = function() {
      obj.log("change develModeVisible: " + obj.config.isDevelModeVisible
        + ", " + typeof(obj.config.isDevelModeVisible));
      $localStorage.set('develModeVisible', obj.config.isDevelModeVisible);
    }
    
    obj.config.geoOptions = {};
    obj.config.geoOptions.timeout 
      = $localStorage.get('geoOptions.timeout', 10000);
      
    obj.log("geoOptions.timeout: " + obj.config.geoOptions.timeout);
    
    obj.config.geoOptions.onChangeTimeout = function() {
      $localStorage.set('geoOptions.timeout', obj.config.geoOptions.timeout);
    }
  
    obj.config.geoOptions.enableHighAccuracy 
      = $localStorage.get('geoOptions.enableHighAccuracy', 'true') == 'true';


    obj.config.geoOptions.onChangeEnableHighAccuracy = function() {
      $localStorage.set('geoOptions.enableHighAccuracy', obj.config.geoOptions.enableHighAccuracy);
    }

    obj.config.isDevelModeVisible = false;
    // config
    
    
    // TODO: 아래는 대충 만들어 둔것이고 나중에 정리
    var fonts = {
      //default: "",
      nanumgothic: "Nanum Gothic",
    };          
    var currentFontKey = "nanumgothic";
    
    
    var sheet;
    obj.setFont = function(fontKey) {
      obj.log("set Font: " + fontKey);
      currentFontKey = fontKey;
      
      if(fontKey == "default") {
        //document.removeChild(sheet);
      } else {
        var fontFileName = fontKey + ".css";
        var fontName = fonts[fontKey];

        sheet = document.createElement("style");
        sheet.innerHTML  = "@import url(http://fonts.googleapis.com/earlyaccess/" + fontFileName + ");";
        sheet.innerHTML += "html,body,input,button,textarea {font-family: '" + fontName + "'!important;}";
        sheet.innerHTML += ".cctv-app-font {font-family: '" + fontName +"' !important;}";
        document.body.appendChild(sheet);
      }
    }
    obj.setFont("nanumgothic");
    obj.getFont = function() { return currentFontKey; }
    
    return obj;
})
;
