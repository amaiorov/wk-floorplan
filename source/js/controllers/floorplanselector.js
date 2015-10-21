var Utils = require( 'app/utils' );
var pubSub = require( 'app/pubsub' );
var template = require( 'views/main.soy' );
var FileHandler = require( 'controllers/filehandler' );

var _instance;

var FloorPlanSelector = function() {

	this.$el = $( '#floorplan-selector' );
	this.$el.on( 'click', 'li a', $.proxy( this.onClickItem, this ) );

	$( '#new-floorplan-modal .btn-primary' ).on( 'click', $.proxy( this.onConfirmModal, this ) );
	$( '#new-floorplan-modal' ).on( 'show.bs.modal', $.proxy( this.onBeforeModalShow, this ) );

	this._fileList = [];

	pubSub.jsonLoaded.add( $.proxy( this.onJsonLoaded, this ) );
	pubSub.modeChanged.add( $.proxy( this.onModeChanged, this ) );
}


FloorPlanSelector.prototype.update = function( fileName, opt_fileList ) {

	var _currentName = fileName.replace( '.json', '' ).replace( /-/g, ' ' );

	this._fileList = opt_fileList || this._fileList;

	var files = {};

	if ( opt_fileList ) {
		$.each( this._fileList, function( i, fileName ) {
			var formattedFileName = fileName.replace( '.json', '' ).split( '-' ).join( ' ' );
			files[ formattedFileName ] = fileName;
		} );
	}

	var frag = soy.renderAsFragment( template.FloorPlanDropdown, {
		currentName: _currentName,
		files: files
	} );

	this.$el.empty().append( frag );

	pubSub.fileChanged.dispatch( fileName );
};


FloorPlanSelector.prototype.onClickItem = function( e ) {

	var fileName = $( e.currentTarget ).attr( 'data-file-name' );

	if ( fileName ) {

		this.update( fileName );

		var fileHandler = FileHandler();

		fileHandler.postToService( 'loadCustomJson', {
			fileName: fileName
		}, $.proxy( this.onJsonReceivedFromServer, this ) );
	}
};


FloorPlanSelector.prototype.onBeforeModalShow = function( e ) {

	var $modal = $( '#new-floorplan-modal' );
	var floorPlanName = $modal.find( 'input' ).val( '' );
};


FloorPlanSelector.prototype.onConfirmModal = function( e ) {

	var $modal = $( '#new-floorplan-modal' ).modal( 'hide' );
	var floorPlanName = $modal.find( 'input' ).val() || $.now();
	var fileName = floorPlanName.replace( /\s+/g, '-' ).toLowerCase() + '.json';

	var fileHandler = FileHandler();
	fileHandler.postToService( 'createJson', {
		fileName: fileName
	}, $.proxy( this.onJsonCreatedFromServer, this ) );
};


FloorPlanSelector.prototype.onModeChanged = function( isEditMode ) {

	this.$el.toggleClass( 'admin', isEditMode );
};


FloorPlanSelector.prototype.onJsonLoaded = function( content, filelist, file ) {

	this.update( file, filelist );
};


FloorPlanSelector.prototype.onJsonReceivedFromServer = function( data ) {

	var content = JSON.parse( data.content );
	pubSub.jsonLoaded.dispatch( content, data.filelist, data.file );
};


FloorPlanSelector.prototype.onJsonCreatedFromServer = function( data ) {

	pubSub.fileChanged.dispatch( data.file );
	pubSub.fileCreated.dispatch();

	this.update( data.file, data.filelist );
};


module.exports = Utils.createSingleton( _instance, FloorPlanSelector );