angular.module('todomvc')
	.factory('todoStorage', function ($http, $injector) {
		'use strict';

		// Detect if an API backend is present. If so, return the API module, else
		// hand off the localStorage adapter
		return $http.get('/api')
			.then(function () {
				return $injector.get('api');
			}, function () {
				return $injector.get('localStorage');
			});
	})

.factory('$mapMakeAndControl', function($scope, soc){
    'use strict';
    
    return{
      initialize: function(){
            var map = L.map('map');
            var curLoc = soc.getDefaultLocation();
            var Seoul = new L.LatLng(curLoc.lat, curLoc.lon); // geographical point (longitude and latitude)
            map.setView(Seoul, 15);

            L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
              attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
              maxZoom: 18
            }).addTo(map);

            map.attributionControl.setPrefix(''); // Don't show the 'Powered by Leaflet' text.
            $scope.map = map;
            var markers = new L.FeatureGroup();

            var scale = new L.Control.Scale().addTo(map);
            
            // Ionic 기본 아이콘은 아래 링크 참고
            // http://www.shape5.com/demo/images/general/ionicons/cheatsheet.html
    
            // custom LeafletJS Plugin
            var simpleButton1 = new L.Control.customControl({ 
              position:   "topleft",
              innerHTML:  "<i class='ion-android-share'></i>",
              onClick:    function(control) { alert(control.options.position); }
            });


            var simpleButton3 = new L.Control.customControl({ 
              position:   "bottomright",
              innerHTML:  "<i class='ion-android-settings'></i>",
              onClick:    function(control) { alert(control.options.position); }
            });


            var simpleButton4 = new L.Control.customControl({ 
              position:   "bottomleft",
              innerHTML:  "<strong>Ha!</strong>",
              onClick:    function(control) { alert(control.options.position); },
              width:      120,
              height:     40
            });

            var simpleButton5 = new L.Control.customControl({ 
              position:   "bottomleft",
              innerHTML:  "지도정보<br>{{ infoCurrentPosition }}",
            });
    
            simpleButton5.setStyle({
              width:      '250px',    // 현재 구조적인 문제로 px 외에는 정상작동하지 않음
              height:     '120px',
              background: 'rgba(80,80,80,0.3)',
              lineHeight: '100%',
              textAlign:  'left'
            });
    
          simpleButton1.addTo(map);
          simpleButton3.addTo(map);
          simpleButton4.addTo(map);
          simpleButton5.addTo(map);


    
          var showMapInfo = function() {
            var infoCurrentPosition = $scope.map.getCenter();
            var infoCurrentBounds = $scope.map.getBounds();        
            simpleButton5.setInnerHTML(
                "<strong>지도정보</strong><br>"
              + "<strong>lastPos:</strong> [" + infoCurrentPosition.lat + "," + infoCurrentPosition.lng + "]<br>"
              + "<strong>northEast:</strong> [" + infoCurrentBounds._northEast.lat + "," + infoCurrentBounds._northEast.lng + "]<br>"
              + "<strong>southWest:</strong> [" + infoCurrentBounds._southWest.lat + "," + infoCurrentBounds._southWest.lng + "]<br>"
              );
          };

          showMapInfo();
      },
      
      MyLocationMarker: function(Location, Accuracy) {
        var marker = L.marker(Location);
        markers.addLayer(marker);
        map.addLayer(markers);
        var AccuText = ('');
        if (Accuracy > 100) {
            AccuText = ('헐 이건 너무 심하잖아.');
        }
        else {
            AccuText = ('적절합니다.');
        }
        marker.bindPopup('You are here.</br>이 지점을 기준으로 반경 ' + Accuracy + ' 미터 안에 있습니다.</p>' + AccuText)
            .openPopup();
      },
      
      centerOnMe: function(){
        
      }
      
    }
})




	.factory('api', function ($http) {
		'use strict';

		var store = {
			todos: [],

			clearCompleted: function () {
				var originalTodos = store.todos.slice(0);

				var completeTodos = [];
				var incompleteTodos = [];
				store.todos.forEach(function (todo) {
					if (todo.completed) {
						completeTodos.push(todo);
					} else {
						incompleteTodos.push(todo);
					}
				});

				angular.copy(incompleteTodos, store.todos);

				return $http.delete('/api/todos')
					.then(function success() {
						return store.todos;
					}, function error() {
						angular.copy(originalTodos, store.todos);
						return originalTodos;
					});
			},

			delete: function (todo) {
				var originalTodos = store.todos.slice(0);

				store.todos.splice(store.todos.indexOf(todo), 1);

				return $http.delete('/api/todos/' + todo.id)
					.then(function success() {
						return store.todos;
					}, function error() {
						angular.copy(originalTodos, store.todos);
						return originalTodos;
					});
			},

			get: function () {
				return $http.get('/api/todos')
					.then(function (resp) {
						angular.copy(resp.data, store.todos);
						return store.todos;
					});
			},

			insert: function (todo) {
				var originalTodos = store.todos.slice(0);

				return $http.post('/api/todos', todo)
					.then(function success(resp) {
						todo.id = resp.data.id;
						store.todos.push(todo);
						return store.todos;
					}, function error() {
						angular.copy(originalTodos, store.todos);
						return store.todos;
					});
			},

			put: function (todo) {
				var originalTodos = store.todos.slice(0);

				return $http.put('/api/todos/' + todo.id, todo)
					.then(function success() {
						return store.todos;
					}, function error() {
						angular.copy(originalTodos, store.todos);
						return originalTodos;
					});
			}
		};

		return store;
	})

	.factory('localStorage', function ($q) {
		'use strict';

		var STORAGE_ID = 'todos-angularjs';

		var store = {
			todos: [],

			_getFromLocalStorage: function () {
				return JSON.parse(localStorage.getItem(STORAGE_ID) || '[]');
			},

			_saveToLocalStorage: function (todos) {
				localStorage.setItem(STORAGE_ID, JSON.stringify(todos));
			},

			clearCompleted: function () {
				var deferred = $q.defer();

				var completeTodos = [];
				var incompleteTodos = [];
				store.todos.forEach(function (todo) {
					if (todo.completed) {
						completeTodos.push(todo);
					} else {
						incompleteTodos.push(todo);
					}
				});

				angular.copy(incompleteTodos, store.todos);

				store._saveToLocalStorage(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			},

			delete: function (todo) {
				var deferred = $q.defer();

				store.todos.splice(store.todos.indexOf(todo), 1);

				store._saveToLocalStorage(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			},

			get: function () {
				var deferred = $q.defer();

				angular.copy(store._getFromLocalStorage(), store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			},

			insert: function (todo) {
				var deferred = $q.defer();

				store.todos.push(todo);

				store._saveToLocalStorage(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			},

			put: function (todo, index) {
				var deferred = $q.defer();

				store.todos[index] = todo;

				store._saveToLocalStorage(store.todos);
				deferred.resolve(store.todos);

				return deferred.promise;
			}
		};

		return store;
	});