// Sass configuration
const gulp = require('gulp');
const sass = require('gulp-sass');
const typescript = require('gulp-typescript');

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

gulp.task('watch', function() {
    gulp.watch('./sass/*.scss', gulp.parallel('sass'));
    gulp.watch('./ts/*.ts', gulp.parallel('compile-js'));
    //gulp.watch('./js/mat-det-inv.js', gulp.parallel('bundlejs'));
});

const defaultTasks = gulp.series('watch');
gulp.task('default', defaultTasks);
