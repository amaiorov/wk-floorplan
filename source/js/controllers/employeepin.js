var inherits = require( 'inherits' );
var Pin = require( 'controllers/pin' );
var employeeCollection = require( 'models/employeecollection' );


var EmployeePin = function( element, opt_model ) {

	var fullName = element.getAttribute( 'data-id' );
	var model = opt_model || employeeCollection.getByName( fullName );

	Pin.call( this, element, model );

}
inherits( EmployeePin, Pin );


EmployeePin.prototype.handleModelChange = function( key, value ) {

	Pin.prototype.handleModelChange.call( this, key, value );

	if ( key === 'isAssigned' ) {

		var isAssigned = value;

		if ( !isAssigned ) {
			this.dispose();
		}
	}
};


module.exports = EmployeePin;