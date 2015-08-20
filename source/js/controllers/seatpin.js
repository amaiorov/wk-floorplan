var ObjectObserver = require( 'libs/observe' ).ObjectObserver;
var FloorModel = require( 'models/floor' );


var SeatPin = function( element, model ) {

	// assign view element
	this.$element = $( element );

	// assign model
	this.model = model;

	this._$onObserved = $.proxy( this.onObserved, this );

	this._observer = new ObjectObserver( this.model );
	this._observer.open( this._$onObserved );
}


SeatPin.prototype.dispose = function() {

	this._observer.close( this._$onObserved );

	this.$element.remove();
	this.$element = null;

	this.model.dispose();
	this.model = null;
};


SeatPin.prototype.setX = function( x ) {

	this.$element.css( {
		'left': x
	} );
};


SeatPin.prototype.setY = function( y ) {

	this.$element.css( {
		'top': y
	} );
};


SeatPin.prototype.onObserved = function( added, removed, changed, getOldValueFn ) {

	for ( var key in changed ) {
		var value = changed[ key ];

		switch ( key ) {
			case 'x':
				this.setX( value );
				break;

			case 'y':
				this.setY( value );
				break;

			default:
				break;
		}
	}
}


module.exports = SeatPin;