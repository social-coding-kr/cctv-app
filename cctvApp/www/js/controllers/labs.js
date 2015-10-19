'use strict';
angular.module('starter.controllers')

.controller('labsCtrl', function($scope, $window, soc) {
    
    var audioFile = "data/1.mp3";
    
if(ionic.Platform.isWebView()) {
    var trackPlaying = false; // This variable will tell us if track is playing
 
    // Preload a music track on app initialization
    window.plugins.NativeAudio.preloadComplex('music', audioFile, 1, 1, 0, function(msg) {
      console.log('msg: ' + msg); // Loaded
    }, function(msg) {
      alert('error: ' + msg); // Loading error
    });
 
    $scope.playAudio = function() {
 
      // Start preloaded track
      window.plugins.NativeAudio.loop('music');
      trackPlaying = true; // Track is playing
    }
 
    // Play audio function
    $scope.playAudioBack = function() {
 
      // Enable background mode while track is playing
      window.cordova.plugins.backgroundMode.enable();
 
      // Called when background mode has been activated
      window.cordova.plugins.backgroundMode.onactivate = function() {
        // if track was playing resume it
        if(trackPlaying) {
          window.plugins.NativeAudio.loop('music');
        }
      }
 
      // Start preloaded track
      window.plugins.NativeAudio.loop('music');
      trackPlaying = true; // Track is playing
/*
      // Stop multichannel clip after 98 seconds, provided track runs for 1:38 min
      window.setTimeout(function() {
 
        window.plugins.NativeAudio.stop('music');    // Stop audio track
        window.plugins.NativeAudio.unload('music');  // Unload audio track and save memory
 
        // disable application if we're still in background and audio is no longer playing
        window.cordova.plugins.backgroundMode.disable();
         
        // Audio is no longer playing
        trackPlaying = false;
 
      }, 1000 * 98);
*/      
    };
 
    // Stop audio function
    $scope.stopAudio = function() {
      // Stop preloaded track
      window.plugins.NativeAudio.stop('music');
      trackPlaying = false;
      window.cordova.plugins.backgroundMode.disable();      
    };

  
}
})