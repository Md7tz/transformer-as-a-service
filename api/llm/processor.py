from time import time
from transformers import AutoTokenizer, AutoModelForCausalLM
from fastapi import HTTPException
import torch

class LLMProcessor:
    def __init__(self):
        self.llm_model = None
        self.llm_tokenizer = None
        self.model_mapping = {
            "qwen2-0.5b-instruct": "Qwen/Qwen2-0.5B-Instruct",
        }
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        print(f"Device: {self.device}")

    def load_model(self, model_name: str):
        mapped_model_name = self.model_mapping.get(model_name)
        try:
            self.llm_model = AutoModelForCausalLM.from_pretrained(mapped_model_name, torch_dtype="auto", device_map="auto").to(self.device)
            self.llm_tokenizer = AutoTokenizer.from_pretrained(mapped_model_name, torch_dtype="auto")
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Failed to load {model_name} model") from e

    def recommend_review(self, text: str, sentiment: dict) -> str:
        prompt = f"Text: {text}\nSentiment: {sentiment['sentiment']} (confidence: {sentiment['confidence']:.2f})\nProvide a recommendation based on the sentiment."
        messages = [
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt}
        ]
        text_with_prompt = self.llm_tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
        model_inputs = self.llm_tokenizer([text_with_prompt], return_tensors="pt").to(self.device)
        
        generated_ids = self.llm_model.generate(model_inputs.input_ids, max_new_tokens=512)
        generated_ids = [
            output_ids[len(input_ids):] for input_ids, output_ids in zip(model_inputs.input_ids, generated_ids)
        ]
        
        recommendation = self.llm_tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0]
        return recommendation

    def process(self, text: str, sentiment_analysis: dict) -> dict:
        if not self.llm_model or not self.llm_tokenizer:
            raise HTTPException(status_code=500, detail="Model not loaded")

        print(f"device {self.device}")
        print(f"Processing text: {text}")
        start_time = time()

        recommendation = self.recommend_review(text, sentiment_analysis)

        computation_time = time() - start_time
        print(f"Computation time: {computation_time:.2f} seconds")
        result = {
            "original_text": text,
            "sentiment_analysis": sentiment_analysis,
            "recommendation": recommendation,
            "computation_time": computation_time,
            "device": str(self.device)
        }

        return result

# Example usage
llm_processor = LLMProcessor()
llm_processor.load_model("qwen2-0.5b-instruct")

# Example text input and sentiment analysis result
text_input = """I'm not sure what accomplished director/producer/cinematographer Joshua Caldwell was thinking taking on this project.
This film has got to be the epitome of terrible writing and should be a classroom example of 'what not to do' when writing a screenplay. 
Why would Joshua take on (clearly) amateur writer Adam Gaines script is beyond me. 
Even his good directing and excellent cinematography could not save this disaster."""

sentiment_analysis_result = {
    "sentiment": "negative",
    "confidence": 0.43
}

result = llm_processor.process(text_input, sentiment_analysis_result)
print(result)
