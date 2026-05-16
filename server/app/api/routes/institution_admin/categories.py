from fastapi import APIRouter, Depends, HTTPException, Form
from app.core.db import supabase
from app.core.auth import verify_admin, get_current_app_user, UserPayload
from app.services.institution_admin import categories_service

router = APIRouter(
    prefix="/{inst_id}/admin/categories",
    tags=["admin_categories"],
    dependencies=[Depends(verify_admin)],
)


# Get all categories including inactive
@router.get("")
async def get_all_categories(inst_id: str):
    try:
        categories = await categories_service.get_all_categories(supabase)
        return categories
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Add a new category
@router.post("")
async def create_category(
    inst_id: str,
    category_name: str = Form(...),
    current_user: UserPayload = Depends(get_current_app_user),
):
    try:
        admin_id = current_user["id"]
        result = await categories_service.create_category(
            supabase, inst_id=inst_id, category_name=category_name, created_by=admin_id
        )
        if not result:
            raise HTTPException(status_code=400, detail="Could not create category")
        return {"message": "Category created successfully", "data": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Update a category
@router.patch("/{category_id}")
async def update_category(
    category_id: str,
    category_name: str = Form(...),
    status: str = Form(...),
):
    try:
        result = await categories_service.update_category(
            supabase, category_id, category_name, status
        )
        if not result:
            raise HTTPException(status_code=404, detail="Category not found")
        return {"message": "Category updated successfully", "data": result}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Delete a category — soft or hard depending on query param
@router.delete("/{category_id}")
async def delete_category(
    category_id: str,
    hard: bool = False,
):
    try:
        if hard:
            result = await categories_service.hard_delete_category(
                supabase, category_id
            )
        else:
            result = await categories_service.delete_category(supabase, category_id)
        if not result:
            raise HTTPException(status_code=404, detail="Category not found")
        return {"message": "Category deleted successfully"}
    except ValueError as e:
        # Category is in use — return a clear error message
        raise HTTPException(status_code=400, detail=str(e))
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


"""
@router.put("/{category_id}")
async def update_category(inst_id: str, category_id: str, data: UpdateCategory):
    try:
        return await categories_service.update_category(
            supabase, category_id, data.dict(exclude_none=True)
        )
    except Exception as e:
        print(f"Update error: {type(e).__name__}: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/{category_id}/suspend")
async def suspend_category(inst_id: str, category_id: str):
    try:
        return await categories_service.suspend_category(supabase, category_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/{category_id}/activate")
async def activate_category(inst_id: str, category_id: str):
    try:
        return await categories_service.activate_category(supabase, category_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
"""
