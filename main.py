from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import asyncio
import logging
import os
from typing import Optional

# Импортируем наши модули
from base_loader import load_b1c_base
from prompt_manager import PromptManager
from deepseek_client import DeepSeekClient

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Получаем порт из переменных окружения
PORT = int(os.getenv("PORT", "8000"))
HOST = os.getenv("HOST", "0.0.0.0")

# Создаем FastAPI приложение
app = FastAPI(
    title="DeepSeek AI Assistant",
    description="AI ассистент с базой знаний по психологии поведения",
    version="1.0.0"
)

# Включаем CORS для всех источников
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Глобальные переменные для хранения загруженных данных
prompt_manager: Optional[PromptManager] = None
deepseek_client: Optional[DeepSeekClient] = None
b1c_base_content: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    stream: Optional[bool] = False

class ChatResponse(BaseModel):
    response: str
    success: bool

@app.on_event("startup")
async def startup_event():
    """Загружаем все необходимые данные при запуске приложения"""
    global prompt_manager, deepseek_client, b1c_base_content
    
    try:
        logger.info("Загружаем базу знаний B1C...")
        b1c_base_content = load_b1c_base()
        logger.info(f"База знаний загружена, размер: {len(b1c_base_content)} символов")
        
        logger.info("Инициализируем менеджер промптов...")
        prompt_manager = PromptManager()
        prompt_manager.set_b1c_base(b1c_base_content)
        
        logger.info("Инициализируем DeepSeek клиент...")
        deepseek_client = DeepSeekClient()
        
        logger.info(f"Приложение успешно запущено на {HOST}:{PORT}!")
        
    except Exception as e:
        logger.error(f"Ошибка при запуске: {e}")
        raise e

@app.get("/health")
async def health_check():
    """Проверка здоровья приложения"""
    return {
        "status": "healthy",
        "b1c_base_loaded": b1c_base_content is not None,
        "prompt_manager_ready": prompt_manager is not None,
        "deepseek_client_ready": deepseek_client is not None,
        "port": PORT,
        "host": HOST
    }

@app.post("/chat")
async def chat_endpoint(request: ChatRequest):
    """Основной эндпоинт для чата с AI ассистентом"""
    
    if not all([prompt_manager, deepseek_client, b1c_base_content]):
        raise HTTPException(status_code=500, detail="Приложение не готово к работе")
    
    try:
        # Получаем финальный системный промпт
        system_prompt = prompt_manager.get_final_prompt()
        
        if request.stream:
            # Стриминг ответ
            return StreamingResponse(
                stream_response(request.message, system_prompt),
                media_type="text/plain"
            )
        else:
            # Обычный ответ
            response = await deepseek_client.simple_chat(request.message, system_prompt)
            return ChatResponse(response=response, success=True)
            
    except Exception as e:
        logger.error(f"Ошибка в чате: {e}")
        raise HTTPException(status_code=500, detail=f"Ошибка обработки запроса: {str(e)}")

async def stream_response(user_message: str, system_prompt: str):
    """Стриминг ответа от AI"""
    try:
        async for chunk in deepseek_client.chat_completion(
            [{"role": "user", "content": user_message}],
            system_prompt,
            stream=True
        ):
            yield chunk
    except Exception as e:
        logger.error(f"Ошибка стриминга: {e}")
        yield f"Ошибка: {str(e)}"

@app.get("/")
async def root():
    """Корневой эндпоинт с информацией о приложении"""
    return {
        "message": "DeepSeek AI Assistant API",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat",
            "health": "/health"
        },
        "status": "running",
        "port": PORT,
        "host": HOST
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=HOST, port=PORT)
