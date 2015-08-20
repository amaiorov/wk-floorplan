var Utils = {};


Utils.lerp = function( a, b, x ) {
	return a + x * ( b - a );
};


Utils.pad = function( n, width, z ) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array( width - n.length + 1 ).join( z ) + n;
};


Utils.uniformRandom = function( a, b ) {
	return a + Math.random() * ( b - a );
};


Utils.clamp = function( value, min, max ) {
	return Math.min( Math.max( value, min ), max );
};


Utils.easeOutCubic = function( t ) {
	return ( --t ) * t * t + 1;
};


Utils.easeOutQuad = function( t ) {
	return t * ( 2 - t );
};

module.exports = Utils;