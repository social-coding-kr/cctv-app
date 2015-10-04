'use strict';

//나의 위치정보를 담을 전역변수
var myLat;
var myLng;

angular.module('starter.controllers')

.controller('MapCtrl', function($rootScope, $scope, $ionicLoading, $http, soc,
    $cordovaGeolocation, $ionicHistory, $ionicPopup, $timeout, $ionicPlatform, $cordovaToast) {

    //$ionicPlatform.ready(function() {
        $scope.search = {}; // 주소 검색에서 사용하는 변수

        var defaultLatLng = soc.getDefaultLocation();

        var mapContainer = document.getElementById('map');
        var mapOption = {
            center: new google.maps.LatLng(defaultLatLng.lat, defaultLatLng.lon),
            zoom: 17,
            maxZoom: 19,
            minZoom: 14,
        };

        var map = new google.maps.Map(mapContainer, mapOption);
        var geocoder = new google.maps.Geocoder();


        $scope.map = map; // centerOnMe 호출시에 사용한다.
        var markers = []; // 위치찾기를 연속으로 수행할 때 마커를 지우기 위해 사용된다.


        var mapGenerator = function(map) {

            $scope.lastRequestCenterLat = null;
            $scope.lastRequestCenterLng = null;

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

                var northEast = bounds.getNorthEast();
                var southWest = bounds.getSouthWest();
                var center = map.getCenter();

                var centerLng = center.getLng();
                var centerLat = center.getLat();

                var east = northEast.getLng();
                var north = northEast.getLat();
                var west = southWest.getLng();
                var south = southWest.getLat();

                var width = east - west;
                var height = north - south;

                // 서버측 API가 준비될때까지 ZoomLevel이 크면 요청을 하지 않는다			    
                if (map.getLevel() > 5) {
                    return;
                }

                // 실제 요청 Parameter
                // 화면에 보이는 2배 요청
                var params = {
                    east: (centerLng + width + 0.000005).toFixed(6),
                    west: (centerLng - width - 0.000005).toFixed(6),
                    north: (centerLat + height + 0.000005).toFixed(6),
                    south: (centerLat - height - 0.000005).toFixed(6)
                };

                // 실제 요청할때는 이 범위보다 2배(?) 큰범위를 요청한다
                $scope.requestInfoSW = "(" + params.south + ", " + params.west + ")";
                $scope.requestInfoNE = "(" + params.north + ", " + params.east + ")";

                $scope.requestInfoCenter = map.getCenter();
                $scope.lastRequestCenterLat = map.getCenter().getLat(); // 이 변수는 다른곳에서 사용한다
                $scope.lastRequestCenterLng = map.getCenter().getLng(); // 이 변수는 다른곳에서 사용한다
            };


            // 지도 확대, 축소 컨트롤에서 확대 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
            $scope.zoomIn = function() {
                map.setLevel(map.getLevel() - 1);
            };

            // 지도 확대, 축소 컨트롤에서 축소 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
            $scope.zoomOut = function() {
                map.setLevel(map.getLevel() + 1);
            };

            google.maps.event.addListener(map, 'dragstart', function() {
                $scope.isDraging = true;
                soc.log('drag start!');
            });

            google.maps.event.addListener(map, 'dragend', function() {
                $scope.isDraging = false;
                soc.log('drag end!');

                // 직전에 서버에 요청했던 Bounds 값과 비교하여
                // 일정 수준이상 차이가 나면 재요청 한다
                // 이부분은 적절 값에 대한 결정 필요

                var bounds = map.getBounds();
                var lastCenter = new google.maps.LatLng($scope.lastRequestCenterLat, $scope.lastRequestCenterLng);
                if (bounds.contain(lastCenter) == false) {
                    // 여기서는 우선 이전에 요청했던 Center 값이 화면 밖으로 벗어나면
                    // 재요청하는 것으로 처리함
                    $scope.requestCctvs();
                    $scope.refreshMapInfo();
                    $scope.$apply();
                }
            });

            // 중심좌표 이동 이벤트
            google.maps.event.addListener(map, 'center_changed', function() {
                // 중심좌표 이동되는 동안 계속 호출된다
                //soc.log("center changed!");
            });

            // 확대수준 변경 이벤트
            google.maps.event.addListener(map, 'zoom_changed', function() {
                //soc.log('zoom changed!');

                // zoomLevel을 확인해서 일정 크기 구간을 벗어나면
                // CCTV 목록을 재요청한다
                $scope.requestCctvs();
                $scope.refreshMapInfo();
                $scope.$apply();
            });

            // Bounds 변경 이벤트
            google.maps.event.addListener(map, 'bounds_changed', function() {
                // Bounds가 변경되는 동안 계속 호출된다
                // (중심좌표 이동 및 확대수준 변경)
                //soc.log('bounds changed!');

                // mapInfo는 변경될때마다 호출
                //$scope.refreshMapInfo();
                //$scope.$apply();

            });

            google.maps.event.addListener(map, 'loading', function() {
                $scope.refreshMapInfo();
                $scope.$apply();

            });

            $scope.locationAccu = "위치찾기 시 정확도와 관련된 값이 표시됩니다.";
            $scope.responseTime = "위치찾기 시 응답시간과 관련된 값이 표시됩니다.";
        };

        //기다리는 자에게 노버그가 있나니...
        function waiting_func() {
            $scope.refreshMapInfo();
            $scope.requestCctvs();
        }

        mapGenerator(map);
        setTimeout(waiting_func, 1000);

        //내 위치에 마크를 설정하고, 개발자 정보에서 위치정보를 갱신해 주는 함수.
        function MyLocationMarker(Accuracy, Time) {
            var i = 0;
            var dummyLength = markers.length;
            while (dummyLength > i) {
                //기존 마커를 제거하고 배열을 비운다.
                markers[dummyLength - i - 1].setMap(null);
                markers.pop();
                i++;
            }
            var points = new google.maps.LatLng(myLat, myLng);
            var marker = new google.maps.Marker({
                position: points
            });
            marker.setMap(map);
            $scope.locationAccu = "이 지점을 기준으로 반경 " + Accuracy.toFixed(8) + "미터 안에 있습니다.";
            $scope.responseTime = Time + "ms";
            markers.push(marker);

            if (soc.config.isDevelModeVisible == true) //개발자 정보 옵션이 켜져 있을 경우,
            {
                var circle = new google.maps.Circle({
                    center: new google.maps.LatLng(myLat, myLng), // 원의 중심좌표 입니다 
                    radius: Accuracy, // 미터 단위의 원의 반지름입니다 
                    strokeWeight: 3, // 선의 두께입니다 
                    strokeColor: '#75B8FA', // 선의 색깔입니다
                    strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
                    fillColor: '#CFE7FF', // 채우기 색깔입니다
                    fillOpacity: 0.4 // 채우기 불투명도 입니다   
                });

                // 지도에 원을 표시합니다 
                circle.setMap(map);
                markers.push(circle);
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
                var posOptions = {
                    timeout: 10000,
                    enableHighAccuracy: false
                };
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
        
        $scope.search.keyEvent = function(event) {
            if(event.keyCode == 13) {
                // EnterKey 입력되었을때 주소 검색을 실행한다
                // 웹에서는 엔터키, 모바일에서는 소프트키보드의 돋보기키에 해당한다
                // 모바일에서 돋보기키를 클릭했을때 소프트키보드가 닫혀야 함
                document.activeElement.blur();  // ActiveElement인 소프크키보드를 닫는다
                $scope.searchAddress();
            }
        }

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
                    if (window.plugins != undefined) {
                        $cordovaToast.show(searchErrorMsg, 'long', 'bottom')
                            .then(function(success) {
                                // success
                                //alert("Toast Success: ");
                            }, function(error) {
                                // error
                                alert("Toast Error: " + error);
                            });
                    } else {
                        alert(searchErrorMsg);
                    }
                }
            });

        }

    });

//});


/*
    $ionicPlatform.ready(function() {
        var curLoc = soc.getDefaultLocation();
        var mapContainer = document.getElementById('map'), // 지도를 표시할 div 
            mapOption = { 
        		center: new daum.maps.LatLng(curLoc.lat, curLoc.lon), // 지도의 중심좌표
        		level: 3 // 지도의 확대 레벨
	    };
	    
	    var markers = []; //위치찾기 재호출시 기존 마커를 지우기 위한 배열

		// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
		var map = new daum.maps.Map(mapContainer, mapOption); 
		$scope.map = map;   // centerOnMe 호출시에 사용한다

			
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
		    
		    var northEast   = bounds.getNorthEast();
            var southWest   = bounds.getSouthWest();
            var center      = map.getCenter();

            var centerLng   = center.getLng();                
            var centerLat   = center.getLat();

            var east    = northEast.getLng();
	        var north   = northEast.getLat();
		    var west    = southWest.getLng();
		    var south   = southWest.getLat();
			    
		    var width   = east - west;
		    var height  = north - south;

            // 서버측 API가 준비될때까지 ZoomLevel이 크면 요청을 하지 않는다			    
		    if(map.getLevel() > 5) {
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
                $scope.refreshMapInfo();
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
            //soc.log('zoom changed!');
            
            // zoomLevel을 확인해서 일정 크기 구간을 벗어나면
            // CCTV 목록을 재요청한다
            $scope.requestCctvs();
            $scope.refreshMapInfo();
            $scope.$apply();
        });			
        
        // Bounds 변경 이벤트
        daum.maps.event.addListener(map, 'bounds_changed', function() {
            // Bounds가 변경되는 동안 계속 호출된다
            // (중심좌표 이동 및 확대수준 변경)
            //soc.log('bounds changed!');

            // mapInfo는 변경될때마다 호출
            //$scope.refreshMapInfo();
            //$scope.$apply();
            
        });
            
    $scope.locationAccu = "위치찾기 시 정확도와 관련된 값이 표시됩니다.";
    $scope.responseTime = "위치찾기 시 응답시간과 관련된 값이 표시됩니다.";
	$scope.refreshMapInfo();
	$scope.requestCctvs();
			
	//내 위치에 마크를 설정하고, 개발자 정보에서 위치정보를 갱신해 주는 함수.
    function MyLocationMarker(Accuracy, Time) {
        var i = 0;
        var dummyLength = markers.length;
        while (dummyLength > i){
            //기존 마커를 제거하고 배열을 비운다.
            markers[dummyLength - i - 1].setMap(null);
            markers.pop();
            i++;
        }
        var points  = new daum.maps.LatLng(myLat, myLng);
        var marker = new daum.maps.Marker({
			position: points
		});
		marker.setMap(map);
		$scope.locationAccu = "이 지점을 기준으로 반경 " + Accuracy.toFixed(8) + "미터 안에 있습니다.";
		$scope.responseTime = Time + "ms";
        markers.push(marker);
        
        if (soc.config.isDevelModeVisible == true) //개발자 정보 옵션이 켜져 있을 경우,
        {
            var circle = new daum.maps.Circle({
                center : new daum.maps.LatLng(myLat, myLng),  // 원의 중심좌표 입니다 
                radius: Accuracy, // 미터 단위의 원의 반지름입니다 
                strokeWeight: 3, // 선의 두께입니다 
                strokeColor: '#75B8FA', // 선의 색깔입니다
                strokeOpacity: 1, // 선의 불투명도 입니다 1에서 0 사이의 값이며 0에 가까울수록 투명합니다
                strokeStyle: 'dashed', // 선의 스타일 입니다
                fillColor: '#CFE7FF', // 채우기 색깔입니다
                fillOpacity: 0.4  // 채우기 불투명도 입니다   
            }); 
    
            // 지도에 원을 표시합니다 
            circle.setMap(map);
            markers.push(circle);
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
            var posOptions = {
                timeout: 10000,
                enableHighAccuracy: false
            };
            $cordovaGeolocation
                .getCurrentPosition(posOptions)
                .then(function(pos) {
                    myLat = pos.coords.latitude;
                    myLng = pos.coords.longitude;
                    var accuracy = pos.coords.accuracy;
                    
                    //정확도가 일정 기준 이내에 들어야 올바른 결과값을 출력한다.
                    if (accuracy < 100){
                        map.panTo(new daum.maps.LatLng(myLat, myLng));
                        var time = pos.timestamp;
                        MyLocationMarker(accuracy, time);
                    }
                    else{
                        LowLocationAccuracy();
                    }
                    $ionicLoading.hide();
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
                if (accuracy < 100){
                    map.panTo(new daum.maps.LatLng(myLat, myLng));
                    var time = pos.timestamp;
                    MyLocationMarker(accuracy, time);
                }
                else{
                    LowLocationAccuracy();
                }
                $ionicLoading.hide();
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
    });
 */


/*
    var simpleButton2 = new L.Control.customControl({ 
        position:   "topright",
        innerHTML:  "<i class='ion-pinpoint'></i>",
        onClick:    $rootScope.centerOnMer
    });
    simpleButton2.addTo(map);
    
    simpleButton2.setMap(map);
*/

//})