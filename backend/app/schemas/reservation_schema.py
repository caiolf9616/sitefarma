from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

class ReservationCreate(BaseModel):
    medication_id: str
    quantity: int = Field(default=1, ge=1, le=5)

class ReservationUpdate(BaseModel):
    quantity: int = Field(ge=1, le=5)

class ReservationResponse(BaseModel):
    id: str
    user_id: str
    medication_id: str
    quantity: int
    status: Literal['pending', 'completed', 'cancelled']
    cancelled_by: Optional[str] = None
    created_at: datetime
    expires_at: datetime

class ReservationWithMedication(ReservationResponse):
    medication: Optional[dict] = None
