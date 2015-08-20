var soy = require( 'libs/soyutils' );
var template = require( 'views/main.soy' );
var employeeCollection = require( 'models/employeecollection' );
var Floor = require( 'models/floor' );


var EntityDragger = function( $element, $entityContainer, _onDragEndCallback ) {

	this._$element = $element.hide();
	this._$entityContainer = $entityContainer;

	this._entityModel = null;
	this._$actualEntityIcon = null;
	this._$draggerEntityIcon = null;

	this._iconOffsetX = 0;
	this._iconOffsetY = 0;

	this._$onDragStart = $.proxy( this.onDragStart, this );
	this._$onDragMove = $.proxy( this.onDragMove, this );
	this._$onDragEnd = $.proxy( this.onDragEnd, this );

	this._onDragEndCallback = _onDragEndCallback;
}


EntityDragger.prototype.activate = function() {

	this._$entityContainer.on( 'mousedown', '.entity-icon', this._$onDragStart );
	this._$entityContainer.on( 'mousedown', '.seat-icon', this._$onDragStart );
};


EntityDragger.prototype.deactivate = function() {

	this._$entityContainer.off( 'mousedown', '.entity-icon', this._$onDragStart );
	this._$entityContainer.off( 'mousedown', '.seat-icon', this._$onDragStart );
};


EntityDragger.prototype.dispose = function() {

	this._$element = null;
	this._$entityContainer = null;
	this._entityModel = null;
	this._$actualEntityIcon = null;
	this._$draggerEntityIcon = null;

	this._$entityContainer.off( 'mousedown', '.entity-icon', this._$onDragStart );
	this._$entityContainer.off( 'mousedown', '.seat-icon', this._$onDragStart );
};


EntityDragger.prototype.onDragStart = function( e ) {

	if ( e.button > 0 || !$( e.target ).hasClass( 'icon' ) ) return;

	$( document ).on( 'mousemove', this._$onDragMove );
	$( document ).on( 'mouseup', this._$onDragEnd );

	this._$actualEntityIcon = $( e.currentTarget );
	var iconOffset = this._$actualEntityIcon.offset();
	this._iconOffsetX = e.pageX - iconOffset.left - this._$actualEntityIcon.width() / 2;
	this._iconOffsetY = e.pageY - iconOffset.top - this._$actualEntityIcon.height() / 2;

	var draggerEntityIcon;

	if ( this._$actualEntityIcon.hasClass( 'seat-icon' ) ) {

		var seatId = this._$actualEntityIcon.attr( 'data-id' );
		this._entityModel = Floor.getSeatById( seatId );

		draggerEntityIcon = soy.renderAsFragment( template.SeatIcon, {
			seat: this._entityModel
		} );

	} else if ( this._$actualEntityIcon.hasClass( 'entity-icon' ) ) {

		var fullName = this._$actualEntityIcon.attr( 'data-id' );
		this._entityModel = employeeCollection.getByName( fullName );

		draggerEntityIcon = soy.renderAsFragment( template.EmployeeIcon, {
			employee: this._entityModel,
			showInfo: true
		} );
	}

	this._$draggerEntityIcon = $( draggerEntityIcon ).hide().addClass( 'dragging' );

	this._$element.append( this._$draggerEntityIcon ).show();
	$( 'html' ).attr( 'data-cursor', 'dragging' );
};


EntityDragger.prototype.onDragMove = function( e ) {

	var elementOffset = this._$element.offset();
	var dragX = e.pageX - elementOffset.left - this._iconOffsetX;
	var dragY = e.pageY - elementOffset.top - this._iconOffsetY;

	this._$draggerEntityIcon.css( {
		'left': dragX + 'px',
		'top': dragY + 'px'
	} ).show();

	this._$actualEntityIcon.hide();
};


EntityDragger.prototype.onDragEnd = function( e ) {

	$( document ).off( 'mousemove', this._$onDragMove );
	$( document ).off( 'mouseup', this._$onDragEnd );

	var elementOffset = this._$element.offset();
	var dragX = e.pageX - elementOffset.left - this._iconOffsetX;
	var dragY = e.pageY - elementOffset.top - this._iconOffsetY;

	var outOfRangeX = ( dragX < 0 || dragX > this._$element.width() );
	var outOfRangeY = ( dragY < 0 || dragY > this._$element.height() );

	dragX = outOfRangeX ? null : dragX;
	dragY = outOfRangeY ? null : dragY;

	this._$element.hide().empty();
	$( 'html' ).attr( 'data-cursor', '' );

	this._onDragEndCallback( dragX, dragY, this._$actualEntityIcon, this._entityModel );
};


module.exports = EntityDragger;