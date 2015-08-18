var soy = require( 'libs/soyutils' );
var template = require( 'views/main.soy' );
var FloorModel = require( 'models/floor' );
var EmployeeIcon = require( 'controllers/employeeicon' );
var Seat = require( 'models/seat' );


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
	var entities = this._entities = [];
	var vacantSeats = FloorModel.getVacantSeats( this.model.index );

	$.each( this.$element.find( '.entity-icon' ), $.proxy( function( i, el ) {

		var entity = new EmployeeIcon( el );
		entities.push( entity );

		var seat = vacantSeats.shift();
		entity.model.seat = seat;

	}, this ) );
}


Floor.prototype.getIndex = function() {

	return this.model.index;
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
			var tileUrl = 'images/floorplan/' + floorIndex + '/' + res + '/' + tileIndex + '.jpg';

			$tile.css( 'background-image', 'url(' + tileUrl + ')' );

		} else {

			$tile.css( 'background-image', 'none' );
		}
	} );
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