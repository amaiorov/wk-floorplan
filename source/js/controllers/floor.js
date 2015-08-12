var FloorModel = require( 'models/floor' );

var EmployeeIcon = require( 'controllers/employeeicon' );
var Seat = require( 'models/seat' );


var Floor = function( element ) {

	// assign view element
	this.$element = $( element );

	// create model
	var floorIndex = this.$element.attr( 'data-id' );
	this._model = FloorModel.getByIndex( floorIndex );

	// create entities
	var entities = this._entities = [];

	$.each( this.$element.find( '.entity-icon' ), $.proxy( function( i, el ) {

		var entity = new EmployeeIcon( el );
		entities.push( entity );

		// WIP: NOW AUTOMATICALLY ASSIGN ENTITIES WITH VACANT SEATS
		var seat = FloorModel.getVacantSeat( this._model.index );
		entity.model.seat( seat );
		entity.updatePosition();

	}, this ) );
}


Floor.prototype.getIndex = function() {

	return this._model.index;
};


Floor.prototype.show = function() {

	this.$element.show();
};


Floor.prototype.hide = function() {

	this.$element.hide();
};


module.exports = Floor;