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

	pubSub.modeChanged.add( $.proxy( this.onModeChanged, this ) );

	this.update( 'default.json' );
}


FloorPlanSelector.prototype.update = function( fileName ) {

	var _currentName = fileName.replace( '.json', '' ).replace( /-/g, ' ' );

	var tempData = {
		currentName: _currentName,
		files: {
			'default': 'default.json',
			'custom floor plan': 'custom-floor-plan.json'
		}
	};

	var frag = soy.renderAsFragment( template.FloorPlanDropdown, tempData );
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
		}, $.proxy( this.onJsonLoad, this ) );
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

	pubSub.fileChanged.dispatch( fileName );
	pubSub.fileCreated.dispatch();
};


FloorPlanSelector.prototype.onModeChanged = function( isEditMode ) {

	this.$el.toggleClass( 'admin', isEditMode );
};


FloorPlanSelector.prototype.onJsonLoad = function( data ) {

	var json = JSON.parse( data.content );
	pubSub.jsonLoaded.dispatch( json );
};


module.exports = Utils.createSingleton( _instance, FloorPlanSelector );