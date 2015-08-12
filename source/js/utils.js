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

module.exports = Utils;