var EntityIcon = function( element, model ) {

	// assign view element
	this.$element = $( element );

	// assign model
	this.model = model;
}


EntityIcon.prototype.updatePosition = function() {

	this.$element.css( {
		'top': this.model.seat.y,
		'left': this.model.seat.x
	} );
};


module.exports = EntityIcon;