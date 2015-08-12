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
	this.seat = null;
	this.initials = this.getInitials();
	this.fullName = this.getFullName();
}


Employee.prototype.getInitials = function() {

	return this.firstName[ 0 ].toUpperCase() + this.lastName[ 0 ].toUpperCase();
}


Employee.prototype.getFullName = function() {

	return this.firstName + ' ' + this.lastName;
}


Employee.prototype.occupy = function( seat ) {

	seat.occupant = this;
	this.seat = seat;
}


module.exports = Employee;