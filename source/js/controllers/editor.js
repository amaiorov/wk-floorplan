var Utils = require( 'app/utils' );
var pubSub = require( 'app/pubsub' );
var template = require( 'views/main.soy' );
var Waitlist = require( 'controllers/waitlist' );
var FloorPlanSelector = require( 'controllers/floorplanselector' );
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

	// create arrays for department buckets
	var departmentBucketList = Utils.arrayUnique( employeeCollection._departmentBucketList ).sort();
	var departmentBucketListCSS = Utils.arrayTransformDupe( departmentBucketList, function( el ) {
		return el.toLowerCase().split( ' ' ).join( '-' );
	} ).sort();

	var element = soy.renderAsFragment( template.Editor, {
		floor6Employees: floor6Employees,
		floor7Employees: floor7Employees,
		floor8Employees: floor8Employees,
		floor6Seats: floor6Seats,
		floor7Seats: floor7Seats,
		floor8Seats: floor8Seats,
		unassignedEmployees: unassignedEmployees,
		departmentBucketList: departmentBucketList,
		departmentBucketListCSS: departmentBucketListCSS
	} );

	this.$element = $( element );

	$( '#editor-container' ).append( this.$element );

	// declare vars
	this._metrics = {};

	// query dom elements
	this._$floorPane = this.$element.find( '.floor-pane' );
	this._$waitlistPane = this.$element.find( '.waitlist-pane' );

	// scoped methods
	this._$onSplitUpdated = $.proxy( this.onSplitUpdated, this );
	this._$onSplitEnded = $.proxy( this.onSplitEnded, this );
	this._$onClickWaitlist = $.proxy( this.onClickWaitlist, this );
	this._$onClickWaitlistIcon = $.proxy( this.onClickWaitlistIcon, this );
	this._$onEntityDragStart = $.proxy( this.onEntityDragStart, this );
	this._$onEntityDragMove = $.proxy( this.onEntityDragMove, this );
	this._$onEntityDragEnd = $.proxy( this.onEntityDragEnd, this );
	this._$onClickAddSeat = $.proxy( this.onClickAddSeat, this );
	this._$onClickRemoveSeat = $.proxy( this.onClickRemoveSeat, this );
	this._$onClickSheet = $.proxy( this.onClickSheet, this );
	this._$onSeatSelected = $.proxy( this.onSeatSelected, this );
	this._$onModeChanged = $.proxy( this.onModeChanged, this );
	this._$changeMode = $.proxy( this.changeMode, this );
	this._$reset = $.proxy( this.reset, this );
	this._$resize = $.proxy( this.resize, this );

	// create editor components
	this.floorPlanSelector = FloorPlanSelector();

	this._waitlist = new Waitlist( this._$waitlistPane, this._metrics );

	var $floorViewport = this.$element.find( '.floor-viewport' );
	this.floorViewer = new FloorViewer( $floorViewport );

	this._entityDragger = new EntityDragger(
		this.$element.find( '.entity-dragger-viewport' ),
		this.$element,
		this._$onEntityDragStart,
		this._$onEntityDragMove,
		this._$onEntityDragEnd );

	this._quadTree = null;

	// controls
	this._$addSeatButton = $( '#toolbar .btn-add-seat' );
	this._$removeSeatButton = $( '#toolbar .btn-remove-seat' );

	this._$sheetCheckbox = $( '#toolbar .checkbox-sheet' ).checkbox( {
		buttonStyle: 'btn-sheet',
		checkedClass: 'checked',
		uncheckedClass: 'unchecked',
		checked: false,
		enabled: true
	} ).change( this._$onClickSheet );

	this._$modeToggler = $( '#mode-toggler' ).bootstrapToggle();
	this._$modeToggler.change( this._$changeMode );

	// add events
	$( window ).on( 'resize', this._$resize ).resize();

	pubSub.editorSplitUpdated.add( this._$onSplitUpdated );
	pubSub.editorSplitEnded.add( this._$onSplitEnded );
	pubSub.modeChanged.add( this._$onModeChanged );
	pubSub.jsonLoaded.add( this._$reset );
	pubSub.fileCreated.add( this._$reset );

	//
	this._$changeMode();
	this._$onSeatSelected( null );
}


Editor.prototype.reset = function( opt_json ) {

	this.floorViewer.focusOnCenter( '6', 0 );

	var floors = this.floorViewer.floors;

	$.each( floors, function( key, floor ) {
		floor.reset();
	} );

	var json = opt_json;

	if ( json ) {

		$.each( floors, function( key, floor ) {
			floor.unlistenForChanges();
		} );

		setTimeout( function() {

			$.each( json[ 'seats' ], function( id, seat ) {
				FloorModel.registerSeat( id, seat[ 'x' ], seat[ 'y' ] );
			} );

			var floor = FloorModel.getByIndex( '6' );

			var entities = employeeCollection.getAll();

			$.each( entities, function( i, entity ) {
				var entityData = json[ 'entities' ][ entity.fullName ];
				entity.x = entityData[ 'x' ];
				entity.y = entityData[ 'y' ];
				entity.floorIndex = entityData[ 'floorIndex' ];

				var seatId = entityData[ 'seat' ];

				if ( seatId ) {
					var seat = FloorModel.getSeatById( seatId );
					entity.seat = seat;
					seat.entity = entity;
				}
			} );

			$.each( floors, function( key, floor ) {
				var entities = employeeCollection.getByFloor( floor.model.index );
				var seats = FloorModel.getByIndex( floor.model.index ).seats;
				floor.createPins( entities, seats );

				floor.listenForChanges();
			} );

		}, 0 );
	}

	Platform.performMicrotaskCheckpoint();
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


Editor.prototype.changeMode = function() {

	var isEditMode = this._$modeToggler.prop( 'checked' );

	pubSub.modeChanged.dispatch( isEditMode );
};


Editor.prototype.onModeChanged = function( isEditMode ) {

	if ( isEditMode ) {

		this._entityDragger.activate();
		this._waitlist.activate();

		this._$addSeatButton.on( 'click', this._$onClickAddSeat );
		this._$removeSeatButton.on( 'click', this._$onClickRemoveSeat );

		this._$addSeatButton.prop( 'disabled', false );
		this._$removeSeatButton.prop( 'disabled', true );
		this._$sheetCheckbox.checkbox( 'setEnabled', true );

		pubSub.seatSelected.add( this._$onSeatSelected );

	} else {

		this._entityDragger.deactivate();
		this._waitlist.deactivate();

		this._$addSeatButton.off( 'click', this._$onClickAddSeat );
		this._$removeSeatButton.off( 'click', this._$onClickRemoveSeat );

		this._$addSeatButton.prop( 'disabled', true );
		this._$removeSeatButton.prop( 'disabled', true );
		this._$sheetCheckbox.checkbox( 'setEnabled', false );

		pubSub.seatSelected.remove( this._$onSeatSelected );
	}

	this.$element.toggleClass( 'preview', !isEditMode );
}


Editor.prototype.onSplitUpdated = function( fraction ) {

	this._$floorPane.css( 'width', fraction * 100 + '%' );
	this._$waitlistPane.css( 'width', ( 1 - fraction ) * 100 + '%' );
}


Editor.prototype.onSplitEnded = function() {

	this.floorViewer.updateViewportMetrics();
}


Editor.prototype.onEntityDragStart = function( x, y, $entityPin, entityModel ) {

	if ( this._quadTree ) {
		this._quadTree.clear();
		this._quadTree = null;
	}

	if ( !$entityPin.hasClass( 'entity-pin' ) ) {
		return;
	}

	// calculate all seats' absolute position for collision detection
	var viewportMetrics = this.floorViewer.updateViewportMetrics();

	var tree = this._quadTree = new QuadTree( {
		x: 0,
		y: 0,
		width: viewportMetrics.width,
		height: viewportMetrics.height
	}, true, 10, 20 );

	var $seatPins = this.floorViewer.currentFloor.$element.find( '.seat-pin' );

	var inViewportPins = $.grep( $seatPins, function( pin ) {

		var pinOffset = $( pin ).offset();

		if ( pinOffset.left < viewportMetrics.x || pinOffset.left > viewportMetrics.x + viewportMetrics.width || pinOffset.top < viewportMetrics.y || pinOffset.top > viewportMetrics.y + viewportMetrics.height ) {

			return false;

		} else {

			var seatModel = FloorModel.getSeatById( pin.getAttribute( 'data-id' ) );

			var collisionPin = {
				x: pinOffset.left - viewportMetrics.x + SeatModel.RADIUS,
				y: pinOffset.top - viewportMetrics.y + SeatModel.RADIUS,
				el: pin,
				model: seatModel
			};

			tree.insert( collisionPin );

			return true;
		}
	} );
};


Editor.prototype.onEntityDragMove = function( x, y, $entityPin, entityModel ) {

	var isSeat = ( entityModel instanceof SeatModel );

	if ( isSeat ) {

		var allowInvalidPositions = true;
		var entityPositionInFloor = this.floorViewer.getFloorPositionByViewerCoordinates( x, y, allowInvalidPositions );
		var entityX = entityPositionInFloor.x;
		var entityY = entityPositionInFloor.y;

		entityModel.x = entityX;
		entityModel.y = entityY;
	}

	if ( this._quadTree ) {

		var seats = this._quadTree.retrieve( {
			x: x,
			y: y
		} );

		this._collidingSeat = $.grep( seats, function( seat ) {

			$( seat.el ).toggleClass( 'active', false );

			var dx = x - seat.x;
			var dy = y - seat.y;
			var drad = SeatModel.RADIUS + SeatModel.RADIUS;

			var isColliding = ( Math.pow( dx, 2 ) + Math.pow( dy, 2 ) ) < Math.pow( drad, 2 );

			if ( !isColliding && entityModel === seat.model.entity ) {
				entityModel.seat = null;
				seat.model.entity = null;
			}

			return isColliding;
		} )[ 0 ];

		if ( this._collidingSeat ) {
			$( this._collidingSeat.el ).toggleClass( 'active', true );
		}

		entityModel.seat = null;
	}

	Platform.performMicrotaskCheckpoint();
};


Editor.prototype.onEntityDragEnd = function( x, y, $entityPin, entityModel ) {

	var entityPositionInFloor = this.floorViewer.getFloorPositionByViewerCoordinates( x, y );
	var entityX = $.isNumeric( x ) ? entityPositionInFloor.x : null;
	var entityY = $.isNumeric( y ) ? entityPositionInFloor.y : null;

	var outOfViewport = ( !entityX || !entityY );
	var isSeat = ( entityModel instanceof SeatModel );
	var isEntity = ( entityModel instanceof EmployeeModel );

	if ( isSeat ) {

		entityModel.x = entityX;
		entityModel.y = entityY;

		if ( outOfViewport ) {

			this.floorViewer.currentFloor.removeSeatPin( entityModel );

			if ( entityModel.entity ) {
				this.floorViewer.currentFloor.removeEntityPin( entityModel.entity );
			}

		} else {

			$entityPin.show();
		}

	} else if ( isEntity ) {

		entityModel.x = entityX;
		entityModel.y = entityY;
		entityModel.floorIndex = outOfViewport ? null : this.floorViewer.currentFloorIndex;

		if ( outOfViewport && entityModel.isAssigned ) {

			this.floorViewer.currentFloor.removeEntityPin( entityModel );

		} else {

			$entityPin.show();
		}

		if ( !outOfViewport && !entityModel.isAssigned ) {

			this.floorViewer.currentFloor.addEntityPin( entityModel );
			this.floorViewer.updateIconSize();
		}

		if ( this._collidingSeat ) {

			var currentSeatEntity = this._collidingSeat.model.entity;

			if ( currentSeatEntity ) {
				this.floorViewer.currentFloor.removeEntityPin( currentSeatEntity );
			}

			entityModel.seat = this._collidingSeat.model;
		}
	}

	Platform.performMicrotaskCheckpoint();
};


Editor.prototype.onClickAddSeat = function( e ) {

	this.floorViewer.currentFloor.addSeatPin(
		this.floorViewer.getFloorPosition(), this.floorViewer.getFloorSize() );

	this.floorViewer.updateIconSize();
};


Editor.prototype.onClickRemoveSeat = function( e ) {

	var seatModel = FloorModel.getSeatById( this._selectedSeatId );

	this.floorViewer.currentFloor.removeSeatPin( seatModel );

	this.onSeatSelected( null );
};


Editor.prototype.onClickSheet = function( e ) {

	if ( e.target.checked ) {

		$( '#sheet-container' ).show();

	} else {

		$( '#sheet-container' ).hide();
	}
};


Editor.prototype.onSeatSelected = function( seatId ) {

	this._selectedSeatId = seatId;

	var shouldDisable = !Utils.isDefAndNotNull( seatId );
	this._$removeSeatButton.prop( 'disabled', shouldDisable );
};


module.exports = Utils.createSingleton( _instance, Editor, 'editor' );