var FloorModel = require( 'models/floor' );

var EmployeeIcon = require( 'controllers/employeeicon' );
var Seat = require( 'models/seat' );


var Floor = function( element ) {

	// assign view element
	this.$element = $( element );

	// create model
	var floorIndex = this.$element.attr( 'data-id' );
	this._model = FloorModel.getByIndex( floorIndex );

	// create occupants
	var occupants = this._occupants = [];

	$.each( this.$element.find( '.occupant-icon' ), $.proxy( function( i, el ) {

		var occupant = new EmployeeIcon( el );
		occupants.push( occupant );

		// WIP: NOW AUTOMATICALLY ASSIGN OCCUPANTS WITH VACANT SEATS
		var seat = FloorModel.getVacantSeat( this._model.index );
		occupant.model.occupy( seat );
		occupant.updatePosition();

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