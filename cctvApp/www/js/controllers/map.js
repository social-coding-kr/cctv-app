'use strict';
var myLat;
var myLng;

angular.module('starter.controllers')

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, soc, $cordovaGeolocation, $ionicHistory, $ionicPopup) {

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

    var scale = new L.Control.Scale().addTo(map);
    
    // Ionic 기본 아이콘은 아래 링크 참고
    // http://www.shape5.com/demo/images/general/ionicons/cheatsheet.html
    
    // custom LeafletJS Plugin
    var simpleButton1 = new L.Control.customControl({ 
        position:   "topleft",
        innerHTML:  "<i class='ion-android-share'></i>",
        onClick:    function(control) { alert(control.options.position); }
    });


    var simpleButton3 = new L.Control.customControl({ 
        position:   "bottomright",
        innerHTML:  "<i class='ion-android-settings'></i>",
        onClick:    function(control) { alert(control.options.position); }
    });


    var simpleButton4 = new L.Control.customControl({ 
        position:   "bottomleft",
        innerHTML:  "<strong>Ha!</strong>",
        onClick:    function(control) { alert(control.options.position); },
        width:      120,
        height:     40
    });

    var simpleButton5 = new L.Control.customControl({ 
        position:   "bottomleft",
        innerHTML:  "지도정보<br>{{ infoCurrentPosition }}",
    });
    
    simpleButton5.setStyle({
        width:      '250px',    // 현재 구조적인 문제로 px 외에는 정상작동하지 않음
        height:     '120px',
        background: 'rgba(80,80,80,0.3)',
        lineHeight: '100%',
        textAlign:  'left'
    });
    
    simpleButton1.addTo(map);
  
    simpleButton3.addTo(map);
    simpleButton4.addTo(map);
    simpleButton5.addTo(map);


    var MyAccuracy = -1;
    var AccuText = ('');
    
    var showMapInfo = function() {
        var infoCurrentPosition = $scope.map.getCenter();
        var infoCurrentBounds = $scope.map.getBounds();
        if (MyAccuracy < 0)
        {
            simpleButton5.setInnerHTML(
                  "<strong>지도정보</strong><br>"
                + "<strong>lastPos:</strong> [" + infoCurrentPosition.lat + "," + infoCurrentPosition.lng + "]<br>"
                + "<strong>northEast:</strong> [" + infoCurrentBounds._northEast.lat + "," + infoCurrentBounds._northEast.lng + "]<br>"
                + "<strong>southWest:</strong> [" + infoCurrentBounds._southWest.lat + "," + infoCurrentBounds._southWest.lng + "]<br>"
            );
        }
        else
        {
            simpleButton5.setInnerHTML(
                  "<strong>지도정보</strong><br>"
                + "<strong>lastPos:</strong> [" + infoCurrentPosition.lat + "," + infoCurrentPosition.lng + "]<br>"
                + "<strong>northEast:</strong> [" + infoCurrentBounds._northEast.lat + "," + infoCurrentBounds._northEast.lng + "]<br>"
                + "<strong>southWest:</strong> [" + infoCurrentBounds._southWest.lat + "," + infoCurrentBounds._southWest.lng + "]<br>"
                + "<strong>Accuracy:</strong> [" + "지도에 표시된 지점을 기준으로 반경 " + MyAccuracy + "미터 안에 있습니다.]<br>" + AccuText
            );
        }
    };
    showMapInfo();

    //내 위치에 마크를 설정하여 주는 함수.
    function MyLocationMarker(Location, Accuracy) {
        var marker = L.marker(Location);
        markers.addLayer(marker);
        map.addLayer(markers);
        MyAccuracy = Accuracy;
        if (Accuracy > 100) {
            AccuText = ('헐 이건 너무 심하잖아.');
        }
        else {
            AccuText = ('적절합니다.');
        }
    }

    //일정 시간 동안 gps정보를 이용할 수 없을 시 토스트를 띄워주는 함수.
    function TimeExpired() {
        var alertPopup = $ionicPopup.alert({
            title: 'GPS 정보를 이용할 수 없습니다.',
            template: '기기의 GPS상태를 확인하거나 유저 폴트의 여부를 확인하세요.'
        });
        $rootScope.reportClicked = false;
        alertPopup.then();
    }

    //내 위치를 잡아주는 함수
    $rootScope.centerOnMe = function() {
        if (!$scope.map) {
            return;
        }

        $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });

        markers.clearLayers();
        if (ionic.Platform.isWebView() == true) {
            // 플러그인 사용
            var posOptions = {
                timeout: 10000,
                enableHighAccuracy: false
            };
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function(pos) {
                    myLat = pos.coords.latitude;
                    myLng = pos.coords.longitude;
                    var Location = new L.LatLng(myLat, myLng);
                    var accuracy = pos.coords.accuracy;
                    MyLocationMarker(Location, accuracy);
                    $scope.map.setView(Location, 15);
                    $ionicLoading.hide();
                    showMapInfo();
                }, function(error) {
                    TimeExpired();
                    $ionicLoading.hide();
                });
        }
        else {
            // html5 기존 함수 사용
            navigator.geolocation.getCurrentPosition(function(pos) {
                myLat = pos.coords.latitude;
                myLng = pos.coords.longitude;
                var Location = new L.LatLng(myLat, myLng);
                var accuracy = pos.coords.accuracy;
                MyLocationMarker(Location, accuracy);
                $scope.map.setView(Location, 15);
                $ionicLoading.hide();
                showMapInfo();
            }, function(error) {
                TimeExpired();
                $ionicLoading.hide();
            });
        }
    };

    // 등록 확정화면에서 넘어올 때 현재 위치를 잡아주고 뒤로가기 버튼을 없애주는 함수
    $ionicHistory.nextViewOptions({
        disableBack: true
    });

    $rootScope.loadingFromReport = function() {
        if ($rootScope.confirmVal === true) {
            // alert($rootScope.confirm);
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
            $rootScope.centerOnMe();
            $rootScope.confirmVal = false;
        }
        else {
            // do nothing
        }
    };

    $rootScope.loadingFromReport();

    var simpleButton2 = new L.Control.customControl({ 
        position:   "topright",
        innerHTML:  "<i class='ion-pinpoint'></i>",
        onClick:    $rootScope.centerOnMe
    });
    simpleButton2.addTo(map);

})