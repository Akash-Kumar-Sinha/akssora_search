import os
import mimetypes
import json
import base64
import uuid
import requests
from botocore.exceptions import ClientError

from app.lib.constant  import MODEL_ID, EMBEDDING_DIMENSION, VECTOR_BUCKET, INDEX_NAME, s3vector_client, s3_client, client, S3_BUCKET
from app.lib.file_name import file_name

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

def generate_image_embeddings(image_url):
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
    embedding = response_body["embeddings"][0]["embedding"]

    return embedding

def save_embedding_to_vector_db(embedding, image_url):
    vector_record = {
        "key": str(uuid.uuid4()),
        "data": {"float32": embedding},
        "metadata": {
            "type": "image",
            "url": image_url,
        }
    }

    s3vector_client.put_vectors(
        vectorBucketName=VECTOR_BUCKET,
        indexName=INDEX_NAME,
        vectors=[vector_record]
    )
    print("Saved embedding to vector DB for image:", image_url)

def upload_image(file):
    try:
        file_location = file_name(file)

        with open(file_location, "wb") as buffer:
            buffer.write(file.file.read())
        
        image_url = upload_image_to_s3(file_location)

        if image_url is None:
            print("Skipping image due to upload failure:", image_url)
            return

        embedding = generate_image_embeddings(image_url)

        save_embedding_to_vector_db(embedding, image_url)

        os.remove(file_location)

        return image_url

    except Exception as e:
        print("Error processing the uploaded image:", e)
        return None