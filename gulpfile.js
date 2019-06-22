// Sass configuration
const gulp = require('gulp');
const sass = require('gulp-sass');
const typescript = require('gulp-typescript');
const browsersync = require('browser-sync');

/*
var browserify = require('browserify');
var source     = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');
var closureCompiler = require('google-closure-compiler').gulp();
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
gulp.task('compile-js', function() {
    return gulp.src('./ts/*.ts')
            .pipe(typescript({
                target: 'ES5',
                removeComments: true,
                out: 'mat-det-inv.min.js'
            }))
            /*
            .pipe(closureCompiler({
                compilation_level: 'SIMPLE',
                warning_level: 'VERBOSE',
                language_in: 'ECMASCRIPT_2015',
                language_out: 'ECMASCRIPT_2015',
                js_output_file: 'mat-det-inv.min.js'
                }, {
                platform: ['native', 'java', 'javascript']
                }))
            */
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

gulp.task('watch', function() {
    gulp.watch('./*.html', gulp.series('browser-reload'));
    gulp.watch('./sass/*.scss', gulp.series('sass', 'browser-reload'));
    gulp.watch('./ts/*.ts', gulp.series('compile-js', 'browser-reload'));
    //gulp.watch('./js/mat-det-inv.js', gulp.parallel('bundlejs'));
});

const defaultTasks = gulp.series('build-server', 'watch');
gulp.task('default', defaultTasks);
