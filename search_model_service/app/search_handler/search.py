import json

from app.lib.constant import (
    MODEL_ID,
    EMBEDDING_DIMENSION,
    VECTOR_BUCKET,
    INDEX_NAME,
    s3vector_client,
    client
)

def search(query):

    response = client.invoke_model(
        body=json.dumps({
            "taskType": "SINGLE_EMBEDDING",
            "singleEmbeddingParams": {
                "embeddingPurpose": "GENERIC_INDEX",
                "embeddingDimension": EMBEDDING_DIMENSION,
                "text": {
                    "truncationMode": "END",
                    "value": query
                }
            }
        }),
        modelId=MODEL_ID,
        accept="application/json",
        contentType="application/json"
    )

    response_body = json.loads(response["body"].read())
    query_embedding = response_body["embeddings"][0]["embedding"]

    # Query vector DB
    response = s3vector_client.query_vectors(
        vectorBucketName=VECTOR_BUCKET,
        indexName=INDEX_NAME,
        queryVector={"float32": query_embedding},
        topK=20,
        returnDistance=True,
        returnMetadata=True
    )

    vectors = response["vectors"]

    # Sort by similarity (lower distance = better)
    vectors.sort(key=lambda x: x["distance"])

    results = []

    for vector in vectors:
        metadata = vector["metadata"]
        distance = vector["distance"]

        result = {
            "type": metadata.get("type"),
            "score": distance
        }

        if metadata.get("type") == "image":
            result["url"] = metadata.get("content")

        elif metadata.get("type") == "video":
            result["url"] = metadata.get("http_url")
            result["start_time"] = metadata.get("start_time")
            result["end_time"] = metadata.get("end_time")
            result["transcript"] = metadata.get("transcript")

        results.append(result)

    return results