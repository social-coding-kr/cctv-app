'use strict';
angular.module('starter.controllers') 

.factory('soco', function($rootScope) {
    
    // initialize    
    $rootScope.soco = {};
    var socoInRoot = $rootScope.soco;
    socoInRoot.console_output = "";
    
    var mock_data = 'data_mock';
    var sub = {};
    sub.A = "A";


    // log
    var log = function(message) { 
      console.log("SOCO message: " + message); 
      log.num += 1;
      socoInRoot.console_output += 
      "  [ SOCO_LOG : " + log.num + " ] " + message;
    }
    
    log.clear = function() {
      log.num = 0;
      socoInRoot.console_output = "CLEAR... ";
    }
    
    log.clear();
    // log      

    // server
    socoInRoot.server = {};
    socoInRoot.server.main_url = "http://147.46.215.152:8099/";

    // server

    // config
    socoInRoot.config = {};
    socoInRoot.config.isDevelOptionEnabled = true;
    socoInRoot.config.isDevelModeVisible = socoInRoot.config.isDevelOptionEnabled;    
    
    // config



    return {
        getMock : function() { return mock_data; },
        log : log,
        server : socoInRoot.server,
        config : socoInRoot.config,
        _tail : null
    }

})
;
/*
angular.module('starter.controllers', [])
.factory('soco', function($rootScope) {
    
    // initialize    
    $rootScope.soco = {};
    var soco = $rootScope.soco;
    
    soco.mock_data = 'data_mock';
    
    return {
        getMock : function() { return soco.mock_data; },
        log : function(message) { console.log("SOCO message"); }
    }
})
*/