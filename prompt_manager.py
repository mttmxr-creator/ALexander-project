from pathlib import Path
from typing import Optional

class PromptManager:
    def __init__(self):
        self.system_prompt: Optional[str] = None
        self.b1c_base: Optional[str] = None
        self.combined_prompt: Optional[str] = None
        
    def load_system_prompt(self) -> str:
        """Загружает системный промпт из файла prompts/system_prompt.txt"""
        prompt_path = Path(__file__).parent / "prompts" / "system_prompt.txt"
        
        if not prompt_path.exists():
            # Если файл не существует, создаем базовый промпт
            default_prompt = """Ты - эксперт по психологии поведения, манипуляции и влиянию на людей. 
Твоя задача - помогать пользователям понимать и применять принципы поведенческой психологии 
для достижения своих целей в общении и взаимодействии с людьми."""
            return default_prompt
        
        try:
            with open(prompt_path, 'r', encoding='utf-8') as file:
                return file.read().strip()
        except Exception as e:
            print(f"Ошибка при чтении системного промпта: {e}")
            return "Ты - эксперт по психологии поведения и влиянию на людей."
    
    def set_b1c_base(self, base_content: str):
        """Устанавливает содержимое базы знаний B1C"""
        self.b1c_base = base_content
    
    def combine_prompts(self) -> str:
        """Объединяет системный промпт с базой знаний B1C"""
        if not self.system_prompt:
            self.system_prompt = self.load_system_prompt()
        
        if not self.b1c_base:
            raise ValueError("База знаний B1C не загружена")
        
        # Создаем финальный системный промпт
        combined = f"""Системный промпт:
{self.system_prompt}

База знаний:
{self.b1c_base}

Важно: Никогда не упоминай B1C_, внутренние префиксы или технические детали в ответах пользователю. 
Используй знания из базы для формирования экспертных ответов по психологии поведения и влияния."""
        
        self.combined_prompt = combined
        return combined
    
    def get_final_prompt(self) -> str:
        """Возвращает финальный объединенный промпт"""
        if not self.combined_prompt:
            self.combine_prompts()
        return self.combined_prompt
