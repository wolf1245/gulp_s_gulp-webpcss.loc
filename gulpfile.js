// папка с готовым проектом с именем проекта как и папка с рабочим проектом
const projectedRezult = require("path").basename(__dirname);
// папка с ресурсами во время разработки
const projectedSourse = "#src";

// пути к файлам и папкам
const path = {
  // пути куда gulp будет выгружать обработыные файлы
  build:{
    html: projectedRezult + "/",
    pages: projectedRezult + "/pages/",
    css: projectedRezult + "/css/",
    img: projectedRezult + "/img/",
    js: projectedRezult + "/js/",
    md: projectedRezult + "/"
  },
  // пути откуда gulp будет брать исходники
  src:{
    // считываем все html, но делаем исключения для файлов с _, это у нас модули файла индекс 
    html: [projectedSourse + "/*.html", "!" + projectedSourse + "/_*.html"],
    // считываем все подпапки что находиться в нутри
    pages: projectedSourse + "/pages/**/*.{tpl,html}",
    // считываем файлы все файлы .scss для генерации .css в папке dist и файлы css, файлы по приоритету, иначе работать не будут
    css: projectedSourse + "/css/*.{scss,css}",
    // считываем все подпапки что находиться в нутри img. с любым названием, но с расширением которое укажем
    img: projectedSourse + "/img/*.{jpg,png,svg,gif,ico,webp}",
    // считываем только файл script.js
    js: projectedSourse + "/js/script.js",
    md: projectedSourse + "/*.md"
  },
  // файлы в которым постоянно отлавливаем изменеения или слушаем изменения
  watch:{
    // слушаем все html
    html: projectedSourse + "/*.html",
    // считываем все подпапки что находиться в нутри
    pages: projectedSourse + "/pages/**/*.{tpl,html}",
    // слушаем файлы все файлы .scss для генерации .css в папке dist и файлы css, файлы по приоритету, иначе работать не будут
    css: projectedSourse + "/css/*.{scss,css}",
    // слушаем все подпапки что находиться в нутри img. с любым названием, но с расширением которое укажем
    img: projectedSourse + "/img/*.{jpg,png,svg,gif,ico,webp}",
    // слушаем все подпапки, файлы с любым названием с разшерением js
    js: projectedSourse + "/js/*.js",
    md: projectedSourse + "/*.md"
  },
  // объект отвечает за удаление после каждого перезапуска
  clean: "./" + projectedRezult + "/"
};

// переменные для написания сценария
const { src, dest } = require('gulp');
// сам галп
const  gulp = require('gulp');
// пакет автоперезагрузки страницы
const  browserSyng = require('browser-sync').create();
// пакет сборки из разных модулей html в 1
const fileInclude = require('gulp-file-include');
// пакет удаление ненужных файлов из папки dist
const autoDel = require('del');
// пакет sass
const scss = require('gulp-sass');
// пакет автопрефикс кроссбраузерности
const autoPref = require('gulp-autoprefixer');
// очистка отненужного файла цсс на выходе в релиз
const clearCss = require('gulp-clean-css');
// пакет gulp-rename
const gRename = require('gulp-rename');
// пакет сжатия js
const minJs = require('gulp-uglify-es').default;
// пакет сжатия img
const imagemin = require('gulp-imagemin');
// пакет конвентирования в формат webp
const webp = require('gulp-webp');
// пакет который подключает формат webpм в html
const webpHtml = require('gulp-webp-html');
// пакет который подключает формат webpм в html
const webpCss = require('gulp-webpcss');
// пакет для svg sprite
const svgSprite = require('gulp-svg-sprite');

// ф-я перезапуска страницы
function browserSyngAut()
{
  browserSyng.init({
    // сервер
    server: {
      // базовая папка
      baseDir: "./" + projectedRezult + "/",
    },
    // порт по которому будет открываться
    port: 3000,
    // отключаем табличку что браузер переобновился
    notify: false
  })
};

// ф-я считывания и изменения html из src файлов
function echoHtml()
{
  // pipe через которую мы обращаемся к gulp
  // просим наш файл html собрать из имеющихся модулей html
  // подключчаем фромат webp в html
  // ф-я возращает файл измененый из src в папку рузультата dist
  // обновляем странцу после этого
  return src(path.src.html)
    .pipe(fileInclude())
    .pipe(webpHtml())
    .pipe(dest(path.build.html))
    .pipe(browserSyng.stream())
}

// ф-я считывания и изменения scss из src файлов
function echoScss()
{
  // pipe через которую мы обращаемся к gulp
  // обработка с указаниями как обработать
  // ф-я добавления автопрефиксов кроссбраузерности
  // подключаем формат webp в css ссылка https://iamdroid.net/ru/blog/image-optimization-with-webp
  // ф-я возращает файл измененый из src в папку рузультата 1 файла dist не сжатый
  // обновляем странцу после этого нужно для кеша
  // ф-я очистки и минимизации цсс
  // переменовуем файл с min.css
  // ф-я возращает файл измененый из src в папку рузультата 2 файла dist сжатый
  // обновляем странцу после этого
  return src(path.src.css)
    .pipe(scss({
        outputStyle: "expanded"
    }))
    .pipe(autoPref({
        overrideBrowserslist: ["last 5 version"],
        cascade: true
      })
    )
    .pipe(webpCss({ webpClass: '', noWebpClass: '.no-webp' }))
    .pipe(dest(path.build.css))
    .pipe(browserSyng.stream())
    .pipe(clearCss())
    .pipe(gRename({
        extname: ".min.css"
    }))
    .pipe(dest(path.build.css))
    .pipe(browserSyng.stream())
}

// ф-я считывания и изменения js из src файлов
function echoJs()
{
  // pipe через которую мы обращаемся к gulp
  // просим наш файл js собрать из имеющихся модулей js
  // ф-я возращает файл измененый из src в папку рузультата dist 1 файл не сжатый
  // обновляем странцу после этого нужно для кеша
  // ф-я сжатия файла js
  // ф-я переменовования файла
  // ф-я возращает файл измененый из src в папку рузультата dist 2 файл сжатый
  // обновляем странцу после этого
  return src(path.src.js)
    .pipe(fileInclude())
    .pipe(dest(path.build.js))
    .pipe(browserSyng.stream())
    .pipe(minJs())
    .pipe(gRename({
      extname: ".min.js"
    }))
    .pipe(dest(path.build.js))
    .pipe(browserSyng.stream())
}

// ф-я считывания и изменения img из src файлов
function echoImg()
{
  // pipe через которую мы обращаемся к gulp
  // конвертируем в формат webp
  // выгружаемформат webp
  // обновляем странцу после этого
  // считываем картинки заново
  // сжимаем их
  // ф-я возращает файл измененый из src в папку рузультата dist
  // обновляем странцу после этого
  return src(path.src.img)
    .pipe(webp({
        quality: 70
    }))
    .pipe(dest(path.build.img))
    .pipe(browserSyng.stream())
    .pipe(src(path.src.img))
    .pipe(imagemin({
        interlaced: true,
        progressive: true,
        svgoPlugins: [{removeViewBox: false}],
        optimizationLevel: 5, // от 0 до 7
    }))
    .pipe(dest(path.build.img))
    .pipe(browserSyng.stream())
}

// ф-я считывания и изменения md файла
function echoMd()
{
  return src(path.src.md)
  .pipe(dest(path.build.md))
  .pipe(browserSyng.stream())
}

// ф-я считывания и изменения файлов pages файла
function echoPages()
{
  return src(path.src.pages)
  .pipe(dest(path.build.pages))
  .pipe(browserSyng.stream())
}

// gulp task для svg вызывающийся отдельно
// обьеденяем спрайты
// выгружаем спрайты в папку dist
// запускаем сначала gulp, после всех задач, в отдельном терминале вызываем task: gulp svgSprite
gulp.task('svgSprite', function() {
  return gulp.src([projectedSourse + '/iconsprite/*.svg'])
    .pipe(svgSprite({
        mode: {
          stack: {
            sprite: "..icons/icons.svg", // sprite file name
            //example: true // создает html пример
          }
        }
    }))
    .pipe(dest(path.build.img))
})



// ф-я слежки за файлами, изменения которые произошли
function agent007()
{
  // из обьекта watch, и присваеваем ф-ю которая обрабатывает html
  gulp.watch([path.watch.html], echoHtml)
  //из обьекта watch, и присваеваем ф-ю которая обрабатывает scssи css
  gulp.watch([path.watch.css], echoScss)
  //из обьекта watch, и присваеваем ф-ю которая обрабатывает js
  gulp.watch([path.watch.js], echoJs)
  //из обьекта watch, и присваеваем ф-ю которая обрабатывает img
  gulp.watch([path.watch.img], echoImg)
  //из обьекта watch, и присваеваем ф-ю которая обрабатывает md
  gulp.watch([path.watch.md], echoMd)
  //из обьекта watch, и присваеваем ф-ю которая обрабатывает md
  gulp.watch([path.watch.pages], echoPages)
}

// ф-я автоудаления папки dist
function del()
{
  return autoDel(path.clean);
}

// запуск ф-и стилей, +  которые должны выполняться + одновременон выполнение
let build = gulp.series(del, gulp.parallel(echoHtml, echoImg, echoScss, echoJs, echoMd, echoPages));
// запуск ф-и файлов папки dist, отслеживание изменений файлов папки src, перезагрузка старницы
let watch = gulp.parallel(build, agent007, browserSyngAut);

// чтоб gulp заметил переменые новые
exports.html = echoHtml;
exports.css = echoScss;
exports.js = echoJs;
exports.img = echoImg;
exports.md = echoMd;
exports.pages = echoPages;
exports.build = build;
exports.watch = watch;
exports.default = watch;