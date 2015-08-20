var ObjectObserver = require( 'libs/observe' ).ObjectObserver;

var _instances = {};


var Seat = function( seatIndex, floorIndex, opt_x, opt_y ) {

	this.seatIndex = seatIndex;
	this.floorIndex = floorIndex;

	this.id = Seat.generateId( seatIndex, floorIndex );

	this.x = opt_x || '0%';
	this.y = opt_y || '0%';

	this.entity = null;

	this._$onObserved = $.proxy( this.onObserved, this );

	this._observer = new ObjectObserver( this );
	this._observer.open( this._$onObserved );
}


Seat.prototype.dispose = function() {

	this.entity = null;

	this._observer.close( this._$onObserved );
	this._observer = null;
}


Seat.prototype.onObserved = function( added, removed, changed, getOldValueFn ) {

	for ( var key in changed ) {
		var value = changed[ key ];

		switch ( key ) {
			case 'entity':
				var entity = value;
				entity.seat = this;
				break;

			default:
				break;
		}
	}
}


Seat.generateId = function( seatIndex, floorIndex ) {

	return 'f' + floorIndex + 's' + seatIndex;
}


Seat.RADIUS = 15;


module.exports = Seat;