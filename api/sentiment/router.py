from typing import Annotated
from fastapi import APIRouter, HTTPException, Request
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from fastapi import Depends
from auth.utils import JWT


router = APIRouter(
    prefix="/sentiment",
    tags=["sentiment"],
)

# Load model directly
tokenizer = AutoTokenizer.from_pretrained("kwang123/bert-sentiment-analysis")
model = AutoModelForSequenceClassification.from_pretrained("kwang123/bert-sentiment-analysis")


@router.get("/")
async def read_root():
    return {"message": "Sentiment Analysis API"}

# sentiment analysis endpoint
# /sentiment/predict

@router.post("/predict")
async def predict_sentiment(request: dict, jwt: Annotated[dict, Depends(JWT)]):
    prompt = request.get("prompt").strip()
    model_name = request.get("model_name")
    analysis_type = request.get("type")

    print(f"prompt: {prompt}")
    print(f"model_name: {model_name}")
    if not model_name:
        raise HTTPException(status_code=400, detail="missing model")
    
    if not prompt:
        raise HTTPException(status_code=400, detail="missing prompt")
    
    # Tokenize input text
    inputs = tokenizer(prompt, return_tensors="pt")
    labels = model.config.id2label
    # Perform inference
    outputs = model(**inputs)
    
    # Get predicted labels and scores
    logits = outputs.logits
    scores = logits.softmax(dim=1).tolist()[0]
    labels = [labels[i] for i in range(len(labels))]

    results = [{"label": label, "score": score} for label, score in zip(labels, scores)]
    
    return results