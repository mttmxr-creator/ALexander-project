#!/usr/bin/env python3
"""
Тестовый скрипт для проверки работы DeepSeek AI Assistant API
"""

import asyncio
import httpx
import json

# URL для тестирования (локальный сервер)
BASE_URL = "http://localhost:8000"

async def test_health():
    """Тестируем эндпоинт проверки здоровья"""
    print("🔍 Тестируем /health...")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(f"{BASE_URL}/health")
            print(f"✅ Статус: {response.status_code}")
            print(f"📊 Ответ: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
        except Exception as e:
            print(f"❌ Ошибка: {e}")
    
    print("-" * 50)

async def test_chat(message: str, stream: bool = False):
    """Тестируем чат эндпоинт"""
    print(f"💬 Тестируем /chat (stream={stream})...")
    print(f"📝 Сообщение: {message}")
    
    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "message": message,
                "stream": stream
            }
            
            if stream:
                # Тестируем стриминг
                async with client.stream("POST", f"{BASE_URL}/chat", json=payload) as response:
                    print(f"✅ Статус: {response.status_code}")
                    print("📡 Стриминг ответ:")
                    print("-" * 30)
                    
                    full_response = ""
                    async for chunk in response.aiter_text():
                        print(chunk, end="", flush=True)
                        full_response += chunk
                    
                    print("\n" + "-" * 30)
                    print(f"📊 Полный ответ ({len(full_response)} символов)")
            else:
                # Тестируем обычный ответ
                response = await client.post(f"{BASE_URL}/chat", json=payload)
                print(f"✅ Статус: {response.status_code}")
                print(f"📊 Ответ: {json.dumps(response.json(), indent=2, ensure_ascii=False)}")
                
        except Exception as e:
            print(f"❌ Ошибка: {e}")
    
    print("-" * 50)

async def main():
    """Основная функция тестирования"""
    print("🚀 Запускаем тесты DeepSeek AI Assistant API")
    print("=" * 50)
    
    # Тест 1: Проверка здоровья
    await test_health()
    
    # Тест 2: Обычный чат
    await test_chat("Расскажи мне о принципах влияния на людей")
    
    # Тест 3: Стриминг чат
    await test_chat("Как можно развить уверенность в себе?", stream=True)
    
    # Тест 4: Короткий вопрос
    await test_chat("Что такое манипуляция?")
    
    print("🎉 Тестирование завершено!")

if __name__ == "__main__":
    # Запускаем асинхронные тесты
    asyncio.run(main())
