var soy = require( 'libs/soyutils' );
var template = require( 'views/main.soy' );
var Utils = require( 'app/utils' );
var pubSub = require( 'app/pubsub' );
var employeeCollection = require( 'models/employeecollection' );
var PathObserver = require( 'libs/observe' ).PathObserver;

var minFracX = .6;
var maxFracX = 1;

var Waitlist = function( $element, editorMetrics ) {

	this._editorMetrics = editorMetrics;
	this._dragFracX = 1;

	this._$element = $element;
	this._$waitlist = this._$element.find( '.waitlist' );
	this._$waitlistContainer = this._$element.find( '.waitlist-container' );
	this._$waitlistInfoContainer = this._$element.find( '.info-container' );

	this._$onClickWaitlist = $.proxy( this.onClickWaitlist, this );
	this._$onClickWaitlistIcon = $.proxy( this.onClickWaitlistIcon, this );
	this._$onSplitStart = $.proxy( this.onSplitStart, this );
	this._$onSplitUpdate = $.proxy( this.onSplitUpdate, this );
	this._$onSplitEnd = $.proxy( this.onSplitEnd, this );

	this._$splitHandle = this._$element.find( '.split-handle' );

	// listen for all employee assigned state changes
	var $onEmployeeStateChanged = $.proxy( this.onEmployeeStateChanged, this );
	this._$onEmployeeStateChanged = $onEmployeeStateChanged;

	var employees = employeeCollection.getAll();
	this._employeeObservers = $.map( employees, function( employee ) {
		var observer = new PathObserver( employee, 'isAssigned', employee.isAssigned );
		observer.open( $onEmployeeStateChanged );
		return observer;
	} );
}


Waitlist.prototype.activate = function() {

	this._$splitHandle.on( 'mousedown', this._$onSplitStart );
	this._$element.on( 'click', '.entity-pin', this._$onClickWaitlistIcon );
	this._$waitlist.on( 'click', this._$onClickWaitlist );

	TweenMax.to( this, .5, {
		_dragFracX: Utils.lerp( minFracX, maxFracX, .5 ),
		ease: Expo.easeInOut,
		onUpdate: this.triggerSplitUpdate,
		onUpdateScope: this,
		onComplete: this.triggerSplitEnd,
		onCompleteScope: this
	} );
}


Waitlist.prototype.deactivate = function() {

	this._$splitHandle.off( 'mousedown', this._$onSplitStart );
	this._$element.off( 'click', '.entity-pin', this._$onClickWaitlistIcon );
	this._$waitlist.off( 'click', this._$onClickWaitlist );
	$( window ).off( 'mousemove', this._$onSplitUpdate );
	$( window ).off( 'mouseup', this._$onSplitEnd );

	TweenMax.to( this, .5, {
		_dragFracX: 1,
		ease: Expo.easeInOut,
		onUpdate: this.triggerSplitUpdate,
		onUpdateScope: this,
		onComplete: this.triggerSplitEnd,
		onCompleteScope: this
	} );
}


Waitlist.prototype.reset = function() {

	this._$waitlist.find( '.entity-pin' ).removeClass( 'active' );
	this._$waitlistContainer.removeClass( 'show-info' );
}


Waitlist.prototype.triggerSplitUpdate = function( e ) {

	pubSub.editorSplitUpdated.dispatch( this._dragFracX );
}


Waitlist.prototype.triggerSplitEnd = function( e ) {

	pubSub.editorSplitEnded.dispatch();
}


Waitlist.prototype.onClickWaitlist = function( e ) {

	var notClickedOnIcons = ( e.delegateTarget === e.target );

	if ( notClickedOnIcons ) {
		this.reset();
	}
}


Waitlist.prototype.onClickWaitlistIcon = function( e ) {

	this._$waitlist.find( '.entity-pin' ).removeClass( 'active' );

	var $icon = $( e.currentTarget ).addClass( 'active' );
	var employee = employeeCollection.getByName( $icon.attr( 'data-id' ) );

	var infoEl = soy.renderAsFragment( template.WaitlistInfo, {
		employee: employee
	} );

	this._$waitlistInfoContainer.empty().append( infoEl );
	this._$waitlistContainer.addClass( 'show-info' );
}


Waitlist.prototype.onEmployeeStateChanged = function( newValue, oldValue ) {

	this.element = soy.renderAsFragment( template.WaitlistEmployees, {
		entities: employeeCollection.getUnassigned()
	} );

	this._$waitlist.empty().append( this.element );
	this.reset();
}


Waitlist.prototype.onSplitStart = function( e ) {

	$( window ).on( 'mousemove', this._$onSplitUpdate );
	$( window ).on( 'mouseup', this._$onSplitEnd );

	$( 'html' ).attr( 'data-cursor', 'horizontal-dragging' );
}


Waitlist.prototype.onSplitUpdate = function( e ) {

	var dragFracX = ( e.clientX - this._editorMetrics.editingRegionLeft ) / this._editorMetrics.editingRegionWidth;
	this._dragFracX = Math.min( Math.max( dragFracX, minFracX ), maxFracX );

	this.triggerSplitUpdate();
}


Waitlist.prototype.onSplitEnd = function( e ) {

	$( window ).off( 'mousemove', this._$onSplitUpdate );
	$( window ).off( 'mouseup', this._$onSplitEnd );

	$( 'html' ).attr( 'data-cursor', '' );

	this.triggerSplitEnd();
}


module.exports = Waitlist;