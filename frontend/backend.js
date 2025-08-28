// 🚀 JavaScript Backend для работы прямо в браузере
class JavaScriptBackend {
    constructor() {
        this.baseKnowledge = null;
        this.promptManager = null;
        this.isInitialized = false;
    }

    // Инициализация backend
    async init() {
        try {
            console.log('🚀 Инициализация JavaScript Backend...');
            
            // Загружаем базу знаний из HTML
            this.baseKnowledge = window.BASE_KNOWLEDGE || '';
            console.log('📚 База знаний загружена:', this.baseKnowledge.length, 'символов');
            
            // Загружаем системный промпт
            this.systemPrompt = window.SYSTEM_PROMPT || 'Ты полезный AI ассистент.';
            console.log('🧠 Системный промпт загружен:', this.systemPrompt.length, 'символов');
            
            // Если база знаний пустая, загружаем из файла
            if (!this.baseKnowledge || this.baseKnowledge.length < 1000) {
                console.log('⚠️ База знаний пустая, загружаю из файла...');
                try {
                    const response = await fetch('./knowledge_base.txt');
                    if (response.ok) {
                        this.baseKnowledge = await response.text();
                        console.log('📚 База знаний загружена из файла:', this.baseKnowledge.length, 'символов');
                    }
                } catch (error) {
                    console.error('❌ Ошибка загрузки базы знаний:', error);
                }
            }
            
            // Создаем менеджер промптов
            this.promptManager = new PromptManager();
            this.promptManager.setSystemPrompt(this.systemPrompt);
            this.promptManager.setBaseKnowledge(this.baseKnowledge);
            
            this.isInitialized = true;
            console.log('✅ JavaScript Backend инициализирован');
            console.log('📊 Итоговые размеры:');
            console.log('  - База знаний:', this.baseKnowledge.length, 'символов');
            console.log('  - Системный промпт:', this.systemPrompt.length, 'символов');
            
        } catch (error) {
            console.error('❌ Ошибка инициализации backend:', error);
            throw error;
        }
    }

    // Обработка чат запроса
    async processChat(userMessage) {
        if (!this.isInitialized) {
            throw new Error('Backend не инициализирован');
        }

        try {
            console.log('💬 Обрабатываю сообщение:', userMessage);
            console.log('🔑 Проверяю API ключ:', window.DEEPSEEK_API_KEY ? 'Найден' : 'НЕ НАЙДЕН');
            
            // Формируем полный промпт
            const fullPrompt = this.promptManager.getFullPrompt(userMessage);
            console.log('📝 Полный промпт сформирован, длина:', fullPrompt.length);
            
            // Вызываем DeepSeek API
            console.log('🚀 Вызываю DeepSeek API...');
            const response = await this.callDeepSeekAPI(fullPrompt);
            console.log('✅ Ответ получен, длина:', response.length);
            
            return response;
            
        } catch (error) {
            console.error('❌ Ошибка обработки чата:', error);
            throw error;
        }
    }

    // Вызов DeepSeek API
    async callDeepSeekAPI(prompt) {
        try {
            // Проверяем API ключ
            if (!window.DEEPSEEK_API_KEY) {
                throw new Error('API ключ не найден. Проверьте настройки.');
            }
            
            console.log('🔑 API ключ найден:', window.DEEPSEEK_API_KEY.substring(0, 10) + '...');
            console.log('📤 Отправляю запрос к DeepSeek API...');
            
            const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${window.DEEPSEEK_API_KEY}`
                },
                body: JSON.stringify({
                    model: 'deepseek-chat',
                    messages: [
                        {
                            role: 'system',
                            content: prompt
                        },
                        {
                            role: 'user',
                            content: 'Пользователь задал вопрос. Ответь на него.'
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 4000
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;

        } catch (error) {
            console.error('❌ Ошибка DeepSeek API:', error);
            
            // Возвращаем заглушку если API недоступен
            return `Извините, произошла ошибка при обращении к AI API: ${error.message}. 
            
Это может быть связано с:
- Неправильным API ключом
- Превышением лимитов API
- Проблемами сети

Попробуйте позже или проверьте настройки API ключа.`;
        }
    }

    // Проверка здоровья backend
    async healthCheck() {
        return {
            status: 'healthy',
            backend_type: 'javascript_browser',
            initialized: this.isInitialized,
            base_knowledge_size: this.baseKnowledge ? this.baseKnowledge.length : 0,
            prompt_manager_ready: this.promptManager !== null
        };
    }
}

// Менеджер промптов
class PromptManager {
    constructor() {
        this.systemPrompt = '';
        this.baseKnowledge = '';
    }

    setSystemPrompt(prompt) {
        this.systemPrompt = prompt;
    }

    setBaseKnowledge(knowledge) {
        this.baseKnowledge = knowledge;
    }

    getFullPrompt(userMessage) {
        return `${this.systemPrompt}

${this.baseKnowledge}

ВАЖНО: Никогда не упоминай B1C_, внутренние префиксы или технические детали.

Пользователь: ${userMessage}

Ассистент:`;
    }
}

// Экспортируем для использования
window.JavaScriptBackend = JavaScriptBackend;
window.PromptManager = PromptManager;
