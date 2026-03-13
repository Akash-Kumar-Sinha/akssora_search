import boto3
from dotenv import load_dotenv
load_dotenv()

MODEL_ID = "amazon.nova-2-multimodal-embeddings-v1:0"
EMBEDDING_DIMENSION = 3072

TEXT_EMBEDDING_MODEL_ID = "amazon.titan-embed-text-v2:0"
TEXT_INDEX_NAME="text-embeddings"
TEXT_EMBEDDING_DIMENSION = 1024

VECTOR_BUCKET = "my-vector-store"
INDEX_NAME = "embeddings"

REGION="ap-south-1"

S3_BUCKET = "elasticbeanstalk-ap-south-1-140023393631"

S3_EMBEDDING_DESTINATION_URI = f"s3://{S3_BUCKET}/embeddings/"

s3_client = boto3.client("s3", region_name=REGION)

s3vector_client = boto3.client("s3vectors", region_name="us-east-1")

client = boto3.client("bedrock-runtime", region_name="us-east-1")

transcribe_client = boto3.client("transcribe", region_name=REGION)
