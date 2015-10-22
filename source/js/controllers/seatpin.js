var Pin = require( 'controllers/pin' );
var inherits = require( 'inherits' );


var SeatPin = function( element, model ) {

	Pin.call( this, element, model );
}
inherits( SeatPin, Pin );


SeatPin.prototype.dispose = function() {

	if ( this.model ) {
		this.model.dispose();
		//console.log( 'Seat "' + this.model.id + '" disposed.' );
	}

	Pin.prototype.dispose.call( this );
};


SeatPin.prototype.handleModelChange = function( key, value ) {

	if ( key === 'entity' ) {
		var hasEntity = value ? true : false;
		this.$element.toggleClass( 'seated', hasEntity );
	}

	if ( ( key === 'x' || key === 'y' ) && !value ) {
		this.dispose();
		return;
	}

	Pin.prototype.handleModelChange.call( this, key, value );
};


module.exports = SeatPin;