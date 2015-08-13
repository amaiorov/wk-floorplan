var ObjectObserver = require( 'libs/observe' ).ObjectObserver;

var _instances = {};


var Seat = function( seatIndex, floorIndex ) {

	this.seatIndex = seatIndex;
	this.floorIndex = floorIndex;

	this.id = Seat.generateId( seatIndex, floorIndex );

	this.x = '0%';
	this.y = '0%';

	this.entity = null;

	this._$onObserved = $.proxy( this.onObserved, this );

	this._observer = new ObjectObserver( this );
	this._observer.open( this._$onObserved );
}


Seat.generateId = function( seatIndex, floorIndex ) {

	return 'f' + floorIndex + 's' + seatIndex;
}


Seat.getByIndex = function( seatIndex, floorIndex ) {

	var model;
	var id = Seat.generateId( seatIndex, floorIndex );

	if ( !_instances[ id ] ) {
		model = _instances[ id ] = new Seat( seatIndex, floorIndex );
	} else {
		model = _instances[ id ];
	}

	return model;
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


Seat.RADIUS = 15;


module.exports = Seat;