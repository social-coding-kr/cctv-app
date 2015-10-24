'use strict';
angular.module('starter.controllers')

.factory('cctvReportFactory', ['$q', 'soc', 'locationFactory', '$ionicPopup',
    '$location',
function($q, soc, locationFactory, $ionicPopup, $location) {

    var self =  {
        status: "none",
        cctvImage: "img/noimage.png",
        lat: null,
        lng: null,
        
        getStatus: function() {
            return this.status;  
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
                    $location.path('/app/confirmReport');
                
                }, function(error) {
                    This.status = "failed";
                    alert("실패");
                }
            );
        },

        startReport: function() {
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
