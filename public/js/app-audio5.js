angular.module( 'Audio5', [] ).factory( 'AudioService', function () {
	'use strict';

	var audio = {};
	var audio5js = function ( name, title ) {
		var element = document.getElementById( name );
		var source = 'ringtones/' + ( title ? title : element.getAttribute( 'data-source' ) );

		var state = function ( active, ended ) {
			if ( !element || !element.children || !element.children[ 0 ] )
				return ;

			playing_save = active ? name : -1;
			if ( ended )
				element.parentNode.children[ 0 ].className = 'c100 small p100';
		};

		audio[ name ] = new Audio5js( {
			throw_errors: true,
			format_time: false,
			//swf_path: 'swf/audio5js.swf',
			codecs: [ 'm4r', 'mp3' ],
			ready: function ( player ) {
				this.on( 'play', function () { state( true ); }, this );
				this.on( 'pause', function () { state( false ); }, this );
				this.on( 'ended', function () { delete ( audio[ name ] ); state( false, true ); }, this );
				this.on( 'error', function () { console.log( arguments ); }, this );

				this.on( 'timeupdate', function ( position, duration ) {
					if ( !element || !element.children || !element.children[ 0 ] )
						return ;

					position = Math.round( position );
					duration = Math.round( duration );

					var progress = element.parentNode.children[ 0 ];
					var percent = Math.round( position / duration * 100 );
					percent = isNaN( percent ) ? 0 : percent;

					progress.className = 'c100 small p' + percent;
				}, this );

				var select;
				switch ( player.codec )
				{
					case 'mp3': select = source + '.mp3'; break;
					default: select = source + '.m4r'; break;
				}

				this.load( select );
				this.play();
			}
		} );

		return ( audio[ name ] );
	};

	var time = function ( seconds ) {
		seconds = seconds || 0;
		return ( new Date( seconds * 1000 ) ).toUTCString().match( /(\d\d:\d\d:\d\d)/ )[ 0 ].substring( 3 );
	};

	var toogle = function ( name, url ) {
		var element = document.getElementById( name );
		var source = url ? url : element.getAttribute( 'data-source' );

		if ( audio[ name ] === undefined )
			audio5js( name, source );
		else
			audio[ name ].playPause();
	};

	var playing_save = -1;
	var playing = function () {
		return ( playing_save );
	};

	var pauseAll = function () {
		for ( var index in audio )
			audio[ index ].pause();
	};

	var deleteOne = function ( prefix, without ) {
		for ( var index in audio )
		{
			var name = index.indexOf( prefix ) ? index : index.substring( prefix.length );

			if ( without.indexOf( name ) < 0 )
			{
				audio[ index ].pause();
				delete ( audio[ index ] );
			}
		}
	};

	var deleteAll = function () {
		for ( var index in audio )
			delete ( audio[ index ] );
	};

	return ( { audio: audio5js, playing: playing, toggle: toogle, pauseAll: pauseAll, deleteOne: deleteOne, deleteAll: deleteAll } );
} );
