var Utils = {};


Utils.lerp = function( a, b, x ) {
	return a + x * ( b - a );
};


Utils.easeOutCubic = function( t ) {
	return ( --t ) * t * t + 1;
};


Utils.easeOutQuad = function( t ) {
	return t * ( 2 - t );
};


Utils.createSingleton = function( _instance, _constructor, _opt_window_instance_name ) {

	var func = function() {

		_instance = _instance || new _constructor();

		if ( _opt_window_instance_name ) {
			window[ _opt_window_instance_name ] = _instance;
		}

		return _instance;
	}

	return func;
};


Utils.createSingletonNow = function( _instance, _constructor, _opt_window_instance_name ) {

	return Utils.createSingleton( _instance, _constructor, _opt_window_instance_name )();
};


module.exports = Utils;