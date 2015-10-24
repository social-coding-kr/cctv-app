'use strict';
angular.module('starter.controllers')

.factory('cctvReportFactory', ['$q', 'soc', 'locationFactory', '$ionicPopup', '$http',
    '$location', '$cordovaFile', '$cordovaCamera',
function($q, soc, locationFactory, $ionicPopup, $http, $location, $cordovaFile, $cordovaCamera) {

    // TODO: 나중에 이 변수는 적절한 위치에서 가져온다
    var userId = "TestingId_ClubSandwich";
    
    return {
        path: null,        
        status: "none",
        lat: null,
        lng: null,
        cctvImage: null,
        boardImage: null,
        cctvImageBinary: null,
        boardImageBinary: null,
        cctvPhotoProcess: false,
        boardPhotoProcess: false,
        
        clear: function() {
            //this.path 는 초기화 금지
            this.status = "none";
            this.lat = null;
            this.lng = null;
            this.cctvImage = null;
            this.boardImage = null;
            this.cctvPhotoProcess = false;
            this.boardPhotoProcess = false;
            
            if(ionic.Platform.isWebView()) {
                this.cameraOptions= {
                    quality: 100,
                    targetWidth: 360,
                    targetHeight: 360, 
                    saveToPhotoAlbum: false,
                    encodingType: navigator.camera.EncodingType.JPEG,
                    //allowEdit        : true, // 사용자의 직접적인 편집 불허
                    destinationType  : navigator.camera.DestinationType.NATIVE_URI,
    			    sourceType       : navigator.camera.PictureSourceType.CAMERA, 
	    		    correctOrientation: true
                };
            }
        },
        
        getStatus: function() {
            return this.status;  
        },

        setPath: function(locationPath) {
            this.path = locationPath;
        },

        startReport: function() {
            $location.path(this.path);
            var currentCoord = this.lng + "," + this.lat;
            //alert(this.lat + ", " + this.lng);            
            soc.getAdressFromPoint(currentCoord);
        },

        cancelReport: function() {
            this.clear();
        },

        findPosition: function() {
            var This = this;
            // 위치 탐색
            This.status = "findPosition";
            locationFactory.getCurrentPosition(locationFactory.defaultOptions).then(
                function(result) {
                    This.status = "foundPosition";
                    This.lat = result.coords.latitude;
                    This.lng = result.coords.longitude;
                    alert("지도에 위치를 표시했다고 친다");

                }, function(error) {
                    This.status = "failed";
                    alert("실패");
                }
            );
        },
        prepareReport: function() {
            this.clear();
            var This = this;
            $ionicPopup.show({title :'<span class="cctv-app-font">위치정보 제공에 동의하십니까?</span>',
                      buttons: [{ 
                        text: '동의',
                        type: 'button-positive',
                        onTap: function(e) {
                            This.findPosition();
                        }
                      }, {
                        text: '거부',
                        type: 'button-default',
                        onTap: function(e) {
                        }
                      }]
                      });
        },
        takeCctvPhoto: function() {
            var This = this;
            $cordovaCamera.getPicture(this.cameraOptions).then(
                function(imageURI) {
                    This.cctvImage = imageURI;
                    This.cctvPhotoProcess = true;
                    This.makeCctvImageBinary();
                }, function(error) {
                    soc.log(error);
                });
            
        }, 
        makeCctvImageBinary: function() {
            var This = this;
            var fullpath = this.cctvImage;
            var file_name = fullpath.replace(/^.*[\\\/]/, '');
            var file_path = fullpath.split('/' + file_name)[0];
            
            if(ionic.Platform.isWebView()) {
                $cordovaFile.readAsBinaryString(file_path, file_name).then(
                    function (success_file_binary)
                    {
                        This.cctvImageBinary = success_file_binary;
                        //alert(This.cctvImageBinary);
                    },
                    function (error)
                    {
                        This.cctvImageBinary = undefined;
                        alert("failed: " + error);
                    }
                );
            }
        },
        takeBoardPhoto: function() {
            var This = this;
            $cordovaCamera.getPicture(this.cameraOptions).then(
                function(imageURI) {
                    This.boardImage = imageURI;
                    This.boardPhotoProcess = true;
                    This.makeBoardImageBinary();
                }, function(error) {
                    soc.log(error);
                });
        }, 
        makeBoardImageBinary: function() {
            var This = this;
            var fullpath = this.boardImage;
            var file_name = fullpath.replace(/^.*[\\\/]/, '');
            var file_path = fullpath.split('/' + file_name)[0];
            
            if(ionic.Platform.isWebView()) {
                $cordovaFile.readAsBinaryString(file_path, file_name).then(
                    function (success_file_binary)
                    {
                        This.boardImageBinary = success_file_binary;
                        //alert(This.cctvImageBinary);
                    },
                    function (error)
                    {
                        This.boardImageBinary = undefined;
                        alert("failed: " + error);
                    }
                );
            }
        },
        boardNoExist: function() {
            this.boardPhotoProcess = true;
        },
        sendReport: function() {
            var formData = new FormData();
            formData.append('latitude', this.lat);
            formData.append('longitude', this.lng);
            // TODO: 목적 처리
            formData.append('purpose', '기타');
            formData.append('cctvImage', this.cctvImageBinary);
            formData.append('noticeImage', this.boardImageBinary);
            formData.append('userId', userId);
            
            $http.post(soc.server.mainUrl + "cctv", formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).success(function(response) {
                soc.log("등록 성공 :" + formData);
                soc.log("response :" + JSON.stringify(response));
            }).error(function(response) {
                soc.log("등록 실패 :" + formData);
                soc.log("response :" + JSON.stringify(response));
                alert("response :" + JSON.stringify(response));
            });
        },
    };
}    
]);
