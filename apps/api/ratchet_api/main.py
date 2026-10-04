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
    # Find or create Repo
    from sqlalchemy import select
    from . import models
    import datetime
    
    repo_stmt = select(models.Repo).where(models.Repo.full_name == request.repo)
    result = await db.execute(repo_stmt)
    repo = result.scalars().first()
    
    if not repo:
        repo = models.Repo(full_name=request.repo, default_branch="main", ecosystem="auto")
        db.add(repo)
        await db.flush()
        
    # Determine sha/url
    fix_sha = request.fix.sha or "unknown"
    parent_sha = "unknown"
    pr_url = request.fix.url if request.fix.type == "pr" else None
    
    # Create the run
    new_run = models.Run(
        repo_id=repo.id,
        source="web",
        fix_sha=fix_sha,
        parent_sha=parent_sha,
        status=models.RunStatus.queued,
        pr_url=pr_url,
        trace_redacted=request.trace,
        logs_redacted=request.logs,
        started_at=datetime.datetime.utcnow()
    )
    
    db.add(new_run)
    await db.commit()
    await db.refresh(new_run)
    
    # TODO: enqueue to arq
    return schemas.CreateRunResponse(id=new_run.id, status="queued")

from sqlalchemy import select
from sqlalchemy.orm import selectinload
from . import models

@app.get("/api/v1/runs/{run_id}", response_model=schemas.RunDetailResponse)
async def get_run(run_id: UUID, db: AsyncSession = Depends(get_db)):
    stmt = (
        select(models.Run, models.Repo.full_name.label("repo_full_name"))
        .join(models.Repo, models.Run.repo_id == models.Repo.id)
        .where(models.Run.id == run_id)
    )
    result = await db.execute(stmt)
    row = result.first()
    
    if not row:
        raise HTTPException(status_code=404, detail="Run not found")
        
    run, repo_full_name = row
    
    # Mocking logs for now if they don't exist in the DB model as easily queryable fields
    # In a real scenario, these would come from attempts or gate results
    return schemas.RunDetailResponse(
        id=run.id,
        repo_full_name=repo_full_name,
        fix_sha=run.fix_sha,
        parent_sha=run.parent_sha,
        status=run.status,
        started_at=run.started_at,
        created_at=run.created_at,
        pr_url=run.pr_url,
        error_message=run.discard_reason or "KeyError when a subscription has no plan_id", 
        parent_fail_log=run.logs_redacted or "tests/regression/test_x.py::test_y\nE   KeyError: 'plan_id'\napp/billing.py:88  charge()\nran 5× identical",
        fix_pass_log="tests/regression/test_x.py::test_y\n1 passed in 0.04s\n\nran 5× identical"
    )

import hmac
import hashlib
import os
from fastapi import Request
from . import github

async def verify_github_webhook(request: Request) -> bytes:
    body = await request.body()
    signature_header = request.headers.get("x-hub-signature-256")
    secret = os.environ.get("GITHUB_WEBHOOK_SECRET")
    
    if secret and signature_header:
        hash_object = hmac.new(secret.encode("utf-8"), msg=body, digestmod=hashlib.sha256)
        expected_signature = "sha256=" + hash_object.hexdigest()
        if not hmac.compare_digest(expected_signature, signature_header):
            raise HTTPException(status_code=401, detail="Invalid GitHub webhook signature")
    return body

@app.post("/api/v1/webhooks/github")
async def github_webhook(request: Request):
    # Verify the webhook signature before processing
    await verify_github_webhook(request)
    
    event = request.headers.get("x-github-event")
    payload = await request.json()
    
    # Extract the installation ID (sent with almost all GitHub App webhooks)
    installation = payload.get("installation")
    if not installation:
        return {"status": "ignored", "reason": "No installation ID in payload"}
        
    installation_id = installation["id"]
    
    if event == "installation" and payload.get("action") in ["created", "new_permissions_accepted"]:
        # The app was just installed. Let's fetch all repos to prove it works!
        try:
            repos = await github.list_installation_repos(installation_id)
            print(f"✅ App successfully installed on account {payload['installation']['account']['login']}")
            print(f"📦 Fetched {len(repos)} repositories: {[r['full_name'] for r in repos]}")
            # TODO: Store these repos in the database!
        except Exception as e:
            print(f"❌ Failed to fetch repos after installation: {e}")
            
    elif event == "pull_request":
        # Handle PR events here
        action = payload.get("action")
        print(f"Received PR {action} event for installation {installation_id}")

    return {"status": "received", "event": event}

# Exception handler to match error format in TRD
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": "HTTP_ERROR", "message": exc.detail}},
    )
