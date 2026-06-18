/**
 * Скрипт быстрой интеграции с Telegram
 * Позволяет отправлять уведомления о вакансиях и откликах без бэкенда
 */

const TELEGRAM_CONFIG = {
    token: "8626789018:AAF2ckO6PqG-S4EnmwxpimcMDcu4_67bOwc", // ВСТАВЬТЕ СЮДА ВАШ API TOKEN
    chatId: "999417476" // ВСТАВЬТЕ СЮДА ВАШ ID (chat_id)
};

/**
 * Функция для отправки уведомления о новом отклике
 * @param {Object} data - данные об отклике (имя, вакансия, телефон)
 */
async function sendTelegramNotification(data) {
    if (!TELEGRAM_CONFIG.token || !TELEGRAM_CONFIG.chatId) {
        console.error("Ошибка: Настройте токен и chatId в telegram-notify.js");
        return;
    }

    const message = `
🔔 *Новый отклик на вакансию!*
----------------------------------
📍 *Вакансия:* ${data.vacancyTitle}
👤 *Кандидат:* ${data.userName}
📞 *Телефон:* ${data.phone}
----------------------------------
_Вы можете ответить кандидату прямо сейчас:_
    `;

    // Клавиатура с кнопками внутри Telegram
    const keyboard = {
        inline_keyboard: [
            [
                { text: "✅ Принять", callback_data: "accept_job" },
                { text: "❌ Отклонить", callback_data: "reject_job" }
            ],
            [
                { text: "💬 Позвонить кандидату", url: `tel:${data.phone}` }
            ]
        ]
    };

    const url = `https://api.telegram.org/bot${TELEGRAM_CONFIG.token}/sendMessage`;

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CONFIG.chatId,
                text: message,
                parse_mode: 'Markdown',
                reply_markup: keyboard
            })
        });

        if (response.ok) {
            console.log("Уведомление в Telegram отправлено успешно!");
        }
    } catch (error) {
        console.error("Ошибка при отправке в Telegram:", error);
    }
}

// ПРИМЕР ИСПОЛЬЗОВАНИЯ (навешиваем на кнопку отклика):
// Добавьте класс .respond-btn к вашей кнопке в HTML
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('respond-btn')) {
        // Имитируем сбор данных
        const demoData = {
            vacancyTitle: "Администратор (Актау, 14 мкр)",
            userName: "Алихан Жан",
            phone: "+7 747 000 00 00"
        };
        
        // Показываем пользователю, что запрос ушел
        const originalText = e.target.innerText;
        e.target.innerText = "Отправка...";
        
        sendTelegramNotification(demoData).then(() => {
            e.target.innerText = "Отклик отправлен!";
            e.target.style.backgroundColor = "#4CAF50";
        });
    }
});