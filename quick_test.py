#!/usr/bin/env python3
"""
Быстрый тест для проверки загрузки базы знаний
"""

def test_base_loader():
    """Тестируем загрузчик базы знаний"""
    print("🧪 Тестируем загрузчик базы знаний...")
    
    try:
        from base_loader import load_b1c_base
        
        # Загружаем базу знаний
        content = load_b1c_base()
        
        print(f"✅ База знаний успешно загружена!")
        print(f"📊 Размер: {len(content)} символов")
        print(f"📁 Содержит информацию из файлов в папке base1/")
        
        # Показываем первые 500 символов
        preview = content[:500] + "..." if len(content) > 500 else content
        print(f"\n📖 Предварительный просмотр:\n{preview}")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка при загрузке базы знаний: {e}")
        return False

def test_prompt_manager():
    """Тестируем менеджер промптов"""
    print("\n🧪 Тестируем менеджер промптов...")
    
    try:
        from prompt_manager import PromptManager
        
        # Создаем менеджер
        pm = PromptManager()
        
        # Загружаем системный промпт
        system_prompt = pm.load_system_prompt()
        print(f"✅ Системный промпт загружен: {len(system_prompt)} символов")
        
        # Устанавливаем тестовую базу знаний
        pm.set_b1c_base("Тестовая база знаний для проверки работы менеджера промптов.")
        
        # Объединяем промпты
        combined = pm.combine_prompts()
        print(f"✅ Промпты объединены: {len(combined)} символов")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка в менеджере промптов: {e}")
        return False

def test_config():
    """Тестируем конфигурацию"""
    print("\n🧪 Тестируем конфигурацию...")
    
    try:
        # Проверяем наличие .env файла
        import os
        if os.path.exists(".env"):
            print("✅ Файл .env найден")
        else:
            print("⚠️  Файл .env не найден (создайте его из env_example.txt)")
        
        # Проверяем переменные окружения
        from dotenv import load_dotenv
        load_dotenv()
        
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if api_key and api_key != "your_deepseek_api_key_here":
            print("✅ DEEPSEEK_API_KEY настроен")
        else:
            print("⚠️  DEEPSEEK_API_KEY не настроен или имеет значение по умолчанию")
        
        return True
        
    except Exception as e:
        print(f"❌ Ошибка в конфигурации: {e}")
        return False

def main():
    """Основная функция тестирования"""
    print("🚀 Быстрый тест DeepSeek AI Assistant")
    print("=" * 50)
    
    tests = [
        test_base_loader,
        test_prompt_manager,
        test_config
    ]
    
    passed = 0
    total = len(tests)
    
    for test in tests:
        if test():
            passed += 1
    
    print("\n" + "=" * 50)
    print(f"📊 Результаты тестирования: {passed}/{total} тестов пройдено")
    
    if passed == total:
        print("🎉 Все тесты пройдены! Приложение готово к запуску.")
        print("\n📋 Следующие шаги:")
        print("1. Создайте файл .env из env_example.txt")
        print("2. Добавьте ваш DeepSeek API ключ")
        print("3. Запустите: python run.py")
    else:
        print("⚠️  Некоторые тесты не пройдены. Проверьте ошибки выше.")
    
    return passed == total

if __name__ == "__main__":
    main()
