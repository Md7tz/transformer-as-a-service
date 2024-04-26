import torch
import torch.nn.functional as F
from transformers import BertTokenizer, BertForSequenceClassification, BertConfig

CLASS_NAMES = ["negative", "neutral", "positive"]
MAX_SEQUENCE_LENGTH = 160

class BertModel:
    def __init__(self):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = BertTokenizer.from_pretrained("bert-base-cased")
        self.config = BertConfig.from_pretrained("bert-base-cased", output_hidden_states=True)
        self.model = BertForSequenceClassification.from_pretrained("bert-base-cased", config=self.config)
        self.model.load_state_dict(torch.load("../../pipelines/assets/model_state_dict.bin", map_location=self.device))

        self.model.to(self.device)
        self.model.eval()

    def predict(self, text):
        encoded_text = self.tokenizer.encode_plus(
            text,
            max_length=MAX_SEQUENCE_LENGTH,
            add_special_tokens=True,
            return_token_type_ids=False,
            pad_to_max_length=True,
            return_attention_mask=True,
            return_tensors="pt"
        )        

        input_ids = encoded_text["input_ids"].to(self.device)
        attention_mask = encoded_text["attention_mask"].to(self.device)

        with torch.no_grad():
            outputs = self.model(input_ids, attention_mask=attention_mask)
            probabilities = F.softmax(outputs.logits, dim=1)

        confidence, predicted_class = torch.max(probabilities, dim=1)
        predicted_class = predicted_class.item()
        probabilities = probabilities.flatten().cpu().numpy().tolist()
        return (
            CLASS_NAMES[predicted_class],
            confidence.item(),
            dict(zip(CLASS_NAMES, probabilities))
        )

# model singleton
bert_model = BertModel()

def get_model():
    return bert_model

def test_bert_model():
    text = "This is a test sentence."
    model = get_model()
    sentiment, confidence, probabilities = model.predict(text)
    print(f"Predicted sentiment: {sentiment}")
    print(f"Confidence: {confidence}")
    print("Class probabilities:")
    for label, prob in probabilities.items():
        print(f"{label}: {prob}")

# Test the BertModel
test_bert_model()
