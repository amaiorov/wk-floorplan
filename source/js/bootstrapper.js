var sheetrock = require( 'sheetrock' );
var soy = require( 'libs/soyutils' );
var template = require( 'views/main.soy' );
var Employee = require( 'models/employee' );
var employeeCollection = require( 'models/employeecollection' );
var SeatEditor = require( 'controllers/seateditor' );

var _instance;

var Bootstrapper = function() {

	var frag = soy.renderAsFragment( template.Home );
	$( document.body ).append( frag );
}

Bootstrapper.prototype.load = function( opt_ssUrl ) {

	this.loadSpreadSheets( opt_ssUrl );
}

Bootstrapper.prototype.loadSpreadSheets = function( opt_ssUrl ) {

	var ssUrl = opt_ssUrl || 'https://docs.google.com/spreadsheets/d/1gm6bI8Oyat9ClNKRwQVlBOzQ_YOV9BDCu0Z7l1BeAro/edit#gid=0';

	sheetrock( {
		url: ssUrl,
		target: $( '#chart' ).get( 0 ),
		callback: function( error, options, response ) {
			var rows = response[ 'rows' ];
			rows.shift();

			$.each( rows, function( i, row ) {
				var employee = new Employee( row.cells );
				employeeCollection.add( employee );
			} );

			var seatEditor = SeatEditor.getInstance();
		}
	} );
}

module.exports = ( function() {
	_instance = _instance || new Bootstrapper( arguments );
	return _instance;
} )();