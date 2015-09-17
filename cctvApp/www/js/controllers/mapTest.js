'use strict';
angular.module('starter.controllers')

.controller('MapTestCtrl',
    function($rootScope, $scope, $ionicLoading, $compile, $http, soc, $ionicPlatform) {

		$ionicPlatform.ready(function() {

            var mapContainer = document.getElementById('map2'); // 지도를 표시할 div 
            var defLoc = soc.getDefaultLocation();
    		var mapOption = { 
        		center: new daum.maps.LatLng(defLoc.lat, defLoc.lon), // 지도의 중심좌표
        		level: 3 // 지도의 확대 레벨
		   	};

			// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
			var map = new daum.maps.Map(mapContainer, mapOption); 
			


			$scope.isDraging = false;
			$scope.refreshMapInfo = function() {
			    $scope.mapInfoCenter = map.getCenter().toString();
			    var bounds = map.getBounds();
			    $scope.mapInfoSW = bounds.getSouthWest().toString();
			    $scope.mapInfoNE = bounds.getNorthEast().toString();
			    $scope.mapInfoZoomLevel = map.getLevel();
			}
			
			$scope.requestInfoCount = 0;
			$scope.requestCctvs = function() {
			    
			    // 일단 지금은 실제 요청은 하지않고 테스트
			    $scope.requestInfoCount += 1;
			    var bounds = map.getBounds();
			    
			    // 실제 요청할때는 이 범위보다 2배(?) 큰범위를 요청한다
			    $scope.requestInfoSW = bounds.getSouthWest().toString();
			    $scope.requestInfoNE = bounds.getNorthEast().toString();			    

			    $scope.requestInfoCenter = map.getCenter(); 
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