var Utils = require( 'app/utils' );
var pubSub = require( 'app/pubsub' );
var soy = require( 'libs/soyutils' );
var template = require( 'views/main.soy' );
var FloorModel = require( 'models/floor' );
var employeeCollection = require( 'models/employeecollection' );
var EmployeePin = require( 'controllers/employeepin' );
var SeatPin = require( 'controllers/seatpin' );
var ObjectObserver = require( 'libs/observe' ).ObjectObserver;


var Floor = function( element, viewportMetrics ) {

	this._viewportMetrics = viewportMetrics;

	// assign view element
	this.$element = $( element );
	this._$inner = this.$element.find( '.inner' );
	this._$tiles = this.$element.find( '.tiles' );

	// create model
	var floorIndex = this.$element.attr( 'data-id' );
	this.model = FloorModel.getByIndex( floorIndex );

	// create entities
	var seats = this._seats = {};
	var entities = this._entities = {};

	$.each( this.$element.find( '.seat-pin' ), $.proxy( function( i, el ) {

		var seatId = el.getAttribute( 'data-id' );
		var seat = new SeatPin( el, FloorModel.getSeatById( seatId ) );
		seats[ seatId ] = seat;

	}, this ) );

	$.each( this.$element.find( '.entity-pin' ), $.proxy( function( i, el ) {

		var entityId = el.getAttribute( 'data-id' );
		var entity = new EmployeePin( el );
		entities[ entityId ] = entity;

	}, this ) );

	// listen for mouse events on pins
	this.$element.on( 'click', '.entity-pin', $.proxy( this.onClickEntityPin, this ) );
	this.$element.on( 'click', '.seat-pin', $.proxy( this.onClickSeatPin, this ) );

	// listen for seat models change
	this._$onObserved = $.proxy( this.onObserved, this );
	this._observer = new ObjectObserver( this.model.seats );
	this._observer.open( this._$onObserved );
}


Floor.prototype.getIndex = function() {

	return this.model.index;
};


Floor.prototype.getEntityPin = function( id ) {

	return this._entities[ id ];
};


Floor.prototype.show = function() {

	this.$element.show();
};


Floor.prototype.hide = function() {

	this.$element.hide();
	this.highlightEntityPin( null );
	this.highlightSeatPin( null );
};


Floor.prototype.addEntityPin = function( model ) {

	var icon = soy.renderAsFragment( template.EmployeePin, {
		employee: model,
		showInfo: true
	} );

	$( icon ).css( {
		'left': model.x,
		'top': model.y
	} );

	this._$inner.append( icon );

	var entity = new EmployeePin( icon, model );
	this._entities[ model.fullName ] = entity;
};


Floor.prototype.removeEntityPin = function( model ) {

	model.seat = null;
	model.x = null;
	model.y = null;
	model.floorIndex = null;

	var entity = this._entities[ model.fullName ];
	delete this._entities[ model.fullName ];
};


Floor.prototype.addSeatPin = function( floorPosition, floorSize ) {

	var x = this._viewportMetrics.width / 2 - floorPosition.x;
	var y = this._viewportMetrics.height / 2 - floorPosition.y;

	x += Utils.uniformRandom( -100, 100 );
	y += Utils.uniformRandom( -100, 100 );

	x = Utils.clamp( x, 0, floorSize.width );
	y = Utils.clamp( y, 0, floorSize.height );

	var percX = x / floorSize.width * 100 + '%';
	var percY = y / floorSize.height * 100 + '%';

	this.model.addSeat( percX, percY );

	Platform.performMicrotaskCheckpoint();
};


Floor.prototype.removeSeatPin = function( model ) {

	this.model.removeSeat( model );

	Platform.performMicrotaskCheckpoint();
};


Floor.prototype.highlightEntityPin = function( pinEl ) {

	var $pinEl = $( pinEl );
	var shouldActivate = !$pinEl.hasClass( 'active' );

	this.$element.find( '.entity-pin' ).removeClass( 'active' );

	if ( shouldActivate ) {
		$pinEl.addClass( 'active' );
	}

	// highlight the entity's seat pin if seated
	if ( pinEl ) {

		var entityModel = employeeCollection.getByName( $pinEl.attr( 'data-id' ) );

		if ( entityModel.seat ) {

			var seatId = entityModel.seat.id;
			this.highlightSeatPin( this._seats[ seatId ].$element.get( 0 ) );
		}
	}
};


Floor.prototype.highlightSeatPin = function( pinEl ) {

	var $pinEl = $( pinEl );
	var shouldActivate = !$pinEl.hasClass( 'active' );

	this.$element.find( '.seat-pin' ).removeClass( 'active' );

	if ( shouldActivate ) {
		$pinEl.addClass( 'active' );

		pubSub.seatSelected.dispatch( $pinEl.attr( 'data-id' ) );

	} else {

		pubSub.seatSelected.dispatch( null );
	}
};


Floor.prototype.updateTiles = function( zoom ) {

	var res;
	var floorIndex = this.model.index;

	if ( zoom < 0.2 ) {
		res = 'low';
	} else if ( zoom < 0.6 ) {
		res = 'medium';
	} else {
		res = 'high';
	}

	// set res as data-attribute for caching tile elements as the current tile structure
	var prevDataRes = this._$tiles.attr( 'data-res' );
	var settings = Floor.tileSettings[ floorIndex ][ res ];

	if ( prevDataRes !== res ) {

		var _cols = settings.cols;
		var _rows = settings.rows;
		var _width = settings.width;
		var _height = settings.height;
		var _tileSize = ( Floor.tileSize / _width ) * 100 + '%';

		var perWidth, perHeight;
		var aspect = _width / _height;

		if ( aspect > Floor.aspectRatio ) {

			perWidth = 100;

		} else {

			perWidth = 100 / ( Floor.aspectRatio / aspect );
		}

		perHeight = perWidth / aspect;

		var tilesFrag = soy.renderAsFragment( template.Tiles, {
			cols: _cols,
			rows: _rows,
			tileSize: _tileSize
		} );

		this._$tiles.attr( 'data-res', res ).empty().css( {
			'width': Math.round( perWidth ) + '%',
			'padding-bottom': Math.round( perHeight ) + '%'
		} ).append( tilesFrag );
	}

	// load and display visible tiles
	var tiles = this._$tiles.find( '.tile' );
	var tileSize = $( tiles[ 0 ] ).width();
	var vx1 = this._viewportMetrics.x;
	var vy1 = this._viewportMetrics.y;
	var vx2 = vx1 + this._viewportMetrics.width;
	var vy2 = vy1 + this._viewportMetrics.height;

	$.each( tiles, function( i, tileEl ) {
		var $tile = $( tileEl );
		var tileOffset = $tile.offset();
		var x1 = tileOffset.left;
		var y1 = tileOffset.top;
		var x2 = x1 + tileSize;
		var y2 = y1 + tileSize;

		if ( x1 <= vx2 && vx1 <= x2 && y1 <= vy2 && vy1 <= y2 ) {

			var tx = parseInt( $tile.attr( 'data-x' ) );
			var ty = parseInt( $tile.attr( 'data-y' ) );
			var tileIndex = ty * settings.cols + tx;
			var lowTileUrl = 'images/floorplan/' + floorIndex + '/low/' + tileIndex + '.jpg';
			var tileUrl = 'images/floorplan/' + floorIndex + '/' + res + '/' + tileIndex + '.jpg';

			if ( !$tile.data( 'hasImage' ) ) {
				var $imageDiv = $( '<div>' );
				$tile.append( $imageDiv );

				var $img = $( '<img>' ).prop( 'src', tileUrl ).one( 'load', function() {
					$imageDiv.css( 'background-image', 'url(' + tileUrl + ')' ).addClass( 'loaded' );
				} );

				$tile.data( 'hasImage', true );
			}

		} else {

			if ( $tile.data( 'hasImage' ) ) {
				$tile.empty();
				$tile.data( 'hasImage', false );
			}
		}
	} );
};


Floor.prototype.onObserved = function( added, removed, changed, getOldValueFn ) {

	for ( var key in added ) {

		var seatModel = added[ key ];

		var el = soy.renderAsFragment( template.SeatPin, {
			seat: seatModel
		} );

		this._$inner.append( el );

		var seat = new SeatPin( el, seatModel );
		this._seats[ key ] = seat;

		this.highlightSeatPin( el );

		console.log( 'Seat "' + key + '" added. Current seats total is: ' + this.model.getSeatsTotal() );
	}

	for ( var key in removed ) {

		var seat = this._seats[ key ];
		seat.dispose();

		delete this._seats[ key ];

		console.log( 'Seat "' + key + '" removed. Current seats total is: ' + this.model.getSeatsTotal() );
	}

	pubSub.edited.dispatch();
};


Floor.prototype.onClickEntityPin = function( e ) {

	this.highlightEntityPin( e.currentTarget );
};


Floor.prototype.onClickSeatPin = function( e ) {

	this.highlightSeatPin( e.currentTarget );
	this.highlightEntityPin( null );
};


Floor.tileSize = 512;


Floor.aspectRatio = 2;


Floor.tileSettings = {
	'6': {
		'low': {
			cols: 4,
			rows: 2,
			width: 1607,
			height: 750
		},
		'medium': {
			cols: 10,
			rows: 5,
			width: 4820,
			height: 2251
		},
		'high': {
			cols: 16,
			rows: 8,
			width: 8034,
			height: 3752
		}
	},
	'7': {
		'low': {
			cols: 4,
			rows: 2,
			width: 1607,
			height: 750
		},
		'medium': {
			cols: 10,
			rows: 5,
			width: 4820,
			height: 2251
		},
		'high': {
			cols: 16,
			rows: 8,
			width: 8034,
			height: 3752
		}
	},
	'8': {
		'low': {
			cols: 2,
			rows: 2,
			width: 920,
			height: 752
		},
		'medium': {
			cols: 6,
			rows: 5,
			width: 2761,
			height: 2255
		},
		'high': {
			cols: 9,
			rows: 8,
			width: 4601,
			height: 3759
		}
	}
}


module.exports = Floor;