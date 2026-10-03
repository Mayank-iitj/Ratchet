from datetime import datetime
from uuid import UUID, uuid4
from sqlalchemy import BigInteger, Boolean, Column, DateTime, Enum, ForeignKey, Integer, Numeric, String
from sqlalchemy.dialects.postgresql import JSONB, UUID as pgUUID
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import enum

Base = declarative_base()

class RunStatus(str, enum.Enum):
    queued = "queued"
    ingesting = "ingesting"
    locating = "locating"
    preparing_env = "preparing_env"
    synthesizing = "synthesizing"
    verifying = "verifying"
    publishing = "publishing"
    shipped = "shipped"
    discarded = "discarded"
    failed = "failed"

class User(Base):
    __tablename__ = "users"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid4)
    github_id = Column(BigInteger, unique=True, nullable=False)
    login = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

class Installation(Base):
    __tablename__ = "installations"

    id = Column(BigInteger, primary_key=True)
    account_login = Column(String, nullable=False)
    account_type = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

class Repo(Base):
    __tablename__ = "repos"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid4)
    installation_id = Column(BigInteger, ForeignKey("installations.id"))
    full_name = Column(String, unique=True, nullable=False)
    default_branch = Column(String, nullable=False)
    ecosystem = Column(String)  # 'python' | 'javascript' | null (auto)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

class Run(Base):
    __tablename__ = "runs"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid4)
    repo_id = Column(pgUUID(as_uuid=True), ForeignKey("repos.id"), nullable=False)
    created_by = Column(pgUUID(as_uuid=True), ForeignKey("users.id"))
    source = Column(String, nullable=False)  # 'web' | 'cli' | 'github_label' | 'benchmark'
    fix_sha = Column(String, nullable=False)
    parent_sha = Column(String, nullable=False)
    status = Column(Enum(RunStatus), nullable=False, default=RunStatus.queued)
    discard_reason = Column(String)
    discard_detail = Column(String)
    pr_url = Column(String)
    idempotency_key = Column(String, unique=True)
    trace_redacted = Column(String, nullable=False)
    logs_redacted = Column(String)
    redaction_counts = Column(JSONB, nullable=False, default=dict)
    harness = Column(JSONB)
    cost_usd = Column(Numeric(8, 4), nullable=False, default=0)
    tokens_in = Column(Integer, nullable=False, default=0)
    tokens_out = Column(Integer, nullable=False, default=0)
    started_at = Column(DateTime(timezone=True))
    finished_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

class Attempt(Base):
    __tablename__ = "attempts"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid4)
    run_id = Column(pgUUID(as_uuid=True), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False)
    n = Column(Integer, nullable=False)
    model = Column(String, nullable=False)
    test_path = Column(String, nullable=False)
    test_code = Column(String, nullable=False)
    test_ast_hash = Column(String, nullable=False)
    expected_failure = Column(JSONB, nullable=False)
    outcome = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

class GateResult(Base):
    __tablename__ = "gate_results"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid4)
    attempt_id = Column(pgUUID(as_uuid=True), ForeignKey("attempts.id", ondelete="CASCADE"), nullable=False)
    gate = Column(String, nullable=False)
    state = Column(String)
    passed = Column(Boolean, nullable=False)
    observed_class = Column(String)
    detail = Column(JSONB, nullable=False, default=dict)
    duration_ms = Column(Integer)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

class Artifact(Base):
    __tablename__ = "artifacts"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid4)
    run_id = Column(pgUUID(as_uuid=True), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False)
    kind = Column(String, nullable=False)
    object_key = Column(String, nullable=False)
    sha256 = Column(String, nullable=False)
    bytes = Column(BigInteger, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

class Event(Base):
    __tablename__ = "events"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    run_id = Column(pgUUID(as_uuid=True), ForeignKey("runs.id", ondelete="CASCADE"), nullable=False)
    ts = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    stage = Column(String, nullable=False)
    level = Column(String, nullable=False, default="info")
    message = Column(String, nullable=False)
    data = Column(JSONB, nullable=False, default=dict)

class BenchmarkResult(Base):
    __tablename__ = "benchmark_results"

    id = Column(pgUUID(as_uuid=True), primary_key=True, default=uuid4)
    benchmark = Column(String, nullable=False)
    bug_id = Column(String, nullable=False)
    run_id = Column(pgUUID(as_uuid=True), ForeignKey("runs.id"))
    outcome = Column(String, nullable=False)
    reason = Column(String)
    reverified = Column(Boolean)
    seconds = Column(Integer)
    cost_usd = Column(Numeric(8, 4))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
