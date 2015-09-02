var Pin = require( 'controllers/pin' );
var inherits = require( 'inherits' );


var SeatPin = function( element, model ) {

	Pin.call( this, element, model );
}
inherits( SeatPin, Pin );


SeatPin.prototype.dispose = function() {

	this.model.dispose();

	Pin.prototype.dispose.call( this );
};


SeatPin.prototype.handleModelChange = function( key, value ) {

	Pin.prototype.handleModelChange.call( this, key, value );

	if ( key === 'entity' ) {
		var hasEntity = value ? true : false;
		this.$element.toggleClass( 'seated', hasEntity );
	}
};


module.exports = SeatPin;