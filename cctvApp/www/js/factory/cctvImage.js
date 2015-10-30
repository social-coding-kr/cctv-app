'use strict';
angular.module('starter.controllers')

.factory('cctvImageFactory', ['$q', 'soc',
function($q, soc) {
    // 썸네일로 보여줄 이미지를 div class="cctv-image-thumb"으로 감싸야 사용가능
    /*
    return {
        refreshThumbImage: function() {
                var divs = document.getElementsByClassName('cctv-image-thumb');
                //var divs = document.querySelectorAll('image-thumb');

                //soc.log(JSON.stringify(divs));


                for (var i = 0; i < divs.length; i++) {
                    soc.log("Z0: " + i);
                    var div = divs[i];
                    var divAspect = div.offsetHeight / div.offsetWidth;
                    div.style.overflow = 'hidden';

                    var img = div.querySelector('img');
                    var imgAspect = img.height / img.width;

                    if (imgAspect <= divAspect) {
                        var imgWidthActual = div.offsetHeight / imgAspect;
                        var imgWidthToBe = div.offsetHeight / divAspect;
                        var marginLeft = -Math.round((imgWidthActual - imgWidthToBe) / 2)
                        img.style.cssText = 'width: auto; height: 100%; margin-left: ' + marginLeft + 'px;'
                    } else {
                        var imgHeightActual = div.offsetWidth * imgAspect;
                        var imgHeightToBe = div.offsetWidth * divAspect;
                        var marginTop = -Math.round((imgHeightActual - imgHeightToBe) / 2)
                        img.style.cssText = 'width: 100%; height: auto; margin-top: ' + marginTop + 'px;';
                    }
                }
            },    
    };
    */
    
    // 세부정보 이미지 부분을 'info-image'로 감싸서 사용
    return {
        refreshInfoImage: function() {
                var divs = document.getElementsByClassName('info-image');
                var WidthImages = 0;
                
                for (var i = 0; i < divs.length; i++) {
                    var div = divs[i];

                    var img = div.querySelector('img');
                    var imgAspect = img.height / img.width;
                    
                    if(imgAspect > 1) {
                        // Do nothing
                    } else {
                        WidthImages += 1;
                    }
                }
                soc.log('WidthImage :' + WidthImages);
                
                if (WidthImages === 0) {
                    var img_height = (divs[0].querySelector('img').height/2).toString();
                    for (var i = 0; i < divs.length; i++) {
                        var img = divs[i].querySelector('img');
                        img.style.cssText = 'width: 50%; height: ' + img_height + 'px; FLOAT: left;';
                        soc.log(img.style.cssText);
                    }
                    soc.log('case WidthImage 0');
                } else if (WidthImages === 1) {
                    for (var i = 0; i < divs.length; i++) {
                        var img = divs[i].querySelector('img');
                        img.style.cssText = 'width: 75%; height: auto;';
                    }
                    soc.log('case WidthImage 1');
                } else {
                    for (var i = 0; i < divs.length; i++) {
                        var img = divs[i].querySelector('img');
                        img.style.cssText = 'width: 100%; height: auto;';
                    }
                    soc.log('case WidthImage 2');
                }
            },    
    };
}    
]);
