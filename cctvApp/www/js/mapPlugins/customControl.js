
// custom LeafletJS Plugin - customControl
L.Control.customControl = L.Control.extend({
    options: {
        position: 'topleft',
        innerHTML: '',
        href: '#',
        onClick: null
    },

    onAdd: function(map) {
        var controlName = 'leafletCustomControl';
        var container = L.DomUtil.create('div', controlName + ' leaflet-bar');

        this._inner = this._createInner(controlName + '-click', container, this._onClick);
        this._updateStyle();
        
        return container;
    },

    onRemove: function(map) {
        // 여기에 뭐가 들어가야 하는지 모르겠다
    },


    setStyle: function(style) {
        this._style = style;
        //this._map.whenReady(this._update, this);
    },
    
    _updateStyle: function() {
        var style = this._style;
        for (var key in style) {
            if (style.hasOwnProperty(key)) {
                this._inner.style[key] = style[key];
            }
        }

    },

    _onClick: function() {
        if (this.options.onClick) {
            this.options.onClick(this);
        }
    },

    _createInner: function(className, container, fn) {
        var inner = L.DomUtil.create('a', className, container);
        inner.innerHTML = this.options.innerHTML;
        inner.href = this.options.href;

        L.DomEvent
            .on(inner, 'click', L.DomEvent.stop)
            .on(inner, 'click', fn, this)
            .on(inner, 'click', this._refocusOnMap, this);
            
        return inner;
    },

    setInnerHTML: function(text) {
        //this.options.text = text;
        this._inner.innerHTML = text;        
    }

});
