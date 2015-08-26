// global requires
window.$ = window.jQuery = require( 'jquery' );
window.soy = require( 'libs/soyutils' );
require( 'bootstrap' );
require( 'libs/bootstrap-toggle' );
require( 'libs/bootstrap-checkbox' );
require( 'libs/gsap/plugins/ThrowPropsPlugin' );
require( 'libs/quadtree' );

// kick off main logic
var bootstrapper = require( 'app/bootstrapper' );

bootstrapper.load();