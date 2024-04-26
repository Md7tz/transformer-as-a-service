from transformers import AutoTokenizer, AutoModelForSequenceClassification
from fastapi import HTTPException
from typing import Optional
from pydantic import BaseModel
from time import time
import torch

class SentimentProcessor:
    def __init__(self):
        self.model = None
        self.tokenizer = None
        self.model_mapping = {
            "bert": "kwang123/bert-sentiment-analysis",
            # Add more models here
            "roberta": "cardiffnlp/twitter-roberta-base-sentiment-latest"
        }
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    def load_model(self, model_name: str):
        mapped_model_name = self.model_mapping.get(model_name, model_name)
        try:
            self.tokenizer = AutoTokenizer.from_pretrained(mapped_model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(mapped_model_name)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(f"Failed to load {self.model} model")) from e
        
    def process(self, prompt: str) -> dict:
        if not self.model or not self.tokenizer:
            raise HTTPException(status_code=500, detail="Model not loaded")

        # Tokenize input text
        inputs = self.tokenizer(prompt, return_tensors="pt")
        labels = self.model.config.id2label

        # Perform inference
        start_time = time()
        with torch.no_grad():
            outputs = self.model(**inputs.to(self.device))
        computation_time = time() - start_time

        # Get predicted labels and scores
        logits = outputs.logits
        scores = logits.softmax(dim=1).tolist()[0]
        labels = [labels[i] for i in range(len(labels))]
            
        results = [{"label": label, "score": score} for label, score in zip(labels, scores)]
        # Include computation time in the response
        results.append({"computation_time": computation_time, "device": str(self.device)})

        return results
        
