import os
import mimetypes
import json
import base64
import uuid
import requests
from botocore.exceptions import ClientError
from concurrent.futures import ThreadPoolExecutor

from app.lib.constant import (
    MODEL_ID,
    EMBEDDING_DIMENSION,
    VECTOR_BUCKET,
    INDEX_NAME,
    s3vector_client,
    s3_client,
    client,
    S3_BUCKET,
    TEXT_INDEX_NAME
) 


from app.lib.file_name import file_name

from app.lib.generate_text_embedding import generate_text_embedding

def upload_image_to_s3(image_path):
    try:
        object_key = os.path.basename(image_path)
        content_type, _ = mimetypes.guess_type(image_path)
        s3_key = f"images/{object_key}"

        s3_client.upload_file(
            image_path,
            S3_BUCKET,
            s3_key,
            ExtraArgs={
                "ACL": "public-read",
                "ContentType": content_type or "image/png"}  
        )   

        image_url = f"https://{S3_BUCKET}.s3.amazonaws.com/{s3_key}"
        print("Upload successful:", image_url)

        return image_url

    except ClientError as e:
        print("S3 upload failed:", e)
        return None

    except Exception as e:
        print("Unexpected error:", e)
        return None



def generate_image_description(image_url: str) -> str:
    """Use Nova Lite to generate a text description of the image."""
    response = requests.get(image_url)
    image_bytes = base64.b64encode(response.content).decode("utf-8")
    result = client.invoke_model(
        body=json.dumps({
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "image": {
                                "format": "png",
                                "source": {"bytes": image_bytes}
                            }
                        },
                        {
                            "text": "Describe this image in detail — objects, people, setting, colors, actions, composition. Be concise, max 3 sentences."
                        }
                    ]
                }
            ],
            "inferenceConfig": {
                "maxTokens": 200,
                "temperature": 0.3
            }
        }),
        modelId="amazon.nova-lite-v1:0",
        accept="application/json",
        contentType="application/json"
    )
    body = json.loads(result["body"].read())
    return body["output"]["message"]["content"][0]["text"].strip()


def generate_image_embeddings(image_url: str):
    """Generate visual embedding from image."""
    response = requests.get(image_url)
    image_bytes = base64.b64encode(response.content).decode("utf-8")
    request_body = {
        "taskType": "SINGLE_EMBEDDING",
        "singleEmbeddingParams": {
            "embeddingPurpose": "GENERIC_INDEX",
            "embeddingDimension": EMBEDDING_DIMENSION,
            "image": {
                "format": "png",
                "source": {"bytes": image_bytes}
            },
        },
    }
    response = client.invoke_model(
        body=json.dumps(request_body),
        modelId=MODEL_ID,
        contentType="application/json",
    )
    response_body = json.loads(response["body"].read())
    return response_body["embeddings"][0]["embedding"]


def save_embedding_to_vector_db(embedding, text_embedding, image_url: str, description: str):
    image_id = str(uuid.uuid4())
    shared_metadata = {
        "type": "image",
        "url": image_url,
        "description": description,
        "image_id": image_id
    }

    s3vector_client.put_vectors(
        vectorBucketName=VECTOR_BUCKET,
        indexName=INDEX_NAME,
        vectors=[{
            "key": f"{image_id}#visual",
            "data": {"float32": embedding},
            "metadata": {**shared_metadata, "embedding_type": "visual"}
        }]
    )

    if text_embedding:
        s3vector_client.put_vectors(
            vectorBucketName=VECTOR_BUCKET,
            indexName=TEXT_INDEX_NAME,
            vectors=[{
                "key": f"{image_id}#text",
                "data": {"float32": text_embedding},
                "metadata": {**shared_metadata, "embedding_type": "text"}
            }]
        )


def upload_image(file):
    try:
        file_location = file_name(file)
        with open(file_location, "wb") as buffer:
            buffer.write(file.file.read())

        image_url = upload_image_to_s3(file_location)
        if image_url is None:
            print("Skipping image due to upload failure:", image_url)
            return

        description = generate_image_description(image_url)

        with ThreadPoolExecutor(max_workers=2) as executor:
            visual_future = executor.submit(generate_image_embeddings, image_url)
            text_future = executor.submit(generate_text_embedding, description)
            visual_embedding = visual_future.result()
            text_embedding = text_future.result()

        save_embedding_to_vector_db(visual_embedding, text_embedding, image_url, description)

        os.remove(file_location)
        return image_url

    except Exception as e:
        print("Error processing the uploaded image:", e)
        return None