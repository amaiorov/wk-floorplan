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
	this.x = null;
	this.y = null;
}


Employee.prototype.isSeated = function() {

	return ( this.x !== null && this.y !== null );
}


Employee.prototype.getInitials = function() {

	return this.firstName[ 0 ].toUpperCase() + this.lastName[ 0 ].toUpperCase();
}


Employee.prototype.getFullName = function() {

	return this.firstName + ' ' + this.lastName;
}


Employee.prototype.seat = function( seat ) {

	seat.entity = this;
	this.seat = seat;

	this.seatByPosition( seat.x, seat.y );
}


Employee.prototype.seatByPosition = function( x, y ) {

	this.x = x;
	this.y = y;
}


Employee.prototype.unseat = function() {

	this.seat = null;
	this.x = null;
	this.y = null;
}


module.exports = Employee;