'use strict';

//나의 위치정보를 담을 전역변수
var myLat;
var myLng;

angular.module('starter.controllers')

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $window, $http, soc,
    $cordovaGeolocation, $ionicHistory, $ionicPopup, $timeout, $ionicPlatform, $cordovaToast) {

    //$ionicPlatform.ready(function() {
        $scope.search = {}; // 주소 검색에서 사용하는 변수

        var defaultLatLng = soc.getDefaultLocation();

        var mapContainer = document.getElementById('map');
        var mapOption = {
            center: new google.maps.LatLng(defaultLatLng.lat, defaultLatLng.lon),
            zoom: 16,
            maxZoom: 19,
            minZoom: 11,    // 서울시 전체가 들어오는 레벨임
            // 아래는 Control 옵션
            disableDefaultUI: true,            
            zoomControl: true,
            scaleControl: true,
            streetViewControl: true,
            mapTypeControl: true,
        };

        var map = new google.maps.Map(mapContainer, mapOption);
        var geocoder = new google.maps.Geocoder();
        
        //처음에는 공공 및 민간 모두 보여준다.
        var publicCCTVChecker = 1;
        var privateCCTVChecker = 1;


        $scope.map = map; // centerOnMe 호출시에 사용한다.
		var markerList = [];
		var purposeList = []; // 목적 리스트
		
        function deleteMarkers() {
            for (var i = 0; i < markerList.length; i++) {
                markerList[i].setMap(null);
            }            
            markerList = [];
            purposeList = [];
        }

        // 지도생성 Begin
        var mapGenerator = function(map) {

            $scope.lastRequestCenterLat = null;
            $scope.lastRequestCenterLng = null;

            $scope.refreshMapInfo = function() {
                $scope.mapInfoCenter = map.getCenter().toString();
                var bounds = map.getBounds();
                $scope.mapInfoSW = bounds.getSouthWest().toString();
                $scope.mapInfoNE = bounds.getNorthEast().toString();
                $scope.mapInfoZoomLevel = map.getZoom();
            };

            $scope.requestInfoCount = 0;
            $scope.requestCctvs = function() {

                $scope.requestInfoCount += 1;
			    var bounds = map.getBounds();

                // ----------------------

                var northEast   = bounds.getNorthEast();
                var southWest   = bounds.getSouthWest();
                var center      = map.getCenter();

                var centerLng   = center.lng();                
                var centerLat   = center.lat();

                var east    = northEast.lng();
		        var north   = northEast.lat();
			    var west    = southWest.lng();
			    var south   = southWest.lat();
			    
			    var width   = east - west;
			    var height  = north - south;

                // 서버측 API가 준비될때까지 ZoomLevel이 크면 요청을 하지 않는다			    
			    if(map.getZoom() < 15) {
			        return;
			    }
			    
			    // 실제 요청 Parameter
			    // 화면에 보이는 2배 요청
			    var params = {
			        east:   (centerLng + width  + 0.000005).toFixed(6),
			        west:   (centerLng - width  - 0.000005).toFixed(6),			        
			        north:  (centerLat + height + 0.000005).toFixed(6),
			        south:  (centerLat - height - 0.000005).toFixed(6)
			    };

			    // 실제 요청할때는 이 범위보다 2배(?) 큰범위를 요청한다
			    $scope.requestInfoSW = "(" + params.south + ", " + params.west + ")";
			    $scope.requestInfoNE = "(" + params.north + ", " + params.east + ")";

                $scope.requestInfoCenter = map.getCenter().toString();
			    $scope.lastRequestCenterLat = map.getCenter().lat();     // 이 변수는 다른곳에서 사용한다
			    $scope.lastRequestCenterLng = map.getCenter().lng();     // 이 변수는 다른곳에서 사용한다

			    soc.getCctvs(params)
			        .then(function(res) {
			            
                        // 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수입니다
                        //soc.log("PREV length: " + markerList.length);

                        deleteMarkers();

                        var cctvLength = res.data.cctvs.length;
                        
                        for(var i=0; i<cctvLength; i++) {
                            var cctv = res.data.cctvs[i];
                            //soc.log(JSON.stringify(cctv));
                            
                            
                            //목적 저장을 위한 코드
                            //목적은 public, private으로 구분.
                            var cctv_ID = cctv.cctvID;
                            var cctvInfo = $http.get("http://147.46.215.152:8099/map/cctvs/{cctv_ID}");
                            var cctv_purpose = cctvInfo.data.cctv.purpose;
                            purposeList.push(cctv_purpose);
                            
                            
                            // 마커가 표시될 위치입니다 
                            var markerPosition  = new google.maps.LatLng(cctv.latitude, cctv.longitude); 

                            // 마커를 생성합니다
                            var marker = new google.maps.Marker({
                                position: markerPosition,
                                icon: soc.markerImage["default"],
                                cctv: cctv, // 마커 자체에 서버에서 받은 cctv 데이터를 포함
                            });
                            
                            //soc.log(JSON.stringify(marker));
                            markerList.push(marker);                                                        
                        }
                        
                        for(i=0; i<markerList.length; i++) {
                                markerList[i].setMap(map);
                        }

			            $scope.responseInfoCount = cctvLength;
                        
                    }, function(err) {
                        soc.log("ERROR: " + JSON.stringify(err));
                    }
                );
            };


            // 함수 이름은 나중에 수정하자
            var updateInfo = function(isForce) {
                // 직전에 서버에 요청했던 Bounds 값과 비교하여
                // 일정 수준이상 차이가 나면 재요청 한다
                // 이부분은 적절 값에 대한 결정 필요
                if(soc.config.isDevelModeVisible) {
                    $scope.refreshMapInfo();
                    $scope.$apply();
                }
                
                var bounds = map.getBounds();
                var lastCenter = new google.maps.LatLng($scope.lastRequestCenterLat, $scope.lastRequestCenterLng);
                if(bounds.contains(lastCenter) == false || isForce) {
                    // 여기서는 우선 이전에 요청했던 Center 값이 화면 밖으로 벗어나면
                    // 재요청하는 것으로 처리함
                    $scope.requestCctvs();
                    $scope.$apply();
                }
            };
            
            /*
            // 지도 확대, 축소 컨트롤에서 확대 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
            $scope.zoomIn = function() {
                map.setLevel(map.getLevel() - 1);
            };

            // 지도 확대, 축소 컨트롤에서 축소 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
            $scope.zoomOut = function() {
                map.setLevel(map.getLevel() + 1);
            };
            */
            
            //민간 cctv의 필터링 여부
            $scope.privateCCTV = function() {
                privateCCTVChecker++;
                if (privateCCTVChecker % 2 == 0)
                {
                    //민간cctv는 필터링하고 보여준다.
                    for (var i = 0; i < purposeList.length; i++) {
                        if (purposeList[i] == "pirvate"){
                            markerList[i].setMap(null);
                        }
                    }            
                }
                else
                {
                    //민간cctv를 보여준다.
                    for (var i = 0; i < purposeList.length; i++) {
                        if (purposeList[i] == "pirvate"){
                            markerList[i].setMap(map);
                        }
                    }
                }
            };

            //공공 cctv의 필터링 여부
            $scope.publicCCTV = function() {
                publicCCTVChecker++;
                if (publicCCTVChecker % 2 == 0)
                {
                    //공공cctv는 필터링하고 보여준다.
                    for (var i = 0; i < purposeList.length; i++) {
                        if (purposeList[i] == "public"){
                            markerList[i].setMap(null);
                        }
                    }            
                }
                else
                {
                    //공공cctv를 보여준다.
                    for (var i = 0; i < purposeList.length; i++) {
                        if (purposeList[i] == "public"){
                            markerList[i].setMap(map);
                        }
                    }
                }
            };
            
            // 중심좌표 이동 이벤트
            google.maps.event.addListener(map, 'center_changed', function() {
                // 중심좌표 이동되는 동안 계속 호출된다

                if(soc.config.isDevelModeVisible) {
                    $scope.refreshMapInfo();
                    if(!$scope.$$phase) {
                        $scope.$apply();
                    }
                }
                
                var bounds = map.getBounds();
                var lastCenter = new google.maps.LatLng($scope.lastRequestCenterLat, $scope.lastRequestCenterLng);
                if(bounds.contains(lastCenter) == false) {
                    // 여기서는 우선 이전에 요청했던 Center 값이 화면 밖으로 벗어나면
                    // 재요청하는 것으로 처리함
                    $scope.requestCctvs();
                    if(soc.config.isDevelModeVisible) {                    
                        if(!$scope.$$phase) {
                            $scope.$apply();
                        }
                    }
                }
                
            });

            // 확대수준 변경 이벤트
            google.maps.event.addListener(map, 'zoom_changed', function() {
                //soc.log('zoom changed!');

                // zoomLevel을 확인해서 일정 크기 구간을 벗어나면
                // CCTV 목록을 재요청한다
                $scope.requestCctvs();
                $scope.refreshMapInfo();
                $scope.$apply();
                updateInfo(true);
            });


            // google map 에서 loading 을 기다리는 이벤트
            // 맵이 완전히 로딩된 후 해야할 작업은 여기서 처리한다
            google.maps.event.addListenerOnce(map, 'idle', function() {
                soc.log("googleMap Loaded!!!"); 
            	$scope.refreshMapInfo();
	    	    $scope.requestCctvs();
            });

            $scope.locationAccu = "위치찾기 시 정확도와 관련된 값이 표시됩니다.";
            $scope.responseTime = "위치찾기 시 응답시간과 관련된 값이 표시됩니다.";
        };
        // 지도생성 End

        mapGenerator(map);
        
        $scope.currentPos = {};
        //내 위치에 마크를 설정하고, 개발자 정보에서 위치정보를 갱신해 주는 함수.
        function MyLocationMarker(Accuracy, Time) {

            if($scope.currentPos.marker)
                $scope.currentPos.marker.setMap(null);
            if($scope.currentPos.circle)                
                $scope.currentPos.circle.setMap(null);
            
            var points = new google.maps.LatLng(myLat, myLng);
            $scope.currentPos.marker = new google.maps.Marker({
                position: points
            });
            $scope.currentPos.marker.setMap(map);
            
            $scope.locationAccu = "이 지점을 기준으로 반경 " + Accuracy.toFixed(8) + "미터 안에 있습니다.";
            $scope.responseTime = Time + "ms";

            if (soc.config.isDevelModeVisible == true) //개발자 정보 옵션이 켜져 있을 경우,
            {
                $scope.currentPos.circle = new google.maps.Circle({
                    center: new google.maps.LatLng(myLat, myLng), // 원의 중심좌표 입니다 
                    radius: Accuracy, // 미터 단위의 원의 반지름입니다 
                    strokeWeight: 3, // 선의 두께입니다 
                    strokeColor: '#75B8FA', // 선의 색깔입니다
                    strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
                    fillColor: '#CFE7FF', // 채우기 색깔입니다
                    fillOpacity: 0.4 // 채우기 불투명도 입니다   
                });

                // 지도에 원을 표시합니다 
                $scope.currentPos.circle.setMap(map);
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

        //정확도가 일정 범위를 넘어가면 자신의 위치를 보여주는 것이 아니라 기기 작동을 멈추고 띄우는 토스트.
        function LowLocationAccuracy() {
            var alertPopup = $ionicPopup.alert({
                title: '위치 정확도가 매우 낮습니다.',
                template: 'GPS가 이용가능한 위치로 이동하거나, 위치찾기 버튼을 다시 한 번 눌러 주세요.'
            });
            $rootScope.reportClicked = false;
            alertPopup.then();
        }


        //내 위치를 잡아주는 함수
        $rootScope.centerOnMe = function() {

            $scope.isCenterOnMeLoadingComplite = false;

            var posOptions = {
                timeout: soc.config.geoOptions.timeout,
                enableHighAccuracy: soc.config.geoOptions.enableHighAccuracy,
                maximumAge: 0,  // 현재위치를 캐시 저장하지 않는다
            };
            
            $scope.lastEnableHighAccuracy = posOptions.enableHighAccuracy;
            $scope.lastTimeout = posOptions.timeout;

            if (!$scope.map) {
                soc.log("scope.map: not found");
                return;
            }

            $scope.loading = $ionicLoading.show({
                content: 'Getting current location...',
                showBackdrop: false
            });

            if (ionic.Platform.isWebView() == true) {
                // 플러그인 사용
                soc.log("모바일 기기에서 위치검색을 실행함")
                $cordovaGeolocation
                    .getCurrentPosition(posOptions)
                    .then(function(pos) {
                        myLat = pos.coords.latitude;
                        myLng = pos.coords.longitude;
                        var accuracy = pos.coords.accuracy;

                        //정확도가 일정 기준 이내에 들어야 올바른 결과값을 출력한다.
                        if (accuracy < 100) {
                            $scope.map.setCenter(new google.maps.LatLng(myLat, myLng));                            
                            var time = pos.timestamp;
                            MyLocationMarker(accuracy, time);
                        }
                        else {
                            LowLocationAccuracy();
                        }
                        $ionicLoading.hide();
                        $scope.isCenterOnMeLoadingComplite = true;
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
                    var accuracy = pos.coords.accuracy;

                    //정확도가 일정 기준 이내에 들어야 올바른 결과값을 출력한다.
                    if (accuracy < 100) {
                        $scope.map.setCenter(new google.maps.LatLng(myLat, myLng));
                        var time = pos.timestamp;
                        MyLocationMarker(accuracy, time);
                    }
                    else {
                        LowLocationAccuracy();
                    }
                    $ionicLoading.hide();
                    $scope.isCenterOnMeLoadingComplite = true;
                }, function(error) {
                    TimeExpired();
                    $ionicLoading.hide();
                }, posOptions);
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
        
        $scope.search.keyEvent = function(event) {
            if(event.keyCode == 13) {
                // EnterKey 입력되었을때 주소 검색을 실행한다
                // 웹에서는 엔터키, 모바일에서는 소프트키보드의 돋보기키에 해당한다
                // 모바일에서 돋보기키를 클릭했을때 소프트키보드가 닫혀야 함
                document.activeElement.blur();  // ActiveElement인 소프트키보드를 닫는다
                $scope.searchAddress();
            }
        }

        // 주소검색 Begin
        $scope.searchAddress = function() {
            soc.log($scope.search.address);

            geocoder.geocode({
                'address': $scope.search.address
            }, function(results, status) {

                if (status === google.maps.GeocoderStatus.OK) {
                    map.setCenter(results[0].geometry.location);
                }
                else {
                    var searchErrorMsg = "검색결과가 없습니다";
                    if ($window.plugins != undefined) {
                        $cordovaToast.show(searchErrorMsg, 'long', 'bottom')
                            .then(function(success) {
                                // success
                                //alert("Toast Success: ");
                            }, function(error) {
                                // error
                                soc.log("Toast Error: " + error);
                            });
                    } else {
                        alert(searchErrorMsg);
                    }
                }
            });

        }
        // 주소검색 End
    });
