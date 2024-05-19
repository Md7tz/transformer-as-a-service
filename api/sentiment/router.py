from typing import Annotated
from fastapi import APIRouter, HTTPException
from transformers import AutoTokenizer, AutoModelForSequenceClassification
from fastapi import Depends
from .processor import SentimentProcessor, ModelType
from dependencies import get_jwt, get_db
from models import Prompt, Result

processor = SentimentProcessor()

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


@router.post("/predict")
async def predict_sentiment(request: dict, jwt: Annotated[dict, Depends(get_jwt)], db = Depends(get_db)):
    prompt = request.get("prompt").strip()
    model_name = request.get("model_name")
    analysis_type = request.get("type")
    # print(jwt)
    # print(f"prompt: {prompt}")
    # print(f"model_name: {model_name}")
    if not model_name:
        raise HTTPException(status_code=400, detail="missing model")
    elif not prompt:
        raise HTTPException(status_code=400, detail="missing prompt")
    
    if model_name:
        processor.load_model(model_name)
    results = processor.process(prompt)

    # Save the prompt and result to the database
    user_id = jwt.get("user_id")

    result = Result(output=results)
    db.add(result)
    db.commit()

    prompt = Prompt(user_id=user_id, model_id=ModelType.CLASSIFICATION, result_id=result.id, input=prompt, analysis_type=analysis_type)
    db.add(prompt)
    db.commit()
    
    return results


@router.get("/webhook")
async def webhook(jwt: Annotated[dict, Depends(get_jwt)], db = Depends(get_db)):
    # Get user ID from JWT
    user_id = jwt.get("user_id")

    # Query prompts and their results for the user
    prompts = db.query(Prompt).filter(Prompt.user_id == user_id).all()

    # Construct response
    response_data = []
    for prompt in prompts:
        response_data.append({
            "id": prompt.id,
            "user_id": prompt.user_id,
            "model_id": prompt.model_id,
            "result": prompt.result,
            "input": prompt.input,
            "analysis_type": prompt.analysis_type,
            "created_at": prompt.created_at,
            "deleted_at": prompt.deleted_at
        })

    return {"prompts": response_data}