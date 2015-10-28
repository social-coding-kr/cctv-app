// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('starter', ['ionic', 'starter.controllers', 'ngCordova'])

.run(function($ionicPlatform, $cordovaSplashscreen, $rootScope, $cordovaNetwork, soc) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    setTimeout(function() {
      if(navigator.splashscreen)
        navigator.splashscreen.hide();

      $rootScope.app = { net : { status : true}};

      if(ionic.Platform.isWebView()) {
        var isOnline = $cordovaNetwork.isOnline();
        var isOffline = $cordovaNetwork.isOffline();

        if (isOnline === false || isOffline === true)
        {
          alert('인터넷과의 연결이 끊어져 서비스 이용이 불가능합니다. 통신상태를 확인해주세요.');

        }
      }
    }, 500);

    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required

      StatusBar.styleDefault();
    }

    


    document.addEventListener("deviceready", function () {

      $rootScope.$on('$cordovaNetwork:offline', function(event, networkState){
        alert('인터넷과의 연결이 끊어져 서비스 이용이 불가능합니다. 통신상태를 확인해주세요.');
      });
    }, false);

    $rootScope.soc = soc;
  });

})

.factory('$localStorage', ['$window', function($window) {
  return {
    set: function(key, value) {
      $window.localStorage[key] = value;
    },
    get: function(key, defaultValue) {
      return $window.localStorage[key] || defaultValue;
    },
    setObject: function(key, value) {
      $window.localStorage[key] = JSON.stringify(value);
    },
    getObject: function(key) {
      return JSON.parse($window.localStorage[key] || '{}');
    }
  }
}])

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
/*
      .state('appstart', {
        url: '/appstart',
        templateUrl: 'templates/splash.html',
        controller: 'AppSplash'
      })
*/
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

  .state('app.cctvlaw', {
    url: '/cctvlaw',
    views: {
      'menuContent': {
        templateUrl: 'templates/cctvlaw.html',
        controller: 'CctvLawCtrl'
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
        controller: 'MapCtrl'
      }
    }
  })
  
  .state('app.cctvApiTest', {
    url: '/cctvApiTest',
    views: {
      'menuContent': {
        templateUrl: 'templates/cctvApiTest.html',
        controller: 'CCTVAPITestCtrl'
      }
    }
  })
  
  .state('app.oauthApiTest', {
    url: '/oauthApiTest',
    views: {
      'menuContent': {
        templateUrl: 'templates/oauthApiTest.html',
        controller: 'OauthAPITestCtrl'
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
  
  .state('app.developtions', {
    url: '/developtions',
    views: {
      'menuContent': {
        templateUrl: 'templates/developtions.html',
        controller: 'develOptionsCtrl'
      }
    }
  })

  .state('app.report', {
    url: '/report',
    views: {
      'menuContent': {
        templateUrl: 'templates/report.html', 
        //controller: 'reportCtrl'
      }
    }
  })
  
  .state('app.backButtonTest', {
    url: '/backButtonTest',
    views: {
      'menuContent': {
        templateUrl: 'templates/backButtonTest.html'
      }
    }
  })

  ;

  // if none of the above states are matched, use this as the fallback
  //$urlRouterProvider.otherwise('/appstart');
  $urlRouterProvider.otherwise('/app/map');

})
/*
.controller('AppSplash', function($scope, $location, $interval) {

      // this controller is dead or sleep
      //

      $scope.init = function ()
      {

        //init

        $scope.event_splash_delay = $interval($scope.go2mainPage, 2000);

      };

      $scope.go2mainPage = function ()
      {
        $interval.cancel($scope.event_splash_delay);
        $location.path('/app/map');
        $location.replace();
      }


});
*/
