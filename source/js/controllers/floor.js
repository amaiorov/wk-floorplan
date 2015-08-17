var soy = require( 'libs/soyutils' );
var template = require( 'views/main.soy' );
var FloorModel = require( 'models/floor' );
var EmployeeIcon = require( 'controllers/employeeicon' );
var Seat = require( 'models/seat' );


var Floor = function( element ) {

	// assign view element
	this.$element = $( element );
	this._$inner = this.$element.find( '.inner' );

	// create model
	var floorIndex = this.$element.attr( 'data-id' );
	this._model = FloorModel.getByIndex( floorIndex );

	// create entities
	var entities = this._entities = [];
	var vacantSeats = FloorModel.getVacantSeats( this._model.index );

	$.each( this.$element.find( '.entity-icon' ), $.proxy( function( i, el ) {

		var entity = new EmployeeIcon( el );
		entities.push( entity );

		var seat = vacantSeats.shift();
		entity.model.seat = seat;

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


Floor.prototype.addEntityIcon = function( model ) {

	var icon = soy.renderAsFragment( template.EmployeeIcon, {
		employee: model,
		showInfo: true
	} );

	$( icon ).css( {
		'left': model.x,
		'top': model.y
	} );

	this._$inner.append( icon );

	var entity = new EmployeeIcon( icon, model );
	this._entities.push( entity );
};


Floor.prototype.removeEntityIcon = function( model ) {

	var entity = $.grep( this._entities, function( employeeIcon ) {
		return ( employeeIcon.model === model );
	} )[ 0 ];

	this._entities.splice( this._entities.indexOf( entity ), 1 );
};


module.exports = Floor;