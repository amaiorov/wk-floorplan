var crossroads = require( 'crossroads' );
var pubSub = require( 'app/pubsub' );
var Utils = require( 'app/utils' );


var _instance;


var Router = function() {

	crossroads.shouldTypecast = true;
	crossroads.routed.add( this.onRouted, this );

	this._routes = [];

	for ( var key in Router.mappings ) {
		var value = Router.mappings[ key ];
		this._routes.push( crossroads.addRoute( value.pattern ) );
	}

	var entryURL = window.location.hash.replace( /^#/, '' );
	crossroads.parse( entryURL );
}


Router.prototype.onRouted = function( request, data ) {

	var routeKey = _.findKey( Router.mappings, function( value ) {
		return value.pattern === data.route[ '_pattern' ];
	} );

	var routeParams = data[ 'params' ];

	console.log( 'routed: ', routeKey, routeParams );

	pubSub.routed.dispatch( routeKey, routeParams[ 0 ] );
};


Router.mappings = {
	'default': {
		pattern: ''
	},
	'location': {
		pattern: 'location{?query}'
	},
	'unsupported': {
		pattern: 'unsupported'
	}
};


module.exports = Utils.createSingletonNow( _instance, Router );