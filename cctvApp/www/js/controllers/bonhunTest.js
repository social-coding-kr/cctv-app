'use strict';
angular.module('starter.controllers')

// 작성자 : 구본헌
// 2015. 08. 21 : 페이스북 로그인 기능 추가
.controller('BonhunTestCtrl', function($scope, $cordovaOauth, $localStorage, $http) {
    
    $scope.back_log = '';
    
    $scope.facebook_profile = {
        id : 'none',
        name : 'none',
        email : 'none'
    };
    
    // 페이스북 access_token 값이 들어오면 프로필을 요청합니다.
    $scope.$watch('access_token', function() {
        if ($scope.access_token != undefined) {
            $http.get("https://graph.facebook.com/v2.2/me",
                {
                    params: {
                        access_token: $scope.access_token,
                        fields: "id,name,email",
                        format: "json" 
                    }
                }
            ).then(function(result) {
                    $scope.facebook_profile = result.data;
                }, function(error) {
                    // 토큰이 만료된 것 일 수 있습니다.
                    // - 여기서 로그인을 부르는 것이 맞는가? 무한히 불릴 가능성은?
                    $scope.facebook_logout();
                    $scope.facebook_login();
                }
            );
        }
    });

    // 페이스북 로그인,
    // 만약 이미 로컬에 token이 저장되어 있다면, token 값을 이용합니다.
    $scope.facebook_login = function() {
        
        if ( $localStorage.get('access_token', 'none') == 'none' ) {
            $cordovaOauth.facebook("146113749059667",
                ["email"])
                .then(function(result) {
                $localStorage.set('access_token', result.access_token)
                $scope.access_token = result.access_token;
            }, function(error) {
                alert(error);
            });
        } else {
            $scope.access_token = $localStorage.get('access_token', 'none');
        }
    };
    
    $scope.facebook_logout = function() {
        $localStorage.set('access_token', 'none');
    };
})