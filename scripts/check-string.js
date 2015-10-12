var checkString		= function ( str, options )
{
	try {
		if ( !str )
			return ( false );
		else if ( typeof str !== 'string' )
			throw 'First parameter accept only string.';

		var error = false;
		if ( options != undefined )
		{
			var minlen = options.minlen !== undefined;
			var maxlen = options.maxlen !== undefined;

			if ( ( minlen && typeof options.minlen !== 'number' ) || ( maxlen && typeof options.maxlen !== 'number' ) )
				throw 'Options type error.';

			switch ( options.mode )
			{
				case 'alpha': error = !str.match( /^[a-z ]+$/i ); break ;
				case 'numeric': error = !str.match( /^[0-9]+$/ ); break ;
				case 'alphanumeric': error = !str.match( /^([0-9]|[a-z ])+([0-9a-z ]+)$/i ); break ;
				default:
			}
			if ( minlen && str.length < options.minlen )
				error = true;
			if ( maxlen && str.length > options.maxlen )
				error = true;
		}

		if ( error )
			return ( false );
		return ( str );
	}
	catch ( e )
	{
		console.error( 'Error:', e );
		return ( false );
	}
};

String.prototype.checkColumn = function () {
	return ( this.replace( /`/g, '' ) );
};

String.prototype.checkEntry = function () {
	return ( this.replace( /"/g, '\\"' ) );
};

Object.prototype.checkColumn = function () {
	for ( var index in this )
	{
		if ( this.hasOwnProperty( index ) && typeof this[ index ] === 'string' )
			this[ index ] = String.prototype.checkColumn.call( this[ index ] );
	}

	return ( this );
};

Object.prototype.checkEntry = function () {
	for ( var index in this )
	{
		if ( this.hasOwnProperty( index ) && typeof this[ index ] === 'string' )
		{
			this[ index ] = String.prototype.checkEntry.call( this[ index ] );
			console.log( this[ index ] );
		}
	}

	return ( this );
};

module.exports = checkString;
