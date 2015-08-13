'use strict';

module.exports = function( grunt ) {

	// Project configuration.
	grunt.initConfig( {

		watch: {
			html: {
				files: [ '*.{html,php}' ],
				options: {
					livereload: true,
					interrupt: true,
					spawn: true,
				},
			},
			soy: {
				files: [ 'soy/**/*.soy' ],
				tasks: [ 'closureSoys' ]
			},
			js: {
				files: [ 'js/**/*.js' ],
				tasks: [ 'browserify', 'exorcise:bundle' ],
				options: {
					livereload: true,
					interrupt: true,
					spawn: true,
				},
			},
			scss: {
				files: [ 'scss/**/*.scss' ],
				tasks: [ 'compass' ],
				options: {
					livereload: true,
					interrupt: true,
					spawn: true,
				},
			},
			css: {
				files: [ 'css/*.css' ],
				options: {
					livereload: true,
					interrupt: true,
					spawn: true,
				},
			},
			svg: {
				files: [ 'fonts/fontcustom/icons/*.svg' ],
				tasks: [ 'webfont' ]
			}
		},

		exorcise: {
			bundle: {
				options: {},
				files: {
					'output/bundle.map': [ 'output/bundle.js' ],
				}
			}
		},

		browserify: {
			options: {
				browserifyOptions: {
					debug: true
				},
				plugin: [
					[
						'remapify', [ {
							src: '**/*.js',
							expose: 'app',
							cwd: './js'
						}, {
							src: '**/*.js',
							expose: 'views',
							cwd: './js/views'
						}, {
							src: '**/*.js',
							expose: 'controllers',
							cwd: './js/controllers'
						}, {
							src: '**/*.js',
							expose: 'models',
							cwd: './js/models'
						}, {
							src: '**/*.js',
							expose: 'libs',
							cwd: './js/libs'
						} ]
					]
				]
			},
			dist: {
				files: {
					'output/bundle.js': [ 'js/main.js' ]
				}
			}
		},

		closureSoys: {
			all: {
				src: 'soy/**/*.soy',
				soyToJsJarPath: 'tools/SoyToJsSrcCompiler.jar',
				outputPathFormat: 'js/views/{INPUT_FILE_NAME}.js',
				options: {
					shouldGenerateJsdoc: true,
					shouldProvideRequireSoyNamespaces: false
				}
			}
		},

		compass: {
			development: {
				options: {
					sassDir: 'scss',
					cssDir: 'css',
					fontsDir: 'fonts',
					imagesDir: 'images',
					generatedImagesDir: 'images/generated',
					relativeAssets: true,
					noLineComments: true,
					assetCacheBuster: true,
					watch: false,
					outputStyle: 'compressed', //nested, expanded, compact, compressed
					environment: 'development'
				}
			},
		},

		webfont: {
			icons: {
				src: 'fonts/fontcustom/icons/*.svg',
				dest: 'fonts/fontcustom',
				destCss: 'scss',
				options: {
					stylesheet: 'scss',
					htmlDemo: true,
					hashes: true,
					engine: 'node',
					templateOptions: {
						baseClass: 'icon',
						classPrefix: 'icon-',
						mixinPrefix: 'icon-'
					}
				}
			}
		},

	} );

	// These plugins provide necessary tasks.
	grunt.loadNpmTasks( 'grunt-browserify' );
	grunt.loadNpmTasks( 'grunt-exorcise' );
	grunt.loadNpmTasks( 'grunt-contrib-watch' );
	grunt.loadNpmTasks( 'grunt-contrib-compass' );
	grunt.loadNpmTasks( 'grunt-closure-soy' );
	grunt.loadNpmTasks( 'grunt-webfont' );

	// Tasks.
	grunt.registerTask( 'development', [
		'compass',
		'webfont',
		'closureSoys',
		'browserify',
		'exorcise:bundle',
		'watch',
	] );

	grunt.registerTask( 'release', [] );
};