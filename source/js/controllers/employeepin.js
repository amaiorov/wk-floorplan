var inherits = require( 'inherits' );
var Pin = require( 'controllers/pin' );
var employeeCollection = require( 'models/employeecollection' );


var EmployeePin = function( element, opt_model ) {

	var fullName = element.getAttribute( 'data-id' );
	var model = opt_model || employeeCollection.getByName( fullName );

	Pin.call( this, element, model );

}
inherits( EmployeePin, Pin );


EmployeePin.prototype.dispose = function() {

	if ( this.model ) {
		//console.log( 'Entity Pin "' + this.model.fullName + '" disposed.' );
	}

	Pin.prototype.dispose.call( this );
};


EmployeePin.prototype.handleModelChange = function( key, value ) {

	if ( key === 'isAssigned' ) {

		var isAssigned = value;

		if ( !isAssigned ) {
			this.dispose();
			return;
		}
	}

	Pin.prototype.handleModelChange.call( this, key, value );
};


module.exports = EmployeePin;