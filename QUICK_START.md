# 🚀 Быстрый запуск DeepSeek AI Assistant

## 1. Установка зависимостей
```bash
cd DeepSeek V3.1
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
```

## 2. Настройка API ключа
```bash
cp env_example.txt .env
# Отредактируйте .env и добавьте ваш DeepSeek API ключ
```

## 3. Быстрая проверка
```bash
python quick_test.py
```

## 4. Запуск сервера
```bash
python run.py
```

## 5. Тестирование API
```bash
python test_chat.py
```

## 🌐 Доступные URL
- **API**: http://localhost:8000
- **Документация**: http://localhost:8000/docs
- **Проверка здоровья**: http://localhost:8000/health

## 📝 Пример запроса
```bash
curl -X POST "http://localhost:8000/chat" \
  -H "Content-Type: application/json" \
  -d '{"message": "Расскажи о принципах влияния на людей"}'
```

## ⚠️ Важно
- Убедитесь, что у вас есть действующий DeepSeek API ключ
- База знаний загружается автоматически при запуске
- Все файлы из папки `base1/` включаются в базу знаний
