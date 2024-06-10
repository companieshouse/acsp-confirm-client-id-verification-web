const gulp = require("gulp");
const dartSass = require("sass");
const gulpSass = require("gulp-sass");
const clean = require("gulp-clean");
const concat = require("gulp-concat");
const uglify = require("gulp-uglify");
const exec = require("child_process").exec;

const sass = gulpSass(dartSass);

const srcDirJs = "./assets/src/js";
const srcDirCss = "./assets/src/scss";
const dstDirJs = "./assets/public/js";
const dstDirCss = "./assets/public/css";
const dstDirAssets = "./assets/public";

// Purge all before building
gulp.task("clean", () => {
    return gulp.src([dstDirJs, dstDirCss], { read: false, allowEmpty: true })
        .pipe(clean());
});

// Build and minify all .scss files into app.min.css
gulp.task("sass", () => {
    return gulp
        .src([`${srcDirCss}/**/*.scss`])
        .pipe(concat("app.min.css"))
        .pipe(sass({
            errLogToConsole: true,
            outputStyle: "compressed",
            indentedSyntax: false,
            includePaths: [
                "node_modules/govuk_frontend_toolkit/stylesheets",
                "node_modules/govuk-elements-sass/public/sass"
            ]
        })
            .on("error", sass.logError))
        .pipe(gulp.dest(dstDirCss));
});

// Build and minify all .js files into app.min.js
gulp.task("js", () => {
    return gulp
        .src([`${srcDirJs}/*.js`, `${srcDirJs}/lib/*.js`])
        .pipe(concat("app.min.js"))
        .pipe(uglify())
        .pipe(gulp.dest(dstDirJs));
});

// Copy the fonts and images from the govuk-frontend package to the public directory
gulp.task("govuk-assets", () => {
    return gulp
        .src(["./node_modules/govuk-frontend/govuk/assets/**/*"])
        .pipe(gulp.dest(dstDirAssets));
});

// Binding all tasks together...
gulp.task("build", gulp.series(["clean", "sass", "js", "govuk-assets"]));

// Watch for changes to JS and SASS files
gulp.task("watch", gulp.series(() => {
    gulp.watch([`${srcDirCss}/*.scss`], gulp.series("sass"));
    gulp.watch([`${srcDirJs}/*.js`, `${srcDirJs}/lib/*.js`], gulp.series("js"));
}));

gulp.task("serve", gulp.series("build", () => {
    exec("npm start", function (err, stdout, stderr) {
        if (err) {
            console.log(err);
        }
        console.log(stdout);
        console.log(stderr);
    });
}));

gulp.task("default", gulp.series("serve"));
