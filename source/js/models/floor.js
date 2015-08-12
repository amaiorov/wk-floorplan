var SeatModel = require( 'models/seat' );

var _instances = {};


var Floor = function( floorIndex ) {

	this.index = floorIndex;
	this.id = 'f' + this.index;

	this.seats = [];
	this.seats = this.generateSeats( 200 );
}


Floor.prototype.generateSeats = function( opt_amount ) {

	var amount = opt_amount || 100;
	var seats = [];

	var i;
	var startIndex = this.seats.length;
	var endIndex = startIndex + amount;

	for ( i = startIndex; i < endIndex; i++ ) {

		var percX = Math.round( Math.random() * 100 ) + '%';
		var percY = Math.round( Math.random() * 100 ) + '%';
		var seatModel = SeatModel.getByIndex( i, this.index );
		seatModel.x = percX;
		seatModel.y = percY;

		seats.push( seatModel );
	}

	return seats;
}


Floor.prototype.getEmployees = function() {

}


Floor.prototype.getPrinters = function() {

}


Floor.prototype.getRooms = function() {

}


Floor.getByIndex = function( index ) {
	var model;

	if ( !_instances[ index ] ) {
		model = _instances[ index ] = new Floor( index );
	} else {
		model = _instances[ index ];
	}

	return model;
}


Floor.getVacantSeat = function( floorIndex ) {

	var floor = Floor.getByIndex( floorIndex );

	var vacantSeat = $.grep( floor.seats, function( seat ) {
		return !seat.entity;
	} )[ 0 ];

	return vacantSeat;
}


module.exports = Floor;