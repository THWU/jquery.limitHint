const gulp = require('gulp');
const newer = require('gulp-newer');
const babel = require('gulp-babel');
const compass = require('gulp-compass');
const eslint = require('gulp-eslint');
const replace = require('gulp-replace');
const minifyCSS = require('gulp-minify-css');
const uglify = require('gulp-uglify-es').default;
const rename = require("gulp-rename");

function handleError(err) {
    console.log(err.toString());
    this.emit('end');
}

const jsSrc = 'source/*.js';
const jsDest = 'dist';
const cssSrcFolder = 'source';
const cssSrc = 'source/*.scss';
const cssDest = 'dist';
const jspPagesSrc = './pages/*.jsp';
const jspPagesDest = './pages';

gulp.task('eslint_with_babel', function () {
    return gulp.src(jsSrc)
        .on('error', handleError)
        .pipe(newer(jsDest))
        //.pipe(eslint())         //  eslint
        //.pipe(eslint.format())  //  output result to the console
        //.pipe(eslint.failAfterError())      //  Fail when the stream end if any ESLint error occured
        .pipe(babel())
        .pipe(gulp.dest(jsDest));
});

gulp.task('uglify', ['eslint_with_babel'], function() {
    return gulp.src([jsDest + '/*.js', '!' + jsDest + '/*.min.js'])
        .on('error', handleError)
        .pipe(uglify())
        .pipe(rename(function(path) {
            path.basename += ".min";
            path.extname = ".js";
        }))
        .pipe(gulp.dest(jsDest));
});

gulp.task('compass', function () {
    return gulp.src(cssSrc) //來源路徑
        .on('error', handleError)
        .pipe(compass({ //這段內輸入config.rb的內容
            css: cssDest, //compass輸出位置
            sass: cssSrcFolder, //sass來源路徑
            sourcemap: true, //compass 1.0 sourcemap
            style: 'compact', //CSS壓縮格式，預設(nested)
            comments: true //是否要註解，預設(true)
            //require: ['susy'] //額外套件 susy
        }))
    // .pipe(gulp.dest('app/assets/temp')); //輸出位置(非必要)
});

gulp.task('minify-css', ['compass'], function () {
    return gulp.src([cssDest + '/*.css', '!' + cssDest + '/*.min.css'])
        .on('error', handleError)
        .pipe(minifyCSS({
            keepBreaks: true,
        }))
        .pipe(rename(function (path) {
            path.basename += ".min";
            path.extname = ".css";
        }))
        .pipe(gulp.dest(cssDest));
});

gulp.task('watch', function () {
    gulp.watch(jsSrc, ['uglify'])
        .on('error', handleError);
    gulp.watch(cssSrc, ['minify-css'])
        .on('error', handleError);
});

// Default Task
var tskList = [];
tskList.push('watch');
tskList.push('uglify');
tskList.push('minify-css');
gulp.task('default', tskList);