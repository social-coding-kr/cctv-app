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

.config(function($stateProvider, $urlRouterProvider, $provide) {

//** Exception Handling
  var debug = true;
  var track = function() {}

  $provide.decorator('$exceptionHandler', ['$delegate', function($delegate) {
    return function(exception, cause) {
      $delegate(exception, cause);

      var data = {
        type: 'angular',
        url: window.location.hash,
        localtime: Date.now()
      };
      if (cause) {
        data.cause = cause;
      }
      if (exception) {
        if (exception.message) {
          data.message = exception.message;
        }
        if (exception.name) {
          data.name = exception.name;
        }
        if (exception.stack) {
          data.stack = exception.stack;
        }
      }

      if (debug) {
        console.log('exception', data);
        window.alert('Error: ' + data.message);
      }
      else {
        track('exception', data);
      }
    };
  }]);
  // catch exceptions out of angular
  window.onerror = function(message, url, line, col, error) {
    var stopPropagation = debug ? false : true;
    var data = {
      type: 'javascript',
      url: window.location.hash,
      localtime: Date.now()
    };
    if (message) {
      data.message = message;
    }
    if (url) {
      data.fileName = url;
    }
    if (line) {
      data.lineNumber = line;
    }
    if (col) {
      data.columnNumber = col;
    }
    if (error) {
      if (error.name) {
        data.name = error.name;
      }
      if (error.stack) {
        data.stack = error.stack;
      }
    }

    if (debug) {
      console.log('exception', data);
      window.alert('Error: ' + data.message);
    }
    else {
      track('exception', data);
    }
    return stopPropagation;
  };
  
//** Exception Handling

  
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
        controller: 'BonhunTestCtrl'
      }
    }
  })
  
  .state('app.bonhunTest', {
    url: '/bonhunTest',
    views: {
      'menuContent': {
        templateUrl: 'templates/bonhunTest.html',
        controller: 'BonhunTestCtrl'
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

  .state('app.takePicture', {
    url: '/takePicture',
    views: {
      'menuContent': {
        templateUrl: 'templates/takePicture.html', 
        controller: 'takePictureCtrl'
      }
    }
  })
  
  .state('app.slectPurpose', {
    url: '/selectPurpose',
    views: {
      'menuContent': {
        templateUrl: 'templates/selectPurpose.html', 
        controller: 'selectPurposeCtrl'
      }
    }
  })
  
  .state('app.confirmReport', {
    url: '/confirmReport',
    views: {
      'menuContent': {
        templateUrl: 'templates/confirmReport.html', 
        controller: 'confirmReportCtrl'
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
