var ObjectObserver = require( 'libs/observe' ).ObjectObserver;
var pubSub = require( 'app/pubsub' );

var Employee = function( props ) {

	var sanitize = function( str ) {
		return str.replace( /\(.+\)/gi, '' ).replace( /\W+/gi, '' );
	}

	this.firstName = props[ 'First' ] || '.';
	this.lastName = props[ 'Last' ] || '.';
	this.extension = props[ 'Ext.' ];
	this.department = props[ 'Department' ];
	this.departmentCSSClass = props[ 'DepartmentBucket' ].toLowerCase().split( ' ' ).join( '-' ) || props[ 'Special' ].toLowerCase().replace( /^\(.{1}\)/, '' ) || 'other';
	this.departmentBucket = props[ 'DepartmentBucket' ] || 'other';
	this.mailbox = props[ 'Desk#/Mailbox#' ];
	this.deskDrawerKey = props[ 'DeskDrawerKey#' ];
	this.workEmail = props[ 'WorkEmail' ];
	this.cellPhone = props[ 'CellPhone#s' ];
	this.initials = this.getInitials();
	this.fullName = this.getFullName();
	this.type = props[ 'Special' ].toLowerCase().replace( /^\(.{1}\)/, '' ) || 'employee';
	if ( this.type.match( /employee|intern|freelance/ ) ) {
		this.photoURL = '/service.php?fullName=' + sanitize( this.firstName ) + '.' + sanitize( this.lastName.split( '/' )[ 0 ] );
	} else {
		this.photoURL = null;
	}
	this.seat = null;
	this.x = null;
	this.y = null;
	this.floorIndex = props[ 'Floor' ] || null;
	this.isAssigned = this.updateAssignedState();

	this._$onObserved = $.proxy( this.onObserved, this );

	this._observer = new ObjectObserver( this );
	this._observer.open( this._$onObserved );
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