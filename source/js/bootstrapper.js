var sheetrock = require( 'sheetrock' );
var soy = require( 'libs/soyutils' );
var template = require( 'views/main.soy' );
var Floor = require( 'models/floor' );
var Employee = require( 'models/employee' );
var employeeCollection = require( 'models/employeecollection' );
var router = require( 'controllers/router' );
var Editor = require( 'controllers/editor' );
var Search = require( 'controllers/search' );
var FileHandler = require( 'controllers/filehandler' );
var pubSub = require( 'app/pubsub' );
var Utils = require( 'app/utils' );
var _instance;

var Bootstrapper = function() {

	var frag = soy.renderAsFragment( template.Main, {
		admin: window.admin
	} );

	$( document.body ).append( frag );

	var search = Search();
}


Bootstrapper.prototype.load = function( opt_ssUrl ) {

	this.loadSpreadSheets( opt_ssUrl, $.proxy( this.onSpreadSheetsLoad, this ) );
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


Bootstrapper.prototype.onSpreadSheetsLoad = function() {

	var action;
	var serviceData;

	pubSub.routed.addOnce( function( key, params ) {

		var fileHandler = FileHandler();

		switch ( key ) {
			case 'location':
				action = 'loadCustomJson';
				serviceData = {
					fileName: params.file ? ( decodeURI( params.file ) + '.json' ) : fileHandler.defaultFile
				};
				break;

			default:
				action = 'loadDefaultJson';
				break;
		}

		fileHandler.postToService( action, serviceData, $.proxy( this.onJsonLoad, this ) );

	}, this );
}


Bootstrapper.prototype.onJsonLoad = function( data ) {

	var content = data ? JSON.parse( data.content ) : null;
	console.log( data );

	pubSub.jsonLoaded.dispatch( content, data.filelist, data.file );

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