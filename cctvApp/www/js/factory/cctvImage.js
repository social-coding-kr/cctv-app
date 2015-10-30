'use strict';
angular.module('starter.controllers')

.factory('cctvImageFactory', ['$q', 'soc',
function($q, soc, $location) {
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
        widthImages : 0, 
        refreshInfoImage: function() {
                soc.log('refreshInfoImage started');
                var location = $location.url();
                soc.log(location);
                var divs = document.getElementsByClassName('info-image');
                this.widthImages = 0;
                for (var i = 0; i < divs.length; i++) {
                    var div = divs[i];

                    var img = div.querySelector('img');
                    var imgAspect = img.height / img.width;
                    
                    if(imgAspect > 1) {
                        // Do nothing
                    } else {
                        this.widthImages += (i + 1);
                    }
                }
                soc.log('widthImages =' + this.widthImages);
                
                if (this.widthImages === 0) {
                    soc.log('가로 이미지가 없는 경우');
                    if(divs.length != 0) {
                        var img_height = (divs[0].querySelector('img').height / 2).toString();
                    }
                    for (var i = 0; i < divs.length; i++) {
                        var img = divs[i].querySelector('img');
                        img.style.cssText = 'width: 50%; height: ' + img_height + 'px; FLOAT: left;';
                        soc.log(img.style.cssText);
                    }
                } else if (this.widthImages === 1) {
                    soc.log('cctvImage만 가로이미지인 경우');
                    if(divs.length == 1) {
                        var cctvImg = divs[0].querySelector('img');
                        cctvImg.style.cssText = 'width: 100%; height: auto;';
                    } else if(divs.length == 2) {
                        var cctvImg = divs[0].querySelector('img');
                        cctvImg.style.cssText = 'width: 100%; height: auto;';
                        var infoImg = divs[1].querySelector('img');
                        infoImg.style.cssText = 'width: 50%; height: auto;';
                    }
                    // var img_margin = divs[1].querySelector('img').height - divs[0].querySelector('img').height;
                    // var top_margin = (img_margin / 4).toString();
                    // soc.log(cctvImg.style.cssText);
                    // soc.log(infoImg.style.cssText);
                } else if (this.widthImages === 2) {
                    soc.log('안내판 이미지만 가로이미지인 경우');
                    if(divs.length == 1) {
                        var cctvImg = divs[0].querySelector('img');
                        cctvImg.style.cssText = 'width: 50%; height: auto;';
                    } else if(divs.length == 2) {
                        var cctvImg = divs[0].querySelector('img');
                        cctvImg.style.cssText = 'width: 50%; height: auto;';
                        var infoImg = divs[1].querySelector('img');
                        infoImg.style.cssText = 'width: 100%; height: auto;';
                    }
                    // var img_margin = divs[0].querySelector('img').height - divs[1].querySelector('img').height;
                    // var top_margin = (img_margin / 4).toString();
                    // soc.log(cctvImg.style.cssText);
                    // soc.log(infoImg.style.cssText);
                } else {
                    soc.log('두 사진 모두 가로이미지인 경우');
                    for (var i = 0; i < divs.length; i++) {
                        var img = divs[i].querySelector('img');
                        img.style.cssText = 'width: 100%; height: auto;';
                        // soc.log(img.style.cssText);
                    }
                }
            },    
    };
}    
]);
