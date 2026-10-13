from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routes.document import router as document_router
from app.routes.chat import router as chat_router


app = FastAPI(
    title="AI Enterprise Document Assistant"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(
    document_router,
    prefix="/documents",
    tags=["Documents"]
)


app.include_router(
    chat_router,
    prefix="/chat",
    tags=["Chat"]
)


@app.get("/")
def home():
    return {
        "message": "AI Enterprise Document Assistant API Running"
    }