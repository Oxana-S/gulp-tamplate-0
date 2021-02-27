/* Ветка-cssTask-2, Commit-15 */
//
//Этот файл содержит логику работы всей сборки проекта
let project_folder = "build"; //Переменная для папки результата проекта, выгружается на сервер и передается заказчику
let source_folder = "src"; //Переменная для папки с исходниками проекта, рабочая папка используется только нами при разработке

// ANCHOR PATH's - Объекты для путей ко всем папкам и файлам
let path = {
	build: {
		htmlTask: project_folder + "/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		imgTask: project_folder + "/assets/img/",
		fonts: project_folder + "/assets/fonts/",
		vnd_js: project_folder + "/js/vnd/",
		vnd_css: project_folder + "/css/vnd/"
	},
	src: {
		htmlTask: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		scssTask: source_folder + "/scss/style.scss",
		cssTaskSrc: source_folder + "/scss/**/*.css",
		scssCssTask: source_folder + "/css",
		scssCssTaskSrc: source_folder + "/css/*.css",
		cssTaskDest: source_folder + "/css/",
		jsTask: source_folder + "/js/**/*.js",
		imgTask: source_folder + "/assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
		f_scss_fonts: source_folder + '/scss/_fonts.scss',
		f_ttf: source_folder + "/assets/fonts/",
		f_ttf2woff: source_folder + "/assets/fonts/*.ttf",
		f_woffSrc: source_folder + "/assets/fonts-woff/*.*",
		f_woffDest: source_folder + "/assets/fonts-woff/",
		vnd_js: source_folder + "/js/vnd/**/*.js",
		vnd_css: source_folder + "/scss/vnd/**/*.{css,scss}"
	},
	watch: {
		htmlTask: source_folder + "/**/*.html",
		scssTask: source_folder + "/scss/**/*.scss",
		cssTask: source_folder + "/scss/**/*.css",
		scssCssTaskSrc: source_folder + "/css/*.css",
		jsTask: source_folder + "/js/**/*.js",
		imgTask: source_folder + "/assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
		vnd_css: source_folder + "/scss/vnd/**/*.css", // добавил пути для слежения за изменениями файлов в папке scss/vnd
		vnd_js: source_folder + "/js/vnd/**/*.js", // добавил пути для слежения за изменениями файлов в папке js/vnd
		f_scss_fonts: source_folder + '/scss/_fonts.scss',
		f_ttf2woff: source_folder + "/assets/fonts/*.ttf" // добавил пути для слежения за изменениями файлов шрифтов в папке fonts/

	},
	clean: {
		// cleanBuild: "./" + "build",
		cleanBuild: project_folder,
		cleanFontsWoff: source_folder + "/assets/fonts-woff", //пути для команды очистки 
		cleanSrcCss: source_folder + "/css"
	},
	create: {
		scssCssTask: "/src/css/"
	}
}
// ANCHOR ПЛАГИНЫ:
const gulp = require('gulp'); //подключение gulp (для использование команд по умолчанию)
const { src, dest, parallel, series, watch } = require('gulp'); //вспомогательные переменные

let browsersync = require('browser-sync').create(); //синхронизация браузера
let fileinclude = require('gulp-file-include'); //плагин для выноса отдельных блоков
let del = require('del'); //плагин удаление файлов
let scss = require('gulp-sass'); //плагин препроцессора sass
let sourcemaps = require('gulp-sourcemaps');
let autoprefixer = require('gulp-autoprefixer'); //добавления префиксов к css свойствам
let group_media = require("gulp-group-css-media-queries"); //группировка медиа запросов
let cleanCSS = require("gulp-clean-css"); //чистка и сжатие css
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
// Сервисные Плагины
const fs = require('fs');
const duration = require('gulp-duration'); //показывает время выполнения Задачи 
//.pipe(duration('здесь_задача time')) // Например задачи ttf2woff2
const through = require('gulp-through');
const newer = require('gulp-newer');
const tap = require('gulp-tap');
const file_plugin = require('gulp-file');
const streamSize = require('stream-size');
const streamLength = require('stream-length'); // для функций lengthStream_1-2
// const lengthStream = require('length-stream'); //! не получилось, можно удалить


//Переменный для flag's
let $flag_folder;
let $flag_preloader;

// Переменные (Массивы)  для названий и путей файлам 
// **CSS
// Порядок Конкатенации файлов Стилей Вендеров и Библиотек
// в функции cssTask()
let arrayCssTask = [
	"vnd/jquery/*.css",
	"vnd/**/*.css",
	"libs/**/*.css"
];
// Порядок Конкатенации и Минификации файлов style.css и vndLib.css
// в функции scssCssTask()
let arrayScssCssTask = [
	"vndLib.css",
	"style.css"
];
// **JS
// Порядок Конкатенации JS файлов Вендеров и Библиотек
// в функции jsTask()
let arrayJsTask = [
	"vnd/jquery/*.js",
	"vnd/**/*.js",
	"libs/**/*.js",
	"kscripts.js",
	"main.js"
];
// ANCHOR BrowserSync
function browserSync(done) {
	console.log('\n Работает: browserSync()..\n  \n');
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
// ANCHOR HTML 
function htmlTask() {
	console.log('\n Работает: htmlTask()..\n  \n');
	return src(path.src.htmlTask) //путь к исходным html файлам
		.pipe(fileinclude()) //обращаемся к fileinclude
		.pipe(webphtml()) //формирование путей к webp
		.pipe(beautify.html())//
		.pipe(dest(path.build.htmlTask)) //путь к выходящим html файлам
		.pipe(browsersync.stream()); //синхронизация браузера
}

// ANCHOR SCSS и CSS 
// ?css - css() - createCssInScss(), scssTask(), cssTask(), cb->scssCssTask()
// Тест css_3() 
// Функция конвертирования ttf в woff и woff2 в папку src/assets/fonts-woff
async function css() {
	console.log('\n Работает: CSS_3()..\n  \n');

	console.log('Это флаг ' + $flag_folder);
	$flag_folder = 0;

	const makePizza = function (cb) {
		createCssInScss();
		setTimeout(cb, 1000);
	}

	const eatPizza = function () {
		scssTask();
		cssTask();
		// cb для eatPizza будет функция - scssCssTask();
		setTimeout(scssCssTask, 1000);
	}

	makePizza(eatPizza);
}

async function createCssInScss() {
	console.log('\n Работает: createCssInScss()..\n  \n');
	let fileNames = ['style.css', 'vndLib.css']

	createFolder_3(path.create.scssCssTask);

	fileNames.forEach(element => {
		createFile_2('./src/css/', element);
		$flag_folder = 5;
	});

}

function scssTask() {
	console.log('\n Работает: scssTask()..\n  \n');
	return src(path.src.scssTask, {}) //путь к исходным scss файлам
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(
			scss({
				outputStyle: "expanded" //формирование развернутого файла
			}).on('error', scss.logError)
		)
		.pipe(group_media())
		.pipe(webpcss())
		.pipe(sourcemaps.write())
		.pipe(dest(path.src.cssTaskDest))
}

function cssTask() {
	console.log('\n Работает: cssTask()..\n  \n');
	return src(path.src.cssTaskSrc, {}) //путь к исходным css файлам
		.pipe(sourcemaps.init())
		// .pipe(order([
		// 	"vnd/jquery/*.css",
		// 	"vnd/**/*.css",
		// 	"libs/**/*.css"
		// ]))
		.pipe(order(arrayCssTask))
		.pipe(concat("vndLib.css"))
		.pipe(sourcemaps.write())
		.pipe(dest(path.src.cssTaskDest))
}

async function scssCssTask() {
	console.log('\n Работает: scssCssTask()..\n  \n');

	return src(path.src.scssCssTaskSrc, {}) //путь к исходным css файлам
		.pipe(plumber())
		.pipe(sourcemaps.init())
		// .pipe(order([
		// 	"vndLib.css",
		// 	"style.css"
		// ]))
		.pipe(order(arrayScssCssTask))
		.pipe(concat("styles.css"))
		.pipe(
			autoprefixer({
				grid: true,
				overrideBrowserslist: ["last 5 versions"], //поддержка версий браузеров
				cascade: true //стиль написание автопрефикса 
			}))
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream()) //синхронизация браузера
		.pipe(rename({ extname: ".min.css" }))
		.pipe(cleanCSS())
		.pipe(sourcemaps.write())
		.pipe(dest(path.build.css))
}

function vnd_css() {
	console.log('\n Работает: vnd_css()..\n  \n');
	return src(path.src.vnd_css)
		// .pipe(
		// 	autoprefixer({
		// 		overrideBrowserslist: ["last 5 versions"], //поддержка версий браузеров
		// 		cascade: true //стиль написание автопрефикса 
		// 	}))
		.pipe(dest(path.build.vnd_css))
		.pipe(browsersync.stream()); //синхронизация браузера
}

// ANCHOR JS
function jsTask() {
	console.log('\n Работает: jsTask()..\n  \n');
	return src(path.src.jsTask)
		.pipe(sourcemaps.init())
		// .pipe(order([
		// 	"vnd/jquery/*.js",
		// 	"vnd/**/*.js",
		// 	"libs/**/*.js",
		// 	"kscripts.js",
		// 	"main.js"
		// ]))
		.pipe(order(arrayJsTask))
		.pipe(concat("scripts.js"))
		.pipe(gulp.dest(path.build.js))
		.pipe(uglify(/* options */))
		.pipe(
			rename({
				extname: ".min.js"
			}))
		.pipe(uglify())
		.pipe(sourcemaps.write())
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream()) //синхронизация браузера
}

function vnd_js() {
	console.log('\n Работает: vnd_js()..\n  \n');
	return src(path.src.vnd_js)
		.pipe(uglify(/* options */))
		.pipe(dest(path.build.vnd_js))
		.pipe(browsersync.stream()); //синхронизация браузера
}

// ANCHOR IMG
function imgTask() {
	console.log('\n Работает: imgTask()..\n  \n');
	return src(path.src.imgTask) //путь к исходным img файлам
		.pipe(newer(path.build.imgTask))
		.pipe(
			webp({
				quality: 70
			})
		)
		.pipe(dest(path.build.imgTask))

		.pipe(src(path.src.imgTask))
		.pipe(newer(path.build.imgTask))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }], //работа с svg
				interlaced: true, //работа с другими форматами изображений
				optimizationLevel: 3 // 0 to 7 //Уровень сжатия
			})
		)
		.pipe(dest(path.build.imgTask)) //путь к выходящим img файлам
		.pipe(browsersync.stream()) //синхронизация браузера
}

// ANCHOR FONTS 
// ?Шрифты - f_ttf2woff() - Конвертация ttf в woff
// Функция конвертирования ttf в woff и woff2 в папку src/assets/fonts-woff
// копирует папку src/assets/fonts-woff в папку build/assets/fonts-woff - (woff2build())
// прописывает шрифты в файл scss/_fonts/scss из папки src/assets/fonts-woff - (fontStyle())
async function f_ttf2woff() {
	console.log('\n Работает: f_ttf2woff()..\n  \n');
	let $numbers_fonts = 0;
	checkFolder(path.src.f_woffDest);
	console.log($flag_folder);
	if ($flag_folder == 5) {
		console.log('\n *Папка с конвертированными Шрифтами уже есть!\n **Копирую Шрифты в папку ' + path.build.fonts);
		woff2build();
	}
	else {
		console.log('\n *Начался процесс конвертации ttf файлов в woff и woff2 \n');
			setTimeout(() =>
			console.log('\n *Шрифты конвертируются и \nсохраняются в папке ' + path.src.f_woffDest + '\n\n'), 1000
		);

		let r = src(path.src.f_ttf2woff)
			.pipe(ttf2woff())
			.pipe(dest(path.src.f_woffDest));

		let t = src(path.src.f_ttf2woff)
			.pipe(ttf2woff2())
			.pipe(dest(path.src.f_woffDest));

		var downloaded = 0;

		r.on('data', function () {
			downloaded++;
			console.log('\n downloaded файл ', downloaded);
		});

		t.on('data', function () {
			downloaded++;
			console.log('\n downloaded файл ', downloaded);
		});

		r.on('finish', function () {
			// $numbers_fonts = 5;
		});

		t.on('finish', function () {
			$numbers_fonts = 5;
			woff2build();
			fontStyle();
		});
	}
}

// Шрифты - woff2build() копирует woff шрифты 
// из папки src/assets/fonts-woff в папку build/assets/fonts-woff
async function woff2build() {
	console.log('\n Работает: woff2build()..\n  \n');
	checkFolder(path.src.f_woffDest);
	if ($flag_folder == 5) {
		let $tr = src(path.src.f_woffSrc)
			.pipe(newer(path.build.fonts)) //!
			.pipe(dest(path.build.fonts));
		console.log('\n ***Шрифты из папки: ' + path.src.f_woffSrc + '\n скопированы в папку: ' + path.build.fonts + '\n -----');
		return $tr;
	} else {
		console.log('\n ***Шрифты из папки: ' + path.src.f_woffSrc + '\n НЕ скопированы в папку: ' + path.build.fonts + '\n *****Почему?');
	}
}

// Шрифты - fontStyle() - Прописывает шрифты в файл scss/_fonts/scss 
async function fontStyle() {
	console.log('\n Работает: fontStyle()..\n Закончился процесс конвертации ttf файлов в woff и woff2 \n');
	let file_content = fs.readFileSync(path.src.f_scss_fonts);
	if (file_content == '') {
		console.log('\n Файл _fonts.scss - Пустой, Процесс пошел!');
		fs.writeFile(path.src.f_scss_fonts, '', cb);
		// return fs.readdir(path.build.fonts, function (err, items) { 
		return fs.readdir(path.src.f_woffDest, function (err, items) {
			if (items) {
				let c_fontname;
				let $numbers_fonts = items.length;
				console.log('\n Надо обработать ' + $numbers_fonts + ' шрифтов');
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(path.src.f_scss_fonts, '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
					console.log('\n Шрифт № ' + i + ' обработан, осталось ' + $numbers_fonts--);
				}
			}
			console.log('\n Все Шрифты обработаны');
		})
	} else {
		console.log('\n_fonts.scss - Не пустой, удалить всё содержимое\n');
	}
}
// Шрифты - функция call back, нужна для подключения шрифтов 
// в файл со стилями для fontStyle() . Просто функция с названием.
function cb() { }

//ANCHOR Частные Задачи:
// Частная Задача-1. 
// svgSprite() - SVG - отдельная задача (ЕСЛИ есть необходимость) для svg спрайтов
gulp.task('svgSprite', function () {
	console.log('\n Работает: svgSprite()..\n  \n');
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
		.pipe(dest(path.build.imgTask))
})

// Частная Задача-2. 
// otf2ttf() - Шрифты - отдельная задача (ЕСЛИ есть необходимость) для конвертации otf в ttf
gulp.task('otf2ttf', function () {
	console.log('\n Работает: otf2ttf()..\n  \n');
	return src([source_folder + '/fonts/*.otf'])
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest(source_folder + '/fonts/'));
})


// ANCHOR Сервисные Функции
// Функция-1.1  clean() - Очистка папок build/ и src/assets/fonts-woff/ и src/css/
async function clean() {
	console.log('\n Работает: clean()..\n  \n');
	console.log('\n ** Удаление папок ' + path.clean.cleanFontsWoff + ' , ' + path.clean.cleanBuild + ' и ' + path.clean.cleanSrcCss + '**\n');
	del(path.clean.cleanFontsWoff);
	del(path.clean.cleanBuild);
	del(path.clean.cleanSrcCss);
}

// Функция-1.2  cleanFontsWoff() - Очистка папки src/fonts-woff
function cleanFontsWoff() {
	console.log('\n Работает: cleanFontsWoff()..\n  \n');
	console.log('\n ** Удаление папки ' + path.clean.cleanFontsWoff + ' **\n');
	checkFolder(path.clean.cleanFontsWoff);
	if ($flag_folder == 5) {
		return del(path.clean.cleanFontsWoff);
	}
	console.log('\n ** Итог: Папки ' + path.clean.cleanFontsWoff + ' Нет!\n Удалять нечего!\n -----\n\n');
}

// Функция-1.3  cleanBuild() - Очистка папки build
function cleanBuild() {
	console.log('\n Работает: cleanBuild()..\n  \n');
	console.log('\n ** Удаление папки ' + path.clean.cleanBuild + ' **\n');
	return del(path.clean.cleanBuild);
}

// Функция-1.4  cleanSrcCss() - Очистка папки src/css/
async function cleanSrcCss() {
	console.log('\n Работает: cleanSrcCss()..\n  \n');
	console.log('\n ** Удаление папки ' + path.clean.cleanSrcCss + ' **\n');
	del(path.clean.cleanSrcCss);
}

// Функция-1.5  cleanFontsWoff() - Очистка папки src/css/
function cleanFontsWoff() {
	console.log('\n Работает: cleanFontsWoff()..\n  \n');

	checkFolder(path.clean.cleanFontsWoff);
	if ($flag_folder == 5) {
		return del(path.clean.cleanFontsWoff);
	}
	console.log('\n ** Итог: Папки ' + path.clean.cleanFontsWoff + ' Нет!\n Удалять нечего!\n -----\n\n');
}

// Функция-2. checkFolder() - Проверка наличия Папки
async function checkFolder(params) {
	console.log('\n Работает: checkFolder()..\n  \n');
	var fs = require('fs');
	if (fs.existsSync(params)) {
		console.log('\n*Папка ' + params + ' уже Есть\n');

		$flag_folder = 5;
		return console.log('\n* Выход из функции checkFolder() -1 *\n');
	} else {
		console.log('\n**Такой Папки ' + params + ' Нет\n');
		$flag_folder = 10;
		return console.log('\n* Выход из функции checkFolder() -2 *\n');
	}
}

// Функция-2. checkFile() - Проверка наличия файлов 
async function checkFile() {

}

// ANCHOR Watcher
// watchFiles() - Отслеживание файлов для синхронизации
function watchFiles() {
	console.log('\n Работает: watchFiles()..\n  \n');
	watch([path.watch.htmlTask], htmlTask);
	watch([path.watch.scssTask], scssTask);
	watch([path.watch.cssTask], cssTask);
	watch([path.watch.scssCssTaskSrc], scssCssTask);
	watch([path.watch.jsTask], jsTask);
	watch([path.watch.imgTask], imgTask);
	watch([path.watch.imgTask], imgTask);
	watch([path.watch.vnd_css], vnd_css); // добавил слежение за файлами в папке scss/vnd
	watch([path.watch.vnd_js], vnd_js); // добавил слежение за файлами в папке js/vnd
	watch([path.watch.f_ttf2woff], f_ttf2woff); // добавил слежение за файлами шрифтов в папке fonts/

}

// ANCHOR Команды для запуска:
// build 
// 1. Сначала Запускаю команду очистки: gulp clean
// 2. И запускаем команду: gulp watch_build
let watch_build = series(cleanBuild, parallel(css, jsTask, htmlTask, imgTask, f_ttf2woff, watchFiles, vnd_js, vnd_css));
let build = parallel(watch_build, browserSync);
// develop
//Для работы, чтобы время не тратить на шрифты и картинки, watch долго запускается 
let watch_develop = series(cleanBuild, (parallel(css, jsTask, htmlTask, imgTask, f_ttf2woff, watchFiles)));
let develop = parallel(watch_develop, browserSync);
// Тесты:
// Тест - scss и css 
let scss_css = parallel(css, htmlTask, jsTask, imgTask, watchFiles, f_ttf2woff, browserSync);


// ANCHOR EXPORTS
// html
exports.htmlTask = htmlTask; //срабатывание команды html
// scss, css
exports.css = css;
exports.createCssInScss = createCssInScss; // Создание Папки src/css 
exports.scssTask = scssTask; // Объединение scss файлов в корне папки scss/ и  папке scss-blocks/
exports.cssTask = cssTask; // Объединение css файлов в папках: libs/ и vnd/ css
exports.scssCssTask = scssCssTask; // Объединение всех css файлов в созданной для этого папке src/css
exports.vnd_css = vnd_css; // запуск команды для обновления css файлов папке vnd 
// js
exports.jsTask = jsTask; //срабатывание команды js
exports.vnd_js = vnd_js; // запуск команды для обновления js файлов папке vnd 
// exports.js = js; //срабатывание команды js
// img
exports.imgTask = imgTask; //срабатывание команды img
// fonts
exports.f_ttf2woff = f_ttf2woff; //запуск команды для шрифтов
exports.woff2build = woff2build;
exports.fontStyle = fontStyle; //запуск команды подключение шрифтов в файл стилей
// Сервисные
exports.clean = clean; // Функция-1.3 - Запуск Удаления директорий - build, src/assets/fonts-woff/ и src/css
exports.cleanBuild = cleanBuild; // Функция-1.1 - Запуск Удаления директории - build
exports.cleanFontsWoff = cleanFontsWoff; // Функция-1.2 - Запуск удаления директории - src/fonts-woff/
exports.cleanSrcCss = cleanSrcCss; // Функция-1.3 - Запуск Удаления директорий - src/css/ 
exports.checkFolder = checkFolder;
// Команды 
exports.build = build; //первый, для проверки загрузки шрифтов и оптимизации картинок
exports.watch_build = watch_build; //
exports.develop = develop; // разработка, без обновления шрифтов и картинок 
exports.watch_develop = watch_develop; //
//
/* По умолчанию поставил режим разработки. Всегда можно поменять*/
exports.default = develop; //запуск gulp который по умолчанию перенаправляет на срабатывание watch_develop
//
// Тесты:
exports.scss_css = scss_css;
exports.watchFiles = watchFiles;



// ANCHOR ФУНКЦИИ для РАБОТЫ:
/* Функция - twirlTimer() - Визуальный лоадер загрузки, пока не понял как применять */
async function twirlTimer() {
	console.log('\n Работает: twirlTimer()..\n  \n');
	var P = ["\\", "|", "/", "-"];
	var x = 0;
	return setInterval(function () {
		process.stdout.write("\r" + P[x++]);
		x &= 3;
	}, 250);
}
exports.twirlTimer = twirlTimer;

/* Функции - createFolder_?() -Создание структуры только Папок проекта: */
// Вариант -1
async function createFolder_1() {
	console.log('\n Работает: createFolder_1()..\n  \n');
	return src('*.*', { read: false })
		.pipe(gulp.dest('./1/text'))
		.pipe(gulp.dest('./2'))
		.pipe(gulp.dest('./2/content'))
}
exports.createFolder_1 = createFolder_1;

// Вариант -2
async function createFolder_2() {
	console.log('\n Работает: createFolder_2()..\n  \n');
	const fs = require('fs');

	const folders = [
		'1/css',
		'1/img',
		'1/img/content',
		'1/img/icons',
		'1/fonts',
		'1/js'
	];

	folders.forEach(dir => {
		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
			console.log('  folder created:', dir);
		}
	});
};
exports.createFolder_2 = createFolder_2;

// ?Вариант -3:*****
async function createFolder_3(dir_name) {
	console.log('\n Работает: createFolder_3()..\n  \n');
	// Include fs and path module 
	// const fs   = require('fs');
	const path = require('path');
	fs.mkdir(path.join(__dirname, dir_name), (err) => {
		if (err) {
			return console.error(err);
		}
		console.log('Directory ' + dir_name + ' created successfully!');
	});
	// }
}
exports.createFolder_3 = createFolder_3;

/* Функции - createFile_?() - Создание Файлов:  */
// Вариант-1:
async function createFile_1(files, dest_dir) {
	console.log('\n Работает: createFile_1()..\n  \n');
	// Нужны плагины:
	// const tap     = require('gulp-tap'),
	// const file_plugin = require('gulp-file');
	src('./')
		.pipe(tap(function (file) {
			let fileName = files;
			let contents = 'hello!';
			return file_plugin(
				fileName, contents
			)
				.pipe(gulp.dest(dest_dir));
		}));
}
exports.createFile_1 = createFile_1;

// ?Вариант-2:*****
async function createFile_2(dest_dir, files) {
	console.log('\n Работает: createFile_2()..\n  \n');
	// let dest_dir_2;
	// let files;
	fs.open(dest_dir + files, 'w', (err) => {
		if (err) throw err;
		console.log('File ' + dest_dir + files + ' created');
		$flag_folder = 15;
	});
}
exports.createFile_2 = createFile_2;


// ANCHOR ТЕСТЫ, ПРОВЕРОЧНЫЕ И ОТЛАДОЧНЫЕ ФУНКЦИИ:
// Тест - Функция - Проверить Переменную
async function debug_var(params) {
	console.log('\n Работает: debug_var()..\n  \n');
	console.log('\n*' + params + '*\n');
}
exports.debug_var = debug_var;

// Тест - Функция - Проверить Пути 
async function debug_path() {
	console.log('\n Работает: debug_path()..\n  \n');
	let h = path.src.f_woffDest;
	let p = checkFolder(path.src.f_woffDest);
	console.log(h);
	console.log(p);
}
exports.debug_path = debug_path;

// Тест - Тестировал duration() и .on()
async function test_my_duration() {
	return src(path.src.f_ttf2woff)
		.pipe(ttf2woff2())
		.on('finish', function () {
			$flag_preloader = 20;
			console.log('Шрифты конвертированы в woff и woff2 и перемещены в папку: ' + path.src.f_woffDest + ' Флаг: ' + $flag_preloader)
		})
		.pipe(dest(path.src.f_woffDest))
		.pipe(duration('ttf2woff2 time'))
}
exports.test_my_duration = test_my_duration;

// Тест - функции createFile_1(params)
async function test_create_files() {
	console.log('\n Работает: test_create_files()..\n  \n');
	let fileNames = ['style.css', 'vndLib.css']

	fileNames.forEach(element => {
		createFile_1(element, './src/css');
	});
}
exports.test_create_files = test_create_files;

// Тест - css_? функция объединения всех тасков scss css:*****
// Вариант-1:
async function css_1() {
	console.log('\n Работает: CSS_1()..\n  \n');

	console.log('Это флаг ' + $flag_folder);
	$flag_folder = 0;
	console.log('Это флаг ' + $flag_folder);
	do {
		createCssInScss();
		$flag_folder = 15
	} while ($flag_folder != 15);
	console.log('\n*Это флаг ' + $flag_folder + '\n');

	scssTask();
	cssTask();
	scssCssTask()
}
exports.css_1 = css_1;

// ?Вариант-2:
async function css_2() {
	console.log('\n Работает: CSS_2()..\n  \n');

	console.log('Это флаг ' + $flag_folder);
	$flag_folder = 0;


	const makePizza = function (cb) {
		createCssInScss();
		setTimeout(cb, 2000);
	}

	const eatPizza = function () {
		scssTask();
		cssTask();
		scssCssTask();
	}
	makePizza(eatPizza);
}
exports.css_2 = css_2;

// ?Вариант-3:
async function css_3() {
	console.log('\n Работает: CSS_3()..\n  \n');

	console.log('Это флаг ' + $flag_folder);
	$flag_folder = 0;

	const makePizza = function (cb) {
		createCssInScss();
		setTimeout(cb, 1000);
	}

	const eatPizza = function () {
		scssTask();
		cssTask();
		// cb для eatPizza будет функция - scssCssTask();
		setTimeout(scssCssTask, 1000);
	}

	makePizza(eatPizza);
}
exports.css_3 = css_3;

// --------------------------------------------------------------
// Тест lengthStream_1() - Определение длины передаваемого потока
// Источник: https://github.com/joepie91/node-stream-length
async function lengthStream_1() {
	console.log('\n Работает: lengthStream_1()..\n  \n');
	// Нужен плагин: stream-length
	// var streamLength = require("stream-length");

	var streamLength = require("stream-length");
	var fileSource = source_folder + "/" + "test.md";

	streamLength(fs.createReadStream(fileSource), {}, function (err, result) {
		if (err) {
			console.log("Could not determine length. Error: " + err.toString());
		}
		else {
			console.log("The length of test.md is " + result);
		}
	});
}
exports.lengthStream_1 = lengthStream_1;

// Массив с файлами исходных Шрифтов проекта
let arrayFonts = [
	"Montserrat-Light.ttf",
	"Montserrat-Regular.ttf"
];
// Тест lengthStream_2() - Определение длины передаваемого потока
// используя массив файлов
async function lengthStream_2() {
	console.log('\n Работает: lengthStream_2()..\n  \n');

	var streamLength = require("stream-length");
	var fileSource = path.src.f_ttf + arrayFonts[0];
	console.log(fileSource);
	var stream = fs.createReadStream(fileSource);

	streamLength(stream, {}, function (err, result) {
		if (err) {
			console.log("Could not determine length. Error: " + err.toString());
		}
		else {
			console.log("The length of " + fileSource + " is " + result);
		}
	});
}
exports.lengthStream_2 = lengthStream_2;



// Тест streamLength_1() - Определение длины передаваемого потока
// Источник: https://github.com/jeffbski/length-stream
async function streamLength_1() {
	console.log('\n Работает: streamLength_1()..\n  \n');

}
exports.streamLength_1 = streamLength_1;