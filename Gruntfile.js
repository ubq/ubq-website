'use strict';

/**
 * Livereload and connect variables
 */
var LIVERELOAD_PORT = 35729;
var lrSnippet = require('connect-livereload')({
  port: LIVERELOAD_PORT
});
var mountFolder = function (connect, dir) {
  return connect.static(require('path').resolve(dir));
};


/**
 * Grunt module
 */
module.exports = function(grunt) {

	/**
		* Dynamically load npm tasks
	*/
	require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);


	grunt.initConfig({

		/**
			* Read text from package.json and assign to pkg var
		*/
		pkg: grunt.file.readJSON('package.json'),


		/**
			* Set project info
		*/
		project: {
			src: 'src',
			dist: 'dist',

			distAssets: '<%= project.dist %>/assets',

			srcImgDir: '<%= project.src %>/img',
			distImgDir: '<%= project.distAssets %>/img',

			scssDir: '<%= project.src %>/css',
			scssFile: 'styles.scss',
			scss: '<%= project.scssDir %>/<%= project.scssFile %>',

			cssDir: '<%= project.distAssets %>/css',
			cssFile: 'styles.css',
			cssFileMin: 'styles.min.css',
			css: '<%= project.cssDir %>/<%= project.cssFile %>',
			cssMin: '<%= project.cssDir %>/<%= project.cssFileMin %>',
		},


		/**
			* Project banner
			* Dynamically appended to CSS/JS files
			* Inherits text from package.json
		*/
		tag: {
			banner: '/*!\n' +
				' * <%= pkg.name %>\n' +
				' * <%= pkg.title %>\n' +
				' * <%= pkg.url %>\n' +
				' * @author <%= pkg.author %>\n' +
				' * @version <%= pkg.version %>\n' +
				' * Copyright <%= pkg.copyright %>. <%= pkg.license %> licensed.\n' +
				' */\n'
		},



		/**
			* Connect port/livereload
			* https://github.com/gruntjs/grunt-contrib-connect
			* Starts a local webserver and injects
			* livereload snippet
		*/
		connect: {
			options: {
				port: 9100,
				hostname: '*'
			},
			livereload: {
				options: {
					middleware: function (connect) {
						return [lrSnippet, mountFolder(connect, 'dist')];
					}
				}
			}
		},



		/**
			* Includes html snippets
			* https://www.npmjs.org/package/grunt-bake
		*/
		bake: {
			build: {
				options: {
					content: "<%= project.src %>/data/data.json"
				},

				files: {
					"<%= project.dist %>/index.html": "<%= project.src %>/templates/index.html",
				}
			}
		},


		/**
			* Clean files and folders
			* https://github.com/gruntjs/grunt-contrib-clean
			* Remove generated files for clean deploy
		*/
		clean: {
			dist: [
				'<%= project.dist %>'
			]
		},



		/**
			* Copy folders/files to destination
			* https://github.com/gruntjs/grunt-contrib-copy
		*/
		copy: {
			images: {
				expand: true,
				cwd: 'src/img',
				src: '**/*',
				dest: '<%= project.distImgDir %>'
			}
		},



		/**
			* Compile Sass/SCSS files
			* https://github.com/gruntjs/grunt-contrib-sass
			* Compiles all Sass/SCSS files and appends project banner
		*/
		sass: {
			dist: {
				options: {
					style: 'expanded'
				},
				files: {
					'<%= project.css %>': '<%= project.scss %>',
				}
			}
		},


		/**
			* Concatenate JavaScript files
			* https://github.com/gruntjs/grunt-contrib-concat
			* Imports all .js files and appends project banner
		*/
		concat: {
			dist: {
				src: [
					'<%= project.src %>/js/libs/jquery/dist/jquery.min.js',
					'<%= project.src %>/js/scripts.js', 
				],
				dest: '<%= project.dist %>/assets/js/scripts.min.js',
			},
			options: {
				stripBanners: true,
				nonull: true,
				banner: '<%= tag.banner %>'
			}
		},


		/**
			* Autoprefixer
			* Adds vendor prefixes if need automatcily
			* https://github.com/nDmitry/grunt-autoprefixer
		*/
		autoprefixer: {
			options: {
				browsers: [
					'last 2 version',
					'safari 6',
					'ie 9',
					'opera 12.1',
					'ios 6',
					'android 4'
				]
			},
			dist: {
				files: {
					'<%= project.cssMin %>': ['<%= project.css %>']
				}
			}
		},


		/**
			* Opens the web server in the browser
			* https://github.com/jsoverson/grunt-open
		*/
		open: {
			server: {
				path: 'http://localhost:<%= connect.options.port %>',
				app: 'Google Chrome'
			}
		},


		/**
			* Generates a KSS living styleguide
			* https://github.com/t32k/grunt-kss
		*/
		// kss: {
		// 	dist: {
		// 		options: {
		// 			includeType: 'css',
		// 			includePath: '<%= project.css %>',
		// 			template: 'dev/styleguide/template'
		// 		},
		// 		files: {
		// 			'dev/styleguide': ['<%= project.sassDir %>']
		// 		},
		// 	}
		// },


		/**
			* Runs tasks against changed watched files
			* https://github.com/gruntjs/grunt-contrib-watch
			* Watching development files and run concat/compile tasks
			* Livereload the browser once complete
		*/
		watch: {
			sass: {
				files: '<%= project.scssDir %>/**/*.scss',
				tasks: ['sass:dist', 'autoprefixer:dist']
			},
			bake: {
				files: ['<%= project.src %>/templates/**/*.html'],
				tasks: ['bake:build']
			},
			concat: {
				files: '<%= project.src %>/js/**/*.js',
				tasks: ['concat']
			},
			livereload: {
				options: {
					livereload: LIVERELOAD_PORT
				},
				files: [
					'<%= project.dist %>/**/*.html',
					'<%= project.cssDir %>/**/*.css',
					'<%= project.dist %>/js/**/*.js',
					'<%= project.dist %>/**/*.{png,jpg,jpeg,gif,webp,svg}'
				]
			}
		}

	});

	/**
		* Default task
		* Run `grunt` on the command line
	*/
	grunt.registerTask('default', [
		'connect:livereload',
		'watch'
	]);


	/**
		* Default task
		* Run `grunt` on the command line
	*/
	grunt.registerTask('openup', [
		'connect:livereload',
		'open',
		'watch'
	]);


	/**
		* Build task
		* Run `grunt build` on the command line
		* Then compress all JS/CSS files
	*/
	grunt.registerTask('build', [
		'clean:dist',
		'copy:images',
		'sass',
		'autoprefixer',
		'bake'
	]);

};