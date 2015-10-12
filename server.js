#!/usr/bin/env node

/// Including Libraries
var	fs				= require( 'fs' ),
	chalk			= require( 'chalk' )
	crypto			= require( 'crypto' ),
	express			= require( 'express' ),
	bodyParser		= require( 'body-parser' );


/// Including Perosnal Libraries
var	getIpPort		= require( __dirname + '/scripts/get-ip-port.js' ),
	cat_port		= process.argv.join( '' ),
	chk_port		= cat_port.indexOf( 'port=' ),
	arg_port		= ( chk_port > 0 ) ? parseInt( cat_port.substring( chk_port + 5 ).split( ' ' )[ 0 ] ) : false;


/// Other Variables And Calls
var	app				= express(),
	port			= arg_port || process.env.PORT || 8888,
	racine			= __dirname + '/' + 'public/';


/// Configuration BDD
var	sqlite3			= require( 'sqlite3' ).verbose(),
	sql				= new sqlite3.Database( './sqlite.db' );


/// Function of Download
var	isRingtone = function ( element, title, category ) {
	return ( element.title == title && ( !category || element.category == category ) );
}

var	findRingtone = function ( element, str ) {
	return ( !str || element.title.toLowerCase().indexOf( str.toLowerCase() ) >= 0 );
}

var	checkRingtone = function ( file, dir ) {
	var ext = file.lastIndexOf( '.m4r' );
	if ( ext <= 0 )
		return ( false );

	var uri = rtdir + ( dir ? ( dir + '/' ) : '' ) + file.substring( 0, ext ) + '.mp3';
	if ( ext == file.length - 4 && fs.existsSync( uri ) )
		return ( true );

	return ( false );
}

var hashRingtone = function ( str ) {
	return ( crypto.createHash( 'sha1' ).update( str ).digest( 'hex' ) );
};

var	addRingtone = function ( index, file, dir ) {
	dir = dir || '';
	var ext = file.lastIndexOf( '.' );
	var title = ext ? file.substring( 0, ext ) : file;

	if ( ext <= 0 )
		return ;

	var hash = hashRingtone( dir + '/' + title );
	sql.all( 'SELECT `count` FROM `download` WHERE `hash` = "' + hash + '"', function( err, rows ) {
		var dl = ( err || !rows.length ) ? 0 : rows[ 0 ].count;
		var element = { id: index, title: title, category: dir, file: file, dl: dl };

		galery.push( element );
		if ( dir )
			subgalery[ dir ].push( element );
	} );
};

var	addDownload = function ( dir, title, dl ) {
	dir = dir || '';
	var hash = hashRingtone( dir + '/' + title );

	var insert = 'INSERT INTO `download` ( `hash`, `count`, `date` ) VALUES ( "' + hash + '", ' + parseInt( dl ) + ', DATETIME( "now" ) )';
	var update = 'UPDATE `download` SET `count` = ' + parseInt( dl ) + ', `date` = DATETIME( "now" ) WHERE `hash` = "' + hash + '"';

	sql.all( 'SELECT `hash` FROM `download` WHERE `hash` = "' + hash + '"', function( err, rows ) {
		if ( err || !rows.length )
			sql.run( insert );
		else
			sql.run( update );
	} );
};


/// Ringtones Listing
var galery = [];
var subgalery = {};
var rtdir = racine + 'ringtones/';
files = fs.readdirSync( rtdir );
for ( index in files )
{
	var file = files[ index ];
	if ( !file.lastIndexOf( '.' ) )
		continue ;

	if ( fs.lstatSync( rtdir + file ).isDirectory() )
	{
		var dir = file;
		subgalery[ dir ] = [];
		subfiles = fs.readdirSync( rtdir + dir );
		for ( subindex in subfiles )
		{
			var subfile = subfiles[ subindex ];
			if ( !subfile.lastIndexOf( '.' ) )
				continue ;

			if ( checkRingtone( subfile, dir ) )
				addRingtone( subindex, subfile, dir );		}
	}
	else if ( checkRingtone( file ) )
		addRingtone( index, file );
}

/// Configuration Server
app.locals.title	= 'Ringtones';
app.locals.strftime	= require( 'strftime' );
app.locals.email	= 'arubinu@free.fr';

app.use( bodyParser.json() );													// for parsing application/json
app.use( bodyParser.urlencoded( { extended: true } ) );							// for parsing application/x-www-form-urlencoded
app.use( '/', express.static( racine ) );

/// Routes Server
app.all( '*', function ( req, res, next ) {
	var date = new Date().toISOString().replace( /T/, ' ' ).replace( /\..+/, '' );

	console.log( chalk.magenta( '[ ' + req.ip + ' ]' ), date, chalk.green( req.method ), '\t' + chalk.grey( req.originalUrl ) );
	next();
} );

if ( fs.existsSync( './index.html' ) )
{
	app.get( '/', function ( req, res ) {
		res.send( fs.readFileSync( 'index.html', 'utf8' ).replace( /\[\[ url \]\]/g, 'http://' + req.headers.host + '/' ) );
	} );
}

app.get( '/sql/count', function ( req, res ) {
	var array = { all: galery.length };
	for ( index in subgalery )
		array[ index ] = subgalery[ index ].length;

	res.json( { success: true, message: 'Ringtones count successful.', data: { count: array } } ).end();
} );

app.get( '/sql/:category', function ( req, res ) {
	var array = [];
	var start = ( parseInt( req.query.after ) || -1 ) + 1;
	var search = req.query.search;
	var select = ( req.params.category == 'all' ) ? galery : subgalery[ req.params.category ];

	if ( start > 1000 )
	{
		res.json( { success: false, message: 'Ringtones out of range.' } ).end()
		return ;
	}

	if ( search )
	{
		var sort = [];
		for ( index in select )
		{
			if ( findRingtone( select[ index ], search ) )
				sort.push( select[ index ] );
		}
		select = sort;
		delete ( sort );
	}

	for ( var i = start; i < start + 10 && i < select.length; ++i )
		array.push( select[ i ] );

	var data = { ringtones: array, count: array.length };
	setTimeout( function () {
		res.json( { success: true, message: 'Ringtones get successful.', data: data } ).end();
	}, 500 );
} );

app.all( '/dl/:type/:category?/:title', function ( req, res, next ) {
	var element = false;
	var title = req.params.title;
	var type = req.params.type;

	for ( index in galery )
	{
		if ( isRingtone( galery[ index ], title, req.params.category ) )
		{
			element = galery[ index ];
			break ;
		}
	}

	if ( !element )
	{
		next();
		return ;
	}

	var uri = rtdir + ( element.category ? element.category + '/' : '' ) + title + '.' + type;
	fs.exists( uri, function( exists ) {
		if ( exists )
		{
			++element.dl;
			var count = element.dl;

			addDownload( element.category, title, count );
			res.download( uri );

			return ;
		}
		next();
	} );
} );

app.all( '*', function ( req, res ) {
	res.redirect( '/' );
} );


/// Signal Interceptor
process.stdin.setRawMode( true );
process.stdin.on( 'readable', function() {
	if ( JSON.stringify( process.stdin.read() ) === '{"type":"Buffer","data":[3]}' )
	{
		if ( typeof server !== 'undefined' )
			server.close();
		sql.close();

		process.exit( 0 );
	}
} );

/// Start Server
var server;
var connect = function ( data ) {
	app.set( 'server.ndd',		data );
	app.set( 'server.port',		port );
	app.set( 'server.addr',		'http://' + app.get( 'server.ndd' ) + ':' + app.get( 'server.port' ) + '/' );

	server = app.listen( app.get( 'server.port' ), function () {
		console.log( chalk.bold( 'Server started on :' ), app.get( 'server.addr' ) );

		if ( process.argv.indexOf( 'ping=no' ) > 0 )
		{
			if ( process.argv.indexOf( 'browser=no' ) <= 0 )
				require( 'open' )( app.get( 'server.addr' ) );
			return ;
		}

		setTimeout( function () {
			getIpPort.port( app.get( 'server.ndd' ), { port: app.get( 'server.port' ), path: '/ping' }, function () {
				if ( process.argv.indexOf( 'browser=no' ) <= 0 )
					require( 'open' )( app.get( 'server.addr' ) );
			}, function () {
				if ( process.argv.indexOf( 'browser=no' ) <= 0 )
					require( 'open' )( 'http://localhost:' + app.get( 'server.port' ) + '' );
				console.log( chalk.red( 'Server unreachable from the outside, configure your NAT !' ) );
			} );
		}, 500 );
	} );
	server.on( 'error', function ( err ) {
		if ( err.code === 'EACCES' )
			console.error( chalk.red( 'Error: port ' + err.port + ' locked' ) );
		else
			console.error( chalk.red( err ) );
		process.exit();
	} );
};

if ( process.argv.indexOf( 'ip=no' ) <= 0 )
	getIpPort.ip( connect, function () {
		console.error( chalk.bold( 'The server could not start, check your connection ...' ) );
		process.exit();
	} );
else
	connect( 'localhost' );
