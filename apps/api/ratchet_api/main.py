import asyncio
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID

from . import schemas
from .database import get_db

app = FastAPI(title="Ratchet API", version="1.0")

@app.get("/api/v1/healthz")
async def healthz():
    return {"status": "ok"}

@app.get("/api/v1/readyz")
async def readyz():
    return {"status": "ready"}

@app.post("/api/v1/runs", response_model=schemas.CreateRunResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_run(request: schemas.CreateRunRequest, db: AsyncSession = Depends(get_db)):
    # TODO: Validate fix parent, store run in DB, enqueue to arq
    # For now, return mock accepted response
    from uuid import uuid4
    return schemas.CreateRunResponse(id=uuid4(), status="queued")

@app.get("/api/v1/runs/{run_id}")
async def get_run(run_id: UUID, db: AsyncSession = Depends(get_db)):
    # TODO: Fetch run details from DB
    raise HTTPException(status_code=404, detail="Run not found")

@app.post("/api/v1/webhooks/github")
async def github_webhook():
    # TODO: Verify HMAC, handle issue/PR labels
    return {"status": "received"}

# Exception handler to match error format in TRD
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": "HTTP_ERROR", "message": exc.detail}},
    )
