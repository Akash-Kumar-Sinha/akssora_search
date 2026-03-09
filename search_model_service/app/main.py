from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.content_handler.routes import router as videos_router
from app.search_handler.search import search

app = FastAPI()

origins = [
    "http://localhost.8000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(videos_router)

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/search")
def search_end(query: str):
    print(f"Received search query: {query}")
    return search(query)