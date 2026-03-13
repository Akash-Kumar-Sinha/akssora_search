import json
from app.lib.constant import client, TEXT_EMBEDDING_MODEL_ID

def generate_text_embedding(text: str) -> list:
    response = client.invoke_model(
        body=json.dumps({
            "inputText": text,
            "normalize": True
        }),
        modelId=TEXT_EMBEDDING_MODEL_ID,
        contentType="application/json",
        accept="application/json"
    )
    body = json.loads(response["body"].read())
    return body["embedding"]