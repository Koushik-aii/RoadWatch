from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api import roads, complaints

app = FastAPI(
    title="RoadWatch API",
    description="API for RoadWatch, a civic road transparency and complaint platform.",
    version="1.0.0",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins in development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"message": "Welcome to the RoadWatch API"}

@app.get("/api/health")
def health_check():
    return {"status": "healthy"}

app.include_router(roads.router)
app.include_router(complaints.router)
