var employeeCollection = require( 'models/employeecollection' );
var Utils = require( 'app/utils' );
var Floor = require( 'models/floor' );
var _instance;

var FileWriter = function() {
	this._jsonPath = './json/';
	this._defaultFile = 'default.json';
	this._serviceURL = './service.php';

	var self = this;
};

FileWriter.prototype.postToService = function( action ) {
	switch ( action ) {
		case 'saveDefaultJson':
			var floorplanData = {
					'entities': employeeCollection.createJson(),
					'seats': Floor.createJson()
				}
				// var entityData = employeeCollection.createJson();
				// var floorData = Floor.createJson();
				// console.log( ( entityData ) );
				// console.log( ( floorData ) );
			data = {
				'json': JSON.stringify( floorplanData ),
				'action': action,
				'path': this._jsonPath,
				'filename': this._defaultFile
			};

			break;
		default:
	}
	$.post( this._serviceURL, data, function( d ) {
		// console.log( 'success' );
		// console.log( d );
	} );
};


module.exports = Utils.createSingleton( _instance, FileWriter, 'filewriter' );