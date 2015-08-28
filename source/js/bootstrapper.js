var sheetrock = require( 'sheetrock' );
var soy = require( 'libs/soyutils' );
var template = require( 'views/main.soy' );
var Employee = require( 'models/employee' );
var employeeCollection = require( 'models/employeecollection' );
var Editor = require( 'controllers/editor' );
var Search = require( 'controllers/search' );
var FileWriter = require( 'controllers/filewriter' );
var Utils = require( 'app/utils' );
var _instance;

var Bootstrapper = function() {

	var frag = soy.renderAsFragment( template.Home );
	$( document.body ).append( frag );

	var search = Search( 2 );
	var filewriter = FileWriter();
}

Bootstrapper.prototype.load = function( opt_ssUrl ) {

	this.loadSpreadSheets( opt_ssUrl );
}

Bootstrapper.prototype.loadSpreadSheets = function( opt_ssUrl ) {

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

			Editor();

			TweenMax.fromTo( $( '#main-container' ).get( 0 ), 1, {
				'opacity': 0
			}, {
				'delay': 1.5,
				'opacity': 1
			} );

			TweenMax.to( $( '#preloader' ).get( 0 ), .5, {
				'delay': 1,
				'opacity': 0,
				'display': 'none'
			} );
		}
	} );
}

module.exports = Utils.createSingletonNow( _instance, Bootstrapper );


//Google Sign-In Client ID
//309069805210-dplnn975m84n2mjg0moqemcf8i8m2u6d.apps.googleusercontent.com