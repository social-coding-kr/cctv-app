'use strict';
angular.module('starter.controllers')

.factory('cctvReportFactory', ['$q', 'soc', '$rootScope', 'locationFactory', '$ionicPopup', '$http',
    '$location', '$cordovaCamera', '$cordovaToast', '$cordovaFile', '$ionicHistory', 'cctvMapFactory',
function($q, soc, $rootScope, locationFactory, $ionicPopup, $http, $location, $cordovaCamera,
    $cordovaToast, $cordovaFile, $ionicHistory, cctvMapFactory) {


    function getBlobImage(filepath) {
        var q = $q.defer();
        var blobImage = null;
        
        //if(false) {
        if(!ionic.Platform.isWebView()) {
            window.webkitResolveLocalFileSystemURL(filepath, function(fileEntry) {
                fileEntry.file(function(file) {
                    var reader = new FileReader();
                    reader.onloadend = function(e) {
                        blobImage = new Blob([reader.result], {type: "image/jpeg"});
                        q.resolve(blobImage);
                    };
                    reader.readAsArrayBuffer(file);
                }, function(error) {
                    q.reject(error);
                }); 
            }, function(error) {
                q.reject(error);
            });        
        } else {
            var fullPath = filepath;
            var fileName = fullPath.replace(/^.*[\\\/]/, '');
            var filePath = fullPath.split('/' + fileName)[0];
            
            $cordovaFile.readAsArrayBuffer(filePath, fileName).then(
                function(result) {
                    blobImage = new Blob([result], {type: "image/jpeg"});
                    q.resolve(blobImage);    
                }, function(error) {
                    q.reject(error);
                });
        }
        return q.promise;
    }
    
    return {
        path: "/app/report",
        mapPath: "/app/map",
        status: "none",
        lat: null,
        lng: null,
        cctvImage: null,
        noticeImage: null,
        cctvImageBinary: null,
        noticeImageBinary: null,
        cctvPhotoProcess: false,
        noticePhotoProcess: false,
        
        reportMarker: null,

        clear: function() {
            //this.path 는 초기화 금지
            this.status = "none";
            this.lat = null;
            this.lng = null;
            this.cctvImage = null;
            this.noticeImage = null;
            this.cctvPhotoProcess = false;
            this.noticePhotoProcess = false;
            this.reportMarker= null;

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

        startReport: function() {
            this.status = "startReporting";
            $location.path(this.path);
            var currentCoord = this.lng + "," + this.lat;
            //alert(this.lat + ", " + this.lng);            
            soc.getAdressFromPoint(currentCoord);
            
        },

        endReport: function() {
            this.hideCurrentPosition();            
            this.clear();            
            $location.path(this.mapPath);
            $ionicHistory.nextViewOptions({
                    disableBack: true
                });
            //$rootScope.deleteCurrentPosition();
        },

        showCurrentPosition: function(pos) {
            var latlng = new google.maps.LatLng(pos.coords.latitude, pos.coords.longitude);
            cctvMapFactory.map.setCenter(latlng);                            
        
            this.reportMarker = new google.maps.Marker({
                position: latlng
            });
            this.reportMarker.setMap(cctvMapFactory.map);
        },
        hideCurrentPosition: function() {
            soc.log("hide");
            soc.log(this.reportMarker);
            if(this.reportMarker) this.reportMarker.setMap(null);
        },
        findPosition: function() {
            var This = this;
            // 위치 탐색
            This.status = "findPosition";
            locationFactory.getCurrentPositionSmart(locationFactory.defaultOptions).then(
                function(result) {
                    This.status = "foundPosition";
                    This.lat = result.coords.latitude;
                    This.lng = result.coords.longitude;
                    This.showCurrentPosition(result);
                    
                }, function(error) {
                    This.status = "failed";
                    //alert("실패");
                }
            );
        },
        prepareReport: function() {
            this.clear();
            var This = this;
            
            cctvMapFactory.endWatchPosition();
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
                            This.endReport();
                        }
                      }]
                      });
        },
        takeCctvPhoto: function() {
            var This = this;
            if(ionic.Platform.isWebView()) {
                $cordovaCamera.getPicture(this.cameraOptions).then(
                    function(imageURI) {
                        This.cctvImage = imageURI;
                        This.cctvPhotoProcess = true;
                        This.makeCctvImageBinary();
                    }, function(error) {
                        soc.log(error);
                    });
            } else {
                this.cctvImage = 'img/cctvExample.jpg';
                this.cctvPhotoProcess = true;
                this.makeCctvImageBinary();
            }
        }, 
        makeCctvImageBinary: function() {
            var This = this;
            function onSuccessBlob(blobImage) { 
                This.cctvImageBinary = blobImage;
            }
            
            getBlobImage(this.cctvImage).then(onSuccessBlob, onError);
        },
        takeNoticePhoto: function() {
            var This = this;
            $cordovaCamera.getPicture(this.cameraOptions).then(
                function(imageURI) {
                    This.noticeImage = imageURI;
                    This.noticePhotoProcess = true;
                    This.makeNoticeImageBinary();
                }, function(error) {
                    soc.log(error);
                });
        }, 
        makeNoticeImageBinary: function() {
            var This = this;
            function onSuccessBlob(blobImage) { 
                This.noticeImageBinary = blobImage;
            }
            
            getBlobImage(this.noticeImage).then(onSuccessBlob, onError);
        },
        noticeNoExist: function() {
            this.noticePhotoProcess = true;
        },
        sendReport: function() {
            var This = this;
            if(!this.cctvPhotoProcess) {
                // TODO: alert 교체
                alert("cctv 사진을 촬영하세요");
                return;
            }

            if(!this.noticePhotoProcess) {
                // TODO: alert 교체
                alert("안내판 사진을 촬영하세요");
                return;
            }
            
            
            var formData = new FormData();
            formData.append('latitude', this.lat);
            formData.append('longitude', this.lng);
            
            // TODO: 목적 처리
            //formData.append('purpose', '기타');
            formData.append('cctvImage', this.cctvImageBinary, "cctvImage.jpg");
            formData.append('noticeImage', this.noticeImageBinary, "noticeImage.jpg");

            $http.post(soc.server.mainUrl + "cctv", formData, {
                transformRequest: angular.identity,
                headers: { 'Content-Type': undefined }
            }).success(function(response) {
                if(ionic.Platform.isWebView()) {
                    $cordovaToast
                        .show('성공적으로 등록되었습니다', 'long', 'bottom')
                        .then(function(success) {
                            // success
                        }, function (error) {
                            // error
                        });                    
                }
                
                This.endReport();
                
                soc.log("등록 성공 :" + formData);
                soc.log("response :" + JSON.stringify(response));
            }).error(function(response) {
                if(ionic.Platform.isWebView()) {                
                    
                    // TODO: 응답 에러 값에 따라 다른 처리를 해야한다
                    $cordovaToast.show('등록 실패: ' + response, 'long', 'bottom')
                        .then(function(success) {
                            // success
                        }, 
                        function (error) {
                            // error
                        });                    
                }
                
                soc.log("등록 실패 :" + formData);
                soc.log("response :" + JSON.stringify(response));
                alert("response :" + JSON.stringify(response));
            });
        },
    };
}    
]);
