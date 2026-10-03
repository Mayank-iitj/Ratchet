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
