// global requires
window.$ = window.jQuery = require( 'jquery' );
require( 'bootstrap' );
require( 'libs/gsap/plugins/ThrowPropsPlugin' );

// kick off main logic
var bootstrapper = require( 'app/bootstrapper' );

bootstrapper.load();