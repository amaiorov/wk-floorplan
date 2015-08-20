var inherits = require( 'inherits' );
var EntityIcon = require( 'controllers/entityicon' );
var employeeCollection = require( 'models/employeecollection' );


var EmployeeIcon = function( element, opt_model ) {

	var fullName = element.getAttribute( 'data-id' );
	var model = opt_model || employeeCollection.getByName( fullName );

	EntityIcon.call( this, element, model );

}
inherits( EmployeeIcon, EntityIcon );


module.exports = EmployeeIcon;