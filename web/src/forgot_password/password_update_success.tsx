import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";

function PasswordUpdateSuccessPage() {
    const navigate = useNavigate();
    return (
        <div className="flex flex-col items-center justify-center min-h-screen w-full p-4">
            {/* Set a standard max-width so your content wraps beautifully on mobile and desktop */}
            <div className="flex flex-col w-full max-w-sm gap-6 mx-auto">
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-3xl font-bold text-center">Success!</h1>
                    <p className="text-md text-caption text-center">
                        You have successfully reset your password.
                    </p>
                    <p className="text-md text-caption text-center">
                        You can now log in with your new password.
                    </p>
                </div>

                <Button
                    type="button"
                    onClick={() => navigate("/login", { replace: true })}
                    className="text-base w-full py-3 cursor-pointer"
                >
                    Back to login
                </Button>
            </div>
        </div>
    );
}

export default PasswordUpdateSuccessPage;
