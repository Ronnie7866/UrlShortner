from pydantic import BaseModel, HttpUrl
from datetime import datetime

class URLCreate(BaseModel):
    url: HttpUrl

class URLResponse(BaseModel):
    short_url: str
    short_code: str

class URLStats(BaseModel):
    id: int
    short_code: str
    original_url: str
    click_count: int
    created_at: datetime
    
    class Config:
        from_attributes = True
