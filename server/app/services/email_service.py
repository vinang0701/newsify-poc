import resend
from app.core.config import settings

resend.api_key = settings.RESEND_API_KEY

async def send_welcome_email(
    to_email: str,
    name: str,
    password: str,
    role: str,
) -> bool:
    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": "2002sameersingh22@gmail.com",  # hardcoded for testing
            "subject": f"Welcome to Newsify — Account Details for {to_email}",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Welcome to Newsify, {name}!</h2>
                    <p>Your institution admin has created an account for you.</p>
                    <p>Here are the login details for <strong>{to_email}</strong>:</p>
                    <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
                        <p><strong>Email:</strong> {to_email}</p>
                        <p><strong>Password:</strong> {password}</p>
                        <p><strong>Role:</strong> {role.replace('_', ' ').title()}</p>
                    </div>
                    <p style="color: #ef4444;"><strong>⚠️ Important:</strong> Please change your password after your first login.</p>
                    <p>If you have any questions, please contact your institution admin.</p>
                    <br/>
                    <p>Best regards,<br/>The Newsify Team</p>
                </div>
            """,
        })
        return True
    except Exception as e:
        print(f"Email failed: {e}")
        return False
    
async def send_removal_email(
    to_email: str,
    name: str,
) -> bool:
    try:
        resend.Emails.send({
            "from": settings.RESEND_FROM_EMAIL,
            "to": "2002sameersingh22@gmail.com",  # hardcoded for testing
            "subject": f"Newsify — Account Removed for {to_email}",
            "html": f"""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4F46E5;">Account Removed</h2>
                    <p>Hi {name},</p>
                    <p>Your Newsify account (<strong>{to_email}</strong>) has been removed by your institution admin.</p>
                    <p>If you believe this was a mistake, please contact your institution admin.</p>
                    <br/>
                    <p>Best regards,<br/>The Newsify Team</p>
                </div>
            """,
        })
        return True
    except Exception as e:
        print(f"Email failed: {e}")
        return False