/*\
|*| Author            : Jack Andrew Loudon <https://github.com/blue-eyeswhitedragon>
|*| Date              : 20th October 2016
|*| License           : MPL 2.0 <https://github.com/MARS-Foundations/MARS/LICENSE.md>
|*| Library/Framework : GULP <gulpjs.com> | Node.js <nodejs.org>
|*| Language          : Javascript
\*/

var isDevelopment = true;

var gulp = require("gulp"),
    pug = require("gulp-pug"),
    sass = require("gulp-sass"),
    sourcemaps = require("gulp-sourcemaps"),
    autoprefixer = require("gulp-autoprefixer"),
    minimiser = require("gulp-clean-css"),
    plumber = require("gulp-plumber"),
    del = require("del"),
    vinylPaths = require("vinyl-paths"),
    rename = require("gulp-rename")
;
	
var paths = {
	src : "src/",
	build : "dist/",
	dev : "test/"
};

if (isDevelopment) { paths.build = paths.dev; }

var plumberErrorHandler = function( err ) { console.log("Plumber caught:\n" + err); this.emit("end"); },
	writeToBuild = function ( stream, dir ) {
		return stream
	    .pipe( autoprefixer( { browsers : "last 2 versions" } ) )
	    .pipe( sourcemaps.write() )
	    .pipe( gulp.dest(paths.build + dir) )
	    .pipe( rename( { extname : ".min.css" } ) )
	    .pipe( minimiser() )
	    .pipe( gulp.dest(paths.build + dir) );
	};

/* Build and Watch Tasks */

/* Clean */

var cleanDir = function ( dir ) {
	var currentPath;
	if ( typeof dir === "undefined" ) currentPath = paths.build;
	else if (isDevelopment) {
		currentPath = paths.build + dir.replace(/\/+$/, "");
		if ( dir.indexOf("*") > -1 ) currentPath = currentPath;
		else currentPath += "/";
	}
	console.log("Cleaning build folder: \"" + currentPath + "\"");
	return (
		gulp
		    .src( currentPath, { read : false } )
		    .pipe( vinylPaths( del ) )
	);
};

gulp.task("__clean-css", function () {
	return cleanDir("assets/css");
});

gulp.task("__clean-pug", function () {
	return cleanDir("*.html");
});

gulp.task("__clean-all", function () {
	return cleanDir("*");
});

gulp.task("__clean", ["__clean-pug", "__clean-css"]);

/* Build */

gulp.task("__build-task-pug", function () {
	return (
		gulp
		    .src( paths.src + "pug/*.pug" )
		    .pipe( plumber( plumberErrorHandler ) )
		    .pipe( pug() )
		    .pipe( gulp.dest( paths.build ) )
	);
});

gulp.task("__build-task-sass", function () {
	return writeToBuild(
		gulp
		    .src( paths.src + "sass/*.scss" )
		    .pipe( plumber( plumberErrorHandler ) )
		    .pipe( sourcemaps.init() )
		    .pipe( sass( { outputStyle : "expanded" } ) ),
		"assets/css/"
	);
});

gulp.task("__build", ["__clean", "__build-pug", "__build-sass"]);
gulp.task("__build-pug", ["__clean-pug", "__build-task-pug"]);
gulp.task("__build-sass", ["__clean-css", "__build-task-sass"]);

/* Watch */

gulp.task("__watch-pug", function () {
	gulp.watch(paths.src + "pug/**/*.pug", ["__build-pug"]);
});

gulp.task("__watch-sass", function () {
	gulp.watch(paths.src + "sass/**/*.scss", ["__build-sass"]);
});

gulp.task("__watch", ["__watch-pug", "__watch-sass"]);

/* Default and Help */

gulp.task("default", ["__build"]);