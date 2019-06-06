// Sass configuration
var gulp = require('gulp');
var sass = require('gulp-sass');
var browserify = require('browserify');
var source     = require('vinyl-source-stream');
var buffer     = require('vinyl-buffer');
var closureCompiler = require('google-closure-compiler').gulp();

gulp.task('sass', function() {
    return gulp.src('./sass/*.scss')
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(gulp.dest('./'))
});
gulp.task('bundlejs', function() {
    return browserify('./js/mat-det-inv.js')
            .bundle()
            .pipe(source('mat-det-inv.min.js'))
            .pipe(gulp.dest('./'));
});
gulp.task('minifyjs', function() {
    return gulp.src('./js/mat-det-inv.js')
            .pipe(closureCompiler({
                compilation_level: 'SIMPLE',
                warning_level: 'VERBOSE',
                language_in: 'ECMASCRIPT_2015',
                language_out: 'ECMASCRIPT_2015',
                js_output_file: 'mat-det-inv.min.js'
                }, {
                platform: ['native', 'java', 'javascript']
                }))
            .pipe(gulp.dest('./'));
});

gulp.task('watch', function() {
    gulp.watch('./sass/*.scss', gulp.parallel('sass'));
    //gulp.watch('./js/mat-det-inv.js', gulp.parallel('minifyjs'));
    gulp.watch('./js/mat-det-inv.js', gulp.parallel('bundlejs'));
});

const defaultTasks = gulp.series('watch');
gulp.task('default', defaultTasks);
