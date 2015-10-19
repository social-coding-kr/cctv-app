'use strict';
angular.module('starter.controllers')

.factory('$cordovaBackground', ['$q', '$window',
function($q, $window) {

    var Background;
    document.addEventListener("deviceready", function () {
        if (ionic.Platform.isWebView()) {
            Background = $window.cordova.plugins.backgroundMode;
        }
    });    
    return {
        disable: function() { return Background.disable(); },
        isEnable: function() { return Background.isEnable(); },
        isActive: function() { return Background.isActive(); },
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
