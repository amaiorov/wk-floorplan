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

	this._hasDragged = false;

	this._$onDragStart = $.proxy( this.onDragStart, this );
	this._$onDragMove = $.proxy( this.onDragMove, this );
	this._$onDragEnd = $.proxy( this.onDragEnd, this );

	this._onDragEndCallback = _onDragEndCallback;
}


EntityDragger.prototype.activate = function() {

	this._$entityContainer.on( 'mousedown', '.entity-pin', this._$onDragStart );
	this._$entityContainer.on( 'mousedown', '.seat-pin', this._$onDragStart );
};


EntityDragger.prototype.deactivate = function() {

	this._$entityContainer.off( 'mousedown', '.entity-pin', this._$onDragStart );
	this._$entityContainer.off( 'mousedown', '.seat-pin', this._$onDragStart );
};


EntityDragger.prototype.dispose = function() {

	this.deactivate();

	this._$element = null;
	this._$entityContainer = null;
	this._entityModel = null;
	this._$actualEntityIcon = null;
	this._$draggerEntityIcon = null;
};


EntityDragger.prototype.onDragStart = function( e ) {

	if ( e.button > 0 || !$( e.target ).hasClass( 'icon' ) ) return;

	$( document ).on( 'mousemove', this._$onDragMove );
	$( document ).on( 'mouseup', this._$onDragEnd );

	this._$actualEntityIcon = $( e.currentTarget );

	var iconOffset = this._$actualEntityIcon.offset();
	this._iconOffsetX = e.pageX - iconOffset.left - this._$actualEntityIcon.width() / 2;
	this._iconOffsetY = e.pageY - iconOffset.top - this._$actualEntityIcon.height() / 2;

	this._hasDragged = false;
};


EntityDragger.prototype.onDragMove = function( e ) {

	if ( !this._hasDragged ) {

		var draggerEntityIcon;

		if ( this._$actualEntityIcon.hasClass( 'seat-pin' ) ) {

			var seatId = this._$actualEntityIcon.attr( 'data-id' );
			this._entityModel = Floor.getSeatById( seatId );

			draggerEntityIcon = soy.renderAsFragment( template.SeatPin, {
				seat: this._entityModel
			} );

		} else if ( this._$actualEntityIcon.hasClass( 'entity-pin' ) ) {

			var fullName = this._$actualEntityIcon.attr( 'data-id' );
			this._entityModel = employeeCollection.getByName( fullName );

			draggerEntityIcon = soy.renderAsFragment( template.EmployeePin, {
				employee: this._entityModel,
				showInfo: true
			} );
		}

		this._$actualEntityIcon.hide();

		this._$draggerEntityIcon = $( draggerEntityIcon ).addClass( 'dragging' );

		this._$element.append( this._$draggerEntityIcon ).show();
		$( 'html' ).attr( 'data-cursor', 'dragging' );
	}

	this._hasDragged = true;

	var elementOffset = this._$element.offset();
	var dragX = e.pageX - elementOffset.left - this._iconOffsetX;
	var dragY = e.pageY - elementOffset.top - this._iconOffsetY;

	this._$draggerEntityIcon.css( {
		'left': dragX + 'px',
		'top': dragY + 'px'
	} ).show();
};


EntityDragger.prototype.onDragEnd = function( e ) {

	$( document ).off( 'mousemove', this._$onDragMove );
	$( document ).off( 'mouseup', this._$onDragEnd );

	if ( !this._hasDragged ) {
		return;
	}

	this._hasDragged = false;

	var elementOffset = this._$element.offset();
	var dragX = e.pageX - elementOffset.left - this._iconOffsetX;
	var dragY = e.pageY - elementOffset.top - this._iconOffsetY;

	var outOfRangeX = ( dragX < 0 || dragX > this._$element.width() );
	var outOfRangeY = ( dragY < 0 || dragY > this._$element.height() );

	dragX = outOfRangeX ? null : dragX;
	dragY = outOfRangeY ? null : dragY;

	this._onDragEndCallback( dragX, dragY, this._$actualEntityIcon, this._entityModel );

	this._$element.hide().empty();
	$( 'html' ).attr( 'data-cursor', '' );
};


module.exports = EntityDragger;