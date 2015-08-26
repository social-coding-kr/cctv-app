'use strict';
angular.module('starter.controllers')

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $http, soc, $cordovaGeolocation, $ionicHistory, $ionicPopup) {

    var map = L.map('map');
    var curLoc = soc.getDefaultLocation();
    var Seoul = new L.LatLng(curLoc.lat, curLoc.lon); // geographical point (longitude and latitude)
    map.setView(Seoul, 15);
      	 
    L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        maxZoom: 18
    }).addTo(map);
    
    map.attributionControl.setPrefix(''); // Don't show the 'Powered by Leaflet' text.
    $scope.map = map;
    var markers = new L.FeatureGroup();
    
/*    var dongjak = [];
    $http.get("data/cctv/dongjak.json")
        .then(function(response) {
            dongjak = response.data;
            soc.log("SUCCESS LOAD DONGJAK");
            //soc.log(JSON.stringify(response));
        }, function(response) {
            soc.log("FAILED LOAD DONGJAK");
            soc.log(JSON.stringify(response));
        });
*/
    
    //내 위치에 마크를 설정하여 주는 함수.
    function MyLocationMarker(Location, Accuracy) {
        var marker = L.marker(Location);
        markers.addLayer(marker);
        map.addLayer(markers);
        marker.bindPopup('You are here.</p>이 지점을 기준으로 반경 ' + Accuracy + ' 미터 안에 있습니다.')
            .openPopup();
    }
    
    //일정 시간 동안 gps정보를 이용할 수 없을 시 토스트를 띄워주는 함수.
    function TimeExpired() {
        var alertPopup = $ionicPopup.alert({
            title: 'GPS 정보를 이용할 수 없습니다.',
            template: '기기의 GPS상태를 확인하거나 유저 폴트의 여부를 확인하세요.'
        });
        alertPopup.then();
    }

    //내 위치를 잡아주는 함수
    $rootScope.centerOnMe = function() {
        if(!$scope.map) {
          return;
        }

        $scope.loading = $ionicLoading.show({
          content: 'Getting current location...',
          showBackdrop: false
        });
        
        markers.clearLayers();
        if(ionic.Platform.isWebView() == true) {
        // 플러그인 사용
            var posOptions = {timeout: 10000, enableHighAccuracy: false};
            $cordovaGeolocation
            .getCurrentPosition(posOptions)
            .then(function (pos) {
                 var Location = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
                 var accuracy = pos.coords.accuracy;
                 MyLocationMarker(Location, accuracy);
                 $scope.map.setView(Location, 15);
            }, function(error) {
                TimeExpired();
            });
        } else {
	        // html5 기존 함수 사용
	        navigator.geolocation.getCurrentPosition(function(pos) {
            var Location = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
            var accuracy = pos.coords.accuracy;
            MyLocationMarker(Location, accuracy);
            $scope.map.setView(Location, 15);
            }, function(error) {
                TimeExpired();
            });
        }
        $ionicLoading.hide();
    };
    
    // 등록 확정화면에서 넘어올 때 현재 위치를 잡아주고 뒤로가기 버튼을 없애주는 함수
    $ionicHistory.nextViewOptions({
        disableBack: true
    });
    
    $rootScope.loadingFromReport = function() {
        if($rootScope.confirmVal === true) {
            // alert($rootScope.confirm);
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $rootScope.centerOnMe();
            $rootScope.confirmVal = false;
        } else {
            // do nothing
        }
    };
        
    $rootScope.loadingFromReport();
    
})