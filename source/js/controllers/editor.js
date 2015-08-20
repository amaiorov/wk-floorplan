var template = require( 'views/main.soy' );
var Waitlist = require( 'controllers/waitlist' );
var EntityDragger = require( 'controllers/entitydragger' );
var FloorViewer = require( 'controllers/floorviewer' );
var FloorModel = require( 'models/floor' );
var SeatModel = require( 'models/seat' );
var EmployeeModel = require( 'models/employee' );
var employeeCollection = require( 'models/employeecollection' );

var _instance;


var Editor = function() {

	var floor6Seats = FloorModel.getByIndex( '6' ).seats;
	var floor7Seats = FloorModel.getByIndex( '7' ).seats;
	var floor8Seats = FloorModel.getByIndex( '8' ).seats;

	var floor6Employees = employeeCollection.getByFloor( 6 );
	var floor7Employees = employeeCollection.getByFloor( 7 );
	var floor8Employees = employeeCollection.getByFloor( 8 );
	var unassignedEmployees = employeeCollection.getUnassigned();

	var element = soy.renderAsFragment( template.Editor, {
		floor6Employees: floor6Employees,
		floor7Employees: floor7Employees,
		floor8Employees: floor8Employees,
		floor6Seats: floor6Seats,
		floor7Seats: floor7Seats,
		floor8Seats: floor8Seats,
		unassignedEmployees: unassignedEmployees
	} );

	this.$element = $( element );

	$( '#editor-container' ).append( this.$element );

	// declare vars
	this._metrics = {};

	// query dom elements
	this._$floorPane = this.$element.find( '.floor-pane' );
	this._$waitlistPane = this.$element.find( '.waitlist-pane' );

	// scoped methods
	this._$onSplitUpdate = $.proxy( this.onSplitUpdate, this );
	this._$onSplitEnd = $.proxy( this.onSplitEnd, this );
	this._$onClickWaitlist = $.proxy( this.onClickWaitlist, this );
	this._$onClickWaitlistIcon = $.proxy( this.onClickWaitlistIcon, this );
	this._$onEntityDragEnd = $.proxy( this.onEntityDragEnd, this );
	this._$onClickAddSeat = $.proxy( this.onClickAddSeat, this );
	this._$onClickRemoveSeat = $.proxy( this.onClickRemoveSeat, this );
	this._$changeMode = $.proxy( this.changeMode, this );
	this._$resize = $.proxy( this.resize, this );

	// add events
	$( window ).on( 'resize', this._$resize ).resize();
	$( window ).on( 'editorsplitupdate', this._$onSplitUpdate );
	$( window ).on( 'editorsplitend', this._$onSplitEnd );

	// create editor components
	this._waitlist = new Waitlist( this._$waitlistPane, this._metrics );

	var $floorViewport = this.$element.find( '.floor-viewport' );
	this._floorViewer = new FloorViewer( $floorViewport );

	this._entityDragger = new EntityDragger(
		this.$element.find( '.entity-dragger-viewport' ),
		this.$element,
		this._$onEntityDragEnd );

	// controls
	this._$addSeatButton = $( '#toolbar .btn-add-seat' );
	this._$removeSeatButton = $( '#toolbar .btn-remove-seat' );

	this._$modeToggler = $( '#mode-toggler' ).bootstrapToggle();
	this._$modeToggler.change( this._$changeMode );

	this._$changeMode();
}


Editor.prototype.resize = function() {

	var $editingRegion = this.$element.find( '.editing-region' );
	var editingRegionPosition = $editingRegion.offset();

	this._metrics.editingRegionWidth = $editingRegion.width();
	this._metrics.editingRegionHeight = $editingRegion.height();
	this._metrics.editingRegionTop = editingRegionPosition.top;
	this._metrics.editingRegionLeft = editingRegionPosition.left;

	return this._metrics;
}


Editor.prototype.onSplitUpdate = function( e ) {

	this._$floorPane.css( 'width', e.fraction * 100 + '%' );
	this._$waitlistPane.css( 'width', ( 1 - e.fraction ) * 100 + '%' );
}


Editor.prototype.onSplitEnd = function( e ) {

	this._floorViewer.updateViewportMetrics();
}


Editor.prototype.onEntityDragEnd = function( x, y, $entityIcon, entityModel ) {

	var entityPositionInFloor = this._floorViewer.getFloorPositionByViewerCoordinates( x, y );
	var entityX = $.isNumeric( x ) ? entityPositionInFloor.x : null;
	var entityY = $.isNumeric( y ) ? entityPositionInFloor.y : null;

	var outOfViewport = ( !entityX || !entityY );
	var isSeat = ( entityModel instanceof SeatModel );
	var isEntity = ( entityModel instanceof EmployeeModel );

	if ( isSeat ) {

		entityModel.x = entityX;
		entityModel.y = entityY;

		if ( outOfViewport ) {

			this._floorViewer.currentFloor.removeSeatPin( entityModel );

		} else {

			$entityIcon.show();
		}

	} else if ( isEntity ) {

		entityModel.x = entityX;
		entityModel.y = entityY;
		entityModel.floorIndex = outOfViewport ? null : this._floorViewer.currentFloorIndex;

		if ( outOfViewport && entityModel.isAssigned ) {

			this._floorViewer.currentFloor.removeEntityIcon( entityModel );

		} else {

			$entityIcon.show();
		}

		if ( !outOfViewport && !entityModel.isAssigned ) {

			this._floorViewer.currentFloor.addEntityIcon( entityModel );
			this._floorViewer.updateIconSize();
		}
	}
};



Editor.prototype.onClickAddSeat = function( e ) {

	this._floorViewer.currentFloor.addSeatPin(
		this._floorViewer.getFloorPosition(), this._floorViewer.getFloorSize() );

	this._floorViewer.updateIconSize();
};


Editor.prototype.onClickRemoveSeat = function( e ) {

};


Editor.prototype.changeMode = function() {

	var isEditMode = this._$modeToggler.prop( 'checked' );

	if ( isEditMode ) {

		this._entityDragger.activate();
		this._waitlist.activate();

		this._$addSeatButton.on( 'click', this._$onClickAddSeat );
		this._$removeSeatButton.on( 'click', this._$onClickRemoveSeat );

		$( '#toolbar .edit-buttons .btn' ).removeClass( 'disabled' );

	} else {

		this._entityDragger.deactivate();
		this._waitlist.deactivate();

		this._$addSeatButton.off( 'click', this._$onClickAddSeat );
		this._$removeSeatButton.off( 'click', this._$onClickRemoveSeat );

		$( '#toolbar .edit-buttons .btn' ).addClass( 'disabled' );
	}

	this.$element.toggleClass( 'preview', !isEditMode );
};


module.exports = {
	getInstance: function() {
		_instance = _instance || new Editor( arguments );
		return _instance;
	}
};