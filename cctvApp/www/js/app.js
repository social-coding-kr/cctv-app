// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova'])

.run(function($ionicPlatform, $rootScope, soc) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
    
    $rootScope.soc = soc;
  });

})

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider

    .state('app', {
    url: '/app',
    abstract: true,
    templateUrl: 'templates/menu.html',
    controller: 'AppCtrl'
  })

  .state('app.search', {
    url: '/search',
    views: {
      'menuContent': {
        templateUrl: 'templates/search.html'
      }
    }
  })

  .state('app.map', {
      url: '/map',
      views: {
        'menuContent': {
          templateUrl: 'templates/map.html',
          controller: 'MapCtrl'
        }
      }
    })
    .state('app.playlists', {
      url: '/playlists',
      views: {
        'menuContent': {
          templateUrl: 'templates/playlists.html',
          controller: 'PlaylistsCtrl'
        }
      }
    })


  .state('app.devel', {
    url: '/devel',
    views: {
      'menuContent': {
        templateUrl: 'templates/devel.html',
        controller: 'DevelCtrl'
      }
    }
  })

  .state('app.devel2', {
    url: '/devel2',
    views: {
      'menuContent': {
        templateUrl: 'templates/devel2.html',
        controller: 'DevelCtrl2'
      }
    }
  })

  .state('app.devlog', {
    url: '/devlog',
    views: {
      'menuContent': {
        templateUrl: 'templates/devlog.html',
        controller: 'DevelCtrl'
      }
    }
  })

  .state('app.cctvdetail', {
    url: '/cctvdetail',
    views: {
      'menuContent': {
        templateUrl: 'templates/cctvdetail.html',
        controller: 'CCTVDetailCtrl'
      }
    }
  })

  .state('app.config', {
    url: '/config',
    views: {
      'menuContent': {
        templateUrl: 'templates/config.html'
      }
    }
  })

  .state('app.takeCctvPicture', {
    url: '/takePicture', //controller url
    views: {
      'menuContent': {
        templateUrl: 'templates/takeCctvPicture.html', 
        controller: 'takePictureCtrl'
      }
    }
  })
  
  .state('app.selectPurpose', {
    url: '/selectPurpose', //controller url
    views: {
      'menuContent': {
        templateUrl: 'templates/selectPurpose.html', 
        controller: 'selectPurposeCtrl'
      }
    }
  })

  .state('app.single', {
    url: '/playlists/:playlistId',
    views: {
      'menuContent': {
        templateUrl: 'templates/playlist.html',
        controller: 'PlaylistCtrl'
      }
    }
  });
  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/map');
});
