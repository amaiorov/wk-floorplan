var $ = require( 'jquery' );

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


EmployeeCollection.prototype.getByFloor = function( floorId ) {

	var floor = floorId.toString();

	var employees = $.grep( this._employees, function( employee ) {
		return ( employee.floor === floor );
	} );

	return employees;
}


EmployeeCollection.prototype.getUnseated = function() {

	var employees = $.grep( this._employees, function( employee ) {
		return !employee.floor;
	} );

	return employees;
}


module.exports = ( function() {
	_instance = _instance || new EmployeeCollection( arguments );
	return _instance;
} )();