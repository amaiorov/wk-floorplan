var OccupantIcon = function( element, model ) {

	// assign view element
	this.$element = $( element );

	// assign model
	this.model = model;
}


OccupantIcon.prototype.updatePosition = function() {

	this.$element.css( {
		'top': this.model.seat.y,
		'left': this.model.seat.x
	} );
};


module.exports = OccupantIcon;