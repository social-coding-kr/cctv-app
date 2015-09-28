'use strict';
angular.module('starter.controllers') 

.factory('oauthService', ['$cordovaOauth', '$localStorage', '$http', '$rootScope',
function($cordovaOauth, $localStorage, $http, $rootScope) {
  
  var access_token = undefined;

  $rootScope.facebook_data = {
        id : 'none',
        name : 'none',
        email : 'please sign-in',
        picture : {}
  };
  
  var facebook_profile = function(try_login) {
    if (access_token != undefined) {
      $http.get("https://graph.facebook.com/v2.2/me",
        {
          params: {
            access_token: access_token,
            fields: "id,name,email,picture",
            format: "json" 
          }
        }
      ).then(function(result) {
          $rootScope.facebook_data = result.data;
        }, function(error) {
          // 토큰이 만료된 것 일 수 있습니다.
          if (try_login) {
            facebook_logout();
            facebook_login();
          }
        }
      );
    }
  };
  
  var facebook_login = function() {
    if ( $localStorage.get('access_token', 'none') == 'none' ) {
      $cordovaOauth.facebook("146113749059667",
        ["email"])
          .then(function(result) {
            $localStorage.set('access_token', result.access_token)
            access_token = result.access_token;
            facebook_profile(true);
      }, function(error) {
          alert(error);
      });
    } else {
      access_token = $localStorage.get('access_token', 'none');
      facebook_profile(true);
    }
  };
  
  var facebook_logout = function() {
    $localStorage.set('access_token', 'none');
  };
  
  facebook_profile(false);

  return {
    login: function() {
      facebook_login(true);
    }
  };
}])
;
