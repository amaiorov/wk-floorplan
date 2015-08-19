var soy = require( 'libs/soyutils' );
var template = require( 'views/main.soy' );
var Waitlist = require( 'controllers/waitlist' );
var EntityDragger = require( 'controllers/entitydragger' );
var FloorViewer = require( 'controllers/floorviewer' );
var employeeCollection = require( 'models/employeecollection' );

var _instance;


var Editor = function() {

	var floor6Employees = employeeCollection.getByFloor( 6 );
	var floor7Employees = employeeCollection.getByFloor( 7 );
	var floor8Employees = employeeCollection.getByFloor( 8 );
	var unassignedEmployees = employeeCollection.getUnassigned();

	var element = soy.renderAsFragment( template.Editor, {
		floor6Employees: floor6Employees,
		floor7Employees: floor7Employees,
		floor8Employees: floor8Employees,
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
		this._floorViewer.updateIconSize();
	}
};


Editor.prototype.changeMode = function() {

	var isEditMode = this._$modeToggler.prop( 'checked' );

	if ( isEditMode ) {

		this._entityDragger.activate();
		this._waitlist.activate();

		$( '#toolbar .edit-buttons .btn' ).removeClass( 'disabled' );

	} else {

		this._entityDragger.deactivate();
		this._waitlist.deactivate();

		$( '#toolbar .edit-buttons .btn' ).addClass( 'disabled' );
	}
};


module.exports = {
	getInstance: function() {
		_instance = _instance || new Editor( arguments );
		return _instance;
	}
};