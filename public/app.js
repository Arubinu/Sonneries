// Start Application
window.parent.postMessage( 'ping', 'http://arubinu.free.fr/' ); // send ping
var	app = angular.module( 'app', [ 'ngResource', 'ngAnimate', 'infinite-scroll', 'ui.bootstrap', 'Audio5' ], function ( $compileProvider ) {
	$compileProvider.debugInfoEnabled( true );
} );

( function ( app ) {
	var design = function( $scope, $http, $interval, $location, $modal, Ringtones, AudioService ) {
		var design = this;
		design.category = {
			load: false,
			search: false,
			num: 0,
			array: {
				id: [ 'all', 'games', 'movies', 'effects' ],
				title: [ 'Tous les genres', 'Jeux vidéo', 'Films', 'Effets sonore' ],
				count: [ 0, 0, 0, 0 ]
			},
			get: function ( type, id ) {
				var num = id ? design.category.array.id.indexOf( id ) : design.category.num;
				return ( design.category.array[ type ][ num ] );
			}
		};

		design.toggle = function ( element ) {
			var name = 'audio-' + element.hash;
			var title = element.title;
			var category = element.category;

			category = ( !category || category == 'all' ) ? '' : category + '/';

			AudioService.pauseAll();
			AudioService.toggle( name, category + title );
		};
		design.next = function () {
			design.infinite.nextPage( design.category.get( 'id' ) );
		};
		design.dl = function ( element ) {
			$modal.open( {
				animation: true,
				templateUrl: 'download.html',
				controller: 'DownloadCtrl',
				size: 'md',
				resolve: { items: { title: element.title } }
			} ).result.then( function ( select ) {
				var file = element.file;
				var category = element.category;
				category = ( !category || category == 'all' ) ? '' : category + '/';

				++element.dl;
				document.location.href = '/dl/' + select + '/' + category + file.substring( 0, file.lastIndexOf( '.' ) );
			} );
		};
		design.qrcode = function ( element ) {
			var title = element.title;
			var category = element.category;
			category = ( !category || category == 'all' ) ? 'all' : category + '/';

			var url = 'http://' + $location.$$host + ':' + $location.$$port + '/#/dl/' + category + '/' + title;

			$modal.open( {
				animation: true,
				templateUrl: 'qrcode.html',
				controller: 'QrCodeCtrl',
				size: 'md',
				resolve: { items: { title: element.title, qrcode: encodeURIComponent( url ) } }
			} );
		}

		design.playing = -1;
		$interval( function () {
			var prefix = 'audio-';
			var name = AudioService.playing().toString();
			design.playing = name.indexOf( prefix ) ? -1 : name.substring( prefix.length );
		}, 500 );
		$scope.$watch( 'design.menu', function ( visible ) {
			var len = visible ? ( design.category.array.id.length * 60 ) : 0;
			document.body.style.paddingTop = 80 + len + 'px';
		} );
		$scope.$watch( 'design.category.num', function ( category ) {
			if ( !design.category.load )
			{
				design.category.load = true;
				return ;
			}

			design.infinite.nextPage( design.category.array.id[ category ], true );
		} );
		$scope.$watch( 'design.infinite.search', function () {
			if ( !design.category.search )
			{
				design.category.search = true;
				return ;
			}

			design.infinite.nextPage( design.category.get( 'id' ), true );
		} );
		$scope.$watch( 'design.infinite.items', function ( newVal, oldVal ) {
			if ( !oldVal || newVal == oldVal )
				return ;

			var deleteAll = [];
			for ( var index in design.infinite.items )
				deleteAll.push( design.infinite.items[ index ].id.toString() );

			AudioService.deleteOne( 'audio', deleteAll );
		}, true );

		$http.get( 'http://' + $location.$$host + ':' + $location.$$port + '/sql/count' ).success( function( data ) {
			if ( data.success !== true )
				return ;

			var element;
			if ( !$location.$$path.indexOf( '/dl/' ) )
			{
				var dl = $location.$$path.substring( 4 ).split( '/' );
				if ( dl.length == 2 )
					element = { id: 666, title: dl[ 1 ], category: dl[ 0 ], file: dl[ 1 ] + '.m4a', dl: 0, enable: false };
			}

			angular.forEach( data.data.count, function ( value, index ) {
				var select = design.category.array.id.indexOf( index );
				design.category.array.count[ select ] = value;

				if ( element && index == element.category )
					element.enable = true;
			} );

			if ( element && element.enable )
				design.dl( element );
		} );

		design.infinite = new Ringtones();
	};

	var qrcode = function( $scope, $modalInstance, items ) {
		$scope.title = items.title;
		$scope.qrcode = items.qrcode;

		$scope.ok = function () {
			$modalInstance.dismiss( 'cancel' );
		};
	};

	var download = function( $scope, $modalInstance, items ) {
		$scope.title = items.title;
		$scope.types = [
			{ ext: 'm4r', name: 'iPhone / iPad' },
			{ ext: 'mp3', name: 'Android / Windows Phone' },
		];

		$scope.confirm = function ( select ) {
			$modalInstance.close( select );
		}

		$scope.ok = function () {
			$modalInstance.dismiss( 'cancel' );
		};
	};

	var infinite = function( $http, $location, UniqId ) {
		var Ringtones = function () {
			this.busy = false;
			this.after = 0;
			this.items = [];
			this.search = '';
			this.stop = false;
			this.error = false;
		};

		Ringtones.prototype.nextPage = function ( category, reset ) {
			if ( this.busy )
				return ;

			if ( reset )
			{
				this.after = 0;
				this.items = [];
				this.stop = false;
			}
			else if ( this.stop )
				return ;

			this.busy = true;

			var search = this.search ? ( '&search=' + encodeURIComponent( this.search.replace( /&amp;/g, '&' ) ) ) : '';
			var url = 'http://' + $location.$$host + ':' + $location.$$port + '/sql/' + category + '?after=' + ( this.after || 0 ) + search;

			$http.get( url ).success( function( data ) {
				var items = data.data.ringtones;

				for ( index in items )
				{
					items[ index ].hash = items[ index ].id + UniqId.toString( items[ index ].id + items[ index ].title );
					this.items.push( items[ index ] );
				}

				if ( !items.length )
					this.stop = true;

				this.after += items.length;
				this.error = false;
				this.busy = false;
			}.bind( this ) ).error( function () { console.log( 'error:', arguments ); this.error = true; } );
		};

		return ( Ringtones );
	};

	var	uniqid = function () {
		return ( {
			toString: function ( str ) {
				return ( CryptoJS.SHA1( str ).toString().substring( 0, 8 ) );
			}
		} );
	}

	app.factory( 'UniqId', [ uniqid ] );
	app.factory( 'Ringtones', [ '$http', '$location', 'UniqId', infinite ] );
	app.controller( 'DesignCtrl', [ '$scope', '$http', '$interval', '$location', '$modal', 'Ringtones', 'AudioService', design ] );
	app.controller( 'QrCodeCtrl', [ '$scope', '$modalInstance', 'items', qrcode ] );
	app.controller( 'DownloadCtrl', [ '$scope', '$modalInstance', 'items', download ] );

	app.run( [ '$rootScope', '$location', function ( $rootScope, $location ) {
		document.body.className = '';

		$rootScope.url = 'http://' + $location.$$host + ':' + $location.$$port + '/';

		$rootScope.scrollTop = function () {
			scrollTo( document.body, 0, 350 );
		}

		var scrollTo = function ( element, to, duration ) {
			if ( duration < 0 )
				return;

			var difference = to - element.scrollTop;
			var perTick = difference / duration * 10;

			setTimeout( function () {
				element.scrollTop = element.scrollTop + perTick;
				if ( element.scrollTop == to )
					return;

				scrollTo( element, to, duration - 10 );
			}, 10 );
		}
	} ] );
} ( angular.module( 'app' ) ) );
