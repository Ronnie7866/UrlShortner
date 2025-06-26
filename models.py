from sqlalchemy import Column, Integer, String, DateTime, Boolean, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from datetime import datetime, date

from database import Base

class ShortURL(Base):
    __tablename__ = "short_urls"
    
    id = Column(Integer, primary_key=True, index=True)
    short_code = Column(String(10), unique=True, index=True, nullable=False)
    original_url = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationship to clicks
    clicks = relationship("Click", back_populates="short_url")

class Click(Base):
    __tablename__ = "clicks"
    
    id = Column(Integer, primary_key=True, index=True)
    short_url_id = Column(Integer, ForeignKey("short_urls.id"), nullable=False)
    ip_address = Column(String(45))  # Support IPv6
    user_agent = Column(Text)
    clicked_at = Column(DateTime, default=datetime.utcnow)
    click_date = Column(Date, default=date.today)
    completed_flow = Column(Boolean, default=False)
    
    # Relationship to short URL
    short_url = relationship("ShortURL", back_populates="clicks")
