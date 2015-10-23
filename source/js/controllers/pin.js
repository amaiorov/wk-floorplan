var ObjectObserver = require( 'libs/observe' ).ObjectObserver;


var Pin = function( element, model ) {

	// assign view element
	this.$element = $( element );

	// assign model
	this.model = model;

	this.isDisposed = false;

	this._observer = new ObjectObserver( this.model );
	this._observer.open( $.proxy( this.onObserved, this ) );
}


Pin.prototype.dispose = function() {

	if ( this.isDisposed ) {

		return;

	} else {

		this.isDisposed = true;
	}

	this._observer.close();

	this.$element.remove();
	this.$element = null;
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

	if ( this.isDisposed ) {
		return;
	}

	for ( var key in changed ) {
		var value = changed[ key ];
		this.handleModelChange( key, value );
	}
}


module.exports = Pin;