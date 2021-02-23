/* Ветка-cssTask-2, Commit-5 */
//
//Этот файл содержит логику работы всей сборки проекта
let project_folder = "build"; //Переменная для папки результата проекта, выгружается на сервер и передается заказчику
let source_folder = "src"; //Переменная для папки с исходниками проекта, рабочая папка используется только нами при разработке

// ANCHOR PATH's - Объекты для путей ко всем папкам и файлам
let path = {
	build: {
		html: project_folder + "/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		img: project_folder + "/assets/img/",
		fonts: project_folder + "/assets/fonts/",
		vnd_js: project_folder + "/js/vnd/",
		vnd_css: project_folder + "/css/vnd/"
	},
	src: {
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		scssTask: source_folder + "/scss/style.scss",
		cssTaskSrc: source_folder + "/scss/**/*.css",
		scssCssTask: source_folder + "/css",
		scssCssTaskSrc: source_folder + "/css/*.css",
		cssTaskDest: source_folder + "/css/",
		// js: source_folder + "/js/scripts.js",
		jsTask: source_folder + "/js/**/*.js",
		img: source_folder + "/assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
		f_scss_fonts: source_folder + '/scss/_fonts.scss',
		f_ttf2woff: source_folder + "/assets/fonts/*.ttf",
		f_woffSrc: source_folder + "/assets/fonts-woff/*.*",
		f_woffDest: source_folder + "/assets/fonts-woff/",
		vnd_js: source_folder + "/js/vnd/**/*.js",
		vnd_css: source_folder + "/scss/vnd/**/*.{css,scss}"
	},
	watch: {
		html: source_folder + "/**/*.html",
		scssTask: source_folder + "/scss/**/*.scss",
		cssTask: source_folder + "/scss/**/*.css",
		scssCssTaskSrc: source_folder + "/css/*.css",
		// scssCssTaskSrc: source_folder + "/css/*.*",
		jsTask: source_folder + "/js/**/*.js",
		img: source_folder + "/assets/img/**/*.{jpg,png,svg,gif,ico,webp}",
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
	}
}
let kor = {
	src: {
		scssCssTask: "src/css"
	}
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
// Сервисные Плагины
const fs = require('fs');
const duration = require('gulp-duration'); //показывает время выполнения Задачи 
//.pipe(duration('здесь_задача time')) // Например задачи ttf2woff2
const through = require('gulp-through');
const newer = require('gulp-newer');
const tap = require('gulp-tap');
// const path        = require('path');
const file_plugin = require('gulp-file');





//Переменный для flag's
let $flag_folder;
let $flag_preloader;


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
function html() {
	console.log('\n Работает: html()..\n  \n');
	return src(path.src.html) //путь к исходным html файлам
		.pipe(fileinclude()) //обращаемся к fileinclude
		.pipe(webphtml()) //формирование путей к webp
		.pipe(beautify.html())//
		.pipe(dest(path.build.html)) //путь к выходящим html файлам
		.pipe(browsersync.stream()); //синхронизация браузера
}

// ANCHOR SCSS и CSS 
// Тест - функции createFile_1(params)
async function createCssInScss() {
	let fileNames = ['style.css', 'vndLib.css']

	createFolder_3(kor.src.scssCssTask);

	fileNames.forEach(element => {
		createFile_2('./src/css', element);
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
		.pipe(order([
			"vnd/jquery/*.css",
			"vnd/**/*.css",
			"libs/**/*.css"
		]))
		.pipe(concat("vndLib.css"))
		.pipe(sourcemaps.write())
		.pipe(dest(path.src.cssTaskDest))
}

async function scssCssTask() {
	console.log('\n Работает: scssCssTask()..\n  \n');
	// checkFolder(path.src.scssCssTask);
	// if ($flag_folder == 5) {
	return src(path.src.scssCssTaskSrc, {}) //путь к исходным css файлам
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(order([
			"vndLib.css",
			"style.css",
		]))
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
		.pipe(sourcemaps.write())
		.pipe(dest(path.build.css))
	// } else {
	// 	console.log('999999999999999999999999999999999999999999');
	// }
}

function vnd_css() {
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
		.pipe(browsersync.stream()) //синхронизация браузера
}

function vnd_js() {
	return src(path.src.vnd_js)
		.pipe(uglify(/* options */))
		.pipe(dest(path.build.vnd_js))
		.pipe(browsersync.stream()); //синхронизация браузера
}

// ANCHOR IMG
function img() {
	console.log('\n Работает: img()..\n  \n');
	return src(path.src.img) //путь к исходным img файлам
		.pipe(newer(path.build.img))
		.pipe(
			webp({
				quality: 70
			})
		)
		.pipe(dest(path.build.img))

		.pipe(src(path.src.img))
		.pipe(newer(path.build.img))
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

// ANCHOR FONTS -  Шрифты - Конвертация ttf в woff
async function f_ttf2woff(params) {
	console.log('\n Работает: f_ttf2woff()..\n  \n');
	checkFolder(path.src.f_woffDest);
	console.log($flag_folder);
	if ($flag_folder == 5) {
		console.log('\n *Точно, папка с конвертированными Шрифтами уже есть!\n **Копирую Шрифты в папку ' + path.build.fonts);
		woff2build();
	}
	else {
		console.log('\n *Начался процесс конвертации ttf файлов в woff и woff2 \n');
		src(path.src.f_ttf2woff)
			.pipe(ttf2woff())
			.pipe(dest(path.src.f_woffDest));

		src(path.src.f_ttf2woff)
			.pipe(ttf2woff2())
			.pipe(dest(path.src.f_woffDest));
		setTimeout(() =>
			console.log('\n *Шрифты конвертируются и \nсохраняются в папке ' + path.src.f_woffDest + '\n\n'), 2000
		);
		// $flag_woff = 15;
		// setTimeout(woff2build,6000);
	}
}
// Функция копирования woff шрифтов из папки src/fonts-woff в папку build/ 
async function woff2build() {
	console.log('\n Работает: woff2build()..\n  \n');
	checkFolder(path.src.f_woffDest);
	if ($flag_folder == 5) {
		let $tr = src(path.src.f_woffSrc)
			.pipe(newer(path.build.fonts))
			.pipe(dest(path.build.fonts));
		console.log('\n ***Шрифты из папки: ' + path.src.f_woffSrc + '\n скопированы в папку: ' + path.build.fonts + '\n -----');
		return $tr;
	} else {
		console.log('\n ***Шрифты из папки: ' + path.src.f_woffSrc + '\n НЕ скопированы в папку: ' + path.build.fonts + '\n *****Почему?');
	}
}
// Шрифты - Прописывает шрифты в файл стилей в build/ Использует миксин (см. _mixin.scss) 
async function fontStyle() {
	console.log('\n Работает: fontStyle()..\n Закончился процесс конвертации ttf файлов в woff и woff2 \n');
	// let file_content = fs.readFileSync(source_folder + '/scss/_fonts.scss');
	let file_content = fs.readFileSync(path.src.f_scss_fonts);
	if (file_content == '') {
		console.log('\n Файл _fonts.scss - Пустой, Процесс пошел!');
		// fs.writeFile(source_folder + '/scss/_fonts.scss', '', cb);
		fs.writeFile(path.src.f_scss_fonts, '', cb); // здесь пишутся шрифты в _fonts.scss 
		return fs.readdir(path.build.fonts, function (err, items) { // здесь путь откуда читаются стили Шрифтов 
			if (items) {
				let c_fontname;
				let $numbers_fonts = items.length;
				console.log('\n Надо обработать ' + $numbers_fonts + ' шрифтов');
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						// fs.appendFile(source_folder + '/scss/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
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
// Шрифты - функция call back, нужна для подключения шрифтов в файл со стилями для fontStyle() . Просто функция с названием.
function cb() { }

//ANCHOR Частные Задачи:
// Частная Задача-1. svgSprite - отдельная задача (ЕСЛИ есть необходимость) для svg спрайтов
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
		.pipe(dest(path.build.img))
})
// Частная Задача-2. Шрифты - отдельная задача (ЕСЛИ есть необходимость) для конвертации otf в ttf
gulp.task('otf2ttf', function () {
	console.log('\n Работает: otf2ttf()..\n  \n');
	return src([source_folder + '/fonts/*.otf'])
		.pipe(fonter({
			formats: ['ttf']
		}))
		.pipe(dest(source_folder + '/fonts/'));
})


// ANCHOR Сервисные Функции
// Функция-1.1  Очистка папки build 
function cleanBuild() {
	console.log('\n Работает: cleanBuild()..\n  \n');
	console.log('\n ** Удаление папки ' + path.clean.cleanBuild + ' **\n');
	return del(path.clean.cleanBuild);
}

// Функция-1.2  Очистка папки src/fonts-woff 
function cleanFontsWoff() {
	console.log('\n Работает: cleanFontsWoff()..\n  \n');
	console.log('\n ** Удаление папки ' + path.clean.cleanFontsWoff + ' **\n');
	checkFolder(path.clean.cleanFontsWoff);
	if ($flag_folder == 5) {
		return del(path.clean.cleanFontsWoff);
	}
	console.log('\n ** Итог: Папки ' + path.clean.cleanFontsWoff + ' Нет!\n Удалять нечего!\n -----\n\n');
}

// Функция-1.3  Очистка папок build/ и src/fonts-woff/ 
async function clean() {
	console.log('\n Работает: clean()..\n  \n');
	console.log('\n ** Удаление папки ' + path.clean.cleanFontsWoff + ' и ' + path.clean.cleanBuild + '**\n');
	del(path.clean.cleanFontsWoff);
	del(path.clean.cleanBuild);
}

// Функция-1.4  Очистка папки src/css/ 
async function cleanSrcCss() {
	console.log('\n Работает: delSrcCss()..\n  \n');
	console.log('\n ** Удаление папки ' + path.clean.cleanSrcCss + ' **\n');
	del(path.clean.cleanSrcCss);
}
function cleanFontsWoff() {
	console.log('\n Работает: cleanFontsWoff()..\n  \n');

	checkFolder(path.clean.cleanFontsWoff);
	if ($flag_folder == 5) {
		return del(path.clean.cleanFontsWoff);
	}
	console.log('\n ** Итог: Папки ' + path.clean.cleanFontsWoff + ' Нет!\n Удалять нечего!\n -----\n\n');
}

// Функция-2. Проверка наличия Папки
async function checkFolder(params) {
	console.log('\n Работает: checkFolder()..\n  \n');
	var fs = require('fs');
	if (fs.existsSync(params)) {
		console.log('\n*Папка уже' + params + ' Есть\n');

		$flag_folder = 5;
		return console.log('\n* Выход из функции-1 *\n');
	} else {
		console.log('\n**Такой Папки ' + params + ' Нет\n');
		$flag_folder = 10;
		return console.log('\n* Выход из функции-2 *\n');
	}
}
// exports.checkFolder = checkFolder;

// Функция-2. Проверка наличия файлов 
async function checkFile() {

}

// ANCHOR Watcher
//Отслеживание файлов для синхронизации
function watchFiles() {
	gulp.watch([path.watch.html], html);
	gulp.watch([path.watch.scssTask], scssTask);
	gulp.watch([path.watch.cssTask], cssTask);
	gulp.watch([path.watch.scssCssTaskSrc], scssCssTask);
	gulp.watch([path.watch.jsTask], jsTask);
	gulp.watch([path.watch.img], img);
	gulp.watch([path.watch.img], img);
	gulp.watch([path.watch.vnd_css], vnd_css); // добавил слежение за файлами в папке scss/vnd
	gulp.watch([path.watch.vnd_js], vnd_js); // добавил слежение за файлами в папке js/vnd
	gulp.watch([path.watch.f_ttf2woff], f_ttf2woff); // добавил слежение за файлами шрифтов в папке fonts/

}

// ANCHOR Команды для запуска:
// build 
let build = gulp.series(cleanBuild, gulp.parallel(jsTask, html, img, f_ttf2woff, vnd_js, vnd_css), cleanSrcCss, fontStyle);
let watch_build = gulp.parallel(build, watchFiles, browserSync);
// develop - для работы, чтобы время не тратить на шрифты и картинки, watch долго запускается 
let develop = gulp.series(cleanBuild, gulp.parallel(jsTask, html, vnd_js, vnd_css));
let watch_develop = gulp.parallel(develop, watchFiles, browserSync);
// тесты
let test = gulp.series(cleanBuild, gulp.parallel(css, jsTask, html, img, f_ttf2woff, woff2build), fontStyle);
// let fonts_check = gulp.series(clean, gulp.parallel(series(scssTask, cssTask, scssCssTask), html));
let watch_test = gulp.parallel(test, watchFiles, browserSync);
// Тест scss и css 
let scss_css = gulp.parallel(css, watchFiles);


// ANCHOR EXPORTS
// html
exports.html = html; //срабатывание команды html
// scss, css
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
exports.img = img; //срабатывание команды img
// fonts
exports.fontStyle = fontStyle; //запуск команды подключение шрифтов в файл стилей
exports.f_ttf2woff = f_ttf2woff; //запуск команды для шрифтов
exports.woff2build = woff2build;
// Сервисные
exports.cleanBuild = cleanBuild; // Функция-1.1 - Запуск Удаления директории - build
exports.cleanFontsWoff = cleanFontsWoff; // Функция-1.2 - Запуск удаления директории - src/fonts-woff/
exports.clean = clean; // Функция-1.3 - Запуск Удаления директорий - build и src/fonts-woff/
exports.cleanSrcCss = cleanSrcCss; // Функция-1.3 - Запуск Удаления директорий - src/css/ 
// Команды 
exports.build = build; //первый, для проверки загрузки шрифтов и оптимизации картинок
exports.watch_build = watch_build; //
exports.develop = develop; // разработка, без обновления шрифтов и картинок 
exports.watch_develop = watch_develop; //
/*По умолчанию поставил режим разработки. Всегда можно поменять*/
exports.default = watch_develop; //запуск gulp который по умолчанию перенаправляет на срабатывание watch
// Тесты:
exports.test = test;
exports.watch_test = watch_test;
exports.scss_css = scss_css;
exports.watchFiles = watchFiles;



// ANCHOR ФУНКЦИИ для РАБОТЫ:
/* Функция - Визуальный лоадер загрузки, пока не понял как применять */
function twirlTimer() {
	var P = ["\\", "|", "/", "-"];
	var x = 0;
	return setInterval(function () {
		process.stdout.write("\r" + P[x++]);
		x &= 3;
	}, 250);
}
exports.twirlTimer = twirlTimer;

/* Функции - Создание структуры только Папок проекта: */
// Вариант -1
async function createFolder_1() {
	return src('*.*', { read: false })
		.pipe(gulp.dest('./1/text'))
		.pipe(gulp.dest('./2'))
		.pipe(gulp.dest('./2/content'))
}
exports.createFolder_1 = createFolder_1;
// Вариант -2
async function createFolder_2() {
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
// ?Вариант -3
async function createFolder_3(dir_name) {
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

/* Функции - Создание Файлов:  */
// Вариант-1:
async function createFile_1(files, dest_dir) {
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
// ?Вариант-2:
async function createFile_2(dest_dir, files) {
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
	console.log('\n*' + params + '*\n');
}
exports.debug_var = debug_var;

// Тест - Функция - Проверить Пути 
async function debug_path() {
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
	let fileNames = ['style.css', 'vndLib.css']

	// return fileNames.forEach(createFile_1('fileName'))
	fileNames.forEach(element => {
		createFile_1(element, './src/css');
	});
}
exports.test_create_files = test_create_files;

// Тест - функция объединения всех тасков scss css 
async function css() {
	console.log('\n Работает: CSS()..\n  \n');

	console.log('Это флаг ' + $flag_folder);
	$flag_folder = 0;
	console.log('Это флаг ' + $flag_folder);
	do {
		createCssInScss();
		// createFolder_3(kor.src.scssCssTask);
		// createFile_2('./src/css/', 'style.css',);
		$flag_folder = 15
	} while ($flag_folder != 15);
	console.log('\n*Это флаг ' + $flag_folder + '\n');

	scssTask();
	cssTask();
	scssCssTask()

}
exports.css = css;
