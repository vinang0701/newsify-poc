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
    print(response.results)
    print("Checking for flag...")
    print(response.results[0].flagged)
    return response.results[0].flagged


@router.get("/")
def test_route():
    print("Hello World!")
    return "Hello"


@router.post("/create")
async def create_post(item: UserPublishPostBody):
    moderation = moderate_text(item.content)

    return {
        "content": item.content,
        "moderation": moderation,
    }
