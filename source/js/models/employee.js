var ObjectObserver = require( 'libs/observe' ).ObjectObserver;
var pubSub = require( 'app/pubsub' );

var Employee = function( props ) {

	this.firstName = props[ 'First' ];
	this.lastName = props[ 'Last' ];
	this.extension = props[ 'Ext.' ];
	this.department = props[ 'Department' ];
	this.departmentCSSClass = props[ 'DepartmentBucket' ].toLowerCase().split( ' ' ).join( '-' );
	this.mailbox = props[ 'Desk#/Mailbox#' ];
	this.deskDrawerKey = props[ 'DeskDrawerKey#' ];
	this.workEmail = props[ 'WorkEmail' ];
	this.cellPhone = props[ 'CellPhone#s' ];
	this.initials = this.getInitials();
	this.fullName = this.getFullName();
	this.type = this.getType( props );
	this.seat = null;
	this.x = null;
	this.y = null;
	this.floorIndex = props[ 'Floor' ] || null;
	this.isAssigned = this.updateAssignedState();

	this._$onObserved = $.proxy( this.onObserved, this );

	this._observer = new ObjectObserver( this );
	this._observer.open( this._$onObserved );
}


Employee.prototype.getType = function( props ) {

	switch ( true ) {
		case ( props[ 'Printer' ].length > 0 ):
			return 'printer';
		case ( props[ 'Room' ].length > 0 ):
			return 'room';
		case ( props[ 'Freelance' ].length > 0 ):
			return 'freelance';
		case ( props[ 'Intern' ].length > 0 ):
			return 'intern';
		default:
			return 'employee';
	}
}


Employee.prototype.updateAssignedState = function() {

	return ( typeof this.x === 'string' && typeof this.y === 'string' );
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
					this.floorIndex = this.seat.floorIndex;
					this.seatByPosition( this.seat.x, this.seat.y );
				}

				this.isAssigned = this.updateAssignedState();
				break;

			case 'x':
			case 'y':
				this.isAssigned = this.updateAssignedState();
				break;

			default:
				break;
		}
	}

	pubSub.edited.dispatch();
}


module.exports = Employee;