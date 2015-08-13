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
    }
    
    obj.log.clear = function() {
      obj.log.num = 0;
      obj.log.output = "CLEAR... ";
    }
    obj.log.clear();
    // log      

    // server
    obj.server = {};
    obj.server.main_url = "http://147.46.215.152:8099/";

    // server

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
