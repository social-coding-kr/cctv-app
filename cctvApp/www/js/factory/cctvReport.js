'use strict';
angular.module('starter.controllers')

.factory('cctvReportFactory', ['$q', 'soc', 'locationFactory', '$ionicPopup',
    '$location',
function($q, soc, locationFactory, $ionicPopup, $location) {

    var self =  {
        status: "none",
        lat: null,
        lng: null,
        path: null,
        
        clear: function() {
            this.status = "none";
            this.lat = null;
            this.lng = null;
            this.path = null;
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
                    //alert(This.lat + ", " + This.lng);
                    alert("지도에 위치를 표시했다고 친다");
                    
                    //$location.path(This.path);
                
                }, function(error) {
                    This.status = "failed";
                    alert("실패");
                }
            );
        },

        prepareReport: function() {
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
        }
    };
    
    return self;
}    
]);
