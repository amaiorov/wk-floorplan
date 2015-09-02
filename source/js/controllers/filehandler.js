var pubSub = require( 'app/pubsub' );
var Utils = require( 'app/utils' );
var employeeCollection = require( 'models/employeecollection' );
var Floor = require( 'models/floor' );
var FloorPlanSelector = require( 'controllers/floorplanselector' );
var td = require( 'throttle-debounce' );

var _instance;

var FileHandler = function() {

	this.defaultFile = 'default.json';
	this._jsonPath = './json/';
	this._serviceURL = './service.php';

	this._$debounceEdited = td.debounce( 1000, $.proxy( this.onEdited, this ) );

	pubSub.modeChanged.add( $.proxy( this.onModeChanged, this ) );
};


FileHandler.prototype.postToService = function( action, customFilename, opt_callback ) {

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
				'filename': this.defaultFile
			};
			break;
		case 'loadDefaultJson':
			postData = {
				'action': action,
				'path': this._jsonPath,
				'filename': this.defaultFile
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
				'filename': customFilename
			};
			break;
		case 'loadCustomJson':
			postData = {
				'action': action,
				'path': this._jsonPath,
				'filename': customFilename
			};
			break;
		default:
	}

	return $.post( this._serviceURL, postData, function( data ) {

		if ( opt_callback ) {
			opt_callback( data );
		}

		console.log( action + ' success!' );
	} );
};


FileHandler.prototype.onEdited = function() {

	var floorPlanSelector = FloorPlanSelector();
	var fileName = floorPlanSelector.currentFileName || this.defaultFile;

	this.postToService( 'saveCustomJson', fileName );
}


FileHandler.prototype.onModeChanged = function( isEditMode ) {

	if ( isEditMode ) {

		pubSub.edited.add( this._$debounceEdited );

	} else {

		pubSub.edited.remove( this._$debounceEdited );
	}
}


module.exports = Utils.createSingleton( _instance, FileHandler, 'filehandler' );