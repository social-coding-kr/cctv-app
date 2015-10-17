'use strict';
angular.module('starter.controllers')

.factory('$cordovaDiagnostic', ['$q', '$window',
function($q, $window) {

    var Diagnostic;
    document.addEventListener("deviceready", function () {
        if (ionic.Platform.isWebView() && ionic.Platform.isAndroid()) {
            Diagnostic = $window.cordova.plugins.diagnostic;
        }
    });    
    return {

        getLocationMode: function() {
            var q = $q.defer();
            if(Diagnostic) {
                Diagnostic.getLocationMode(function(mode) {
                    q.resolve(mode);
                }, function(error) {
                    q.reject(error);
                });
            } else {
                q.reject("only available Android");                   
            }
            return q.promise;            
        },
        isLocationEnabled: function() {
            var q = $q.defer();
            if(Diagnostic) {
                Diagnostic.isLocationEnabled(function(enable) {
                    q.resolve((enable == true));
                }, function(error) {
                    q.reject(error);
                });
            } else {
                q.reject("only available Android");                   
            }
            return q.promise;            
        },
        isGpsLocationEnabled: function() {
            var q = $q.defer();
            if(Diagnostic) {
                Diagnostic.isGpsLocationEnabled(function(enable) {
                    q.resolve((enable == true));
                }, function(error) {
                    q.reject(error);
                });
            } else {
                q.reject("only available Android");                   
            }
            return q.promise;            
        },
        isNetworkLocationEnabled: function() {
            var q = $q.defer();
            if(Diagnostic) {
                Diagnostic.isNetworkLocationEnabled(function(enable) {
                    q.resolve((enable == true));
                }, function(error) {
                    q.reject(error);
                });
            } else {
                q.reject("only available Android");                   
            }
            return q.promise;            
        },
        switchToLocationSettings: function() {
            if (Diagnostic) {    
                Diagnostic.switchToLocationSettings();
            } else {
                
            }
        },
    };

}    
]);
