import os, json
from confluent_kafka import Producer
from dotenv import load_dotenv

load_dotenv()

producer = Producer({
    "bootstrap.servers": os.getenv("KAFKA_BROKER", "localhost:9092")
})

def publish_video_job(job: dict):
    producer.produce(
        topic="video-processing",
        key=job["job_id"],
        value=json.dumps(job).encode("utf-8")
    )
    producer.flush()