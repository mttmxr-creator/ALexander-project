#!/usr/bin/env python3
"""
Простой скрипт для запуска frontend на локальном HTTP сервере
"""

import http.server
import socketserver
import webbrowser
import os
from pathlib import Path

def start_frontend_server(port=3000):
    """Запускает HTTP сервер для frontend"""
    
    # Получаем путь к текущей папке
    frontend_dir = Path(__file__).parent
    os.chdir(frontend_dir)
    
    # Создаем HTTP сервер
    Handler = http.server.SimpleHTTPRequestHandler
    
    with socketserver.TCPServer(("", port), Handler) as httpd:
        print(f"🚀 Frontend сервер запущен на http://localhost:{port}")
        print(f"📁 Обслуживается папка: {frontend_dir}")
        print("=" * 50)
        print("📋 Доступные файлы:")
        
        # Показываем доступные файлы
        for file in frontend_dir.iterdir():
            if file.is_file():
                print(f"  📄 {file.name}")
        
        print("=" * 50)
        print("💡 Откройте http://localhost:3000 в браузере")
        print("💡 Или нажмите Enter для автоматического открытия")
        print("🛑 Нажмите Ctrl+C для остановки сервера")
        
        # Автоматически открываем браузер
        try:
            input()
            webbrowser.open(f"http://localhost:{port}")
        except KeyboardInterrupt:
            pass
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n🛑 Сервер остановлен")

if __name__ == "__main__":
    try:
        start_frontend_server()
    except KeyboardInterrupt:
        print("\n👋 До свидания!")
    except Exception as e:
        print(f"❌ Ошибка: {e}")
        print("💡 Убедитесь, что порт 3000 свободен")
