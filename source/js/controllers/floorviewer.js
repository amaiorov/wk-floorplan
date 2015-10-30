var Utils = require( 'app/utils' );
var pubSub = require( 'app/pubsub' );
var TweenMax = require( 'libs/gsap/TweenMax' );
var Draggable = require( 'libs/gsap/utils/Draggable' );
var Floor = require( 'controllers/floor' );
var FileHandler = require( 'controllers/filehandler' );

var mousewheelHideDelay = null;
var zoom = 0;
var minWidth = 1200;
var maxWidth = 8000;

var FloorViewer = function( _$element ) {

	this.$element = _$element;

	this._$floorContainer = this.$element.find( '.floor-container' );
	this._$floorButtons = this.$element.find( '.floor-buttons .btn' );
	this._$urlGenerator = this.$element.find( '.url-generator' );
	this._$legend = this.$element.find( '.legend-container' );
	this._$mousewheelScroller = this.$element.find( '.mousewheel-scroller' );

	this._$resize = $.proxy( this.resize, this );
	this._$hideMousewheelScroller = $.proxy( this.hideMousewheelScroller, this );

	this._zoomTweener = new TweenMax( {
		zoom: 0
	}, .5, {
		'paused': true,
		'ease': Strong.easeOut,
		'onUpdate': this.onZoomUpdate,
		'onUpdateScope': this,
		'onComplete': this.onZoomComplete,
		'onCompleteScope': this
	} );

	this._draggable = new Draggable( this._$floorContainer.get( 0 ), {
		'type': 'x,y',
		'edgeResistance': 0.85,
		'throwResistance': 10000,
		'throwProps': true,
		'zIndexBoost': false,
		'onDragStart': this.onDragStart,
		'onDragStartScope': this,
		'onDrag': this.onDrag,
		'onDragScope': this,
		'onThrowComplete': this.onThrowComplete,
		'onThrowCompleteScope': this
	} );

	this.currentFloorIndex = null;
	this.currentFloor = null;

	this._floorWidth = this._$floorContainer.width();
	this._floorHeight = this._$floorContainer.height();
	this._floorZoomFractionX = null;
	this._floorZoomFractionY = null;
	this._viewportZoomX = null;
	this._viewportZoomY = null;

	this._editingRegionWidth = null;
	this._editingRegionHeight = null;

	this._viewportMetrics = this.updateViewportMetrics();

	// Create and stores floors by index
	var floors = this.floors = {};
	var viewportMetrics = this._viewportMetrics;
	$.each( this.$element.find( '.floor' ), function( i, el ) {
		var floor = new Floor( el, viewportMetrics );
		floors[ floor.getIndex() ] = floor;
	} );

	//
	this.init();
}


FloorViewer.prototype.init = function() {

	$onClickFloorButton = $.proxy( this.onClickFloorButton, this );
	this._$floorButtons.on( 'click', $onClickFloorButton );

	$onClickUrlButton = $.proxy( this.onClickUrlButton, this );
	this._$urlGenerator.find( 'button' ).on( 'click', $onClickUrlButton );

	$onClickLegendToggle = $.proxy( this.onClickLegendToggle, this );
	this._$legend.find( '.toggle' ).on( 'click', $onClickLegendToggle );

	var $onMouseWheel = $.proxy( this.onMouseWheel, this );
	this.$element.on( 'mousewheel wheel', $onMouseWheel );

	var $onDoubleClick = $.proxy( this.onDoubleClick, this );
	this.$element.on( 'dblclick', $onDoubleClick );

	$( window ).on( 'resize', this._$resize ).resize();

	var $onSearchComplete = $.proxy( this.onSearchComplete, this );
	pubSub.searchCompleted.add( $onSearchComplete );

	TweenMax.set( this._$floorContainer.get( 0 ), {
		'x': ( this._editingRegionWidth - this._floorWidth ) / 2,
		'y': ( this._editingRegionHeight - this._floorHeight ) / 2,
	} );

	this.updateBounds();
	this.setMousewheelSpeed( 5 );
	this.setZoomSlider( 0 );

	//var floorIndex = this.$element.find( '.floor-buttons .active' ).attr( 'data-id' );
	//this.focusOnCenter( floorIndex, 0 );

	this.hideMousewheelScroller();
}


FloorViewer.prototype.getFloorCenterInView = function() {

	var floorPosition = this.getFloorPosition();

	var centerX = this._viewportMetrics.width / 2 - floorPosition.x;
	var centerY = this._viewportMetrics.height / 2 - floorPosition.y;

	return {
		x: centerX,
		y: centerY
	}
}


FloorViewer.prototype.getFloorPosition = function() {

	return {
		x: this._$floorContainer.get( 0 )._gsTransform.x,
		y: this._$floorContainer.get( 0 )._gsTransform.y
	}
}


FloorViewer.prototype.getFloorSize = function() {

	return {
		width: this._floorWidth,
		height: this._floorHeight
	}
}


FloorViewer.prototype.locateFromRoute = function( params ) {

	// pause current zooming animation
	this._zoomTweener.pause();

	// apply changes
	if ( params.floor ) {

		this.toggleFloor( params.floor.toString() );
	}

	if ( params.zoom ) {

		zoom = this._zoomTweener.target.zoom = Utils.clamp( params.zoom, 0, 1 );

		this._floorWidth = Math.round( Utils.lerp( minWidth, maxWidth, zoom ) );
		this._floorHeight = Math.round( this._floorWidth / Floor.aspectRatio );

		TweenMax.set( this._$floorContainer.get( 0 ), {
			'width': this._floorWidth,
			'height': this._floorHeight
		} );

		this.updateBounds();

		this.currentFloor.updateTiles( zoom );

		$.each( this.floors, function( i, floor ) {
			floor.updatePinSize( zoom );
		} );
	}

	if ( params.x && params.y ) {

		this.moveTo( params.x, params.y );
	}
}


FloorViewer.prototype.moveTo = function( x, y ) {

	var floorXAfterCentered = ( this._viewportMetrics.width - x * 2 ) / 2;
	var floorYAfterCentered = ( this._viewportMetrics.height - y * 2 ) / 2;

	TweenMax.set( this._$floorContainer.get( 0 ), {
		'x': floorXAfterCentered,
		'y': floorYAfterCentered
	} );

	this._draggable.update( true );

	this.currentFloor.updateTiles( zoom );
}


FloorViewer.prototype.focusOnClickedPosition = function( e, opt_zoom ) {

	this.updatePropsBeforeMouseZoom( e );

	if ( opt_zoom ) {
		this.zoom( opt_zoom );
	}

	this.currentFloor.updateTiles( zoom );
}


FloorViewer.prototype.focusOnCenter = function( opt_floorIndex, opt_zoom ) {

	if ( opt_floorIndex ) {
		this.toggleFloor( opt_floorIndex );
	}

	var floorSize = this.getFloorSize();
	this.moveTo( floorSize.width / 2, floorSize.height / 2 );

	if ( $.isNumeric( opt_zoom ) ) {

		var elementOffset = this.$element.offset();
		this._viewportZoomX = this._viewportMetrics.x + this._viewportMetrics.width / 2 - elementOffset.left;
		this._viewportZoomY = this._viewportMetrics.y + this._viewportMetrics.height / 2 - elementOffset.top;

		var floorPosition = this.getFloorPosition();
		var floorX = floorPosition.x;
		var floorY = floorPosition.y;

		this._floorZoomFractionX = ( this._viewportZoomX - floorX ) / this._floorWidth;
		this._floorZoomFractionY = ( this._viewportZoomY - floorY ) / this._floorHeight;

		this.zoom( opt_zoom );
	}

	this.currentFloor.updateTiles( zoom );
}


FloorViewer.prototype.focusOnPin = function( entityModel, opt_zoom ) {

	this.toggleFloor( entityModel.floorIndex );

	var pin = this.currentFloor.getEntityPin( entityModel.fullName );
	var pinPosition = pin.$element.position();

	this.moveTo( pinPosition.left, pinPosition.top );

	if ( opt_zoom ) {

		var pinOffset = pin.$element.offset();
		var pinHalfWidth = pin.$element.width() / 2;
		var pinHalfHeight = pin.$element.height() / 2;
		var elementOffset = this.$element.offset();

		this._viewportZoomX = pinOffset.left + pinHalfWidth - elementOffset.left;
		this._viewportZoomY = pinOffset.top + pinHalfHeight - elementOffset.top;

		var floorPosition = this.getFloorPosition();
		var floorX = floorPosition.x;
		var floorY = floorPosition.y;

		this._floorZoomFractionX = ( this._viewportZoomX - floorX ) / this._floorWidth;
		this._floorZoomFractionY = ( this._viewportZoomY - floorY ) / this._floorHeight;

		this.zoom( opt_zoom );
	}

	this.currentFloor.highlightEntityPin( pin.$element );
	this.currentFloor.updateTiles( zoom );
}


FloorViewer.prototype.zoom = function( fraction ) {

	zoom = fraction;

	this._zoomTweener.play();

	this._zoomTweener.updateTo( {
		zoom: zoom
	}, true );

	$.each( this.floors, function( i, floor ) {
		floor.updatePinSize( zoom );
	} );
}


FloorViewer.prototype.updateBounds = function() {

	var regionWidth = this._editingRegionWidth;
	var regionHeight = this._editingRegionHeight;

	var marginRatio = .4;
	var movableX = Math.max( 0, this._floorWidth - regionWidth ) + marginRatio * regionWidth;
	var movableY = Math.max( 0, this._floorHeight - regionHeight ) + marginRatio * regionHeight;

	var bounds = {
		'minX': -movableX,
		'minY': -movableY,
		'maxX': regionWidth + movableX - this._floorWidth,
		'maxY': regionHeight + movableY - this._floorHeight
	};

	this._draggable.applyBounds( bounds );
}


FloorViewer.prototype.updateViewportMetrics = function() {

	this._viewportMetrics = this._viewportMetrics || {};

	var offset = this.$element.offset();
	this._viewportMetrics.x = offset.left;
	this._viewportMetrics.y = offset.top;
	this._viewportMetrics.width = this.$element.width();
	this._viewportMetrics.height = this.$element.height();

	return this._viewportMetrics;
}


FloorViewer.prototype.updatePropsBeforeMouseZoom = function( e ) {

	var elementOffset = this.$element.offset();
	var windowScrollTop = $( window ).scrollTop();
	var windowScrollLeft = $( window ).scrollLeft();

	var floorPosition = this.getFloorPosition();
	var floorX = floorPosition.x;
	var floorY = floorPosition.y;

	this._viewportZoomX = e.originalEvent.clientX - ( elementOffset.left - windowScrollLeft );
	this._viewportZoomY = e.originalEvent.clientY - ( elementOffset.top - windowScrollTop );

	this._floorZoomFractionX = ( this._viewportZoomX - floorX ) / this._floorWidth;
	this._floorZoomFractionY = ( this._viewportZoomY - floorY ) / this._floorHeight;
}


FloorViewer.prototype.getFloorPositionByViewerCoordinates = function( viewerCoordX, viewerCoordY, allowInvalidPositions ) {

	var floorPosition = this.getFloorPosition();
	var floorX = floorPosition.x;
	var floorY = floorPosition.y;

	var fractionX = ( viewerCoordX - floorX ) / this._floorWidth;
	var fractionY = ( viewerCoordY - floorY ) / this._floorHeight;

	if ( !allowInvalidPositions && ( fractionX < 0 || fractionX > 1 || fractionY < 0 || fractionY > 1 ) ) {
		return {
			x: null,
			y: null
		}
	}

	return {
		x: fractionX * 100 + '%',
		y: fractionY * 100 + '%'
	}
}


FloorViewer.prototype.setZoomSlider = function( fraction ) {

	var scrollHeight = this._$mousewheelScroller.get( 0 ).scrollHeight;
	var scrollTop = scrollHeight * ( 1 - fraction ) - this._$mousewheelScroller.height();

	this._$mousewheelScroller.scrollTop( scrollTop );
}


FloorViewer.prototype.setMousewheelSpeed = function( multiplier ) {

	this._$mousewheelScroller.find( '.inner' ).css( 'height', multiplier * 100 + '%' );
}


FloorViewer.prototype.toggleFloor = function( floorId ) {

	var self = this;
	var zoom = this._zoomTweener.target.zoom;
	var $floorButtons = this._$floorButtons;

	$.each( this.floors, function( id, floor ) {

		if ( floorId === id ) {

			floor.show();
			floor.updateTiles( zoom );

			self.currentFloor = floor;
			self.currentFloorIndex = floorId;

		} else {

			floor.hide();
		}
	} );

	$floorButtons.removeClass( 'active' );
	$floorButtons.filter( '[data-id="' + floorId + '"]' ).addClass( 'active' );
}


FloorViewer.prototype.generateURL = function() {

	var fileHandler = FileHandler();
	var floorCenter = this.getFloorCenterInView();

	var params = {
		file: fileHandler.getEncodedFilename(),
		floor: this.currentFloorIndex,
		zoom: zoom.toFixed( 2 ),
		x: floorCenter.x.toFixed( 2 ),
		y: floorCenter.y.toFixed( 2 )
	};

	return 'http://' + window.location.hostname + '/#/location?file=' + params.file + '&floor=' + params.floor + '&zoom=' + params.zoom + '&x=' + params.x + '&y=' + params.y;
}


FloorViewer.prototype.dispose = function() {

	this._$floorButtons.off( 'click' );
	this.$element.off( 'mousewheel' );

	window.clearTimeout( mousewheelHideDelay );
}


FloorViewer.prototype.resize = function() {

	var $editingRegion = $( '.editing-region' );
	this._editingRegionWidth = $editingRegion.width();
	this._editingRegionHeight = $editingRegion.height();

	this.updateViewportMetrics();
	this.updateBounds();

	if ( this.currentFloor ) {
		this.currentFloor.updateTiles( zoom );
	}
}


FloorViewer.prototype.showMousewheelScroller = function( e ) {

	this._$mousewheelScroller.css( 'visibility', 'visible' );
}


FloorViewer.prototype.hideMousewheelScroller = function( e ) {

	this._$mousewheelScroller.css( 'visibility', 'hidden' );

	mousewheelHideDelay = null;
}


FloorViewer.prototype.onZoomUpdate = function() {

	this._floorWidth = Math.round( Utils.lerp( minWidth, maxWidth, this._zoomTweener.target.zoom ) );
	this._floorHeight = Math.round( this._floorWidth / Floor.aspectRatio );

	var floorOffsetX = Math.round( this._viewportZoomX - this._floorWidth * this._floorZoomFractionX );
	var floorOffsetY = Math.round( this._viewportZoomY - this._floorHeight * this._floorZoomFractionY );

	TweenMax.set( this._$floorContainer.get( 0 ), {
		'x': floorOffsetX,
		'y': floorOffsetY,
		'width': this._floorWidth,
		'height': this._floorHeight
	} );

	this.updateBounds();
}


FloorViewer.prototype.onZoomComplete = function() {

	this.currentFloor.updateTiles( zoom );
}


FloorViewer.prototype.onSearchComplete = function( entityModel ) {

	this.focusOnPin( entityModel );
}


FloorViewer.prototype.onClickFloorButton = function( e ) {

	var floorId = e.currentTarget.getAttribute( 'data-id' );
	this.toggleFloor( floorId );
}


FloorViewer.prototype.onClickUrlButton = function( e ) {

	$( e.currentTarget ).toggleClass( 'active' );
	this._$urlGenerator.toggleClass( 'show-url' );

	if ( this._$urlGenerator.hasClass( 'show-url' ) ) {
		var url = this.generateURL();
		this._$urlGenerator.find( 'input' ).val( url ).select();
	}
}


FloorViewer.prototype.onClickLegendToggle = function( e ) {

	this._$legend.toggleClass( 'show-legend' );
}


FloorViewer.prototype.onDragStart = function() {

	this._zoomTweener.pause();
}


FloorViewer.prototype.onDrag = function() {

	this.currentFloor.updateTiles( zoom );
}


FloorViewer.prototype.onThrowComplete = function() {

	this.currentFloor.updateTiles( zoom );
}


FloorViewer.prototype.onDoubleClick = function( e ) {

	this.focusOnClickedPosition( e, 1 );
}


FloorViewer.prototype.onMouseWheel = function( e ) {

	this.updatePropsBeforeMouseZoom( e );

	// prevent document scroll
	var scroller = this._$mousewheelScroller.get( 0 );

	var scrollTop = scroller.scrollTop;
	var scrollHeight = scroller.scrollHeight - this._$mousewheelScroller.height();

	var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail || -e.originalEvent.deltaY;

	var hitTop = ( scrollTop === 0 && delta > 0 );
	var hitBottom = ( scrollHeight - scrollTop === 0 && delta < 0 );
	var scrollOnElement = ( ( e.currentTarget === e.target ) || $.contains( e.currentTarget, e.target ) );

	if ( scrollOnElement && ( hitTop || hitBottom || !mousewheelHideDelay ) ) {
		e.preventDefault();
		e.stopPropagation();
	}

	// toggle mousewheel scroller
	this.showMousewheelScroller();

	window.clearTimeout( mousewheelHideDelay );
	mousewheelHideDelay = window.setTimeout( this._$hideMousewheelScroller, 200 );

	// track scroll ratio
	var scrollFraction = 1 - scrollTop / scrollHeight;

	// update zoom
	if ( ( delta > 0 && scrollFraction >= zoom ) || ( delta < 0 && scrollFraction <= zoom ) ) {
		this.zoom( scrollFraction );
	}
}


module.exports = FloorViewer;