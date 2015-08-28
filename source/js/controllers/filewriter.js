var employeeCollection = require( 'models/employeecollection' );
var pubSub = require( 'app/pubsub' );
var Utils = require( 'app/utils' );
var Floor = require( 'models/floor' );
var td = require( 'throttle-debounce' );

var _instance;

var FileWriter = function() {

	this._jsonPath = './json/';
	this._defaultFile = 'default.json';
	this._serviceURL = './service.php';

	this._$debounceEdited = td.debounce( 1000, $.proxy( this.onEdited, this ) );

	pubSub.modeChanged.add( $.proxy( this.onModeChanged, this ) );
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
		console.log( 'save success!' );
	} );
};


FileWriter.prototype.onEdited = function() {

	this.postToService( 'saveDefaultJson' );
}


FileWriter.prototype.onModeChanged = function( isEditMode ) {

	if ( isEditMode ) {

		pubSub.edited.add( this._$debounceEdited );

	} else {

		pubSub.edited.remove( this._$debounceEdited );
	}
}


module.exports = Utils.createSingleton( _instance, FileWriter, 'filewriter' );