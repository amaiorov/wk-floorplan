var Utils = require( 'app/utils' );
var pubSub = require( 'app/pubsub' );
var template = require( 'views/main.soy' );
var FileHandler = require( 'controllers/filehandler' );

var _instance;

var FloorPlanSelector = function() {

	this.$el = $( '#floorplan-selector' );
	this.$el.on( 'click', 'li a', $.proxy( this.onClickItem, this ) );

	this._$modal = $( '#new-floorplan-modal' );
	this._$modalForm = this._$modal.find( 'form' );
	this._$modalSubmitButton = this._$modal.find( '.btn-submit' );

	this._$modalSubmitButton
		.on( 'click', $.proxy( this.onSubmitModal, this ) );

	this._$modalForm
		.on( 'submit', $.proxy( this.onSubmitModal, this ) );

	this._$modal.find( 'input' )
		.on( 'input', $.proxy( this.onModalInput, this ) );

	this._$modal
		.on( 'show.bs.modal', $.proxy( this.onBeforeModalShow, this ) )
		.on( 'shown.bs.modal', $.proxy( this.onModalShown, this ) );

	this._fileList = [];

	pubSub.jsonLoaded.add( $.proxy( this.onJsonLoaded, this ) );
	pubSub.modeChanged.add( $.proxy( this.onModeChanged, this ) );
}


FloorPlanSelector.prototype.update = function( fileName, opt_fileList ) {

	var _currentName = fileName.replace( '.json', '' );

	this._fileList = opt_fileList || this._fileList;

	var files = {};

	if ( opt_fileList ) {
		$.each( this._fileList, function( i, fileName ) {
			var formattedFileName = fileName.replace( '.json', '' );
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

	if ( e.currentTarget.hasAttribute( 'data-disabled' ) ) {
		return;
	}

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

	this._$modal.find( 'input' ).val( '' ).trigger( 'input' );
	this._$modal.find( '.prompt' ).hide();
	this._$modalForm.toggleClass( 'has-error', false );
};


FloorPlanSelector.prototype.onModalShown = function( e ) {

	this._$modal.find( 'input' ).focus();
};


FloorPlanSelector.prototype.onModalInput = function( e ) {

	var hasValue = ( e.target.value && e.target.value.length > 0 );
	this._$modalSubmitButton.attr( 'disabled', !hasValue );
};


FloorPlanSelector.prototype.onSubmitModal = function( e ) {

	e.preventDefault();

	var floorPlanName = this._$modal.find( 'input' ).val();
	var fileName = floorPlanName + '.json';

	if ( this._fileList.indexOf( fileName ) > -1 ) {
		this._$modal.find( '.filename-existed' ).show();
		this._$modalForm.toggleClass( 'has-error', true );
		return;
	}

	this._$modal.modal( 'hide' );

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

	var content = JSON.parse( data.content );

	pubSub.fileCreated.dispatch( content, data.filelist, data.file );

	this.update( data.file, data.filelist );
};


module.exports = Utils.createSingleton( _instance, FloorPlanSelector );