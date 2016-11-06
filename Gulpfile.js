var gulp = require('gulp'),
    webserver = require('gulp-webserver'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    precss = require('precss'),
    imagemin = require('gulp-imagemin'),
    php2html = require('gulp-php2html'),
    htmlmin = require('gulp-htmlmin'),
    minify = require('gulp-minify'),
    cssnano = require('cssnano'),
    rev = require('gulp-rev'),
    revReplace = require('gulp-rev-replace'),
    revDel = require('rev-del'),

    limbo = 'limbo/',
    source = 'development/',
    dest = 'production/';

// Optimize images through gulp-image
gulp.task('imageoptim', function() {
    gulp.src(source + 'images/**/*.{jpg,JPG}')
    .pipe(imagemin())
    .pipe(gulp.dest(dest + 'images'));
});


// HTML
gulp.task('html', function() {
    return gulp.src(source + '*.{html,php}')
    //.pipe(php2html())
    .pipe(htmlmin({
        collapseWhitespace: true,
        minifyJS: true,
        removeComments: true
    }))
    .pipe(gulp.dest(limbo)); // moving all html files to limbo
});

// JavaScript
gulp.task('javascript', function() {
    return gulp.src(source + 'JS/**/*.js')
    .pipe(minify({
        // exclude the libs directory from minification
        exclude: ['libs']
    }))
    .pipe(gulp.dest(limbo + 'JS')); // moving all js files to limbo
});

// CSS
gulp.task('css', function() {
    return gulp.src(source + '**/*.css')
    .pipe(postcss([
        precss(),
        autoprefixer(),
        cssnano()
    ]))
    .pipe(gulp.dest(limbo)); // moving all css files to limbo
});

// Rename assets based on content cache
gulp.task('revision', ['html','css','javascript'], function() { //before i run revision i need to run html,css and js
    return gulp.src(limbo + '**/*.{js,css}')
    .pipe(rev())   //appending hashes
    .pipe(gulp.dest(dest)) // now place them in destination folder(production)
    .pipe(rev.manifest()) //The manifest is a .json file that lists the original file name and the new file name with the hash, so therefore we can compare them.
    .pipe(revDel({dest: dest})) // rev-del will compare manifest file comparing original and new changes in production folder and deletes old file in production folder
    .pipe(gulp.dest(dest));
});

// Replace URLs with hashed ones based on rev manifest.
// Runs immediately after revision:
gulp.task('revreplace', ['revision'], function() { // before i run revreplace i will revision which also runs html,css and js
    var manifest = gulp.src(dest + 'rev-manifest.json');

    return gulp.src(limbo + '**/*.html')
    .pipe(revReplace({manifest: manifest}))
    .pipe(gulp.dest(dest));
});

// Watch everything
gulp.task('watch', function() {
    gulp.watch(source + '**/*.{html,css,js}', ['revreplace']); // on change in any html,css and js files i will trigger revreplace which runs revision and html,css,js
    gulp.watch(source + 'images/**/*.{jpg,JPG}', ['imageoptim']);
});

// Run a livereload web server because lazy
gulp.task('webserver', function() {
    gulp.src(dest)
    .pipe(webserver({
        livereload: true,
        open: true
    }));
});

// Default task (runs at initiation: gulp --verbose)
gulp.task('default', ['imageoptim', 'revreplace', 'watch', 'webserver']);
