from .constant import VECTOR_BUCKET, INDEX_NAME, s3vector_client, EMBEDDING_DIMENSION

def create_vector_bucket_and_index():
    try:
        s3vector_client.create_vector_bucket(vectorBucketName=VECTOR_BUCKET)
    except s3vector_client.exceptions.ConflictException:
        pass

    try:
        s3vector_client.create_index(
            vectorBucketName=VECTOR_BUCKET,
            indexName=INDEX_NAME,
            dataType="float32",
            dimension=EMBEDDING_DIMENSION,
            distanceMetric="cosine"
        )
    except s3vector_client.exceptions.ConflictException:
        pass