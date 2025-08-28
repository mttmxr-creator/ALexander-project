import os
import PyPDF2
from pathlib import Path
from typing import List

def load_b1c_base() -> str:
    """
    Загружает все файлы из папки backend/base1 и объединяет их в одну строку.
    Обрабатывает как текстовые файлы, так и PDF.
    """
    base_path = Path(__file__).parent / "base1"
    
    if not base_path.exists():
        raise FileNotFoundError(f"Папка {base_path} не найдена")
    
    combined_content = []
    
    # Получаем список всех файлов в папке
    files = list(base_path.glob("*"))
    
    for file_path in files:
        try:
            if file_path.suffix.lower() == '.pdf':
                # Обрабатываем PDF файлы
                content = _extract_pdf_text(file_path)
            elif file_path.suffix.lower() == '.txt':
                # Обрабатываем текстовые файлы
                content = _extract_txt_text(file_path)
            else:
                # Пропускаем неизвестные форматы
                continue
                
            if content.strip():
                combined_content.append(f"=== {file_path.name} ===\n{content}\n")
                
        except Exception as e:
            print(f"Ошибка при чтении файла {file_path}: {e}")
            continue
    
    return "\n".join(combined_content)

def _extract_pdf_text(pdf_path: Path) -> str:
    """Извлекает текст из PDF файла"""
    try:
        with open(pdf_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            text = ""
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
            return text.strip()
    except Exception as e:
        print(f"Ошибка при чтении PDF {pdf_path}: {e}")
        return ""

def _extract_txt_text(txt_path: Path) -> str:
    """Извлекает текст из текстового файла"""
    try:
        with open(txt_path, 'r', encoding='utf-8') as file:
            return file.read().strip()
    except UnicodeDecodeError:
        # Пробуем другие кодировки
        try:
            with open(txt_path, 'r', encoding='latin-1') as file:
                return file.read().strip()
        except Exception as e:
            print(f"Ошибка при чтении текстового файла {txt_path}: {e}")
            return ""
    except Exception as e:
        print(f"Ошибка при чтении текстового файла {txt_path}: {e}")
        return ""
