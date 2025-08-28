# 🚀 Полное развертывание на GitHub

## 📋 Что будет работать:
- ✅ **Frontend**: GitHub Pages (бесплатно)
- ✅ **Backend**: GitHub Actions (бесплатно)
- ✅ **API**: Прямо с GitHub
- ✅ **База знаний**: Встроена в код

## 🔑 Шаг 1: Настройка GitHub Secrets

### 1. Перейдите в ваш репозиторий:
```
https://github.com/mttmxr-creator/ALexander-project
```

### 2. Откройте Settings → Secrets and variables → Actions

### 3. Добавьте новый секрет:
- **Name**: `DEEPSEEK_API_KEY`
- **Value**: `sk-bdc400f5aaa143f6bf37e01b0e42bf05`

### 4. Нажмите "Add secret"

## 🚀 Шаг 2: Запуск деплоя

### 1. Закоммитьте и запушьте код:
```bash
git add .
git commit -m "Setup GitHub Actions deployment"
git push
```

### 2. GitHub Actions автоматически запустится

### 3. Следите за прогрессом:
```
https://github.com/mttmxr-creator/ALexander-project/actions
```

## 🌐 Шаг 3: Проверка работы

### 1. Frontend будет доступен по адресу:
```
https://mttmxr-creator.github.io/ALexander-project/
```

### 2. Backend будет работать через GitHub Actions

### 3. Все API вызовы будут обрабатываться GitHub

## 🎯 Результат:
**Готовая ссылка для друзей:**
```
https://mttmxr-creator.github.io/ALexander-project/
```

## ⚠️ Важно:
- GitHub Actions бесплатно дает 2000 минут в месяц
- Backend будет работать только при активных запросах
- Для продакшн нагрузки лучше использовать Render/Railway

## 🔧 Устранение проблем:
- Проверьте GitHub Actions логи
- Убедитесь что секрет `DEEPSEEK_API_KEY` добавлен
- Проверьте что ветка `gh-pages` создалась
