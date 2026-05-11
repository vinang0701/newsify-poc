import stripe
from fastapi import APIRouter, Depends, HTTPException, Request
from app.core.config import settings
from app.core.db import supabase
from app.core.auth import verify_admin, get_current_app_user, UserPayload

stripe.api_key = settings.STRIPE_SECRET_KEY

PLAN_PRICE_MAP = {
    "basic": settings.STRIPE_BASIC_PRICE_ID,
    "pro": settings.STRIPE_PRO_PRICE_ID,
    "premium": settings.STRIPE_PREMIUM_PRICE_ID,
}

PLAN_DETAILS = {
    "basic": {
        "name": "Basic",
        "price": 18000,
        "users": "15,000 users",
        "communities": "100 communities",
    },
    "pro": {
        "name": "Pro",
        "price": 30000,
        "users": "20,000 users",
        "communities": "200 communities",
    },
    "premium": {
        "name": "Premium",
        "price": 50000,
        "users": "Unlimited users",
        "communities": "Unlimited communities",
    },
}

router = APIRouter(
    prefix="/{inst_id}/admin/billing",
    tags=["billing"],
    dependencies=[Depends(verify_admin)],
)


@router.get("/current-plan")
async def get_current_plan(inst_id: str):
    try:
        response = (
            supabase.table("institutions")
            .select("id, name, plan, start_date, end_date, status")
            .eq("id", inst_id)
            .single()
            .execute()
        )
        if not response.data:
            raise HTTPException(status_code=404, detail="Institution not found")
        return response.data
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/create-checkout-session")
async def create_checkout_session(
    inst_id: str,
    plan: str,
    current_user: UserPayload = Depends(get_current_app_user),
):
    try:
        if plan not in PLAN_PRICE_MAP:
            raise HTTPException(status_code=400, detail="Invalid plan")

        price_id = PLAN_PRICE_MAP[plan]

        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price": price_id,
                "quantity": 1,
            }],
            mode="subscription",
            success_url=f"http://localhost:5173/admin/billing?success=true&plan={plan}&session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"http://localhost:5173/admin/billing?cancelled=true",
            metadata={
                "inst_id": inst_id,
                "plan": plan,
            },
        )

        return {"url": session.url, "session_id": session.id}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    

@router.post("/verify-payment")
async def verify_payment(
    inst_id: str,
    session_id: str,
    plan: str,
):
    try:
        # Verify the session with Stripe
        session = stripe.checkout.Session.retrieve(session_id)

        if session.payment_status == "paid":
            from datetime import datetime, timedelta
            start_date = datetime.now().date().isoformat()
            end_date = (datetime.now() + timedelta(days=365)).date().isoformat()

            # Update institution plan in DB
            supabase.table("institutions").update({
                "plan": plan.upper(),
                "start_date": start_date,
                "end_date": end_date,
                "status": "Active",
            }).eq("id", inst_id).execute()

            return {"status": "success", "plan": plan}

        return {"status": "pending"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(request: Request):
    # This endpoint receives events from Stripe
    # e.g. when payment succeeds, update the institution plan in DB
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

    # Handle successful payment
    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        inst_id = session["metadata"]["inst_id"]
        plan = session["metadata"]["plan"]

        # Update institution plan in DB
        from datetime import datetime, timedelta
        start_date = datetime.now().date().isoformat()
        end_date = (datetime.now() + timedelta(days=365)).date().isoformat()

        supabase.table("institutions").update({
            "plan": plan,
            "start_date": start_date,
            "end_date": end_date,
            "status": "Active",
        }).eq("id", inst_id).execute()

    return {"status": "ok"}