import uuid
from typing import Any

from fastapi import APIRouter, Depends, HTTPException
from pydantic import EmailStr, BaseModel
from openai import OpenAI
from app.services import users_service
from app.core.db import supabase
from app.core.config import settings

router = APIRouter(prefix="/{inst_id}/users", tags=["users"])
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


# Get a list a community user is a part of
@router.get("/me/communities")
async def get_user_communities(inst_id: str):
    # hard code this first
    user_id = "4813d507-9b97-4bb7-bee4-39ec47070889"
    user_communities = await users_service.get_user_communities(
        supabase, inst_id, user_id
    )

    if user_communities is None or len(user_communities) == 0:
        raise HTTPException(status_code=404, detail="No communities found")
    return user_communities
