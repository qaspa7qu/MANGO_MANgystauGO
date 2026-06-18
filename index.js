const express = require('express');
const cors = require('cors');
const db = require('./db-config');
const app = express();
const PORT = 3000;

// Настройка CORS
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(express.json());

// Функция очистки номера (удаляет пробелы, дефисы, скобки, оставляя только + и цифры)
function normalizePhone(phone) {
    if (!phone) return '';
    // Если в строке есть @, значит это email босса — просто убираем пробелы
    if (phone.includes('@')) return phone.trim().toLowerCase();
    // Если это телефон воркера — очищаем от лишних символов
    return phone.replace(/[^\d+]/g, ''); 
}
// 1. Эндпоинт для РЕГИСТРАЦИИ
app.post('/api/register', (req, res) => {
    console.log("=== ПОПЫТКА РЕГИСТРАЦИИ ===");
    
    const rawUsername = req.body.username || req.body.phone;
    const username = normalizePhone(rawUsername); // Очищаем перед сохранением
    const { password, role } = req.body;

    console.log(`Оригинал: "${rawUsername}" -> После очистки: "${username}"`);

    if (!username) {
        return res.status(400).json({ error: "Поле username или phone обязательно!" });
    }

    const sql = `INSERT INTO users (username, password, role) VALUES (?, ?, ?)`;
    db.run(sql, [username, password, role], function(err) {
        if (err) {
            console.error("Ошибка БД при регистрации:", err.message);
            return res.status(400).json({ error: "Такой пользователь уже есть!" });
        }
        console.log(`✅ Пользователь ${username} успешно добавлен с ID: ${this.lastID}`);
        res.json({ message: "Пользователь успешно зарегистрирован!", id: this.lastID });
    });
});

// 2. Эндпоинт для АВТОРИЗАЦИИ (Логина)
app.post('/api/worker/login', (req, res) => {
    console.log("=== ПОПЫТКА ВХОДА ===");
    
    const rawPhone = req.body.phone || req.body.username;
    const phone = normalizePhone(rawPhone); // Очищаем перед поиском в базе
    const { password } = req.body;

    console.log(`Оригинал при входе: "${rawPhone}" -> После очистки: "${phone}"`);

    if (!phone || !password) {
        return res.status(400).json({ error: "Логин и пароль обязательны" });
    }

    const sql = `SELECT * FROM users WHERE username = ? AND password = ?`;
    db.get(sql, [phone, password], (err, row) => {
        if (err) {
            console.error("Ошибка БД при логине:", err.message);
            return res.status(500).json({ error: "Ошибка базы данных" });
        }
        
        if (!row) {
            console.log(`❌ Отказ: В базе нет юзера с логином "${phone}" и паролем "${password}"`);
            return res.status(401).json({ message: "Неверный номер или пароль" });
        }

        console.log(`✅ Успех! Пользователь ${row.username} вошел в систему.`);
        res.json({ 
            message: "Авторизация успешна!", 
            id: row.id, 
            phone: row.username 
        });
    });
});

// ВРЕМЕННЫЙ РОУТ ДЛЯ СБРОСА БАЗЫ ДАННЫХ
app.get('/api/debug/clear-users', (req, res) => {
    db.run(`DELETE FROM users`, (err) => {
        if (err) return res.status(500).send("Ошибка при очистке: " + err.message);
        res.send("Таблица пользователей успешно очищена!");
    });
});

// Запуск бэкенд-сервера
app.listen(PORT, () => {
    console.log(`Бэкенд запущен на http://172.25.201.9:${PORT}`);
});