var soy = require( 'libs/soyutils' );
var template = require( 'views/main.soy' );
var Waitlist = require( 'controllers/waitlist' );
var EntityDragger = require( 'controllers/entitydragger' );
var FloorViewer = require( 'controllers/floorviewer' );
var employeeCollection = require( 'models/employeecollection' );

var _instance;


var SeatEditor = function() {

	var floor6Employees = employeeCollection.getByFloor( 6 );
	var floor7Employees = employeeCollection.getByFloor( 7 );
	var floor8Employees = employeeCollection.getByFloor( 8 );
	var unassignedEmployees = employeeCollection.getUnassigned();

	this.element = soy.renderAsFragment( template.SeatEditor, {
		floor6Employees: floor6Employees,
		floor7Employees: floor7Employees,
		floor8Employees: floor8Employees,
		unassignedEmployees: unassignedEmployees
	} );

	$( '#editor-container' ).append( this.element );

	// declare vars
	this._metrics = null;
	this._handleOffsetX = 0;

	// query dom elements
	this._$floorPane = $( this.element ).find( '.floor-pane' );
	this._$waitlistPane = $( this.element ).find( '.waitlist-pane' );

	// scoped methods
	this._$onSplitStart = $.proxy( this.onSplitStart, this );
	this._$onSplitDrag = $.proxy( this.onSplitDrag, this );
	this._$onSplitEnd = $.proxy( this.onSplitEnd, this );
	this._$onClickWaitlist = $.proxy( this.onClickWaitlist, this );
	this._$onClickWaitlistIcon = $.proxy( this.onClickWaitlistIcon, this );
	this._$onEntityDragEnd = $.proxy( this.onEntityDragEnd, this );
	this._$resize = $.proxy( this.resize, this );

	// add events
	$( window ).on( 'resize', this._$resize ).resize();

	this._$splitHandle = $( this.element ).find( '.split-handle' );
	this._$splitHandle.on( 'mousedown', this._$onSplitStart );

	// create editor components
	this._waitlist = new Waitlist( this._$waitlistPane );

	var $floorViewport = $( this.element ).find( '.floor-viewport' );
	this._floorViewer = new FloorViewer( $floorViewport );

	this._entityDragger = new EntityDragger(
		$( this.element ).find( '.entity-dragger-viewport' ),
		$( this.element ),
		this._$onEntityDragEnd );
}


SeatEditor.prototype.resize = function() {

	var $editingRegion = $( this.element ).find( '.editing-region' );
	var editingRegionPosition = $editingRegion.offset();

	this._metrics = {
		editingRegionWidth: $editingRegion.width(),
		editingRegionHeight: $editingRegion.height(),
		editingRegionTop: editingRegionPosition.top,
		editingRegionLeft: editingRegionPosition.left
	};

	return this._metrics;
}


SeatEditor.prototype.onSplitStart = function( e ) {

	$( document.body ).on( 'mousemove', this._$onSplitDrag );
	$( document.body ).on( 'mouseup', this._$onSplitEnd );

	this._handleOffsetX = e.offsetX;

	$( 'html' ).attr( 'data-cursor', 'horizontal-dragging' );
}


SeatEditor.prototype.onSplitDrag = function( e ) {

	var dragFracX = ( e.clientX - this._metrics.editingRegionLeft ) / this._metrics.editingRegionWidth;
	var minFracX = .6;
	var maxFracX = 1;
	dragFracX = Math.min( Math.max( dragFracX, minFracX ), maxFracX );

	this._$floorPane.css( 'width', dragFracX * 100 + '%' );
	this._$waitlistPane.css( 'width', ( 1 - dragFracX ) * 100 + '%' );
}


SeatEditor.prototype.onSplitEnd = function( e ) {

	$( document.body ).off( 'mousemove', this._$onSplitDrag );
	$( document.body ).off( 'mouseup', this._$onSplitEnd );

	$( 'html' ).attr( 'data-cursor', '' );

	this._floorViewer.updateViewportMetrics();
}


SeatEditor.prototype.onEntityDragEnd = function( x, y, $entityIcon, entityModel ) {

	var entityPositionInFloor = this._floorViewer.getFloorPositionByViewerCoordinates( x, y );
	var entityX = $.isNumeric( x ) ? entityPositionInFloor.x : null;
	var entityY = $.isNumeric( y ) ? entityPositionInFloor.y : null;

	var shouldUnassign = ( !entityX || !entityY );

	entityModel.x = entityX;
	entityModel.y = entityY;
	entityModel.floorIndex = shouldUnassign ? null : this._floorViewer.currentFloorIndex;

	if ( shouldUnassign && entityModel.isAssigned ) {

		this._floorViewer.currentFloor.removeEntityIcon( entityModel );

	} else {

		$entityIcon.show();
	}

	if ( !shouldUnassign && !entityModel.isAssigned ) {

		this._floorViewer.currentFloor.addEntityIcon( entityModel );
	}
};


module.exports = {
	getInstance: function() {
		_instance = _instance || new SeatEditor( arguments );
		return _instance;
	}
};