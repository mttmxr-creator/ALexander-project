# 🚀 Инструкции по деплою DeepSeek AI Assistant

## 📋 Подготовка к деплою

### 1. Подготовка репозитория
```bash
# Убедитесь, что все файлы закоммичены
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 2. Подготовка базы знаний
⚠️ **ВАЖНО**: Папка `base1/` содержит большие файлы и не должна быть в Git репозитории.
- Создайте отдельный репозиторий для базы знаний
- Или используйте Git LFS для больших файлов
- Или загружайте файлы отдельно после деплоя

## 🌐 Деплой на Vercel

### 1. Подключение к Vercel
1. Перейдите на [vercel.com](https://vercel.com)
2. Войдите через GitHub
3. Нажмите "New Project"
4. Выберите ваш репозиторий

### 2. Настройка переменных окружения
В настройках проекта добавьте:
```
DEEPSEEK_API_KEY=your_actual_deepseek_api_key
```

### 3. Настройка сборки
Vercel автоматически использует `vercel.json`:
- Python runtime: автоматически определяется
- Build command: автоматически
- Output directory: автоматически

### 4. Деплой
```bash
# Или используйте Vercel CLI
vercel --prod
```

## 🚂 Деплой на Render

### 1. Создание сервиса
1. Перейдите на [render.com](https://render.com)
2. Создайте новый Web Service
3. Подключите GitHub репозиторий

### 2. Настройка сервиса
- **Name**: deepseek-ai-assistant
- **Environment**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `gunicorn main:app --bind 0.0.0.0:$PORT --worker-class uvicorn.workers.UvicornWorker --workers 1 --timeout 120`

### 3. Переменные окружения
Добавьте в Environment Variables:
```
DEEPSEEK_API_KEY=your_actual_deepseek_api_key
PORT=10000
```

### 4. Автоматический деплой
- Включите Auto-Deploy
- Выберите ветку `main`

## 🚄 Деплой на Railway

### 1. Создание проекта
1. Перейдите на [railway.app](https://railway.app)
2. Создайте новый проект
3. Подключите GitHub репозиторий

### 2. Настройка
Railway автоматически определит Python проект и использует `Procfile`

### 3. Переменные окружения
Добавьте:
```
DEEPSEEK_API_KEY=your_actual_deepseek_api_key
```

## 🔧 Настройка после деплоя

### 1. Загрузка базы знаний
После деплоя загрузите файлы базы знаний:
```bash
# Для Vercel (через CLI)
vercel env pull .env.local

# Для Render/Railway (через веб-интерфейс)
# Загрузите файлы в папку base1/
```

### 2. Проверка работоспособности
```bash
# Проверьте health endpoint
curl https://your-app.vercel.app/health

# Проверьте чат
curl -X POST "https://your-app.vercel.app/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Тест"}'
```

## 📊 Мониторинг

### 1. Логи
- **Vercel**: Dashboard → Functions → Logs
- **Render**: Logs в веб-интерфейсе
- **Railway**: Logs в веб-интерфейсе

### 2. Метрики
- **Vercel**: Analytics в Dashboard
- **Render**: Metrics в веб-интерфейсе
- **Railway**: Metrics в веб-интерфейсе

## 🚨 Решение проблем

### 1. Ошибка импорта модулей
```bash
# Убедитесь, что все файлы в корне проекта
# Проверьте PYTHONPATH в vercel.json
```

### 2. Ошибка загрузки базы знаний
```bash
# Проверьте, что папка base1/ доступна
# Убедитесь, что файлы не слишком большие
```

### 3. Таймауты API
```bash
# Увеличьте timeout в vercel.json
# Проверьте настройки gunicorn в Procfile
```

## 🔄 Обновление

### 1. Автоматическое обновление
- Push в `main` ветку автоматически запускает деплой
- Vercel: мгновенно
- Render: ~2-5 минут
- Railway: ~1-3 минуты

### 2. Ручное обновление
```bash
# Vercel
vercel --prod

# Render/Railway
# Через веб-интерфейс
```

## 📝 Полезные команды

### Vercel CLI
```bash
# Установка
npm i -g vercel

# Логин
vercel login

# Деплой
vercel --prod

# Переменные окружения
vercel env add DEEPSEEK_API_KEY
```

### Проверка статуса
```bash
# Health check
curl https://your-app.vercel.app/health

# API info
curl https://your-app.vercel.app/
```

## 🎯 Рекомендации

1. **Используйте Git LFS** для больших файлов базы знаний
2. **Настройте мониторинг** для отслеживания ошибок
3. **Используйте staging** окружение для тестирования
4. **Настройте алерты** для критических ошибок
5. **Регулярно обновляйте** зависимости
