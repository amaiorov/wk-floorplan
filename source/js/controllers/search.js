var template = require( 'views/main.soy' );
var employeeCollection = require( 'models/employeecollection' );
var Utils = require( 'app/utils' );
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

	this._searchField.addEventListener( 'keyup', function( evt ) {
		search.typeHandler( evt );
	} );
	this._searchField.addEventListener( 'focus', function( evt ) {
		search.typeHandler( evt );
	} );
	this._searchField.addEventListener( 'blur', function( evt ) {
		search.hideAutocompleteList();
	} );
	this._searchModeButton.addEventListener( 'blur', function( evt ) {
		search.hideAutocompleteList();
	} );
};

Search.prototype.getMatchedItems = function() {
	var matchedList = document.createElement( 'ul' ),
		matchedItems = [],
		query = this.getQuery();
	matchedList.classList.add( 'dropdown-menu', 'dropdown-menu-left' );
	this._autocompleteList.classList.add( 'open' )

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
			item.fullName = item.fullName.replace( new RegExp( query, 'gi' ), '<strong>$&</strong>' );
			item.department = item.department.replace( new RegExp( query, 'gi' ), '<strong>$&</strong>' );
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
};

Search.prototype.typeHandler = function( evt ) {
	if ( evt.target.value.length >= 2 ) {
		var allEntities = search.getMatchedItems();
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
		$( search._autocompleteList ).empty().append( frag );
	} else {
		search.hideAutocompleteList();
	}
};
module.exports = Utils.createSingleton( _instance, Search, 'search' );