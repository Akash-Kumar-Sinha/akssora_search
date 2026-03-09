import os
import uuid
from fastapi import APIRouter, UploadFile, File
from app.content_handler.image import upload_image

from app.lib.create_vector_bucket_and_index import create_vector_bucket_and_index
from app.lib.file_name import file_name
from app.workers.producer import publish_video_job
from app.content_handler.video import upload_video_to_s3

router = APIRouter(prefix="/upload")

@router.post("/image")
async def upload_image_handler(file: UploadFile = File(...)):
    create_vector_bucket_and_index()
    upload_image(file)
    return {"type": "image", "message": "Image uploaded and processed successfully"}


@router.post("/video")
async def upload_video_handler(file: UploadFile = File(...)):
    create_vector_bucket_and_index()

    try:
        file_location = file_name(file)
        with open(file_location, "wb") as buffer:
            buffer.write(file.file.read())
        urls = upload_video_to_s3(file_location)

        os.remove(file_location)
        if not urls:
            return {"error": "Failed to upload video"}

    except Exception as e:
        return None

    job_id = str(uuid.uuid4())

    publish_video_job({
        "job_id": job_id,
        "s3_url": urls["s3_url"],
        "url": urls["url"]
    })

    return {"type": "video",  "message": "Video uploaded successfully, processing in background"}