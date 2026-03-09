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

    response = s3vector_client.query_vectors(
        vectorBucketName=VECTOR_BUCKET,
        indexName=INDEX_NAME,
        queryVector={"float32": query_embedding},
        topK=20,
        returnDistance=True,
        returnMetadata=True
    )

    vectors = response["vectors"]
    vectors.sort(key=lambda x: x["distance"])

    results = []
    video_map = {}

    for vector in vectors:
        metadata = vector["metadata"]
        distance = vector["distance"]

        if metadata.get("type") == "image":
            results.append({
                "type": "image",
                "url": metadata.get("url"),
                "score": distance
            })

        elif metadata.get("type") == "video":
            url = metadata.get("url")

            if url not in video_map:
                video_map[url] = {
                    "type": "video",
                    "url": url,
                    "score": distance,
                    "segments": []
                }

            video_map[url]["segments"].append({
                "start_time": metadata.get("start_time"),
                "end_time": metadata.get("end_time"),
                "transcript": metadata.get("transcript"),
                "score": distance
            })

    results.extend(video_map.values())
    results.sort(key=lambda x: x["score"])

    return results