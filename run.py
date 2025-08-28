#!/usr/bin/env python3
"""
Простой скрипт для запуска DeepSeek AI Assistant
"""

import uvicorn
import os
from dotenv import load_dotenv

if __name__ == "__main__":
    # Загружаем переменные окружения
    load_dotenv()
    
    # Настройки сервера
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))
    
    print(f"🚀 Запускаем DeepSeek AI Assistant на {host}:{port}")
    print("📚 База знаний будет загружена автоматически при запуске")
    print("💬 API будет доступен по адресу: http://localhost:8000")
    print("📖 Документация API: http://localhost:8000/docs")
    print("=" * 50)
    
    # Запускаем сервер
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
