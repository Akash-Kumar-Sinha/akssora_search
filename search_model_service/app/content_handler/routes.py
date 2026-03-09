from fastapi import APIRouter, UploadFile, File
from app.content_handler.image import upload_image
from app.content_handler.video import upload_video 

router = APIRouter(prefix="/upload")

@router.post("/image")
async def upload_image_handler(file: UploadFile = File(...)):
    print(f"Received image file: {file.filename}")
    upload_image(file)

    return {"type": "image", "filename": file.filename}

@router.post("/video")
async def upload_video_handler(file: UploadFile = File(...)):
    print(f"Received video file: {file.filename}")
    upload_video(file)
    return {"type": "video", "filename": file.filename}