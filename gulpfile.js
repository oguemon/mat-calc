// Sass configuration
const gulp = require('gulp');
const sass = require('gulp-sass');
const typescript = require('gulp-typescript');
const browsersync = require('browser-sync');
const closureCompiler = require('google-closure-compiler').gulp();

/*
var browserify = require('browserify');
var source     = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');
*/

gulp.task('sass', function() {
    return gulp.src('./sass/*.scss')
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(gulp.dest('./'))
});
/*
gulp.task('bundlejs', function() {
    return browserify('./js/mat-det-inv.js')
            .bundle()
            .pipe(source('mat-det-inv.min.js'))
            .pipe(gulp.dest('./'));
});
*/
gulp.task('compile-js-dev', function() {
    return gulp.src('./ts/*.ts')
            .pipe(typescript({
                target: 'ES6',
                removeComments: true,
                out: 'mat-det-inv.min.js'
            }))
            .pipe(gulp.dest('./'));
});

gulp.task('compile-js-release', function() {
    return gulp.src('./ts/*.ts')
            .pipe(typescript({
                target: 'ES6',
                removeComments: true
            }))
            .pipe(closureCompiler({
                compilation_level: 'SIMPLE',
                warning_level: 'DEFAULT',
                language_in: 'ECMASCRIPT_2015',
                language_out: 'ECMASCRIPT_2015',
                js_output_file: 'mat-det-inv.min.js'
            }))
            .pipe(gulp.dest('./'));
});

gulp.task('build-server', function (done) {
    browsersync.init({
        server: {
            baseDir: "./",
            index  : "mat-det-inv.html"
        }
    });
    done();
    console.log('Server was launched');
});

gulp.task('browser-reload', function (done){
    browsersync.reload();
    done();
    console.log('Browser reload completed');
});

gulp.task('watch-dev', function() {
    gulp.watch('./*.html', gulp.series('browser-reload'));
    gulp.watch('./sass/*.scss', gulp.series('sass', 'browser-reload'));
    gulp.watch('./ts/*.ts', gulp.series('compile-js-dev', 'browser-reload'));
    //gulp.watch('./js/mat-det-inv.js', gulp.parallel('bundlejs'));
});

const tasks_dev = gulp.series('build-server', 'watch-dev');
gulp.task('develop', tasks_dev);

const tasks_release = gulp.series('sass', 'compile-js-release');
gulp.task('release', tasks_release);
