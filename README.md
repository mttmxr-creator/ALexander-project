# DeepSeek AI Assistant

FastAPI приложение для AI ассистента с использованием DeepSeek API и предзагруженной базой знаний по психологии поведения.

## Особенности

- 🤖 Интеграция с DeepSeek API
- 📚 Автоматическая загрузка базы знаний из папки `base1`
- 💬 Поддержка обычного и стримингового чата
- 🔄 Автоматические повторы при ошибках API
- 🌐 CORS включен для всех источников
- 📊 Эндпоинт проверки здоровья
- 🚀 Готов к деплою на Vercel, Render, Railway
- 🎨 **Современный веб-интерфейс** - Готовый frontend для чата

## Структура проекта

```
DeepSeek V3.1/
├── main.py              # Основное FastAPI приложение
├── base_loader.py       # Загрузчик базы знаний
├── prompt_manager.py    # Менеджер промптов
├── deepseek_client.py   # Клиент DeepSeek API
├── config.py            # Конфигурация
├── requirements.txt     # Зависимости
├── test_chat.py         # Тестовый скрипт
├── quick_test.py        # Быстрая проверка
├── run.py               # Скрипт запуска
├── vercel.json          # Конфигурация Vercel
├── Procfile             # Конфигурация Render/Railway
├── Dockerfile           # Docker контейнер
├── docker-compose.yml   # Docker Compose
├── runtime.txt          # Версия Python
├── .gitattributes      # Git LFS настройки
├── env_example.txt      # Пример переменных окружения
├── README.md            # Документация
├── QUICK_START.md       # Быстрый старт
├── DEPLOY.md            # Инструкции по деплою
├── frontend/            # 🌐 Веб-интерфейс
│   ├── index.html       # Основная страница
│   ├── style.css        # Стили и темы
│   ├── script.js        # JavaScript логика
│   ├── start_frontend.py # Скрипт запуска
│   └── README.md        # Документация frontend
├── backend/             # Папка для backend файлов
├── base1/               # База знаний (PDF и TXT файлы)
└── prompts/             # Системные промпты
```

## Установка

### Локальная разработка

1. **Клонируйте репозиторий и перейдите в папку:**
   ```bash
   cd DeepSeek V3.1
   ```

2. **Создайте виртуальное окружение:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # Linux/Mac
   # или
   venv\Scripts\activate     # Windows
   ```

3. **Установите зависимости:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Настройте переменные окружения:**
   - Скопируйте `env_example.txt` в `.env`
   - Добавьте ваш DeepSeek API ключ:
     ```
     DEEPSEEK_API_KEY=your_actual_api_key_here
     ```

### Docker (рекомендуется)

```bash
# Создайте .env файл с API ключом
cp env_example.txt .env

# Запустите с Docker Compose
docker-compose up --build
```

## Запуск

### Backend API

#### Локальный запуск
```bash
python main.py
```

Или с uvicorn:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Или с run.py:
```bash
python run.py
```

#### Docker
```bash
docker-compose up
```

### Frontend (веб-интерфейс)

#### Быстрый запуск
```bash
cd frontend
python start_frontend.py
```

Или откройте `frontend/index.html` прямо в браузере.

#### Локальный сервер
```bash
cd frontend
python -m http.server 3000
# Откройте http://localhost:3000
```

### Тестирование
```bash
# Быстрая проверка backend
python quick_test.py

# Полное тестирование API
python test_chat.py

# Frontend автоматически тестирует подключение к API
```

## Веб-интерфейс 🌐

### Особенности frontend
- 🎨 **Современный дизайн** в стиле ChatGPT
- 🌓 **Темная/светлая тема** с автоматическим переключением
- 💬 **Адаптивный чат** с пузырями сообщений
- ⚡ **Стриминг ответов** для лучшего UX
- 📝 **Markdown рендеринг** для форматированных ответов
- 💾 **Локальное хранилище** истории чата
- ⌨️ **Горячие клавиши** для быстрой работы
- 📱 **Мобильная оптимизация**

### Использование
1. Запустите backend API (порт 8000)
2. Откройте frontend в браузере
3. Начните чат с AI ассистентом!

📖 **Подробная документация frontend**: [frontend/README.md](frontend/README.md)

## Деплой

### 🌐 Vercel (рекомендуется)
```bash
# Установите Vercel CLI
npm i -g vercel

# Деплой
vercel --prod
```

### 🚂 Render
1. Подключите GitHub репозиторий
2. Настройте переменные окружения
3. Автоматический деплой

### 🚄 Railway
1. Подключите GitHub репозиторий
2. Настройте переменные окружения
3. Автоматический деплой

📖 **Подробные инструкции по деплою**: [DEPLOY.md](DEPLOY.md)

## API Endpoints

### `GET /health`
Проверка состояния приложения:
```json
{
  "status": "healthy",
  "b1c_base_loaded": true,
  "prompt_manager_ready": true,
  "deepseek_client_ready": true,
  "port": 8000,
  "host": "0.0.0.0"
}
```

### `POST /chat`
Основной эндпоинт для чата:

**Запрос:**
```json
{
  "message": "Расскажи о принципах влияния на людей",
  "stream": false
}
```

**Ответ:**
```json
{
  "response": "Ответ от AI ассистента...",
  "success": true
}
```

### `GET /`
Информация о приложении и доступных эндпоинтах.

## База знаний

Приложение автоматически загружает все файлы из папки `base1/`:
- **TXT файлы** - читаются как текст
- **PDF файлы** - обрабатываются с помощью PyPDF2

Содержимое объединяется в единую базу знаний, которая используется для формирования "личности" AI ассистента.

⚠️ **Важно**: Папка `base1/` исключена из Git репозитория из-за больших размеров файлов. Загрузите содержимое отдельно после деплоя.

## Системный промпт

Системный промпт загружается из `prompts/system_prompt.txt` и объединяется с базой знаний для создания полной инструкции AI.

## Обработка ошибок

- Автоматические повторы при сетевых ошибках
- Обработка HTTP статусов (401, 429, 5xx)
- Логирование всех ошибок
- Graceful fallback при проблемах с файлами

## Разработка

### Добавление новых файлов в базу знаний
Просто поместите новые TXT или PDF файлы в папку `base1/` - они автоматически загрузятся при следующем запуске.

### Изменение системного промпта
Отредактируйте файл `prompts/system_prompt.txt` - изменения применятся при перезапуске.

### Настройка параметров API
Измените параметры в `deepseek_client.py`:
- `max_retries` - количество повторов
- `retry_delay` - задержка между повторами
- `temperature` - креативность ответов
- `max_tokens` - максимальная длина ответа

### Frontend разработка
- Все файлы в папке `frontend/`
- Чистый HTML/CSS/JavaScript без фреймворков
- Marked.js для рендеринга Markdown
- Inter font для современной типографики

## Требования

- Python 3.8+
- DeepSeek API ключ
- Доступ к интернету для API запросов
- Современный браузер для frontend

## Деплой и CI/CD

### Автоматический деплой
- Push в `main` ветку автоматически запускает деплой
- Vercel: мгновенно
- Render: ~2-5 минут
- Railway: ~1-3 минуты

### Переменные окружения
- `DEEPSEEK_API_KEY` - ваш API ключ DeepSeek
- `PORT` - порт для приложения (автоматически настраивается)
- `HOST` - хост для приложения (по умолчанию 0.0.0.0)

## Быстрый старт

### Полный стек (Backend + Frontend)
```bash
# Терминал 1: Backend
cd DeepSeek V3.1
python run.py

# Терминал 2: Frontend
cd frontend
python start_frontend.py
```

### Только API
```bash
python quick_test.py  # Проверка
python run.py         # Запуск
```

### Только Frontend
```bash
cd frontend
python start_frontend.py
# Откройте http://localhost:3000
```

## Лицензия

MIT License
