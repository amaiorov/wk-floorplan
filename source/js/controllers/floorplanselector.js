var Utils = require( 'app/utils' );
var pubSub = require( 'app/pubsub' );
var template = require( 'views/main.soy' );

var _instance;

var FloorPlanSelector = function() {

	this.$el = $( '#floorplan-selector' );

	this.$el.on( 'click', 'li a', $.proxy( this.onClickItem, this ) );

	$( '#new-floorplan-modal .btn-primary' ).on( 'click', $.proxy( this.onConfirmModal, this ) );
	$( '#new-floorplan-modal' ).on( 'show.bs.modal', $.proxy( this.onBeforeModalShow, this ) );

	pubSub.modeChanged.add( $.proxy( this.onModeChanged, this ) );

	this.currentFileName = 'default.json';

	this.update( this.currentFileName );
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

	this.currentFileName = fileName;
};


FloorPlanSelector.prototype.onClickItem = function( e ) {

	var $target = $( e.currentTarget );

	if ( $target.hasClass( 'new' ) ) {

		console.log( $target );

	} else {

		var fileName = $target.attr( 'data-file-name' );
		this.currentFileName = fileName;

		this.update( fileName );
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

	this.update( fileName );
};


FloorPlanSelector.prototype.onModeChanged = function( isEditMode ) {

	this.$el.toggleClass( 'admin', isEditMode );
};


module.exports = Utils.createSingleton( _instance, FloorPlanSelector );