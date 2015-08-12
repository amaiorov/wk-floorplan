var inherits = require( 'inherits' );
var OccupantIcon = require( 'controllers/occupanticon' );
var employeeCollection = require( 'models/employeecollection' );


var EmployeeIcon = function( element, id ) {

	var firstName = element.getAttribute( 'data-first' );
	var lastName = element.getAttribute( 'data-last' );
	var model = employeeCollection.getByName( firstName, lastName );

	OccupantIcon.call( this, element, model );

}
inherits( EmployeeIcon, OccupantIcon );


//Creature.prototype.die.call( this );

module.exports = EmployeeIcon;