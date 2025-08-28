import httpx
import json
import asyncio
from typing import AsyncGenerator, Dict, Any, Optional
from config import DEEPSEEK_API_KEY, DEEPSEEK_API_URL, DEEPSEEK_MODEL

class DeepSeekClient:
    def __init__(self):
        self.api_key = DEEPSEEK_API_KEY
        self.api_url = DEEPSEEK_API_URL
        self.model = DEEPSEEK_MODEL
        self.max_retries = 3
        self.retry_delay = 1.0
        
    async def chat_completion(
        self, 
        messages: list, 
        system_prompt: str,
        stream: bool = False,
        temperature: float = 0.7,
        max_tokens: int = 4000
    ) -> AsyncGenerator[str, None]:
        """
        Отправляет запрос к DeepSeek API и возвращает ответ
        
        Args:
            messages: Список сообщений в формате [{"role": "user", "content": "..."}]
            system_prompt: Системный промпт с базой знаний
            stream: Включить стриминг ответа
            temperature: Температура генерации (0.0 - 1.0)
            max_tokens: Максимальное количество токенов в ответе
        """
        
        # Формируем полный системный промпт
        full_messages = [{"role": "system", "content": system_prompt}] + messages
        
        payload = {
            "model": self.model,
            "messages": full_messages,
            "stream": stream,
            "temperature": temperature,
            "max_tokens": max_tokens
        }
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        for attempt in range(self.max_retries):
            try:
                async with httpx.AsyncClient(timeout=60.0) as client:
                    if stream:
                        async with client.stream("POST", self.api_url, json=payload, headers=headers) as response:
                            response.raise_for_status()
                            async for line in response.aiter_lines():
                                if line.strip() and line.startswith("data: "):
                                    data = line[6:]  # Убираем "data: "
                                    if data == "[DONE]":
                                        break
                                    try:
                                        json_data = json.loads(data)
                                        if "choices" in json_data and len(json_data["choices"]) > 0:
                                            delta = json_data["choices"][0].get("delta", {})
                                            if "content" in delta:
                                                yield delta["content"]
                                    except json.JSONDecodeError:
                                        continue
                    else:
                        response = await client.post(self.api_url, json=payload, headers=headers)
                        response.raise_for_status()
                        result = response.json()
                        
                        if "choices" in result and len(result["choices"]) > 0:
                            content = result["choices"][0]["message"]["content"]
                            yield content
                        else:
                            raise ValueError("Неожиданный формат ответа от API")
                            
                # Если успешно, выходим из цикла повторов
                break
                
            except httpx.HTTPStatusError as e:
                if e.response.status_code == 401:
                    raise ValueError("Неверный API ключ DeepSeek")
                elif e.response.status_code == 429:
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(self.retry_delay * (2 ** attempt))
                        continue
                    else:
                        raise ValueError("Превышен лимит запросов к API")
                elif e.response.status_code >= 500:
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(self.retry_delay * (2 ** attempt))
                        continue
                    else:
                        raise ValueError(f"Ошибка сервера DeepSeek: {e.response.status_code}")
                else:
                    raise ValueError(f"HTTP ошибка: {e.response.status_code}")
                    
            except httpx.RequestError as e:
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (2 ** attempt))
                    continue
                else:
                    raise ValueError(f"Ошибка сети: {str(e)}")
                    
            except Exception as e:
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(self.retry_delay * (2 ** attempt))
                    continue
                else:
                    raise ValueError(f"Неожиданная ошибка: {str(e)}")
    
    async def simple_chat(self, user_message: str, system_prompt: str) -> str:
        """
        Простой чат без стриминга - возвращает полный ответ
        """
        messages = [{"role": "user", "content": user_message}]
        
        response_content = ""
        async for chunk in self.chat_completion(messages, system_prompt, stream=False):
            response_content += chunk
            
        return response_content
