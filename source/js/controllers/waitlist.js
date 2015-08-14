var soy = require( 'libs/soyutils' );
var template = require( 'views/main.soy' );
var employeeCollection = require( 'models/employeecollection' );


var Waitlist = function( $element ) {

	this._$element = $element;
	this._$waitlist = this._$element.find( '.waitlist' );
	this._$waitlistContainer = this._$element.find( '.waitlist-container' );
	this._$waitlistInfoContainer = this._$element.find( '.info-container' );

	this._$onClickWaitlist = $.proxy( this.onClickWaitlist, this );
	this._$onClickWaitlistIcon = $.proxy( this.onClickWaitlistIcon, this );

	this._$element.on( 'click', '.entity-icon', this._$onClickWaitlistIcon );
	this._$waitlist.on( 'click', this._$onClickWaitlist );
}


Waitlist.prototype.onClickWaitlist = function( e ) {

	var notClickedOnIcons = ( e.delegateTarget === e.target );

	if ( notClickedOnIcons ) {
		this._$waitlist.find( '.entity-icon' ).removeClass( 'active' );
		this._$waitlistContainer.removeClass( 'show-info' );
	}
}


Waitlist.prototype.onClickWaitlistIcon = function( e ) {

	this._$waitlist.find( '.entity-icon' ).removeClass( 'active' );

	var $icon = $( e.currentTarget ).addClass( 'active' );
	var employee = employeeCollection.getByName( $icon.attr( 'data-first' ), $icon.attr( 'data-last' ) );

	var infoEl = soy.renderAsFragment( template.WaitlistInfo, {
		employee: employee
	} );

	this._$waitlistInfoContainer.empty().append( infoEl );
	this._$waitlistContainer.addClass( 'show-info' );
}


module.exports = Waitlist;