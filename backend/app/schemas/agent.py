"""Schemas describing the agent's observable execution trace.

The trace is intentionally a flat list of discrete, named steps with a
status and a short human-readable detail string — never raw model
reasoning or chain-of-thought.
"""
from __future__ import annotations

from pydantic import BaseModel

from app.schemas.common import StepStatus


class ExecutionStep(BaseModel):
    step: int
    name: str
    status: StepStatus
    details: str | None = None
    timestamp: str | None = None


class AgentDecision(BaseModel):
    """The agent's routing decision, returned alongside the trace for transparency."""

    task: str
    modality: str
    image_count: int
    specialist: str
    reason: str
