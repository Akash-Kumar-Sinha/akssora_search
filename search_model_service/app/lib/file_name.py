import time

def file_name(file):
    timestamp = int(time.time())
    safe_filename = file.filename.replace(" ", "_")
    filename = f"{timestamp}_{safe_filename}"
    file_location = f"/tmp/{filename}"
    return file_location
