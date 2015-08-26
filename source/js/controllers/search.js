var template = require( 'views/main.soy' );
var employeeCollection = require( 'models/employeecollection' );
var Utils = require( 'app/utils' );
var pubSub = require( 'app/pubsub' );
var Editor = require( 'controllers/editor' );

var _instance;


var Search = function( searchThreshold ) {
	// alert( 'search yo!' );
	this._searchMode = '';
	this._threshold = searchThreshold;
	this._employees = employeeCollection._employees;
	this._searchField = document.getElementById( 'search-query' );
	this._autocompleteList = document.getElementById( 'autocomplete-list' );
	this._searchModeButton = document.getElementById( 'search-mode' );
	this._searchModeList = this._searchModeButton.nextSibling;
	// debugger;
	this._submit = document.getElementById( 'search-submit' );

	this._autocompleteListShown = false;

	var self = this;

	$( this._autocompleteList ).on( 'click', '.entity', function( evt ) {

		self.hideAutocompleteList();

		var id = evt.currentTarget.getAttribute( 'data-id' );
		var entityModel = employeeCollection.getByName( id );

		pubSub.searchCompleted.dispatch( entityModel );
	} );

	this._searchField.addEventListener( 'keyup', function( evt ) {
		self.typeHandler( evt );
	} );

	this._searchField.addEventListener( 'focus', function( evt ) {
		self.typeHandler( evt );
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

	/*
		this._searchField.addEventListener( 'blur', function( evt ) {
			self.hideAutocompleteList();
		} );
		this._searchModeButton.addEventListener( 'blur', function( evt ) {
			self.hideAutocompleteList();
		} );*/
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
		var item = {},
			fullNameIndex = this._employees[ i ].fullName.toLowerCase().indexOf( query ),
			departmentIndex = this._employees[ i ].department.toLowerCase().indexOf( query );
		if ( fullNameIndex > -1 || departmentIndex > -1 ) {

			// create tmp object to store matched entity
			for ( var prop in this._employees[ i ] ) {
				item[ prop ] = this._employees[ i ][ prop ];
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
	// return matchedList;
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
			} else {
				_otherFloorEntities[ entity.floorIndex ] = _otherFloorEntities[ entity.floorIndex ] || [];
				_otherFloorEntities[ entity.floorIndex ].push( entity );
			}
		} );

		// append list to soy view
		var frag = soy.renderAsFragment( template.AutocompleteList, {
			currentFloorEntities: _currentFloorEntities,
			otherFloorEntities: _otherFloorEntities
		} );
		$( this._autocompleteList ).empty().append( frag );
	} else {
		this.hideAutocompleteList();
	}
};
module.exports = Utils.createSingleton( _instance, Search, 'search' );