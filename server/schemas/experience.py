from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from bson import ObjectId

class ExperienceBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    company: str = Field(..., min_length=1, max_length=200)
    location: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    description: str = Field(..., min_length=1)
    responsibilities: List[str] = Field(default_factory=list)
    technologies: List[str] = Field(default_factory=list)
    start_date: datetime
    end_date: Optional[datetime] = None  # None means current position
    employment_type: str = Field(default="Full-time")  # Full-time, Part-time, Contract, etc.
    is_current: bool = Field(default=False)

class ExperienceCreate(ExperienceBase):
    pass

class ExperienceUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    company: Optional[str] = Field(None, min_length=1, max_length=200)
    location: Optional[str] = None
    lat: Optional[float] = None
    lon: Optional[float] = None
    description: Optional[str] = Field(None, min_length=1)
    responsibilities: Optional[List[str]] = None
    technologies: Optional[List[str]] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    employment_type: Optional[str] = None
    is_current: Optional[bool] = None

class ExperienceInDB(ExperienceBase):
    id: str = Field(default_factory=lambda: str(ObjectId()), alias="_id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        json_schema_extra = {
            "example": {
                "title": "Software Engineer",
                "company": "Tech Company Inc.",
                "location": "San Francisco, CA",
                "description": "Building awesome web applications",
                "responsibilities": ["Develop features", "Code reviews"],
                "technologies": ["Python", "FastAPI", "React"],
                "start_date": "2023-01-01T00:00:00",
                "is_current": True,
                "employment_type": "Full-time"
            }
        }
