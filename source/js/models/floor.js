var Utils = require( 'app/utils' );
var SeatModel = require( 'models/seat' );

var _instances = {};

var Floor = function( floorIndex ) {

	this.index = floorIndex;
	this.id = 'f' + this.index;

	this.freeSeatIndexes = [];
	this.usedSeatIndexes = [];

	for ( var i = 1; i <= 300; i++ ) {
		this.freeSeatIndexes.push( Utils.pad( i, 3 ) );
	}

	this.seats = {};
	this.generateSeats( 150 );
	Floor.floors.push( this );
}


Floor.prototype.getSeatsTotal = function() {

	return Object.keys( this.seats ).length;
}


Floor.prototype.addSeat = function( x, y ) {

	var seatIndex = this.freeSeatIndexes.shift();
	this.usedSeatIndexes.push( seatIndex );

	var floorIndex = this.index;

	var seatModel = new SeatModel( seatIndex, floorIndex, x, y );
	this.seats[ seatModel.id ] = seatModel;

	return seatModel;
}


Floor.prototype.removeSeat = function( seatModel ) {

	this.freeSeatIndexes.push( seatModel.seatIndex );
	this.usedSeatIndexes.splice( this.usedSeatIndexes.indexOf( seatModel.seatIndex ), 1 );

	delete this.seats[ seatModel.id ];
}


Floor.prototype.generateSeats = function( opt_amount ) {

	var amount = opt_amount || 100;

	for ( var i = 0; i < amount; i++ ) {

		var percX = Math.round( Math.random() * 100 ) + '%';
		var percY = Math.round( Math.random() * 100 ) + '%';
		this.addSeat( percX, percY );
	}

	return this.seats;
}


Floor.prototype.getVacantSeats = function() {

	var vacantSeats = [];

	$.each( this.seats, function( seatId, seat ) {
		if ( !seat.entity ) {
			vacantSeats.push( seat );
		}
	} );

	return vacantSeats;
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


Floor.getSeatById = function( id ) {

	var floorIndex = id.charAt( 1 );
	var floor = Floor.getByIndex( floorIndex );
	var seat = floor.seats[ id ];

	return seat;
}

Floor.createJson = function() {

	var result = {};

	for ( var i = 0; i < Floor.floors.length; i++ ) {

		var seats = $.each( Floor.floors[ i ].seats, function( i, seat ) {
			result[ seat.id ] = {
				'x': seat.x,
				'y': seat.y
			}
		} );
	}

	return result;
}

Floor.floors = [];


module.exports = Floor;