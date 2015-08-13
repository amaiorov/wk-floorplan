var inherits = require( 'inherits' );
var EntityIcon = require( 'controllers/entityicon' );
var employeeCollection = require( 'models/employeecollection' );


var EmployeeIcon = function( element, id ) {

	var firstName = element.getAttribute( 'data-first' );
	var lastName = element.getAttribute( 'data-last' );
	var model = employeeCollection.getByName( firstName, lastName );

	EntityIcon.call( this, element, model );

}
inherits( EmployeeIcon, EntityIcon );


//Creature.prototype.die.call( this );

module.exports = EmployeeIcon;