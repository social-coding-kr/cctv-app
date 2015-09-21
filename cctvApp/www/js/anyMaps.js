
    //window.google = window.google || {}
    //window.daum = window.daum || {}

    (function() {
        console.log("preset Prototype google to daum");
        
        // 레벨과 줌은 서로 반대다
        var googleMaxZoom = 19;
        google.maps.Map.prototype.getLevel = function() {
            return googleMaxZoom - this.getZoom();
        }  

        google.maps.Map.prototype.setLevel = function(level) {
            google.maps.Map.prototype.setZoom(googleMaxZoom - level);
        }

        google.maps.LatLngBounds.prototype.contain
            = google.maps.LatLngBounds.prototype.contains;
            google.maps.LatLng.prototype.getLat
            = google.maps.LatLng.prototype.lat;
    
        google.maps.LatLng.prototype.getLng
            = google.maps.LatLng.prototype.lng;
    })();
    
    function AnyMaps(provider) {
        var anyMaps = provider.maps;
    
        // 추가적으로 넣어줄 내용
        anyMaps.isGoogleMap = function() {
            return anyMaps == google.maps;
        }

        anyMaps.isDaumMap = function() {
            return anyMaps == daum.maps;
        }
        
        return anyMaps;
    }
    
