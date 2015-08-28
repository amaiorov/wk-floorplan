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

FileWriter.prototype.postToService = function( action, customFilename ) {
	var postData = {};
	switch ( action ) {
		case 'saveDefaultJson':
			postData = {
				'json': JSON.stringify( {
					'entities': employeeCollection.createJson(),
					'seats': Floor.createJson()
				} ),
				'action': action,
				'path': this._jsonPath,
				'filename': this._defaultFile
			};
			break;
		case 'loadDefaultJson':
			postData = {
				'action': action,
				'path': this._jsonPath,
				'filename': this._defaultFile
			};
			break;
		case 'saveCustomJson':
			postData = {
				'json': JSON.stringify( {
					'entities': employeeCollection.createJson(),
					'seats': Floor.createJson()
				} ),
				'action': action,
				'path': this._jsonPath,
				'filename': customFilename + '.json'
			};
			break;
		case 'loadCustomJson':
			postData = {
				'action': action,
				'path': this._jsonPath,
				'filename': customFilename + '.json'
			};
			break;
		default:
	}

	return $.post( this._serviceURL, postData, function( data ) {
		// console.log( 'success' );
	} );
};


module.exports = Utils.createSingleton( _instance, FileWriter, 'filewriter' );