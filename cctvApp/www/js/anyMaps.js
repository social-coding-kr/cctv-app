
    //window.google = window.google || {}
    //window.daum = window.daum || {}

    var anyMapsRealGoogleMarker = null;
    (function() {
        console.log("preset Prototype google to daum");
        
        // 레벨과 줌은 서로 반대다
        var googleMaxZoom = 19;
        google.maps.Map.prototype.getLevel = function() {
            return googleMaxZoom - this.getZoom();
        }  

        google.maps.Map.prototype.setLevel = function(level) {
            //google.maps.Map.prototype.setZoom(googleMaxZoom - level);
            this.setZoom(googleMaxZoom - level);
        }

        google.maps.LatLngBounds.prototype.contain
            = google.maps.LatLngBounds.prototype.contains;
            google.maps.LatLng.prototype.getLat
            = google.maps.LatLng.prototype.lat;
    
        google.maps.LatLng.prototype.getLng
            = google.maps.LatLng.prototype.lng;
        
        // Marker 바꿔치기    
        anyMapsRealGoogleMarker = google.maps.Marker;
        
        //console.log(google.maps.prototype.Marker);
        /*
        google.maps.Marker = function(options) {
            options["icon"] = options["image"];
            return anyMapsRealGoogleMarker(options);
        }*/
    })();
    
    var anyMapsMarkerImages = {};
    
    function AnyMaps(provider) {
        var anyMaps = provider.maps;
    
        // 추가적으로 넣어줄 내용
        anyMaps.isGoogleMap = function() {
            return anyMaps == google.maps;
        }

        anyMaps.isDaumMap = function() {
            return anyMaps == daum.maps;
        }

        anyMaps.registMarkerImage = function(name, image, width, height) {
            var daumMarkerImageSize = new daum.maps.Size(width, height);
            var daumMarketImageOption = {offset: new daum.maps.Point(width/2, height)};
            var daumMarkerImage
            
            anyMapsMarkerImages[name] = {
                image: image,
                width: width,
                height: height,
                daumMarkerImage: new daum.maps.MarkerImage(image, daumMarkerImageSize, daumMarketImageOption)
            };
        }
        
        anyMaps.getMarkerImage = function(name) {
            if(anyMaps.isGoogleMap()) {
                return anyMapsMarkerImages[name].image;
            } else {
                return anyMapsMarkerImages[name].daumMarkerImage;
            }
        }
        
        return anyMaps;
    }
    
