'use strict';
angular.module('starter.controllers')

.controller('MapTestCtrl',
    function($rootScope, $scope, $ionicLoading, $compile, $http, soc, $ionicPlatform) {

		$ionicPlatform.ready(function() {
			/*
			var oPoint = new nhn.api.map.LatLng(37.5010226, 127.0396037);
			nhn.api.map.setDefaultPoint('LatLng');
			soc.log("map.setDefaultPoint");
			var oMap = new nhn.api.map.Map('map2' ,{
						point : oPoint,
						zoom : 10,
						enableWheelZoom : true,
						enableDragPan : true,
						enableDblClickZoom : false,
						mapMode : 0,
						activateTrafficMap : false,
						activateBicycleMap : false,
						minMaxLevel : [ 1, 14 ],
						size : new nhn.api.map.Size(500, 400)
					});
            soc.log("new map.Map");
            */
            var mapContainer = document.getElementById('map2'), // 지도를 표시할 div 
    		mapOption = { 
        		center: new daum.maps.LatLng(33.450701, 126.570667), // 지도의 중심좌표
        		level: 3 // 지도의 확대 레벨
		   	};

			// 지도를 표시할 div와  지도 옵션으로  지도를 생성합니다
			var map = new daum.maps.Map(mapContainer, mapOption); 
		});
    })