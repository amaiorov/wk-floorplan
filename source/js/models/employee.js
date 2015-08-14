var ObjectObserver = require( 'libs/observe' ).ObjectObserver;

var Employee = function( props ) {

	this.firstName = props[ 'First' ];
	this.lastName = props[ 'Last' ];
	this.extension = props[ 'Ext.' ];
	this.floor = props[ 'Floor' ];
	this.department = props[ 'Department' ];
	this.mailbox = props[ 'Desk #/ Mailbox #' ];
	this.deskDrawerKey = props[ 'Desk Drawer Key #' ];
	this.workEmail = props[ 'workEmail' ];
	this.cellPhone = props[ 'Cell Phone #s' ];
	this.initials = this.getInitials();
	this.fullName = this.getFullName();
	this.seat = props[ 'Seat' ];
	this.x = props[ 'X' ];
	this.y = props[ 'Y' ];
	this.isAssigned = this.x && this.y;

	this._$onObserved = $.proxy( this.onObserved, this );

	this._observer = new ObjectObserver( this );
	this._observer.open( this._$onObserved );
}


Employee.prototype.getInitials = function() {

	return this.firstName[ 0 ].toUpperCase() + this.lastName[ 0 ].toUpperCase();
}


Employee.prototype.getFullName = function() {

	return this.firstName + ' ' + this.lastName;
}


Employee.prototype.seatByPosition = function( x, y ) {

	this.x = x;
	this.y = y;
}


Employee.prototype.onObserved = function( added, removed, changed, getOldValueFn ) {

	for ( var key in changed ) {
		var value = changed[ key ];

		switch ( key ) {
			case 'seat':
				var seat = value;

				if ( seat ) {

					seat.entity = this;

					this.seat = seat;
					this.seatByPosition( this.seat.x, this.seat.y );

				} else {

					seat = undefined;
					this.x = undefined;
					this.y = undefined;
				}
				break;

			case 'x':
			case 'y':
				this.isAssigned = ( this.x && this.y );
				break;

			default:
				break;
		}
	}
}


module.exports = Employee;