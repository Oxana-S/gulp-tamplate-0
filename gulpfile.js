//Этот файл содержит логику работы всей сборки проекта
let project_folder = "build"; //Переменная для папки результата проекта, выгружается на сервер и передается заказчику
let source_folder = "src"; //Переменная для папки с исходниками проекта, рабочая папка используется только нами при разработке

// ANCHOR PATH's - Объекты для путей ко всем папкам и файлам
let path = {
	build: {
		html: project_folder + "/",
		css: project_folder + "/css/",
		js: project_folder + "/js/",
		img: project_folder + "/img/",
		fonts: project_folder + "/fonts/",
		vnd_js: project_folder + "/js/vnd/",
		vnd_css: project_folder + "/css/vnd/"
	},
	src: {
		html: [source_folder + "/*.html", "!" + source_folder + "/_*.html"],
		// css: source_folder + "/scss/style.scss",
		// scssTask: source_folder + "/scss/*.scss",
		scssTask: source_folder + "/scss/style.scss",
		cssTaskSrc: source_folder + "/scss/**/*.css",
		cssTaskDest: source_folder + "/css/",
		scssCssTaskSrc: source_folder + "/css/*.css",
		// js: source_folder + "/js/scripts.js",
		jsTask: source_folder + "/js/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		f_ttf2woff: source_folder + "/fonts/*.ttf",
		f_woffSrc: source_folder + "/fonts-woff/*.*",
		f_woffDest: source_folder + "/fonts-woff/",
		vnd_js: source_folder + "/js/vnd/**/*.js",
		vnd_css: source_folder + "/scss/vnd/**/*.{css,scss}"
	},
	watch: {
		html: source_folder + "/**/*.html",
		scssTask: source_folder + "/scss/**/*.scss",
		cssTask: source_folder + "/scss/**/*.css",
		scssCssTask: source_folder + "/css/*.css",
		// css: source_folder + "/scss/**/*.scss",
		jsTask: source_folder + "/js/**/*.js",
		img: source_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		vnd_css: source_folder + "/scss/vnd/**/*.css", // добавил пути для слежения за изменениями файлов в папке scss/vnd
		vnd_js: source_folder + "/js/vnd/**/*.js", // добавил пути для слежения за изменениями файлов в папке js/vnd
		f_ttf2woff: source_folder + "/fonts/*.ttf" // добавил пути для слежения за изменениями файлов шрифтов в папке fonts/

	},
	clean: {
		cleanBuild: "./" + "build",
		cleanFontsWoff: source_folder + "/fonts-woff" //пути для команды очистки 
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
let fs = require('fs');
// const { CLIENT_RENEG_LIMIT } = require('tls'); // ?? не знаю для чего это и как тут появилось??
let $flag_folder;
// ANCHOR BrowserSync
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
// ANCHOR HTML 
function html() {
	return src(path.src.html) //путь к исходным html файлам
		.pipe(fileinclude()) //обращаемся к fileinclude
		.pipe(webphtml()) //формирование путей к webp
		.pipe(beautify.html())//
		.pipe(dest(path.build.html)) //путь к выходящим html файлам
		.pipe(browsersync.stream()); //синхронизация браузера
}

// ANCHOR SCSS и CSS 
function scssTask() {
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
	return src(path.src.cssTaskSrc, {}) //путь к исходным css файлам
		.pipe(sourcemaps.init())
		.pipe(order([
			"vnd/jquery/*.css",
			"vnd/**/*.css",
			"libs/**/*.css"
		]))
		.pipe(concat("vnd-lib.css"))
		.pipe(sourcemaps.write())
		.pipe(dest(path.src.cssTaskDest))
}

function scssCssTask() {
	return src(path.src.scssCssTaskSrc, {}) //путь к исходным css файлам
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(order([
			"vnd-lib.css",
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
		.pipe(clean_css())
		.pipe(rename({ extname: ".min.css" }))
		.pipe(sourcemaps.write())
		.pipe(dest(path.build.css))

}

async function delCssFolderSrc() {
	del(path.src.cssTaskDest);
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

// ANCHOR JS
function jsTask() {
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

// ANCHOR FONTS -  Шрифты - Конвертация ttf в woff
async function f_ttf2woff(params) {
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
		$flag_woff = 15;
	}
}
// Функция копирования woff шрифтов из папки src/fonts-woff в папку build/ 
async function woff2build() {
	checkFolder(path.src.f_woffDest);
	if ($flag_folder == 5) {
		let $tr = src(path.src.f_woffSrc)
			.pipe(dest(path.build.fonts));
		console.log('\n ***Шрифты из папки: ' + path.src.f_woffSrc + '\n скопированы в папку: ' + path.build.fonts + '\n -----');
		return $tr;
	} else {
		console.log('\n ***Шрифты из папки: ' + path.src.f_woffSrc + '\n НЕ скопированы в папку: ' + path.build.fonts + '\n *****Почему?');
	}
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
	console.log('\n Закончился процесс конвертации ttf файлов в woff и woff2 \n');
	let file_content = fs.readFileSync(source_folder + '/scss/_fonts.scss');
	if (file_content == '') {
		console.log('\n Файл _fonts.scss - Пустой, Процесс пошел!');
		fs.writeFile(source_folder + '/scss/_fonts.scss', '', cb);
		return fs.readdir(path.build.fonts, function (err, items) { // здесь путь куда пишутся стили Шрифтов 
			if (items) {
				let c_fontname;
				let $numbers_fonts = items.length;
				console.log('\n Надо обработать ' + $numbers_fonts + ' шрифтов');
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(source_folder + '/scss/_fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
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

// ANCHOR Сервисные Функции
// Функция-1.  Очистка папки build 
function cleanBuild() {
	console.log('\n ** Удаление папки ' + path.clean.cleanBuild + ' **\n');
	return del(path.clean.cleanBuild);
}
function cleanFontsWoff() {
	console.log('\n ** Удаление папки ' + path.clean.cleanFontsWoff + ' **\n');
	checkFolder(path.clean.cleanFontsWoff);
	if ($flag_folder == 5) {
		return del(path.clean.cleanFontsWoff);
	}
	console.log('\n ** Итог: Папки '+ path.clean.cleanFontsWoff + ' Нет!\n Удалять нечего!\n -----\n\n' );
}
exports.cleanFontsWoff = cleanFontsWoff;
// Функция-2. Очистка Терминала
async function cleanTerminal() {
	console.group();
	for (let i = 0; i < 10; i++) {
		console.log('\n');
	}
	console.groupEnd("End ");
}

// Функция-3. Проверка наличия Папки
async function checkFolder(params) {
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


// ANCHOR Watcher
//Отслеживание файлов для синхронизации
function watchFiles() {
	gulp.watch([path.watch.html], html);
	// gulp.watch([path.watch.css], css);
	gulp.watch([path.watch.scssTask], scssTask);
	gulp.watch([path.watch.cssTask], cssTask);
	gulp.watch([path.watch.scssCssTask], scssCssTask);
	gulp.watch([path.watch.jsTask], jsTask);
	gulp.watch([path.watch.img], img);
	gulp.watch([path.watch.img], img);
	gulp.watch([path.watch.vnd_css], vnd_css); // добавил слежение за файлами в папке scss/vnd
	gulp.watch([path.watch.vnd_js], vnd_js); // добавил слежение за файлами в папке js/vnd
	gulp.watch([path.watch.f_ttf2woff], f_ttf2woff); // добавил слежение за файлами шрифтов в папке fonts/

}

// ANCHOR Команды для запуска:
// build 
let build = gulp.series(cleanBuild, gulp.parallel(jsTask, html, img, f_ttf2woff, vnd_js, vnd_css), includeFonts, fontStyle);
let watch_build = gulp.parallel(build, watchFiles, browserSync);
// develop - для работы, чтобы время не тратить на шрифты и картинки, watch долго запускается 
let develop = gulp.series(cleanBuild, gulp.parallel(jsTask, html, vnd_js, vnd_css));
let watch_develop = gulp.parallel(develop, watchFiles, browserSync);
// production
let production = gulp.series(cleanBuild, gulp.parallel(jsTask, html, vnd_js, vnd_css));
let watch_production = gulp.parallel(production, watchFiles, browserSync);
// только для проверки подключения Шрифтов
let fonts_check = gulp.series(cleanBuild, gulp.parallel(series(scssTask, cssTask, scssCssTask), jsTask, html, f_ttf2woff), delCssFolderSrc, fontStyle);
// let fonts_check = gulp.series(clean, gulp.parallel(series(scssTask, cssTask, scssCssTask), html));
let watch_fonts_check = gulp.parallel(fonts_check, watchFiles, browserSync);


// ANCHOR EXPORTS
// html
exports.html = html; //срабатывание команды html
// scss, css
exports.scssTask = scssTask; // Объединение scss файлов в корне папки scss/ и  папке scss-blocks/
exports.cssTask = cssTask; // Объединение css файлов в папках: libs/ и vnd/ css
exports.scssCssTask = scssCssTask; // Объединение всех css файлов в созданной для этого папке src/css
exports.vnd_css = vnd_css; // запуск команды для обновления css файлов папке vnd 
exports.delCssFolderSrc = delCssFolderSrc; // удаление папки src/css после переноса стилей в build  
//js
exports.jsTask = jsTask; //срабатывание команды js
exports.vnd_js = vnd_js; // запуск команды для обновления js файлов папке vnd 
// exports.js = js; //срабатывание команды js
// img
exports.img = img; //срабатывание команды img
// fonts
exports.fontStyle = fontStyle; //запуск команды подключение шрифтов в файл стилей
exports.f_ttf2woff = f_ttf2woff; //запуск команды для шрифтов
exports.includeFonts = includeFonts; //запуск команды подключение шрифтов
exports.woff2build = woff2build;
// Сервисные
exports.cleanBuild = cleanBuild; //запуск удаления директории - build
exports.cleanFontsWoff = cleanFontsWoff;
exports.cleanTerminal = cleanTerminal; // Очистка - Терминала
// Команды 
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

//Проверочные и Отладочные функции:

async function debug_var() {
	console.log('\n* params *\n');
}
exports.debug_var = debug_var;


async function debug_path() {
	let h = path.src.f_woffDest;
	let p = checkFolder(path.src.f_woffDest);
	console.log(h);
	console.log(p);

}
exports.debug_path = debug_path;



