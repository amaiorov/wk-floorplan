var template = require( 'views/main.soy' );
var employeeCollection = require( 'models/employeecollection' );
var Utils = require( 'app/utils' );
var pubSub = require( 'app/pubsub' );
var Editor = require( 'controllers/editor' );
var _instance;


var Search = function() {

	this._threshold = 2;
	this._employees = employeeCollection.getAll();
	this._searchField = document.getElementById( 'search-query' );
	this._autocompleteList = document.getElementById( 'autocomplete-list' );
	this._autocompleteSelectedNode = null;

	this._$dropdown = $( '#search .dropdown' );

	this._submit = document.getElementById( 'search-submit' );

	this._autocompleteListShown = false;

	this._category = this._$dropdown.find( 'li a' )[ 0 ].getAttribute( 'data-value' );

	var self = this;

	$( this._autocompleteList ).on( 'click', '.entity', function( evt ) {

		self.hideAutocompleteList();

		var id = evt.currentTarget.getAttribute( 'data-id' );
		var entityModel = employeeCollection.getByName( id );

		pubSub.searchCompleted.dispatch( entityModel );

		self._searchField.value = entityModel.fullName;
	} );

	this._searchField.addEventListener( 'keyup', function( evt ) {
		self.typeHandler( evt );
	} );

	this._searchField.addEventListener( 'focus', function( evt ) {
		self.typeHandler( evt );
	} );

	this._$dropdown.on( 'show.bs.dropdown', function() {
		self.hideAutocompleteList();
	} );

	this._$dropdown.find( 'li a' ).click( function( e ) {
		var $target = $( e.target );
		var text = $target.text();
		$( '#search .dropdown .text' ).text( text );

		self._category = $target.attr( 'data-value' );
	} );

	var search = $( '#search' )[ 0 ];
	$( document.body ).on( 'click', function( evt ) {
		if ( !self._autocompleteListShown ) {
			return;
		}

		if ( !$.contains( search, evt.target ) ) {
			self.hideAutocompleteList();
		}
	} );
};

Search.prototype.getMatchedItems = function() {
	var matchedList = document.createElement( 'ul' ),
		matchedItems = [],
		query = this.getQuery();
	matchedList.classList.add( 'dropdown-menu', 'dropdown-menu-left' );
	this._autocompleteList.classList.add( 'open' );

	this._autocompleteListShown = true;

	// loop through entities and find matching objects
	for ( var i = 0; i < this._employees.length; i++ ) {

		var employee = this._employees[ i ];

		// skip this entity if not belongs to the current category
		switch ( this._category ) {
			case 'people':
				if ( employee.type !== 'employee' && employee.type !== 'freelance' && employee.type !== 'intern' ) {
					continue;
				}
				break;

			case 'rooms':
				if ( employee.type !== 'room' ) {
					continue;
				}
				break;

			case 'printers':
				if ( employee.type !== 'printer' ) {
					continue;
				}
				break;

			default:
				break;
		}

		var item = {},
			fullNameIndex = employee.fullName.toLowerCase().indexOf( query.toLowerCase() ),
			departmentIndex = employee.department.toLowerCase().indexOf( query.toLowerCase() );

		if ( fullNameIndex > -1 || departmentIndex > -1 ) {

			// create tmp object to store matched entity
			for ( var prop in employee ) {
				item[ prop ] = employee[ prop ];
			}

			// mark found text in name and department
			item.formattedFullName = item.fullName.replace( new RegExp( query, 'gi' ), '<strong>$&</strong>' );
			item.formattedDepartment = item.department.replace( new RegExp( query, 'gi' ), '<strong>$&</strong>' );
			matchedItems.push( item );
		}
	}

	if ( matchedItems.length === 0 ) {
		matchedItems.push( {
			'floorIndex': -1
		} );
	}

	return matchedItems;
};

Search.prototype.getQuery = function() {
	return this._searchField.value;
};

Search.prototype.clearAutocompleteList = function() {
	while ( this._autocompleteList.firstChild ) {
		this._autocompleteList.removeChild( this._autocompleteList.firstChild );
	}
};

Search.prototype.hideAutocompleteList = function() {
	this._autocompleteList.classList.remove( 'open' );
	this._autocompleteListShown = false;
};

Search.prototype.typeHandler = function( evt ) {
	if ( evt.target.value.length >= 2 ) {
		var allEntities = this.getMatchedItems();
		_currentFloorEntities = [],
			_otherFloorEntities = {},
			currentFloorIndex = Editor().floorViewer.currentFloorIndex;

		// loop through entities and push to appropariate floor array
		$.each( allEntities, function( i, entity ) {
			if ( entity.floorIndex === currentFloorIndex ) {
				_currentFloorEntities.push( entity );
			} else if ( entity.floorIndex ) {
				_otherFloorEntities[ entity.floorIndex ] = _otherFloorEntities[ entity.floorIndex ] || [];
				_otherFloorEntities[ entity.floorIndex ].push( entity );
			}
		} );

		// append list to soy view
		var frag = soy.renderAsFragment( template.AutocompleteList, {
			currentFloorEntities: _currentFloorEntities,
			otherFloorEntities: _otherFloorEntities,
			category: this._category
		} );
		$( this._autocompleteList ).empty().append( frag );

		if ( evt.which === 38 || evt.which === 40 ) {
			this.keyboardNav( evt.which );
		}

	} else {

		this.hideAutocompleteList();
	}
};

Search.prototype.keyboardNav = function( direction ) {
	var list = this._autocompleteList.querySelectorAll( 'a' );
	// keyboard up (38) or down (40)
	if ( direction === 38 ) {
		if ( !this._autocompleteSelectedNode ) {
			this._autocompleteSelectedNode = list[ list.length ].getAttribute( 'data-id' );
			this._autocompleteSelectedNode.classList.add( 'hover' );
		} else {
			this._autocompleteSelectedNode.classList.remove( 'hover' );
			for ( var i in list ) {
				if ( list[ i ].getAttribute( 'data-id' ) === this._autocompleteSelectedNode ) {
					this._autocompleteSelectedNode = list[ i - 1 ].getAttribute( 'data-id' );
					break;
				}
			}
			this._autocompleteSelectedNode.classList.add( 'hover' );
		}
	} else if ( direction === 40 ) {
		if ( !this._autocompleteSelectedNode ) {
			this._autocompleteSelectedNode = list[ 0 ].getAttribute( 'data-id' );
			this._autocompleteSelectedNode.classList.add( 'hover' );
		} else {
			this._autocompleteSelectedNode.classList.remove( 'hover' );
			for ( var i in list ) {
				if ( list[ i ].getAttribute( 'data-id' ) === this._autocompleteSelectedNode ) {
					this._autocompleteSelectedNode = list[ i + 1 ].getAttribute( 'data-id' );
					break;
				}
			}
			this._autocompleteSelectedNode.classList.add( 'hover' );
		}
	}
};

module.exports = Utils.createSingleton( _instance, Search, 'search' );