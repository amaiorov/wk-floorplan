var employeeCollection = require( 'models/employeecollection' );

var _instance;

var Search = function() {
	// alert( 'search yo!' );
	console.log( employeeCollection );
}



module.exports = ( function() {
	_instance = _instance || new Search( arguments );
	return _instance;
} )();