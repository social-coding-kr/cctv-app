'use strict';

//나의 위치정보를 담을 전역변수
var myLat;
var myLng;

angular.module('starter.controllers')

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $http, soc, $cordovaGeolocation, $ionicHistory, $ionicPopup, $timeout) {

    var curLoc = soc.getDefaultLocation();
    var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
    mapOption = { 
    		center: new daum.maps.LatLng(curLoc.lat, curLoc.lon), // 지도의 중심좌표
    		level: 3 // 지도의 확대 레벨
	};

			// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
			var map = new daum.maps.Map(mapContainer, mapOption); 
			
			
			// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
			//var mapTypeControl = new daum.maps.MapTypeControl();

			// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
			// daum.maps.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
			//map.addControl(mapTypeControl, daum.maps.ControlPosition.TOPRIGHT);

			// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
			//var zoomControl = new daum.maps.ZoomControl();
			//map.addControl(zoomControl, daum.maps.ControlPosition.RIGHT);
			
			// 지도 확대, 축소 컨트롤에서 확대 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
			$scope.zoomIn = function() {
    			map.setLevel(map.getLevel() - 1);
			};

			// 지도 확대, 축소 컨트롤에서 축소 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
			$scope.zoomOut = function() {
    			map.setLevel(map.getLevel() + 1);
			};
			
			$scope.isDraging = false;
			
			$scope.refreshMapInfo = function() {
			    $scope.mapInfoCenter = map.getCenter().toString();
			    var bounds = map.getBounds();
			    $scope.mapInfoSW = bounds.getSouthWest().toString();
			    $scope.mapInfoNE = bounds.getNorthEast().toString();
			    $scope.mapInfoZoomLevel = map.getLevel();
			};
			
			$scope.requestInfoCount = 0;
			$scope.requestCctvs = function() {
			    
			    // 일단 지금은 실제 요청은 하지않고 테스트
			    $scope.requestInfoCount += 1;
			    var bounds = map.getBounds();
			    
			    // 실제 요청할때는 이 범위보다 2배(?) 큰범위를 요청한다
			    $scope.requestInfoSW = bounds.getSouthWest().toString();
			    $scope.requestInfoNE = bounds.getNorthEast().toString();			    

			    $scope.requestInfoCenter = map.getCenter(); 
			};
			
            daum.maps.event.addListener(map, 'dragstart', function() {
                $scope.isDraging = true;
                soc.log('drag start!');
            });			
			
            daum.maps.event.addListener(map, 'dragend', function() {
                $scope.isDraging = false;
                soc.log('drag end!');

                // 직전에 서버에 요청했던 Bounds 값과 비교하여
                // 일정 수준이상 차이가 나면 재요청 한다
                // 이부분은 적절 값에 대한 결정 필요
                
                var bounds = map.getBounds();
                if(bounds.contain($scope.requestInfoCenter) == false) {
                    // 여기서는 우선 이전에 요청했던 Center 값이 화면 밖으로 벗어나면
                    // 재요청하는 것으로 처리함
                    $scope.requestCctvs();
                    $scope.$apply();
                }
            });			
            
			// 중심좌표 이동 이벤트
		    daum.maps.event.addListener(map, 'center_changed', function() {
		        // 중심좌표 이동되는 동안 계속 호출된다
		        //soc.log("center changed!");
            });

            // 확대수준 변경 이벤트
            daum.maps.event.addListener(map, 'zoom_changed', function() {
                soc.log('zoom changed!');
                
                // zoomLevel을 확인해서 일정 크기 구간을 벗어나면
                // CCTV 목록을 재요청한다
                $scope.requestCctvs();
                $scope.$apply();
            });			
            
            // Bounds 변경 이벤트
            daum.maps.event.addListener(map, 'bounds_changed', function() {
                // Bounds가 변경되는 동안 계속 호출된다
                // (중심좌표 이동 및 확대수준 변경)
                soc.log('bounds changed!');

                // mapInfo는 변경될때마다 호출
                $scope.refreshMapInfo();
                $scope.$apply();
                
            });
            
            
			$scope.refreshMapInfo();
			$scope.requestCctvs();
 
 
 
 /*
 
 
        
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
    
    //화면 로딩과 동시에 cctv 정보를 뿌려주기 위한 임시코드
    //수정일 : 2015. 9. 12.
    //필요성에 의문이 생겨 주석 처리함.




    // icon - Image 사용
    var simpleIcon = L.icon({
        iconUrl: 'img/cctv_temp_icon.png',
        iconSize: [20, 20],
        iconAnchor: [10, 10],
        popupAnchor: [0, -10],
        shadowSize: [0, 0]
    });

    var locationMarker = function(Location, item) {
        var marker = L.marker(Location, {
            icon: simpleIcon
        });
        
        markers.addLayer(marker);

        if (item) {
            marker.bindPopup(
                item.연번 + ", " + item.용도 + ", " + item.주소
            );
        }
            //soc.log(JSON.stringify(Location));
    };

    var dongjak = [];
    $http.get("data/cctv/dongjak.json")
        .then(function(response) {
            dongjak = response.data;
            var asdf1 = dongjak.length;
            soc.log("SUCCESS LOAD DONGJAK");
            //soc.log(JSON.stringify(response));
        }, function(response) {
            soc.log("FAILED LOAD DONGJAK");
            soc.log(JSON.stringify(response));
        });

    var convert_info = function() {

        var addPoint = function(item, isLast) {

            var showCctv = function(item) {
                var Location = new L.LatLng(item.lat, item.lon);
                locationMarker(Location, item);
            };
            var asdf2 = dongjak.length;

                if (!item.lat || !item.lon) {
                    var onSuccess = function(point, opts) {
                        soc.log(JSON.stringify(point));
                        item.lat = point.y;
                        item.lon = point.x;
                        //soc.log(JSON.stringify(item));

                        if (opts) {
                            soc.log(JSON.stringify(dongjak));
                        }
                        showCctv(item);
                    };

                    //soc.log(item.연번 + " " + item.주소);
                    soc.getPointFromAddress(item.주소, onSuccess, null, isLast);

                }
                else {
                    showCctv(item);
                }
        };

            //for(var i=dongjak.length-2; i<dongjak.length; i++) {
            for (var i = 0; i < dongjak.length; i++) {
                var isLast = false;
                if (i == dongjak.length - 1) isLast = true;

                addPoint(dongjak[i], isLast);
            }

            // makers 그룹은 변환 후 한번만 추가해 주는 것이 성능에 도움이 됩니다.
            map.addLayer(markers);
        };
    
    //타임아웃 함수. 이게 없으면 서버에서 데이터 전송 중 함수가 실행되는 비극이 발생해 정보가 나타나지 않습니다.
    $timeout(convert_info, 10);
*/

     //내 위치에 마크를 설정하여 주는 함수. - 다음 버전
    function MyLocationMarker(Location, Accuracy) {
        new daum.maps.Marker({
			position: points[Location],
		}).setMap(map);
        //MyAccuracy = Accuracy;
        if (Accuracy > 100) {
            AccuText = ('헐 이건 너무 심하잖아.');
        }
        else {
            AccuText = ('적절합니다.');
        }
    }

/*
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
*/
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
        
        soc.log('bounds changed!');
        
        $scope.loading = $ionicLoading.show({
            content: 'Getting current location...',
            showBackdrop: false
        });
        
        //markers.clearLayers();
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
                    soc.log('bounds changed!' + myLat);
                    soc.log('bounds changed!' + myLng);
                    //var Location = daum.maps.LatLng(myLat, myLng);
                    //map.panTo(Location);
                    map.panTo(new daum.maps.LatLng(myLat, myLng));
                    //var Location = new L.LatLng(myLat, myLng);
                    var accuracy = pos.coords.accuracy;
                    MyLocationMarker(Location, accuracy);
                    //$scope.map.setView(Location, 15);
                    $ionicLoading.hide();
                    //showMapInfo();
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
                                    soc.log('bounds changed!' + myLat);
                    soc.log('bounds changed!' + myLng);
                //var Location = daum.maps.LatLng(myLat, myLng);
                //map.panTo(Location);
                map.panTo(new daum.maps.LatLng(myLat, myLng));
                //var Location = new L.LatLng(myLat, myLng);
                var accuracy = pos.coords.accuracy;
                MyLocationMarker(Location, accuracy);
                //$scope.map.setView(Location, 15);
                $ionicLoading.hide();
                //showMapInfo();
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

    $rootScope.AnotherPageToMap = function() {
        if ($rootScope.reportClicked === false) {
            $ionicHistory.nextViewOptions({
                disableBack: true
            });
        }
        else {
            // do nothing
        }
    };

    $rootScope.AnotherPageToMap();
/*
    var simpleButton2 = new L.Control.customControl({ 
        position:   "topright",
        innerHTML:  "<i class='ion-pinpoint'></i>",
        onClick:    $rootScope.centerOnMe
    });
    simpleButton2.addTo(map);
    
    simpleButton2.setMap(map);
*/
})