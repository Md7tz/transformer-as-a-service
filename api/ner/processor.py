from time import time
from transformers import AutoTokenizer, AutoModelForTokenClassification, pipeline
from fastapi import HTTPException
from typing import Optional
from pydantic import BaseModel
import torch

from utils import convert_numpy_types, insert_entity_labels

class NERProcessor:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.model_mapping = {
            "bert": "dslim/bert-base-NER",
            "wikineural": "Babelscape/wikineural-multilingual-ner"
        }
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    def load_model(self, model_name: str):
        mapped_model_name = self.model_mapping.get(model_name)
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(mapped_model_name)
            self.model = AutoModelForTokenClassification.from_pretrained(mapped_model_name)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(f"Failed to load {self.model} model")) from e
        
    def process(self, prompt: str) -> dict:
        if not self.model or not self.tokenizer:
            raise HTTPException(status_code=500, detail="Model not loaded")

        start_time = time()
        # # Perform inference
        pipe = pipeline("ner", model=self.model, tokenizer=self.tokenizer, device=self.device)
        computation_time = time() - start_time

        results = pipe(prompt)
        enitites = results.copy()
        results.append({"processed_text": insert_entity_labels(prompt, enitites)})
        results.append({"computation_time": computation_time, "device": str(self.device)})
        results = convert_numpy_types(results)

        return results
        