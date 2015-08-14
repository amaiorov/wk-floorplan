var Utils = require( 'app/utils' );
var TweenMax = require( 'libs/gsap/TweenMax' );
var Draggable = require( 'libs/gsap/utils/Draggable' );
var Floor = require( 'controllers/floor' );

var mousewheelHideDelay = null;
var zoom = 0;
var minWidth = 1200;
var maxWidth = minWidth * 4;
var aspectRatio = 1024 / 576;

var FloorViewer = function( _$element ) {

	this.$element = _$element;

	this._$floorContainer = this.$element.find( '.floor-container' );
	this._$floorButtons = this.$element.find( '.floor-buttons .btn' );
	this._$mousewheelScroller = this.$element.find( '.mousewheel-scroller' );

	this._$resize = $.proxy( this.resize, this );
	this._$hideMousewheelScroller = $.proxy( this.hideMousewheelScroller, this );

	this._zoomTweener = new TweenMax( {
		zoom: 0
	}, .5, {
		'paused': true,
		'ease': Strong.easeOut,
		'onUpdate': this.onZoomAnimate,
		'onUpdateScope': this
	} );

	this._draggable = new Draggable( this._$floorContainer.get( 0 ), {
		'type': 'x,y',
		'edgeResistance': 0.85,
		'throwResistance': 10000,
		'throwProps': true,
		'zIndexBoost': false,
		'onDragStart': this.onDragStart,
		'onDragStartScope': this
	} );

	this._floorWidth = this._$floorContainer.width();
	this._floorHeight = this._$floorContainer.height();
	this._floorZoomFractionX = null;
	this._floorZoomFractionY = null;
	this._viewportZoomX = null;
	this._viewportZoomY = null;

	this._editingRegionWidth = null;
	this._editingRegionHeight = null;
	this._elementOffset = null;
	this._windowScrollTop = null;
	this._windowScrollLeft = null;

	// Create and stores floors by index
	var floors = this._floors = {};
	$.each( this.$element.find( '.floor' ), function( i, el ) {
		var floor = new Floor( el );
		floors[ floor.getIndex() ] = floor;
	} );

	//
	this.init();
}


FloorViewer.prototype.init = function() {

	$onClickFloorButton = $.proxy( this.onClickFloorButton, this );
	this._$floorButtons.on( 'click', $onClickFloorButton );

	var $onMouseWheel = $.proxy( this.onMouseWheel, this );
	this.$element.on( 'mousewheel', $onMouseWheel );

	$( window ).on( 'resize', this._$resize ).resize();

	TweenMax.set( this._$floorContainer.get( 0 ), {
		'x': ( this._editingRegionWidth - this._floorWidth ) / 2,
		'y': ( this._editingRegionHeight - this._floorHeight ) / 2,
	} );

	this.updateBounds();
	this.setMousewheelSpeed( 4 );
	this.setZoomSlider( 0 );
	this.toggleFloor( this.$element.find( '.floor-buttons .active' ).attr( 'data-id' ) );

	this.hideMousewheelScroller();
}


FloorViewer.prototype.zoom = function( fraction ) {

	zoom = fraction;

	this._zoomTweener.play();

	this._zoomTweener.updateTo( {
		zoom: zoom
	}, true );
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


FloorViewer.prototype.getFloorPositionByViewerCoordinates = function( viewerCoordX, viewerCoordY ) {

	var floorX = this._$floorContainer.get( 0 )._gsTransform.x;
	var floorY = this._$floorContainer.get( 0 )._gsTransform.y;

	var percentX = ( viewerCoordX - floorX ) / this._floorWidth * 100 + '%';
	var percentY = ( viewerCoordY - floorY ) / this._floorHeight * 100 + '%';

	return {
		x: percentX,
		y: percentY
	}
};


FloorViewer.prototype.setZoomSlider = function( fraction ) {

	var scrollHeight = this._$mousewheelScroller.get( 0 ).scrollHeight;
	this._$mousewheelScroller.scrollTop( scrollHeight * ( 1 - fraction ) );
}


FloorViewer.prototype.setMousewheelSpeed = function( multiplier ) {

	this._$mousewheelScroller.find( '.inner' ).css( 'height', multiplier * 100 + '%' );
}


FloorViewer.prototype.toggleFloor = function( floorId ) {

	$.each( this._floors, function( id, floor ) {
		if ( floorId === id ) {
			floor.show();
		} else {
			floor.hide();
		}
	} );
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

	this.updateBounds();
}


FloorViewer.prototype.showMousewheelScroller = function( e ) {

	this._$mousewheelScroller.css( 'visibility', 'visible' );
}


FloorViewer.prototype.hideMousewheelScroller = function( e ) {

	this._$mousewheelScroller.css( 'visibility', 'hidden' );

	mousewheelHideDelay = null;

	this._elementOffset = null;
	this._windowScrollTop = null;
	this._windowScrollLeft = null;
}


FloorViewer.prototype.onZoomAnimate = function() {

	this._floorWidth = Math.round( Utils.lerp( minWidth, maxWidth, this._zoomTweener.target.zoom ) );
	this._floorHeight = Math.round( this._floorWidth / aspectRatio );

	var floorOffsetX = this._viewportZoomX - this._floorWidth * this._floorZoomFractionX;
	var floorOffsetY = this._viewportZoomY - this._floorHeight * this._floorZoomFractionY;

	TweenMax.set( this._$floorContainer.get( 0 ), {
		'x': floorOffsetX,
		'y': floorOffsetY,
		'width': this._floorWidth,
		'height': this._floorHeight
	} );

	this.updateBounds();
}


FloorViewer.prototype.onClickFloorButton = function( e ) {

	var floorId = e.currentTarget.getAttribute( 'data-id' );
	this.toggleFloor( floorId );
}


FloorViewer.prototype.onDragStart = function() {

	this._zoomTweener.pause();
}


FloorViewer.prototype.onMouseWheel = function( e ) {

	// calculate floor zoom properties
	if ( this._elementOffset === null ) {
		this._elementOffset = this.$element.offset();
	}

	if ( this._windowScrollTop === null ) {
		this._windowScrollTop = $( window ).scrollTop();
	}

	if ( this._windowScrollLeft === null ) {
		this._windowScrollLeft = $( window ).scrollLeft();
	}

	var floorX = this._$floorContainer.get( 0 )._gsTransform.x;
	var floorY = this._$floorContainer.get( 0 )._gsTransform.y;

	this._viewportZoomX = e.clientX - ( this._elementOffset.left - this._windowScrollLeft );
	this._viewportZoomY = e.clientY - ( this._elementOffset.top - this._windowScrollTop );

	this._floorZoomFractionX = ( this._viewportZoomX - floorX ) / this._floorWidth;
	this._floorZoomFractionY = ( this._viewportZoomY - floorY ) / this._floorHeight;

	// prevent document scroll
	var scroller = this._$mousewheelScroller.get( 0 );

	var scrollTop = scroller.scrollTop;
	var scrollHeight = scroller.scrollHeight - this._$mousewheelScroller.height();

	var delta = e.originalEvent.wheelDelta || -e.originalEvent.detail;

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