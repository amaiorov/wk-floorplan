var sheetrock = require( 'sheetrock' );
var soy = require( 'libs/soyutils' );
var template = require( 'views/main.soy' );
var Floor = require( 'models/floor' );
var Employee = require( 'models/employee' );
var employeeCollection = require( 'models/employeecollection' );
var Editor = require( 'controllers/editor' );
var Search = require( 'controllers/search' );
var FileHandler = require( 'controllers/filehandler' );
var Utils = require( 'app/utils' );
var _instance;

var Bootstrapper = function() {

	var frag = soy.renderAsFragment( template.Main );
	$( document.body ).append( frag );

	var search = Search();
}


Bootstrapper.prototype.load = function( opt_ssUrl ) {

	this.loadSpreadSheets( opt_ssUrl, $.proxy( this.loadDefaultJson, this ) );
}


Bootstrapper.prototype.loadSpreadSheets = function( opt_ssUrl, callback ) {

	var ssUrl = opt_ssUrl || 'https://docs.google.com/spreadsheets/d/1LhJO-TTiwQwrODfAHCzBa2WXUWNZKdsqS2_44cp-WBQ/edit#gid=0';
	//Jessi's: https://docs.google.com/spreadsheets/d/1gm6bI8Oyat9ClNKRwQVlBOzQ_YOV9BDCu0Z7l1BeAro/edit#gid=0';

	sheetrock( {
		url: ssUrl,
		target: $( '#sheet' ).get( 0 ),
		callback: function( error, options, response ) {
			var rows = response[ 'rows' ];
			rows.shift();

			$.each( rows, function( i, row ) {
				var employee = new Employee( row.cells );
				employeeCollection.add( employee );
			} );

			callback();
		}
	} );
}


Bootstrapper.prototype.loadDefaultJson = function() {

	var fileHandler = FileHandler();
	fileHandler.postToService( 'loadDefaultJson', null, $.proxy( this.onJsonLoad, this ) );
}


Bootstrapper.prototype.onJsonLoad = function( data ) {

	var json = data ? JSON.parse( data ) : null;
	console.log( json );

	// WIP: generate all seat models
	var floor6 = Floor.getByIndex( '6' );
	var floor7 = Floor.getByIndex( '7' );
	var floor8 = Floor.getByIndex( '8' );

	var entities = employeeCollection.getAll();

	if ( json ) {

		$.each( json[ 'seats' ], function( id, seat ) {
			Floor.registerSeat( id, seat[ 'x' ], seat[ 'y' ] );
		} );

		$.each( entities, function( i, entity ) {
			var entityData = json[ 'entities' ][ entity.fullName ];
			entity.x = entityData[ 'x' ];
			entity.y = entityData[ 'y' ];
			entity.floorIndex = entityData[ 'floorIndex' ];

			var seatId = entityData[ 'seat' ];

			if ( seatId ) {
				var seat = Floor.getSeatById( seatId );
				entity.seat = seat;
			}
		} );

	} else {

		$.each( Floor.floors, function( i, floor ) {
			floor.generateSeats( 150 );
		} );

		var allVacantSeats = {};

		$.each( entities, function( i, entity ) {
			var floorIndex = entity.floorIndex;
			var floor = Floor.getByIndex( floorIndex );
			var vacantSeats = allVacantSeats[ floorIndex ] || floor.getVacantSeats();
			allVacantSeats[ floorIndex ] = vacantSeats;

			var seat = vacantSeats.shift();
			entity.seat = seat;
		} );
	}

	Platform.performMicrotaskCheckpoint();

	//
	TweenMax.fromTo( $( '#main-container' ).get( 0 ), 1, {
		'opacity': 0
	}, {
		'delay': 1.5,
		'opacity': 1,
		'onStart': Editor
	} );

	TweenMax.to( $( '#preloader' ).get( 0 ), .5, {
		'delay': 1,
		'opacity': 0,
		'display': 'none'
	} );
}


module.exports = Utils.createSingletonNow( _instance, Bootstrapper );