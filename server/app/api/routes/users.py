import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import EmailStr, BaseModel
from openai import OpenAI

from app.core.config import settings

router = APIRouter(prefix="/users", tags=["users"])
client = OpenAI(api_key=settings.OPENAI_API_KEY)


class UserPublishPostBody(BaseModel):
    email: EmailStr
    content: str

    def print_content(self):
        print(self.content)

def moderate_text(text: str):
    # ingest
    # call api
    print("Moderting text...")
    response = client.moderations.create(
        model="omni-moderation-latest",
        input=text,
    )
    print(response)
    return response


@router.get("/")
def test_route():
    print("Hello World!")
    return "Hello"

@router.post("/create")
async def create_post(item: UserPublishPostBody):
    moderation = moderate_text(item.content)

    return {
        "email": item.email,
        "content": item.content,
        "moderation": moderation.model_dump()
    }


