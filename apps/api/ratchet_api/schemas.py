from pydantic import BaseModel, Field
from typing import Optional
from uuid import UUID

class FixReference(BaseModel):
    type: str = Field(..., pattern="^(commit|pr)$")
    sha: Optional[str] = None
    url: Optional[str] = None
    number: Optional[int] = None

class RunOptions(BaseModel):
    max_attempts: int = 4
    stability_runs: int = 5
    ecosystem: str = "auto"

class CreateRunRequest(BaseModel):
    repo: str
    fix: FixReference
    trace: str
    logs: Optional[str] = None
    options: RunOptions = Field(default_factory=RunOptions)

class CreateRunResponse(BaseModel):
    id: UUID
    status: str = "queued"

class ErrorDetail(BaseModel):
    code: str
    message: str
    field: Optional[str] = None

class ErrorResponse(BaseModel):
    error: ErrorDetail

from datetime import datetime

class RunDetailResponse(BaseModel):
    id: UUID
    repo_full_name: str
    fix_sha: str
    parent_sha: str
    status: str
    started_at: Optional[datetime] = None
    created_at: datetime
    pr_url: Optional[str] = None
    error_message: Optional[str] = None
    parent_fail_log: Optional[str] = None
    fix_pass_log: Optional[str] = None
