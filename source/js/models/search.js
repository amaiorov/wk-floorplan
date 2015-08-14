var employeeCollection = require( 'models/employeecollection' );

var _instance;

var Search = function() {
	alert( 'search yo!' );
}


module.exports = ( function() {
	_instance = _instance || new Search( arguments );
	return _instance;
} )();