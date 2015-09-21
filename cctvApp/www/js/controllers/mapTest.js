'use strict';
angular.module('starter.controllers')

.controller('MapTestCtrl',
    function($rootScope, $scope, $state, $ionicLoading, $compile, $http, soc, $ionicPlatform) {
/*
			// 레벨과 줌은 서로 반대다
			    google.maps.Map.prototype.getLevel = function() {
			        return 19 - this.getZoom();
			    }
			    google.maps.Map.prototype.setLevel = function(level) {
			        google.maps.Map.prototype.setZoom(19 - level);
			    }


			    //soc.log("contain undefined");
			    google.maps.LatLngBounds.prototype.contain
			        = google.maps.LatLngBounds.prototype.contains;

			    //soc.log("getLat undefined");    		    
    		    google.maps.LatLng.prototype.getLat
    		        = google.maps.LatLng.prototype.lat;
    		        
    		    google.maps.LatLng.prototype.getLng
    		        = google.maps.LatLng.prototype.lng;

*/

        var googleMapLoaded = false;

        var map = null;
        var anyMaps = null;
        var defLoc = soc.getDefaultLocation();        
        var mapContainer = null;
        
        var level = 3;
        
        var googleMaps = AnyMaps(google);
        var daumMaps = AnyMaps(daum);
        
        var googleMapContainer = document.getElementById('mapTestGoogle');
		var googleMapOption = { 
    		center: new googleMaps.LatLng(defLoc.lat, defLoc.lon), // 지도의 중심좌표
            zoom: 19 - level,        		
	   	};
        var googleMap = new googleMaps.Map(googleMapContainer, googleMapOption); 

        var daumMapContainer = document.getElementById('mapTestDaum');
		var daumMapOption = { 
    		center: new daumMaps.LatLng(defLoc.lat, defLoc.lon), // 지도의 중심좌표
            level: level,        		
	   	};
        var daumMap = new daum.maps.Map(daumMapContainer, daumMapOption); 



        var thisIsMap = function() {
            $scope.lastRequestCenterLat = null;
            $scope.lastRequestCenterLng = null;
            soc.log(soc.mapProvider);
            if(soc.mapProvider == daum) {
                map = daumMap;
                anyMaps = daumMaps;
                //mapContainer = document.getElementById('mapTestDaum'); // 지도를 표시할 div                     
                //soc.log("daum: " + JSON.stringify(mapContainer));                
            } else {
                map = googleMap;
                anyMaps = googleMaps;
                //mapContainer = document.getElementById('mapTestGoogle'); // 지도를 표시할 div                     
                //soc.log("google: " + JSON.stringify(mapContainer));
            }

/*
    		var mapOption = { 
        		center: new soc.mapProvider.maps.LatLng(defLoc.lat, defLoc.lon), // 지도의 중심좌표
        		level: 3, // 지도의 확대 레벨
                zoom: 19 - 3,        		
		   	};

			map = new soc.mapProvider.maps.Map(mapContainer, mapOption); 
*/


            // 테스트용 고정 마커
            /*
            var testMarker = new soc.mapProvider.maps.Marker({
                position: mapOption.center,
                image: soc.getMarkerImage()
            });
            
            testMarker.setMap(map);

            

// Begin 임시 인포윈도우
            // 마커를 클릭했을 때 마커 위에 표시할 인포윈도우를 생성합니다
            var iwContent = '<div style="padding:5px;">Hello World!</div>', // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
                iwRemoveable = true; // removeable 속성을 ture 로 설정하면 인포윈도우를 닫을 수 있는 x버튼이 표시됩니다

            // 인포윈도우를 생성합니다
            var infowindow = new soc.mapProvider.maps.InfoWindow({
                content : iwContent,
                removable : iwRemoveable
            });

            // 마커에 클릭이벤트를 등록합니다
            soc.mapProvider.maps.event.addListener(testMarker, 'click', function() {
                  // 마커 위에 인포윈도우를 표시합니다
                infowindow.open(map, testMarker);  
            });
// End 임시 인포윈도우
            */

			$scope.refreshMapInfo = function() {
			    $scope.mapInfoCenter = map.getCenter().toString();
			    var bounds = map.getBounds();
			    $scope.mapInfoSW = bounds.getSouthWest().toString();
			    $scope.mapInfoNE = bounds.getNorthEast().toString();
			    $scope.mapInfoZoomLevel = map.getLevel();
			}
			
			var markerList = [];
			
                        function deleteMarkers() {
                            for (var i = 0; i < markerList.length; i++) {
                                markerList[i].setMap(null);
                            }            
                            markerList = [];                            
                        }			
			$scope.requestInfoCount = 0;
			$scope.requestCctvs = function() {

			    // 일단 지금은 실제 요청은 하지않고 테스트
			    $scope.requestInfoCount += 1;
			    var bounds = map.getBounds();

                // ----------------------

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
			    }

			    // 실제 요청할때는 이 범위보다 2배(?) 큰범위를 요청한다
			    $scope.requestInfoSW = "(" + params.south + ", " + params.west + ")";
			    $scope.requestInfoNE = "(" + params.north + ", " + params.east + ")";

                $scope.requestInfoCenter = map.getCenter().toString();
			    $scope.lastRequestCenterLat = map.getCenter().getLat();     // 이 변수는 다른곳에서 사용한다
			    $scope.lastRequestCenterLng = map.getCenter().getLng();     // 이 변수는 다른곳에서 사용한다

			    soc.getCctvs(params)
			        .then(function(res) {
			            
                        // 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수입니다
                        //soc.log("PREV length: " + markerList.length);

                        deleteMarkers();
                        
                        var cctvLength = res.data.cctvs.length;
                        for(var i=0; i<cctvLength; i++) {
                            var cctv = res.data.cctvs[i];
                            //if(markerList[cctv.cctvId] === undefined) {
                                //soc.log(cctv.cctvId + " ADD");
                                // 마커가 표시될 위치입니다 
                                var markerPosition  = new anyMaps.LatLng(cctv.latitude, cctv.longitude); 

                                // 마커를 생성합니다
                                if(anyMaps.isGoogleMap()) {
                                    var marker = new anyMaps.Marker({
                                        position: markerPosition,
                                        icon: soc.getMarkerImage()
                                    });
                                } else {
                                    var marker = new anyMaps.Marker({
                                        position: markerPosition,
                                        image: soc.getMarkerImage()
                                    });
                                }
                                

                                markerList.push(marker);                                                        
                                // 마커가 지도 위에 표시되도록 설정합니다

                                
                                
                            //} else {
                                //soc.log(cctv.cctvId + " PASS");
                            //}
                            
                        }
                        for(var i=0; i<markerList.length; i++) {
                                markerList[i].setMap(map);
                        }
                        //soc.log("AFT length: " + markerList.length);
                        
			            $scope.responseInfoCount = cctvLength;
                        
                    }, function(err) {
                        soc.log("ERROR: " + JSON.stringify(err));
                    }
                );
                
			}

			// 일반 지도와 스카이뷰로 지도 타입을 전환할 수 있는 지도타입 컨트롤을 생성합니다
			//var mapTypeControl = new mapProvider.MapTypeControl();

			// 지도에 컨트롤을 추가해야 지도위에 표시됩니다
			// mapProvider.ControlPosition은 컨트롤이 표시될 위치를 정의하는데 TOPRIGHT는 오른쪽 위를 의미합니다
			//map.addControl(mapTypeControl, mapProvider.ControlPosition.TOPRIGHT);

			// 지도 확대 축소를 제어할 수 있는  줌 컨트롤을 생성합니다
			//var zoomControl = new mapProvider.ZoomControl();
			//map.addControl(zoomControl, mapProvider.ControlPosition.RIGHT);
			
			// 지도 확대, 축소 컨트롤에서 확대 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
			$scope.zoomIn = function() {
    			map.setLevel(map.getLevel() - 1);
			}

			// 지도 확대, 축소 컨트롤에서 축소 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
			$scope.zoomOut = function() {
    			map.setLevel(map.getLevel() + 1);
			}
			
            /* 사용 필요성 없음
            mapProvider.event.addListener(map, 'dragstart', function() {
                //soc.log('drag start!');
            });			
			*/

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
                var lastCenter = new anyMaps.LatLng($scope.lastRequestCenterLat, $scope.lastRequestCenterLng);
                if(bounds.contain(lastCenter) == false || isForce) {
                    // 여기서는 우선 이전에 요청했던 Center 값이 화면 밖으로 벗어나면
                    // 재요청하는 것으로 처리함
                    $scope.requestCctvs();
                    $scope.$apply();
                }
            }
			
            anyMaps.event.addListener(map, 'dragend', function() {
                //soc.log('drag end!');
                //updateInfo();
            });			
            
			// 중심좌표 이동 이벤트
            // 중심좌표 이동되는 동안 계속 호출된다
	        // 성능에 좋을리 없으니 사용하지 말자

		    anyMaps.event.addListener(map, 'center_changed', function() {
		        //soc.log("center changed!");
                // 직전에 서버에 요청했던 Bounds 값과 비교하여
                // 일정 수준이상 차이가 나면 재요청 한다
                // 이부분은 적절 값에 대한 결정 필요
                if(soc.config.isDevelModeVisible) {
                    $scope.refreshMapInfo();
                    $scope.$apply();
                }
                
                var bounds = map.getBounds();
                var lastCenter = new anyMaps.LatLng($scope.lastRequestCenterLat, $scope.lastRequestCenterLng);
                if(bounds.contain(lastCenter) == false) {
                    // 여기서는 우선 이전에 요청했던 Center 값이 화면 밖으로 벗어나면
                    // 재요청하는 것으로 처리함
                    $scope.requestCctvs();
                    $scope.$apply();
                }
		        
            });

            
            // 확대수준 변경 이벤트
            anyMaps.event.addListener(map, 'zoom_changed', function() {
                //soc.log('zoom changed!');
                
                // zoomLevel을 확인해서 일정 크기 구간을 벗어나면
                // CCTV 목록을 재요청한다
                updateInfo(true);
            });			
            
            // Bounds 변경 이벤트
            // Bounds가 변경되는 동안 계속 호출된다
            // 성능에 좋을리 없으니 사용하지 말자
            /*
            mapProvider.event.addListener(map, 'bounds_changed', function() {
                // (중심좌표 이동 및 확대수준 변경)
                //soc.log('bounds changed!');

                // mapInfo는 변경될때마다 호출
                //$scope.refreshMapInfo();
                //$scope.$apply();
                
            });
            */
            
            //var googleMapLoaded = false;
            if(anyMaps.isGoogleMap()) {
                anyMaps.event.addListenerOnce(map, 'idle', function() {
                    soc.log("googleMap Loaded!!!"); 
            		$scope.refreshMapInfo();
	    	    	$scope.requestCctvs();
                
                    // do something only the first time the map is loaded
                    googleMapLoaded = true;
                });                   
                
                if(googleMapLoaded) {
            		$scope.refreshMapInfo();
	    	    	$scope.requestCctvs();
                }
            } else {
        		$scope.refreshMapInfo();
		    	$scope.requestCctvs();
            }
        }

		//$ionicPlatform.ready(thisIsMap());
		
        $scope.changeMap = function() {
            soc.changeMap();
            thisIsMap();
        }
        
        thisIsMap();
        
        
        
        
        $scope.formDataTest = function() {
            var fd = new FormData();
            fd.append("item1_number", 100);
            fd.append("item2_string", "HelloWorld");
            
            
            // Blob 첫번째 인자에 배열로 file 내용을 담아주면 됩니다
            var blob = new Blob(["HAHAHAHA"], {type: "image/png"});
            fd.append("item3_file", blob, "temp.txt");

            var blob = new Blob(["HOHOHOHO"], {type: "image/png"});
            fd.append("item4_file", blob, "temp2.txt");
            
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "http://147.46.215.152:9999");
            xhr.send(fd);
        }
    })