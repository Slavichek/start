let project_folder = "dist";
let source_folder = "#src";

let fs = require("fs");

let path = {
    build: {
        html: project_folder + "/",
        css: project_folder + "/css/",
        js: project_folder + "/js/",
        img: project_folder + "/assets/images/",
        fonts: project_folder + "/assets/fonts/",
        jsLibs: project_folder + "/js/libs/",
        cssLibs: project_folder + "/css/libs/",
    },
    src: {
        html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
        css: source_folder + "/scss/style.scss",
        js: source_folder + "/js/script.js",
        img: source_folder + "/assets/images/**/*.+(png|jpg|gif|ico|svg|webp)",
        fonts: source_folder + "/assets/fonts/**/*.ttf",
        libs: project_folder + "/libs/",
        jsLibs: source_folder + "/js/libs/",
        cssLibs: source_folder + "/css/libs/",
    },
    watch: {
        html: source_folder + "/**/*.html",
        css: source_folder + "/scss/**/*.scss",
        js: source_folder + "/js/**/*.js",
        img: source_folder + "/assets/imgages/**/*.+(png|jpg|gif|ico|svg|webp)",
        jsLibs: project_folder + "/js/libs/",
        cssLibs: project_folder + "/css/libs/",
    },
    clean: "./" + project_folder + "/",
};

let { src, dest } = require("gulp"),
    gulp = require("gulp"),
    browsersync = require("browser-sync").create(),
    fileinclude = require("gulp-file-include"),
    del = require("del"),
    scss = require("gulp-sass"),
    autoprefixer = require("gulp-autoprefixer"),
    media_queries = require("gulp-group-css-media-queries"),
    clean_css = require("gulp-clean-css"),
    rename = require("gulp-rename"),
    uglify = require("gulp-uglify"),
    // uglify = require("gulp-uglify-es").default,
    imagemin = require("gulp-imagemin"),
    ttf2woff = require("gulp-ttf2woff"),
    ttf2woff2 = require("gulp-ttf2woff2"),
    fonter = require("gulp-fonter"),
    webphtml = require("gulp-webp-html"),
    concat = require("gulp-concat"),
    webp = require("gulp-webp");

function browserSync(params) {
    browsersync.init({
        server: {
            baseDir: "./" + project_folder + "/",
        },
        port: 3000,
        notify: false,
    });
}

function html() {
    return src(path.src.html)
        .pipe(fileinclude())
        .pipe(webphtml())
        .pipe(dest(path.build.html))
        .pipe(browsersync.stream());
}
function css() {
    return src(path.src.css)
        .pipe(
            scss({
                outputStyle: "expanded",
            })
        )
        .pipe(media_queries())
        .pipe(
            autoprefixer({
                overrideBrowserslist: ["last 7 versions"],
                cascade: true,
            })
        )
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css",
            })
        )
        .pipe(dest(path.build.css))
        .pipe(browsersync.stream());
}

function js() {
    return src(path.src.js)
        .pipe(fileinclude())
        .pipe(dest(path.build.js))
        .pipe(uglify())
        .pipe(
            rename({
                extname: ".min.js",
            })
        )
        .pipe(dest(path.build.js))
        .pipe(browsersync.stream());
}

function jsLibs() {
    src([
        "#src/libs/jquery/dist/jquery.js",
        // "#src/libs/bootstrap/bootstrap.js",
        // "#src/libs/owl.carousel/dist/owl.carousel.js",
        // "#src/js/common.js", //always end if need
    ])
        .pipe(concat("libs.js"))
        .pipe(uglify())
        .pipe(
            rename({
                extname: ".min.js",
            })
        )
        .pipe(dest(path.src.jsLibs))
        .pipe(dest(path.build.jsLibs))
        .pipe(browsersync.stream());
}

function cssLibs() {
    src([
        // "#src/libs/owl.carousel/dist/assets/owl.carousel.css",
        // "#src/libs/owl.carousel/dist/assets/owl.theme.default.css",
        "#src/css/libs/common.css", //always end if need
    ])
        .pipe(concat("libs.css"))
        .pipe(dest(path.build.css))
        .pipe(clean_css())
        .pipe(
            rename({
                extname: ".min.css",
            })
        )
        .pipe(dest(path.src.cssLibs))
        .pipe(dest(path.build.cssLibs))
        .pipe(browsersync.stream());
}

function images() {
    return src(path.src.img)
        .pipe(
            webp({
                quality: 70,
            })
        )
        .pipe(dest(path.build.img))
        .pipe(src(path.src.img))
        .pipe(
            imagemin({
                interlaced: true,
                progressive: true,
                optimizationLevel: 3,
                svgoPlugins: [{ removeViewBox: false }],
            })
        )
        .pipe(dest(path.build.img))
        .pipe(browsersync.stream());
}

function fonts() {
    src(path.src.fonts).pipe(ttf2woff()).pipe(dest(path.build.fonts));
    return src(path.src.fonts).pipe(ttf2woff2()).pipe(dest(path.build.fonts));
}
gulp.task("otf2ttf", function () {
    return src([source_folder + "/fonts/*.otf"])
        .pipe(
            fonter({
                formats: ["ttf"],
            })
        )
        .pipe(dest([source_folder + "/fonts/"]));
});

function fontsStyle(cb) {
    let file_content = fs.readFileSync(source_folder + "/scss/base/fonts.scss");
    if (file_content == "") {
        fs.writeFile(source_folder + "/scss/base/fonts.scss", "", cb);
        return fs.readdir(path.build.fonts, function (err, items) {
            if (items) {
                let c_fontname;
                for (var i = 0; i < items.length; i++) {
                    let fontname = items[i].split(".");
                    fontname = fontname[0];
                    if (c_fontname != fontname) {
                        fs.appendFile(
                            source_folder + "/scss/base/fonts.scss",
                            '@include font("' +
                                fontname +
                                '", "' +
                                fontname +
                                '", "400", "normal");\r\n',
                            cb
                        );
                    }
                    c_fontname = fontname;
                }
            }
        });
    }
    cb();
}

function watchFiles(params) {
    gulp.watch([path.watch.html], html);
    gulp.watch([path.watch.css], css);
    gulp.watch([path.watch.js], js);
    gulp.watch([path.watch.img], images);
    gulp.watch([path.watch.jsLibs], jsLibs);
}

function clean(params) {
    return del(path.clean);
}

let build = gulp.series(
    clean,
    gulp.parallel(js, css, html, images, fonts, jsLibs, cssLibs),
    fontsStyle
);
let watch = gulp.parallel(build, watchFiles, browserSync);

exports.cssLibs = cssLibs;
exports.jsLibs = jsLibs;
exports.fontsStyle = fontsStyle;
exports.fonts = fonts;
exports.images = images;
exports.js = js;
exports.css = css;
exports.html = html;
exports.build = build;
exports.watch = watch;
exports.default = watch;

// npm install (node modules)
// gulp otf2ttf (task fonts for otf to ttf) just for otf
//  gulp (start project)
// gulp fontsStyle if needed to require font with mixins
// gulp (start project)

