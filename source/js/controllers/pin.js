var ObjectObserver = require( 'libs/observe' ).ObjectObserver;


var Pin = function( element, model ) {

	// assign view element
	this.$element = $( element );

	// assign model
	this.model = model;

	this._$onObserved = $.proxy( this.onObserved, this );

	this._observer = new ObjectObserver( this.model );
	this._observer.open( this._$onObserved );
}


Pin.prototype.dispose = function() {

	this._observer.close( this._$onObserved );

	this.$element.remove();
	this.$element = null;

	this.model = null;
};


Pin.prototype.setX = function( x ) {

	this.$element.css( {
		'left': x
	} );
};


Pin.prototype.setY = function( y ) {

	this.$element.css( {
		'top': y
	} );
};


Pin.prototype.handleModelChange = function( key, value ) {

	switch ( key ) {
		case 'x':
			this.setX( value );
			break;

		case 'y':
			this.setY( value );
			break;

		default:
			break;
	}
};


Pin.prototype.onObserved = function( added, removed, changed, getOldValueFn ) {

	for ( var key in changed ) {
		var value = changed[ key ];
		this.handleModelChange( key, value );
	}
}


module.exports = Pin;