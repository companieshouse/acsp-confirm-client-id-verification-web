/*
 * Builds the static front-end assets into assets/public.
 *
 * Replaces the previous gulp build so that gulp (and its transitive dependency on the
 * vulnerable `braces` package via gulp-cli/liftoff/findup-sync/micromatch) is no longer needed.
 * Output matches the gulp build: every .scss file under assets/src/scss is concatenated and
 * compiled into a single compressed app.min.css, and the JS sources are concatenated and
 * minified into app.min.js.
 */
const fs = require("fs");
const path = require("path");
const sass = require("sass");
const UglifyJS = require("uglify-js");

const srcDirJs = "./assets/src/js";
const srcDirCss = "./assets/src/scss";
const dstDirJs = "./assets/public/js";
const dstDirCss = "./assets/public/css";

const listFiles = (dir, extension, recursive) => {
    return fs.readdirSync(dir, { withFileTypes: true })
        .sort((a, b) => a.name.localeCompare(b.name))
        .flatMap((entry) => {
            const entryPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                return recursive ? listFiles(entryPath, extension, recursive) : [];
            }
            return entry.name.endsWith(extension) ? [entryPath] : [];
        });
};

// Same separator gulp-concat used, so the concatenated source is identical
const concatFiles = (files) => files.map((file) => fs.readFileSync(file, "utf8")).join("\n");

const clean = () => {
    fs.rmSync(dstDirJs, { recursive: true, force: true });
    fs.rmSync(dstDirCss, { recursive: true, force: true });
};

const buildCss = () => {
    const scssFiles = listFiles(srcDirCss, ".scss", true);
    const result = sass.compileString(concatFiles(scssFiles), {
        style: "compressed",
        loadPaths: [
            process.cwd(),
            "node_modules/govuk_frontend_toolkit/stylesheets",
            "node_modules/govuk-elements-sass/public/sass"
        ],
        // Suppress deprecation warnings raised inside govuk-frontend's own Sass; warnings from our code still show
        quietDeps: true
    });
    fs.mkdirSync(dstDirCss, { recursive: true });
    fs.writeFileSync(path.join(dstDirCss, "app.min.css"), result.css);
};

const buildJs = () => {
    const jsFiles = [...listFiles(srcDirJs, ".js", false), ...listFiles(path.join(srcDirJs, "lib"), ".js", false)];
    const result = UglifyJS.minify(concatFiles(jsFiles));
    if (result.error) {
        throw result.error;
    }
    fs.mkdirSync(dstDirJs, { recursive: true });
    fs.writeFileSync(path.join(dstDirJs, "app.min.js"), result.code);
};

clean();
buildCss();
buildJs();
console.log("Built assets into ./assets/public");
