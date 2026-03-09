import time
import os
import mimetypes
import json
from botocore.exceptions import ClientError

from app.lib.constant import MODEL_ID, EMBEDDING_DIMENSION, VECTOR_BUCKET, INDEX_NAME, s3vector_client, s3_client, client, S3_BUCKET, S3_EMBEDDING_DESTINATION_URI, transcribe_client

from app.lib.file_name import file_name

def upload_video_to_s3(video_path):
    try:
        object_key = os.path.basename(video_path)
        content_type, _ = mimetypes.guess_type(video_path)

        s3_key = f"videos/{object_key}"

        s3_client.upload_file(
            video_path,
            S3_BUCKET,
            s3_key,
            ExtraArgs={
                "ACL": "public-read",
                "ContentType": content_type or "video/mp4"
            }
        )

        s3_uri = f"s3://{S3_BUCKET}/{s3_key}"
        url = f"https://{S3_BUCKET}.s3.ap-south-1.amazonaws.com/{s3_key}"

        return {
            "s3_uri": s3_uri,
            "url":url
        }

    except ClientError as e:
        print("S3 upload failed:", e)
        return None

    except Exception as e:
        print("Unexpected error:", e)
        return None
    

def transcribe_video(video_path, job_name):
    """Get full transcript with timestamps from AWS Transcribe."""
    transcribe_client.start_transcription_job(
        TranscriptionJobName=job_name,
        Media={"MediaFileUri": video_path},
        MediaFormat="mp4",
        LanguageCode="en-US",
        Settings={"ShowSpeakerLabels": False}
    )
    while True:
        job = transcribe_client.get_transcription_job(TranscriptionJobName=job_name)
        status = job["TranscriptionJob"]["TranscriptionJobStatus"]
        if status in ["COMPLETED", "FAILED"]:
            break
        time.sleep(10)

    if status == "FAILED":
        raise Exception("Transcription failed")

    transcript_uri = job["TranscriptionJob"]["Transcript"]["TranscriptFileUri"]
    import urllib.request
    with urllib.request.urlopen(transcript_uri) as f:
        transcript_data = json.loads(f.read().decode("utf-8"))

    return transcript_data["results"]["items"]  # word-level timestamps


def extract_transcript_for_segment(items, start_time, end_time):
    """Pull only the words that fall within this segment's time range."""
    words = []
    for item in items:
        if item["type"] != "pronunciation":
            continue
        word_start = float(item.get("start_time", 0))
        word_end = float(item.get("end_time", 0))
        if word_start >= start_time and word_end <= end_time:
            words.append(item["alternatives"][0]["content"])
    return " ".join(words)



def generate_video_embedding(video_path):
    segment_duration = 15
    job_name = f"ghost-editor-{int(time.time())}"
    print("Starting transcription job...")
    transcript_items = transcribe_video(video_path, job_name)
    print(f"Transcription complete: {len(transcript_items)} word tokens")
    model_input = {
        "taskType": "SEGMENTED_EMBEDDING",
        "segmentedEmbeddingParams": {
            "embeddingPurpose": "GENERIC_INDEX",
            "embeddingDimension": EMBEDDING_DIMENSION,
            "video": {
                "format": "mp4",
                "embeddingMode": "AUDIO_VIDEO_COMBINED",
                "source": {
                    "s3Location": {"uri": video_path}
                },
                "segmentationConfig": {
                    "durationSeconds": segment_duration
                }
            }
        }
    }
    print("Starting embedding job for video:", video_path)
    response = client.start_async_invoke(
        modelId=MODEL_ID,
        modelInput=model_input,
        outputDataConfig={
            "s3OutputDataConfig": {
                "s3Uri": S3_EMBEDDING_DESTINATION_URI
            }
        }
    )
    invocation_arn = response["invocationArn"]
    print("Embedding job started:", invocation_arn)
    while True:
        job = client.get_async_invoke(invocationArn=invocation_arn)
        status = job["status"]
        if status != "InProgress":
            break
        time.sleep(10)
    if status != "Completed":
        raise Exception("Embedding job failed")
    output_s3_uri = job["outputDataConfig"]["s3OutputDataConfig"]["s3Uri"]
    s3_uri_parts = output_s3_uri.replace("s3://", "").split("/", 1)
    bucket = s3_uri_parts[0]
    prefix = s3_uri_parts[1]
    embeddings_key = f"{prefix}/embedding-audio-video.jsonl"
    response = s3_client.get_object(Bucket=bucket, Key=embeddings_key)
    content = response["Body"].read().decode("utf-8")
    embeddings = []
    for i, line in enumerate(content.strip().split("\n")):
        data = json.loads(line)
        start_time = i * segment_duration
        end_time = start_time + segment_duration
        transcript = extract_transcript_for_segment(transcript_items, start_time, end_time)

        embeddings.append({
            "start_time": start_time,
            "end_time": end_time,
            "embedding": data["embedding"],
            "transcript": transcript, 
        })
    print(f"Generated {len(embeddings)} segment embeddings")
    return embeddings

def save_video_embedding_to_vector_db(embeddings, s3_uri, url):

    if not embeddings:
        print("No embeddings to store")
        return

    vectors = []

    for segment in embeddings:

        start_time = float(segment.get("start_time", 0.0))
        end_time = float(segment.get("end_time", 0.0))
        embedding = segment.get("embedding")
        transcript = segment.get("transcript", "")
        print(f"Processing segment: {start_time:.2f}s - {end_time:.2f}s")
        print(f"Transcript: {transcript}")

        if not embedding:
            continue

        # unique key per segment
        vector_key = f"{s3_uri}_{start_time}_{end_time}"

        vector_record = {
            "key": vector_key,
            "data": {
                "float32": embedding
            },
            "metadata": {
                "type": "video",
                "s3_uri": s3_uri,
                "url": url,
                "start_time": start_time,
                "end_time": end_time,
                "transcript": transcript
            }
        }

        vectors.append(vector_record)

    print(f"Uploading {len(vectors)} vectors to index {INDEX_NAME}")

    if not vectors:
        print("No valid vectors to upload")
        return

    try:

        s3vector_client.put_vectors(
            vectorBucketName=VECTOR_BUCKET,
            indexName=INDEX_NAME,
            vectors=vectors
        )

        print(f"Stored {len(vectors)} embeddings for video {http_url} in vector DB")

    except Exception as e:

        print("Vector upload failed")
        print("Vector Bucket:", VECTOR_BUCKET)
        print("Index Name:", INDEX_NAME)
        raise e
def upload_video(file):
    try:
        s3vector_client.create_vector_bucket(
            vectorBucketName=VECTOR_BUCKET
        )
        print(f"Vector bucket '{VECTOR_BUCKET}' created.")
    except s3vector_client.exceptions.ConflictException:
        print(f"Vector bucket '{VECTOR_BUCKET}' already exists.")
    
    try:
        s3vector_client.create_index(
            vectorBucketName=VECTOR_BUCKET,
            indexName=INDEX_NAME,
            dataType="float32",
            dimension=EMBEDDING_DIMENSION,
            distanceMetric="cosine"
        )
        print(f"Index '{INDEX_NAME}' created.")
    except s3vector_client.exceptions.ConflictException:
        print(f"Index '{INDEX_NAME}' already exists.")

    try:
        file_location = file_name(file)
        with open(file_location, "wb") as buffer:
            buffer.write(file.file.read())
        urls = upload_video_to_s3(file_location)

        if urls:
            s3_uri = urls["s3_uri"]
            url = urls["url"]

            embeddings = generate_video_embedding(s3_uri)
            save_video_embedding_to_vector_db(embeddings, s3_uri, url)
            print(f"Generated embeddings for {len(embeddings)} frames from {url}")
    
    except Exception as e:
        print("Error processing the uploaded image:", e)
        return None