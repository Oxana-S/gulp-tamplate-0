//Этот файл содержит логику работы всей сборки проекта
let project_folder = "build"; //Переменная для папки результата проекта, выгружается на сервер и передается заказчику
let source_folder = "src"; //Переменная для папки с исходниками проекта, рабочая папка используется только нами при разработке

//Объекты для путей ко всем папкам и файлам
let path = {
	build: {
		html: project_folder + "/",
		// css: project_folder + "/css/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		img: project_folder + "/img/",
		fonts: project_folder + "/fonts/",
		vnd_js: project_folder + "/js/vnd/",
		vnd_css: project_folder + "/css/vnd/"
	},
	src: {
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		// css: source_folder + "/scss/styles.scss",
		css_a: source_folder + "/scss/*.scss",
		css_b: source_folder + "/css/",
		// js: source_folder + "/js/scripts.js",
		js: source_folder + "/js/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		fonts: source_folder + "/fonts/*.ttf",
		vnd_js: source_folder + "/js/vnd/**/*.js",
		vnd_css: source_folder + "/scss/vnd/**/*.{css,scss}"
	},
	watch: {
		html: source_folder + "/**/*.html",
		css: source_folder + "/scss/**/*.scss",
		js: source_folder + "/js/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		vnd_css: source_folder + "/scss/vnd/**/*.css", // добавил пути для слежения за изменениями файлов в папке scss/vnd
		vnd_js: source_folder + "/js/vnd/**/*.js", // добавил пути для слежения за изменениями файлов в папке js/vnd
		fonts: source_folder + "/fonts/*.ttf" // добавил пути для слежения за изменениями файлов шрифтов в папке fonts/

	},
	clean: "./" + project_folder + "/" //пути для команды очистки 
}



const { src, dest, parallel, series, watch } = require('gulp'); //вспомогательные переменные
const gulp = require('gulp'); //подключение gulp (для использование команд по умолчанию)
let browsersync = require('browser-sync').create(); //синхронизация браузера
let fileinclude = require('gulp-file-include'); //плагин для выноса отдельных блоков
let del = require('del'); //плагин удаление файлов
let scss = require('gulp-sass'); //плагин препроцессора sass
let sourcemaps = require('gulp-sourcemaps');
let autoprefixer = require('gulp-autoprefixer'); //добавления префиксов к css свойствам
let group_media = require("gulp-group-css-media-queries"); //группировка медиа запросов
let clean_css = require("gulp-clean-css"); //чистка и сжатие css
let rename = require("gulp-rename"); //переименовывание файла
let imagemin = require("gulp-imagemin"); //оптимизация изображений
let uglify = require("gulp-uglify-es").default; //сжатие js
let webp = require('gulp-webp'); //плагин для webp формата
let beautify = require('gulp-beautify');//
let webphtml = require('gulp-webp-html');
let webpcss = require('gulp-webp-css');
let svgSprite = require('gulp-svg-sprite');
let plumber = require('gulp-plumber');
let concat = require('gulp-concat');
let order = require('gulp-order');


// Шрифты - 
let ttf2woff = require('gulp-ttf2woff');
let ttf2woff2 = require('gulp-ttf2woff2');
let fonter = require('gulp-fonter');

// Шрифты - переменная для записи и подключения шрифтов к стилям
let fs = require('fs');


function browserSync(done) {
	browsersync.init({
		server: {
			baseDir: "./" + project_folder + "/" //указываем папку запуска файлов (то от куда будут запускаться исходные файлы)
		},
		port: 3000, //указываем порт для локального сервера
		notify: false //выключаем уведомление о перезагрузки страницы
	});
	done();
}

// *Общедоступные задачи:


function css() {
	return src(path.src.css, {}) //путь к исходным css файлам
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(
			scss({
				outputStyle: "expanded" //формирование развернутого файла
			}).on('error', scss.logError)
		)
		.pipe(group_media())
		.pipe(
			autoprefixer({
				grid: true,
				overrideBrowserslist: ["last 5 versions"], //поддержка версий браузеров
				cascade: true //стиль написание автопрефикса 
			}))
		.pipe(webpcss())

		.pipe(dest(path.build.css))
		.pipe(browsersync.stream()) //синхронизация браузера
		.pipe(clean_css())
		.pipe(rename({ extname: ".min.css" }))
		.pipe(sourcemaps.write('.'))   // создание карты css.map в текущей папке

		.pipe(dest(path.build.css)) //путь к выходящим css файлам

}
function cssTask() {
	return src(path.src.css_a, {}) //путь к исходным css файлам
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(
			scss({
				outputStyle: "expanded" //формирование развернутого файла
			}).on('error', scss.logError)
		)
		.pipe(group_media())
		.pipe(
			autoprefixer({
				grid: true,
				overrideBrowserslist: ["last 5 versions"], //поддержка версий браузеров
				cascade: true //стиль написание автопрефикса 
			}))
		.pipe(webpcss())

		.pipe(dest(path.src.css_b))

		// .pipe(browsersync.stream()) //синхронизация браузера
		// .pipe(clean_css())
		// .pipe(rename({ extname: ".min.css" }))
		.pipe(sourcemaps.write('.'))   // создание карты css.map в текущей папке

		// .pipe(dest(path.build.css)) //путь к выходящим css файлам

}




function vnd_css() {
	return src(path.src.vnd_css)
		.pipe(
			autoprefixer({
				overrideBrowserslist: ["last 5 versions"], //поддержка версий браузеров
				cascade: true //стиль написание автопрефикса 
			}))
		.pipe(dest(path.build.vnd_css))
		.pipe(browsersync.stream()); //синхронизация браузера
}

function html() {
	return src(path.src.html) //путь к исходным html файлам
		.pipe(fileinclude()) //обращаемся к fileinclude
		.pipe(webphtml()) //формирование путей к webp
		.pipe(beautify.html())//
		.pipe(dest(path.build.html)) //путь к выходящим html файлам
		.pipe(browsersync.stream()); //синхронизация браузера
}

// это js-функция, по моему не нужен
function js() {
	return src(path.src.js) //путь к исходным js файлам
		.pipe(fileinclude()) //обращаемся к fileinclude
		.pipe(gulp.dest(path.build.js))
		.pipe(uglify(/* options */))
		.pipe(
			rename({
				extname: ".min.js"
			}))
		.pipe(dest(path.build.js)) //путь к выходящим js файлам
		.pipe(browsersync.stream()); //синхронизация браузера
}

function vnd_js() {
	return src(path.src.vnd_js)
		.pipe(uglify(/* options */))
		.pipe(dest(path.build.vnd_js))
		.pipe(browsersync.stream()); //синхронизация браузера
}

function jsTask() {
	return src(path.src.js)
		.pipe(sourcemaps.init())
		.pipe(order([
			"vnd/jquery/*.js",
			"vnd/**/*.js",
			"libs/**/*.js",
			"kscripts.js",
			"main.js"
		]))
		.pipe(concat("scripts.js"))
		.pipe(gulp.dest(path.build.js))
		.pipe(uglify(/* options */))
		.pipe(
			rename({
				extname: ".min.js"
			}))
		.pipe(sourcemaps.write())
		.pipe(dest(path.build.js))
	}
	

function img() {
	return src(path.src.img) //путь к исходным img файлам
		.pipe(
			webp({
				quality: 70
			})
		)
		.pipe(dest(path.build.img))
		.pipe(src(path.src.img))

		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }], //работа с svg
				interlaced: true, //работа с другими форматами изображений
				optimizationLevel: 3 // 0 to 7 //Уровень сжатия
			})
		)
		.pipe(dest(path.build.img)) //путь к выходящим img файлам
		.pipe(browsersync.stream()) //синхронизация браузера
}

//* Частная Задача. svgSprite - отдельная задача (ЕСЛИ есть необходимость) для svg спрайтов
gulp.task('svgSprite', function () {
	return gulp.src([source_folder + '/iconsprite/*.svg'])
		.pipe(svgSprite({
			mode: {
				stack: {
					sprite: "../iconsprite/icons.svg",
					example: true
				}
			},
		}
		))
		.pipe(dest(path.build.img))
})

// ANCHOR Шрифты - Конвертация ttf в woff
function fonts(params) {
	console.log('\n Начался процесс конвертации ttf файлов в woff и woff2 \n');
	src(path.src.fonts)
		.pipe(ttf2woff())
		.pipe(dest(path.build.fonts));
	
	let $ttf2woff2 = src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts));
	console.log('\n Закончился процесс конвертации ttf файлов в woff и woff2 \n');
	let l =length.$ttf2woff2;
		return $ttf2woff2;
}

//* Частная Задача. Шрифты - отдельная задача (ЕСЛИ есть необходимость) для конвертации otf в ttf
gulp.task('otf2ttf', function () {
	return src([source_folder + '/fonts/*.otf'])
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest(source_folder + '/fonts/'));
})

// Не Использую эту функцию !!! 
//Шрифты - Для подключение шрифтов 
async function includeFonts() {
	return fs.readdir(path.build.fonts, 'utf8', (error, fontFiles) => {
		let pluggableFonts = '';
		const addedFonts = new Set();
		for (let fontFile of fontFiles) {
			const fontName = fontFile.split('.')[0];
			if (!addedFonts.has(fontName)) {
				pluggableFonts += '@include font("' + fontName + '", "' + fontName + '", "400", "normal");\r\n';
				addedFonts.add(fontName);
			}
		}
		fs.writeFile(source_folder + '/scss/_fonts.scss', pluggableFonts, () => { });
	});
}

// Шрифты - Прописывает шрифты в файл стилей в build/ Использует миксин (см. _mixin.scss) 
async function fontStyle() {
	let file_content = fs.readFileSync(source_folder + '/scss/fonts.scss');
	if (file_content == '') {
		console.log('\n Файл _fonts.scss - Пустой, Процесс пошел!');
		fs.writeFile(source_folder + '/scss/fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				let $numbers_fonts = items.length; 
				console.log('\n Надо обработать ' + $numbers_fonts + ' шрифтов');
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(source_folder + '/scss/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
					console.log('\n Шрифт № ' + i + ' обработан, осталось ' + items.length - i);
				}
			}
			console.log('\n Все Шрифты обработаны');
		})
	} else {
		console.log('\n_fonts.scss - Не пустой, удалить всё содержимое\n');
	}
}

// Шрифты - функция call back, нужна для подключения шрифтов в файл со стилями для fontStyle() . Просто функция с названием.
function cb() { }

// Очистка папки build 
function clean() {
	return del(path.clean);
}

// Очистка Терминала
async function cleanTerminal() {
	console.group();
	for (let i = 0; i < 10; i++) {
		console.log('\n');
	}
	console.groupEnd("End ");
}


//Отслеживание файлов для синхронизации
function watchFiles() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.js], js);
	gulp.watch([path.watch.img], img);
	gulp.watch([path.watch.img], img);
	gulp.watch([path.watch.vnd_css], vnd_css); // добавил слежение за файлами в папке scss/vnd
	gulp.watch([path.watch.vnd_js], vnd_js); // добавил слежение за файлами в папке js/vnd
	gulp.watch([path.watch.fonts], fonts); // добавил слежение за файлами шрифтов в папке fonts/

}

// Команды для запуска:
// build 
let build = gulp.series(clean, gulp.parallel(js, css, html, img, fonts, vnd_js, vnd_css), includeFonts, fontStyle);
let watch_build = gulp.parallel(build, watchFiles, browserSync);
// develop - для работы, чтобы время не тратить на шрифты и картинки, watch долго запускается 
let develop = gulp.series(clean, gulp.parallel(js, css, html, vnd_js, vnd_css));
let watch_develop = gulp.parallel(develop, watchFiles, browserSync);
// production
let production = gulp.series(clean, gulp.parallel(js, css, html, vnd_js, vnd_css));
let watch_production = gulp.parallel(production, watchFiles, browserSync);
// только для проверки подключения Шрифтов
let fonts_check = gulp.series(cleanTerminal, clean, gulp.parallel(css, html), fonts, gulp.parallel(fontStyle));
let watch_fonts_check = gulp.parallel(fonts_check, watchFiles, browserSync);


// Общедоступные Задачи
exports.html = html; //срабатывание команды html

exports.css = css; //срабатывание команды css
exports.cssTask = cssTask; //срабатывание команды css

exports.vnd_css = vnd_css; // запуск команды для обновления css файлов папке vnd 

exports.jsTask = jsTask; //срабатывание команды js
exports.vnd_js = vnd_js; // запуск команды для обновления js файлов папке vnd 
exports.js = js; //срабатывание команды js

exports.img = img; //срабатывание команды img

exports.fontStyle = fontStyle; //запуск команды подключение шрифтов в файл стилей
exports.fonts = fonts; //запуск команды для шрифтов
exports.includeFonts = includeFonts; //запуск команды подключение шрифтов

exports.clean = clean; //запуск удаления директории - build
exports.cleanTerminal = cleanTerminal; // Очистка - Терминала

/* Схема следующая:
1. build, он работает очень долго. Время основное забирает пере конвертация ttf шрифты в woff, прописывает и подключает шрифты в файлы fonts и styles; также обжимает картинки.
2. develop, режим разработки, отключены шрифты, картинки 
3. production надо подумать и доработать*/
exports.build = build; //первый, для проверки загрузки шрифтов и оптимизации картинок
exports.watch_build = watch_build; //
exports.develop = develop; // разработка, без обновления шрифтов и картинок 
exports.watch_develop = watch_develop; //
exports.production = production; // в продакшен 
exports.watch_production = watch_production; //
/*По умолчанию поставил режим разработки. Всегда можно поменять*/
exports.default = watch_develop; //запуск gulp который по умолчанию перенаправляет на срабатывание watch
// Проверка работы с шрифтами:
exports.fonts_check = fonts_check;
exports.watch_fonts_check = watch_fonts_check;


/* Мои изменения и дополнения */



