'use strict';
angular.module('starter.controllers')

.controller('MapTestCtrl',
    function($rootScope, $scope, $ionicLoading, $compile, $http, soc, $ionicPlatform) {

		$ionicPlatform.ready(function() {

            var mapContainer = document.getElementById('map2'); // 지도를 표시할 div 
            var defLoc = soc.getDefaultLocation();
    		var mapOption = { 
        		center: new daum.maps.LatLng(defLoc.lat, defLoc.lon), // 지도의 중심좌표
        		//center: new daum.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
        		level: 3 // 지도의 확대 레벨
		   	};

			// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
			var map = new daum.maps.Map(mapContainer, mapOption); 
			
            var markerImageSrc = 'img/map-pin_17x30.png'; // 마커이미지의 주소입니다    
            var markerImageSize = new daum.maps.Size(15, 26); // 마커이미지의 크기입니다
            var markerImageOption = {offset: new daum.maps.Point(7, 26)}; // 마커이미지의 옵션입니다. 마커의 좌표와 일치시킬 이미지 안에서의 좌표를 설정합니다			
			
            // 마커의 이미지정보를 가지고 있는 마커이미지를 생성합니다
            var markerImage = new daum.maps.MarkerImage(markerImageSrc, markerImageSize, markerImageOption);
            //var markerPosition = new daum.maps.LatLng(defLoc.lat, defLoc.lon); // 마커가 표시될 위치입니다			

            var testMarkerPosition  = mapOption.center;

            // 테스트용 고정 마커
            var testMarker = new daum.maps.Marker({
                position: testMarkerPosition,
                image: markerImage
            });
            testMarker.setMap(map);
            

// Begin 임시 인포윈도우
            // 마커를 클릭했을 때 마커 위에 표시할 인포윈도우를 생성합니다
            var iwContent = '<div style="padding:5px;">Hello World!</div>', // 인포윈도우에 표출될 내용으로 HTML 문자열이나 document element가 가능합니다
                iwRemoveable = true; // removeable 속성을 ture 로 설정하면 인포윈도우를 닫을 수 있는 x버튼이 표시됩니다

            // 인포윈도우를 생성합니다
            var infowindow = new daum.maps.InfoWindow({
                content : iwContent,
                removable : iwRemoveable
            });

            // 마커에 클릭이벤트를 등록합니다
            daum.maps.event.addListener(testMarker, 'click', function() {
                  // 마커 위에 인포윈도우를 표시합니다
                infowindow.open(map, testMarker);  
            });
// End 임시 인포윈도우


			$scope.isDraging = false;
			$scope.refreshMapInfo = function() {
			    $scope.mapInfoCenter = map.getCenter().toString();
			    var bounds = map.getBounds();
			    $scope.mapInfoSW = bounds.getSouthWest().toString();
			    $scope.mapInfoNE = bounds.getNorthEast().toString();
			    $scope.mapInfoZoomLevel = map.getLevel();
			}
			
			var markerList = [];
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


			    $scope.requestInfoCenter = map.getCenter();     // 이 변수는 다른곳에서 사용한다


			    soc.getCctvs(params)
			        .then(function(res) {
			            
                        // 배열에 추가된 마커들을 지도에 표시하거나 삭제하는 함수입니다
                        soc.log("PREV length: " + markerList.length);
                        function deleteMarkers() {
                            for (var i = 0; i < markerList.length; i++) {
                                markerList[i].setMap(null);
                                delete markerList[i];
                            }            
                            markerList = [];                            
                        }
                        deleteMarkers();
                        
                        var length = res.data.cctvs.length;
                        for(var i=0; i<length; i++) {
                            var cctv = res.data.cctvs[i];
                            if(markerList[cctv.cctvId] === undefined) {
                                //soc.log(cctv.cctvId + " ADD");
                                // 마커가 표시될 위치입니다 
                                var markerPosition  = new daum.maps.LatLng(cctv.latitude, cctv.longitude); 

                                // 마커를 생성합니다
                                var marker = new daum.maps.Marker({
                                    position: markerPosition,
                                    image: markerImage
                                });
                            
                                // 마커가 지도 위에 표시되도록 설정합니다
                                marker.setMap(map);
                                
                                markerList.push(marker);                            
                            } else {
                                //soc.log(cctv.cctvId + " PASS");
                            }
                            
                        }
                        soc.log("AFT length: " + markerList.length);
                        
			            $scope.responseInfoCount = map.getCenter();
                        
                    }, function(err) {
                        soc.log("ERROR: " + JSON.stringify(err));
                    }
                );
                
			}

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
			}

			// 지도 확대, 축소 컨트롤에서 축소 버튼을 누르면 호출되어 지도를 확대하는 함수입니다
			$scope.zoomOut = function() {
    			map.setLevel(map.getLevel() + 1);
			}
			
			
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
		});
    })