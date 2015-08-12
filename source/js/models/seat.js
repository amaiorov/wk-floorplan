var _instances = {};


var Seat = function( seatIndex, floorIndex ) {

	this.seatIndex = seatIndex;
	this.floorIndex = floorIndex;

	this.id = Seat.generateId( seatIndex, floorIndex );

	this.x = '0%';
	this.y = '0%';

	this.occupant = null;
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


module.exports = Seat;