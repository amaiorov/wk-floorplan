// global requires
window.$ = window.jQuery = require( 'jquery' );
window.soy = require( 'libs/soyutils' );
require( 'bootstrap' );
require( 'libs/gsap/plugins/ThrowPropsPlugin' );

// kick off main logic
var bootstrapper = require( 'app/bootstrapper' );

bootstrapper.load();