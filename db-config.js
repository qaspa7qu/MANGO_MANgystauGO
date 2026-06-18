const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Создаем или открываем файл базы данных в папке проекта
const dbPath = path.resolve(__dirname, 'database.sqlite');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Ошибка подключения к SQLite:', err.message);
    } else {
        console.log('Успешно подключились к базе данных SQLite.');
    }
});

// Создаем таблицу пользователей, если её еще нет
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            role TEXT
        )
    `);
});

module.exports = db;