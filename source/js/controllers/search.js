var template = require( 'views/main.soy' );
var employeeCollection = require( 'models/employeecollection' );
var Utils = require( 'app/utils' );
var Editor = require( 'controllers/editor' );
var _instance;

var Search = function( searchThreshold ) {
	// alert( 'search yo!' );
	this._threshold = searchThreshold;
	this._employees = employeeCollection._employees;
	this._searchField = document.getElementById( 'search-query' );
	this._autocompleteList = document.getElementById( 'autocomplete-list' );
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
};

Search.prototype.getMatchedItems = function() {
	var matchedList = document.createElement( 'ul' ),
		item,
		matchedItems = [],
		query = this.getQuery();
	matchedList.classList.add( 'dropdown-menu', 'dropdown-menu-left' );
	// this.clearAutocompleteList();
	this._autocompleteList.classList.add( 'open' )
	for ( var i = 0; i < this._employees.length; i++ ) {
		if ( this._employees[ i ].fullName.toLowerCase().indexOf( query ) > -1 ) {
			// matchedList = matchedList || newNode;
			matchedItems.push( this._employees[ i ] );
			item = document.createElement( 'li' ).appendChild( document.createElement( 'a' ) );
			item.innerHTML = this._employees[ i ].fullName.replace( new RegExp( query, 'gi' ), '<strong>' + query + '</strong>' );
			item = item.parentNode;
			matchedList.appendChild( item );
			// this._autocompleteList.appendChild( item );
		}
	}
	if ( matchedList.children.length === 0 ) {
		matchedList.innerHTML = '<li><a>No matches found</a></li>';
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
	if ( evt.target.value.length > 0 ) {
		console.log( 'key up yo: ' + evt.which );

		var allEntities = search.getMatchedItems();
		var _currentFloorEntities = [];
		var _otherFloorEntities = {};
		var currentFloorIndex = Editor().floorViewer.currentFloorIndex;

		$.each( allEntities, function( i, entity ) {
			if ( entity.floorIndex === currentFloorIndex ) {
				_currentFloorEntities.push( entity );
			} else {
				_otherFloorEntities[ entity.floorIndex ] = _otherFloorEntities[ entity.floorIndex ] || [];
				_otherFloorEntities[ entity.floorIndex ].push( entity );
			}
		} );

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