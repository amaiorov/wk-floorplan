var ObjectObserver = require( 'libs/observe' ).ObjectObserver;

var EntityIcon = function( element, model ) {

	// assign view element
	this.$element = $( element );

	// assign model
	this.model = model;

	this._$onObserved = $.proxy( this.onObserved, this );

	this._observer = new ObjectObserver( this.model );
	this._observer.open( this._$onObserved );
}


EntityIcon.prototype.dispose = function() {

	this._observer.close( this._$onObserved );

	this.$element = null;
	this.model = null;
};


EntityIcon.prototype.setX = function( x ) {

	this.$element.css( {
		'left': x
	} );
};


EntityIcon.prototype.setY = function( y ) {

	this.$element.css( {
		'top': y
	} );
};


EntityIcon.prototype.onObserved = function( added, removed, changed, getOldValueFn ) {

	for ( var key in changed ) {
		var value = changed[ key ];

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
	}
}


module.exports = EntityIcon;