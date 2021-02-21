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