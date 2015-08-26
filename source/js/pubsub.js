var Utils = require( 'app/utils' );
var Signal = require( 'signals' );

var _instance;


var PubSub = function() {

	this.seatSelected = new Signal();
	this.editorSplitUpdated = new Signal();
	this.editorSplitEnded = new Signal();
	this.searchCompleted = new Signal();
};


module.exports = Utils.createSingletonNow( _instance, PubSub );