var td = require( 'throttle-debounce' );
var pubSub = require( 'app/pubsub' );
var Utils = require( 'app/utils' );
var employeeCollection = require( 'models/employeecollection' );
var Floor = require( 'models/floor' );

var _instance;

var FileHandler = function() {

	this.defaultFile = 'default.json';
	this.currentFile = this.defaultFile;

	this._serviceURL = './service.php';

	this._$debounceEdited = td.debounce( 1000, $.proxy( this.onEdited, this ) );

	pubSub.modeChanged.add( $.proxy( this.onModeChanged, this ) );
	pubSub.fileChanged.add( $.proxy( this.onFileChanged, this ) );
};


FileHandler.prototype.getEncodedFilename = function() {

	return encodeURI( this.currentFile.replace( '.json', '' ) );
};


FileHandler.prototype.postToService = function( action, params, opt_callback ) {

	var postData = {};

	switch ( action ) {
		case 'loadDefaultJson':
			postData = {
				'action': action,
				'filename': this.defaultFile
			};
			break;
		case 'loadCustomJson':
			postData = {
				'action': action,
				'filename': params.fileName
			};
			break;
		case 'createJson':
			var returnUnassigned = true;
			postData = {
				'json': JSON.stringify( {
					'entities': employeeCollection.createJson( returnUnassigned ),
					'seats': {}
				} ),
				'action': action,
				'filename': params.fileName
			};
			break;
		case 'saveJson':
			postData = {
				'json': JSON.stringify( {
					'entities': employeeCollection.createJson(),
					'seats': Floor.createJson()
				} ),
				'action': action,
				'filename': params.fileName
			};
			break;
		case 'getHeadshot':
			postData = {
				'action': action,
				'fullName': params.fullName
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

	this.postToService( 'saveJson', {
		fileName: this.currentFile
	} );
}

FileHandler.prototype.onFileChanged = function( fileName ) {

	this.currentFile = fileName;
}


FileHandler.prototype.onModeChanged = function( isEditMode ) {

	if ( isEditMode ) {

		pubSub.edited.add( this._$debounceEdited );

	} else {

		pubSub.edited.remove( this._$debounceEdited );
	}
}


module.exports = Utils.createSingleton( _instance, FileHandler, 'filehandler' );