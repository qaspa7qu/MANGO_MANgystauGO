/* ═══════════════════════════════════════════════════════
   MANGYSTAU GO — Чат-бот виджет
   Подключи в любую страницу (перед закрывающим </body>):

   <link rel="stylesheet" href="chatbot.css">
   <script src="chatbot.js"></script>

   ⚠️  ВАЖНО: вставь свой API ключ ниже в переменную
       ANTHROPIC_API_KEY и выбери нужную модель.
═══════════════════════════════════════════════════════ */

(function () {

    /* ─────────────────────────────────────────
       🔑  НАСТРОЙКИ — заполни сам
    ───────────────────────────────────────── */
    const ANTHROPIC_API_KEY = '';
    const MODEL             = 'stepfun/step-3.5-flash'; // или твоя модель

    /* Системный промпт — кто такой бот */
    const SYSTEM_PROMPT = `Ты — дружелюбный помощник платформы MANGystau GO.
Помогаешь работодателям и соискателям: объясняешь как разместить резюме или вакансию,
как пользоваться поиском, отвечаешь на вопросы о платформе.
Отвечай коротко и по делу. Если вопрос не связан с платформой — вежливо скажи,
что можешь помочь только по теме сервиса.
Язык ответа — тот же, на котором написан вопрос (русский или казахский).`;

    /* Быстрые подсказки (чипы) */
    const HINTS = [
        'Как добавить резюме?',
        'Как найти работу?',
        'Как связаться с работодателем?',
        'Что такое MANGystau GO?'
    ];

    /* ─────────────────────────────────────────
       История сообщений (для контекста)
    ───────────────────────────────────────── */
    let history = [];

    /* ─────────────────────────────────────────
       Создаём HTML виджета
    ───────────────────────────────────────── */
    document.body.insertAdjacentHTML('beforeend', `
        <!-- Кнопка-пузырь -->
        <button id="chatbot-bubble" aria-label="Открыть чат">
            <svg id="bubble-icon-chat" width="26" height="26" viewBox="0 0 24 24"
                 fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
        </button>

        <!-- Окно чата -->
        <div id="chatbot-window" role="dialog" aria-label="Чат с помощником">

            <!-- Шапка -->
            <div id="chatbot-header">
                <div class="chatbot-avatar">🥭</div>
                <div class="chatbot-header-info">
                    <div class="chatbot-name">MANGo Помощник</div>
                    <div class="chatbot-status">Онлайн</div>
                </div>
                <button id="chatbot-close" aria-label="Закрыть чат">✕</button>
            </div>

            <!-- Лента сообщений -->
            <div id="chatbot-messages"></div>

            <!-- Быстрые подсказки -->
            <div id="chatbot-hints"></div>

            <!-- Поле ввода -->
            <div id="chatbot-input-row">
                <textarea id="chatbot-input" rows="1"
                    placeholder="Напишите вопрос..." maxlength="500"></textarea>
                <button id="chatbot-send" aria-label="Отправить">
                    <svg width="18" height="18" viewBox="0 0 24 24"
                         fill="none" stroke="#fff" stroke-width="2.2"
                         stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"/>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                    </svg>
                </button>
            </div>
        </div>
    `);

    /* ─────────────────────────────────────────
       Ссылки на элементы
    ───────────────────────────────────────── */
    const bubble   = document.getElementById('chatbot-bubble');
    const win      = document.getElementById('chatbot-window');
    const closeBtn = document.getElementById('chatbot-close');
    const messages = document.getElementById('chatbot-messages');
    const hintsBox = document.getElementById('chatbot-hints');
    const input    = document.getElementById('chatbot-input');
    const sendBtn  = document.getElementById('chatbot-send');

    let isOpen = false;

    /* ─────────────────────────────────────────
       Открыть / закрыть
    ───────────────────────────────────────── */
    function openChat() {
        isOpen = true;
        win.classList.add('show');
        bubble.classList.add('open');
        bubble.classList.remove('has-notify');
        if (messages.children.length === 0) {
            addBotMessage('Привет! 👋 Я MANGo Помощник. Чем могу помочь?');
            renderHints();
        }
        setTimeout(() => input.focus(), 220);
    }

    function closeChat() {
        isOpen = false;
        win.classList.remove('show');
        bubble.classList.remove('open');
    }

    bubble.addEventListener('click', () => isOpen ? closeChat() : openChat());
    closeBtn.addEventListener('click', closeChat);

    /* ─────────────────────────────────────────
       Рендер быстрых чипов
    ───────────────────────────────────────── */
    function renderHints() {
        hintsBox.innerHTML = '';
        HINTS.forEach(h => {
            const chip = document.createElement('button');
            chip.className = 'hint-chip';
            chip.textContent = h;
            chip.addEventListener('click', () => {
                hintsBox.innerHTML = ''; // убираем чипы после выбора
                sendMessage(h);
            });
            hintsBox.appendChild(chip);
        });
    }

    /* ─────────────────────────────────────────
       Добавить сообщение в ленту
    ───────────────────────────────────────── */
    function addBotMessage(text) {
        const div = document.createElement('div');
        div.className = 'msg bot';
        div.textContent = text;
        messages.appendChild(div);
        scrollToBottom();
        return div;
    }

    function addUserMessage(text) {
        const div = document.createElement('div');
        div.className = 'msg user';
        div.textContent = text;
        messages.appendChild(div);
        scrollToBottom();
    }

    function addTyping() {
        const div = document.createElement('div');
        div.className = 'msg bot typing';
        div.id = 'typing-indicator';
        div.innerHTML = `
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>
            <div class="typing-dot"></div>`;
        messages.appendChild(div);
        scrollToBottom();
        return div;
    }

    function removeTyping() {
        const t = document.getElementById('typing-indicator');
        if (t) t.remove();
    }

    function scrollToBottom() {
        messages.scrollTop = messages.scrollHeight;
    }

    /* ─────────────────────────────────────────
       Отправить сообщение → API
    ───────────────────────────────────────── */
    async function sendMessage(text) {
        text = text.trim();
        if (!text) return;

        input.value = '';
        input.style.height = 'auto';
        sendBtn.disabled = true;

        addUserMessage(text);
        history.push({ role: 'user', content: text });

        const typing = addTyping();

        try {
            const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
        'Content-Type':  'application/json',
        'Authorization': 'Bearer ' + ANTHROPIC_API_KEY,
        'HTTP-Referer':  'http://127.0.0.1:3000',
        'X-Title':       'MANGystau GO'
    },
    body: JSON.stringify({
        model:    MODEL,
        messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...history
        ],
        max_tokens: 512
    })
});

const data  = await response.json();
const reply = data.choices?.[0]?.message?.content || 'Извините, не удалось получить ответ.';

            history.push({ role: 'assistant', content: reply });

            removeTyping();
            addBotMessage(reply);

        } catch (err) {
            console.error('Chatbot error:', err);
            removeTyping();
            addBotMessage('⚠️ Ошибка соединения. Попробуйте чуть позже.');
        }

        sendBtn.disabled = false;
        input.focus();
    }

    /* ─────────────────────────────────────────
       Отправка по кнопке и Enter
    ───────────────────────────────────────── */
    sendBtn.addEventListener('click', () => sendMessage(input.value));

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage(input.value);
        }
    });

    /* Авторасширение textarea */
    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = Math.min(input.scrollHeight, 90) + 'px';
    });

    /* ─────────────────────────────────────────
       Уведомление через 4 сек если чат закрыт
    ───────────────────────────────────────── */
    setTimeout(() => {
        if (!isOpen) bubble.classList.add('has-notify');
    }, 4000);

})();
