'use strict';
angular.module('starter.controllers')

.factory('cctvReportFactory', ['$q', 'soc', '$rootScope', 'locationFactory', '$ionicPopup', '$http',
    '$location', '$cordovaCamera', '$cordovaToast', '$cordovaFile', '$ionicHistory', 'cctvMapFactory',
    'cctvImageFactory', '$cordovaDialogs', '$state',
function($q, soc, $rootScope, locationFactory, $ionicPopup, $http, $location, $cordovaCamera,
    $cordovaToast, $cordovaFile, $ionicHistory, cctvMapFactory, cctvImageFactory, $cordovaDialogs, $state) {

    function onError(error) {
        if(ionic.Platform.isWebView()) {
             $cordovaToast.show(error, 'long', 'bottom');
        } else {
            alert(error);
        }
       
    }

    function getBlobImage(filepath) {
        var q = $q.defer();
        var blobImage = null;
        
        
        
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
            // 대부분의 디바이스
            var fullPath = filepath;
            var fileName = fullPath.replace(/^.*[\\\/]/, '');
            var filePath = fullPath.split('/' + fileName)[0];
            
            soc.log("window.BlobBuilder: " + window.BlobBuilder);
            soc.log("window.WebKitBlobBuilder: " + window.WebKitBlobBuilder);
            soc.log("window.MozBlobBuilder: " + window.MozBlobBuilder);
            soc.log("window.MSBlobBuilder: " + window.MSBlobBuilder);
            
            $cordovaFile.readAsArrayBuffer(filePath, fileName).then(
                function(result) {

                    soc.log("readAsArrayBuffer: " + result +", " + result.byteLength);
                    
                    /* 바이너리 헤더 확인을 위한 코드
                    var dataView = new DataView(result);
                    var textlog = "";
                    for(var i=0; i<16; i++) {
                        var hex = dataView.getUint8(i);  
                        soc.log(hex);
                        textlog += hex.toString(16) + " ";
                    }
                    soc.log(textlog + "///");
                    */
                    
                    try {
                        blobImage = new Blob([result], {type: "image/jpeg"});
                        soc.log("1. Blob.size:" + blobImage.size + ", Blob.type: " + blobImage.type);
                    } catch(e) {
                        // 아래는 Blob 생성자를 사용할수 없는 웹뷰(젤리빈 등)을 위한 코드
                        window.BlobBuilder = window.BlobBuilder ||
                            window.WebKitBlobBuilder ||
                            window.MozBlobBuilder ||
                            window.MSBlobBuilder;
                        
                        if (e.name == 'TypeError' && window.BlobBuilder) {
                            soc.log("TypeError: " + e.message);
                            //var dataView = new DataView(result);
                            var bb = new BlobBuilder();
                            bb.append(result);
                            blobImage = bb.getBlob("image/jpeg");
                            soc.log("case 2");
                            //soc.log("2. Blob.size:" + blobImage.size + ", Blob.type: " + blobImage.type);
                        }
                        else if (e.name == "InvalidStateError") {
                            // InvalidStateError (tested on FF13 WinXP)
                            blobImage = new Blob([result.buffer], {type: {type: "image/jpeg"}});
                            soc.log("case 3");
                        }
                        else {
                            // We're screwed, blob constructor unsupported entirely   
                            soc.log("Error");
                        }
                    }
                    soc.log("3. Blob.size:" + blobImage.size + ", Blob.type: " + blobImage.type);
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
        statusNone: "none",
        statusFindPosition: "findPosition",
        statusFoundPosition: "foundPosition",
        statusStartReport: "startReport",
        statusSendReport: "sendReport",
        statusFailed: "failed",
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
            this.status = this.statusNone;
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
            this.status = this.statusStartReport;
            $location.path(this.path);
            $rootScope.AnotherPageToMap();
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
                
            cctvMapFactory.requestCctvs();
            //$rootScope.deleteCurrentPosition();
        },
        
        cancelReport: function() {
            soc.log("cancel");
            if(ionic.Platform.isWebView()) {      
                $cordovaToast.show('CCTV 위치 등록이 취소되었습니다', 'long', 'bottom');
            }
            this.endReport();
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
            //soc.log(this.reportMarker);
            if(this.reportMarker) this.reportMarker.setMap(null);
        },
        findPosition: function() {
            var This = this;
            // 위치 탐색
            This.status = This.statusFindPosition;
            locationFactory.getCurrentPositionSmart(locationFactory.defaultOptions).then(
                function(result) {
                    This.status = This.statusFoundPosition;
                    This.lat = result.coords.latitude;
                    This.lng = result.coords.longitude;
                    This.showCurrentPosition(result);
                    
                }, function(error) {
                    This.status = This.statusFailed;
                    This.endReport();
                }
            );
        },
        prepareReport: function() {
            var This = this;
            
            if(this.status == this.statusFindPosition
            || this.status == this.statusFoundPosition) return; //여러번 누르는 문제 방지
            

            /*
            if(window.WebKitBlobBuilder !== undefined) {
                $cordovaDialogs.confirm('해당 기기에서는 제공되지 않는 기능입니다 ', 'CCTV 위치 등록', ['확인'])
                .then(function(buttonIndex) {

                });
                This.endReport();                
                return;
            }
            */
            this.endReport();
            
            
            cctvMapFactory.endWatchPosition();
            $ionicPopup.show({
                      title :'<strong><span class="cctv-app-font cctv-text-center">위치 정보 사용</span></strong>',
                      template : '등록할 <strong><span style="color: blue">CCTV 위치 파악</span></strong>을 위해 사용자의 현 위치 정보를 필요로합니다.<br /> 위치 정보 사용에 <strong><span style="color: blue;">동의</span></strong>하시겠습니까?',
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
                        //cctvImageFactory.refreshThumbImage();
                        This.makeCctvImageBinary();
                    }, function(error) {
                        soc.log(error);
                    });
            } else {
                this.cctvImage = 'img/cctvFake.jpg';
                this.cctvPhotoProcess = true;
                //cctvImageFactory.refreshThumbImage();
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
            if(ionic.Platform.isWebView()) {
                $cordovaCamera.getPicture(this.cameraOptions).then(
                    function(imageURI) {
                        This.noticeImage = imageURI;
                        This.noticePhotoProcess = true;
                        //cctvImageFactory.refreshThumbImage();
                        This.makeNoticeImageBinary();
                    }, function(error) {
                        soc.log(error);
                    });
            } else {
                this.noticeImage = 'img/noticeFake.jpg';
                this.cctvNoticeProcess = true;
                //cctvImageFactory.refreshThumbImage();
            }
        }, 
        makeNoticeImageBinary: function() {
            var This = this;
            function onSuccessBlob(blobImage) { 
                This.noticeImageBinary = blobImage;
            }
            
            getBlobImage(this.noticeImage).then(onSuccessBlob, onError);
        },
        noticeNoExist: function() {
            this.noticeImage = null;
            this.noticeImageBinary = null;
            this.noticePhotoProcess = true;
        },
        sendReport: function() {
            var This = this;
            if(!this.cctvPhotoProcess) {
                // TODO: alert 교체
                alert("cctv 사진을 촬영하세요");
                return;
            }

            if (!this.noticePhotoProcess) {
                // TODO: alert 교체
                alert("안내판 사진을 촬영하세요");
                return;
            }
            
            if(this.status == this.statusSendReport) {
                // 여러번 누르기 방지
                return;
            }
            
            this.status = this.statusSendReport;

            //-----------------------------------------------------------
            // BlobBuilder를 사용하는 구형 웹뷰를 위한 폼데이터 생성 코드
            //-----------------------------------------------------------
            var
            // Android native browser uploads blobs as 0 bytes, so we need a test for that
                needsFormDataShim = (function() {
                    var bCheck = ~navigator.userAgent.indexOf('Android') && ~navigator.vendor.indexOf('Google') && !~navigator.userAgent.indexOf('Chrome');

                    return bCheck && navigator.userAgent.match(/AppleWebKit\/(\d+)/).pop() <= 534;
                })(),

                // Test for constructing of blobs using new Blob()
                blobConstruct = !!(function() {
                    try {
                        return new Blob();
                    }
                    catch (e) {}
                })(),

                // Fallback to BlobBuilder (deprecated)
                XBlob = blobConstruct ? window.Blob : function(parts, opts) {
                    var bb = new(window.BlobBuilder || window.WebKitBlobBuilder || window.MSBlobBuilder);
                    parts.forEach(function(p) {
                        bb.append(p);
                    });

                    return bb.getBlob(opts ? opts.type : undefined);
                };

            function FormDataShim() {
                var
                // Store a reference to this
                    o = this,

                    // Data to be sent
                    parts = [],

                    // Boundary parameter for separating the multipart values
                    boundary = Array(21).join('-') + (+new Date() * (1e16 * Math.random())).toString(36),

                    // Store the current XHR send method so we can safely override it
                    oldSend = XMLHttpRequest.prototype.send;
                this.getParts = function() {
                    return parts.toString();
                };
                this.append = function(name, value, filename) {
                    parts.push('--' + boundary + '\r\nContent-Disposition: form-data; name="' + name + '"');

                    if (value instanceof Blob) {
                        parts.push('; filename="' + (filename || 'blob') + '"\r\nContent-Type: ' + value.type + '\r\n\r\n');
                        parts.push(value);
                    }
                    else {
                        parts.push('\r\n\r\n' + value);
                    }
                    parts.push('\r\n');
                };

                XMLHttpRequest.prototype.send = function(val) {
                    var fr,
                        data,
                        oXHR = this;

                    if (val === o) {
                        // Append the final boundary string
                        parts.push('--' + boundary + '--\r\n');
                        soc.log(parts.toString());
                        // Create the blob
                        data = new XBlob(parts);

                        // Set up and read the blob into an array to be sent
                        fr = new FileReader();
                        fr.onload = function() {
                            oldSend.call(oXHR, fr.result);
                        };
                        fr.onerror = function(err) {
                            throw err;
                        };
                        fr.readAsArrayBuffer(data);

                        // Set the multipart content type and boudary
                        this.setRequestHeader('Content-Type', 'multipart/form-data; boundary=' + boundary);
                        XMLHttpRequest.prototype.send = oldSend;
                    }
                    else {
                        oldSend.call(this, val);
                    }
                };
            }
            //-----------------------------------------------------------

            var formData = needsFormDataShim ? new FormDataShim() : new FormData();

            formData.append('latitude', this.lat);
            formData.append('longitude', this.lng);

            formData.append('cctvImage', this.cctvImageBinary, "cctvImage.jpg");
            formData.append('noticeImage', this.noticeImageBinary, "noticeImage.jpg");


            $http.post(soc.server.mainUrl + "cctv", formData, {
                    transformRequest: angular.identity,
                    headers: {
                        'Content-Type': undefined
                    }
                }).success(function(response) {
                    if (ionic.Platform.isWebView()) {
                        $cordovaToast
                            .show('성공적으로 등록되었습니다', 'long', 'bottom')
                            .then(function(success) {
                                // success
                            }, function(error) {
                                // error
                            });
                    }

                    This.endReport();

                    soc.log("등록 성공 :" + formData);
                    //soc.log("response :" + JSON.stringify(response));
                }).error(function(response) {
                    if (ionic.Platform.isWebView()) {
                        $cordovaToast.show('등록 실패: ' + response, 'long', 'bottom')
                            .then(function(success) {
                                // success
                            },function(error) {     
                                // error
                            });                    
                }
                
                //soc.log("등록 실패 :" + formData);
                //soc.log("response :" + JSON.stringify(response));
                //alert("response :" + JSON.stringify(response));
            });
        },
    };
}    
]);
