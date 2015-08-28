var $ = require( 'jquery' );
var Utils = require( 'app/utils' );

var _instance;

var EmployeeCollection = function() {

	this._employees = [];
}


EmployeeCollection.prototype.add = function( employee ) {

	this._employees.push( employee );
}


EmployeeCollection.prototype.remove = function( employee ) {

	var i = this._employees.indexOf( employee );

	if ( i != -1 ) {
		this._employees.splice( i, 1 );
	}
}


EmployeeCollection.prototype.getAll = function() {

	return this._employees;
}


EmployeeCollection.prototype.getByName = function( fullName ) {

	var employee = $.grep( this._employees, function( employee ) {
		return ( employee.fullName === fullName );
	} )[ 0 ];

	return employee;
}


EmployeeCollection.prototype.getByFloor = function( floorId ) {

	var floor = floorId.toString();

	var employees = $.grep( this._employees, function( employee ) {
		return ( employee.floorIndex === floor );
	} );

	return employees;
}


EmployeeCollection.prototype.getUnassigned = function() {

	var employees = $.grep( this._employees, function( employee ) {
		return !employee.isAssigned;
	} );

	return employees;
}


EmployeeCollection.prototype.createJson = function() {

	var result = {};

	var employees = $.each( this._employees, function( i, employee ) {
		result[ employee.fullName ] = {
			'seat': employee.seat ? employee.seat.id : null,
			'x': employee.x,
			'y': employee.y
		}
	} );

	return result;
}


module.exports = Utils.createSingletonNow( _instance, EmployeeCollection, 'employeeCollection' );