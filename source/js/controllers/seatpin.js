var Pin = require( 'controllers/pin' );
var inherits = require( 'inherits' );


var SeatPin = function( element, model ) {

	Pin.call( this, element, model );
}
inherits( SeatPin, Pin );


SeatPin.prototype.dispose = function() {

	Pin.prototype.dispose.call( this );

	this.model.dispose();
	this.model = null;
};


module.exports = SeatPin;