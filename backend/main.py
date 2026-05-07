import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from routes.mentions import router as mentions_router
from routes.geo import router as geo_router
from routes.ai_response import router as ai_router
from routes.trust_score import router as trust_router

load_dotenv()

app = FastAPI(title="Vigil.ai API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(mentions_router)
app.include_router(geo_router)
app.include_router(ai_router)
app.include_router(trust_router)


@app.get("/")
def root():
    return {"status": "ok", "brand": "Housing.com", "version": "1.0.0"}


@app.get("/health")
def health():
    return {"status": "healthy"}
