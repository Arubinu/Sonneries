var	http	= require( 'http' );

var	getIP	= function( success, error ) {
	getPort( 'jsonip.com', { port: 80 }, function ( data ) { success( JSON.parse( data ).ip ); }, error );
};

var	getPort	= function( addr, options, success, error ) {
	var chunk = '';
	if ( typeof options !== 'object' )
		options = {};
	options[ 'hostname' ] = addr;
	options[ 'agent' ] = false;
	options[ 'pool' ] = false;

	var req = http.request( options, function ( res ) {
		res.setEncoding( 'utf8' );
		res.on( 'data', function ( data ) { chunk += data; } );
		res.on( 'end', function () { if ( typeof success === 'function' ) success( chunk ); } );
	} );
	req.on( 'socket', function ( socket ) {
		socket.setTimeout( 2500 );
		socket.on( 'timeout', function() { req.abort(); } );
	} );
	req.on( 'error', function () {
		if ( typeof error === 'function' )
			error( 'Unable to connect to remote host.' );
	} );
	req.end();
};

module.exports.ip = getIP;
module.exports.port = getPort;
