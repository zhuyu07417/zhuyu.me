from datetime import datetime
from typing import Optional
from sqlmodel import SQLModel, Field

class QQUser(SQLModel, table=True):
    __tablename__ = "qq_user"

    id: Optional[int] = Field(default=None, primary_key=True)
    openid: str = Field(unique=True, index=True, max_length=128)
    nickname: str = Field(default="", max_length=100)
    avatar: str = Field(default="", max_length=500)
    created_at: datetime = Field(default_factory=datetime.now)
