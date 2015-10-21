var Utils = require( 'app/utils' );
var Signal = require( 'signals' );

var _instance;


var PubSub = function() {

	this.seatSelected = new Signal();
	this.editorSplitUpdated = new Signal();
	this.editorSplitEnded = new Signal();
	this.searchCompleted = new Signal();
	this.edited = new Signal();
	this.modeChanged = new Signal();

	this.jsonLoaded = new Signal();
	this.jsonLoaded.memorize = true;

	this.fileChanged = new Signal();
	this.fileCreated = new Signal();
};


module.exports = Utils.createSingletonNow( _instance, PubSub );