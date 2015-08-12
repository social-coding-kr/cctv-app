'use strict';
angular.module('starter.controllers') 

.factory('soc', function($rootScope) {
    
    // initialize    
    $rootScope.soc = {};
    var socInRoot = $rootScope.soc;
    socInRoot.console_output = "";
    
    var mock_data = 'data_mock';
    var sub = {};
    sub.A = "A";


    // log
    var log = function(message) { 
      console.log("SOC_LOG : " + message); 
      log.num += 1;
      socInRoot.console_output += 
      "  [ SOC_LOG : " + log.num + " ] " + message;
    }
    
    log.clear = function() {
      log.num = 0;
      socInRoot.console_output = "CLEAR... ";
    }
    
    log.clear();
    // log      

    // server
    socInRoot.server = {};
    socInRoot.server.main_url = "http://147.46.215.152:8099/";

    // server

    // config
    socInRoot.config = {};
    socInRoot.config.isDevelOptionEnabled = true;
    socInRoot.config.isDevelModeVisible = socInRoot.config.isDevelOptionEnabled;    
    
    // config



    return {
        getMock : function() { return mock_data; },
        log : log,
        server : socInRoot.server,
        config : socInRoot.config,
        _tail : null
    }

})
;
