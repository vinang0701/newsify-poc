import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useLocation, useNavigate } from "react-router";
import Loading from "@/components/loading";
import { z } from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import OTPInput from "@/components/otp-input";

const VerifyOTPSchema = z.object({
    otp: z
        .array(z.string())
        .length(6, "OTP must be exactly 6 digits")
        .refine((arr) => arr.every((char) => char !== ""), {
            message: "Please fill in all OTP fields",
        }),
});

type VerifyOTPData = z.infer<typeof VerifyOTPSchema>;

const VerifyOTPPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const email = location.state?.email;

    const [serverError, setServerError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Safeguard redirect if someone lands here without an email context
    useEffect(() => {
        if (!email) {
            navigate("/forgot_password", { replace: true });
        }
    }, [email, navigate]);

    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<VerifyOTPData>({
        resolver: zodResolver(VerifyOTPSchema),
        defaultValues: {
            otp: Array(6).fill(""),
        },
    });
    const onSubmit = async (formData: VerifyOTPData) => {
        setIsLoading(true);
        setServerError(null);

        const token = formData.otp.join("");

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token,
                type: "recovery", // use 'recovery' for forgot password resets
            });

            if (error) {
                setServerError(error.message);
                return;
            }

            if (data?.session) {
                // Pass email forward to complete the state tracking chain
                navigate("/update_password", {
                    state: { email },
                    replace: true,
                });
            }
        } catch (e) {
            console.error(e);
            setServerError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading || !email) {
        return <Loading />;
    }

    return (
        <div className="flex flex-row bg-card h-screen items-center justify-between p-2 bg-linear-to-r from-primary/60 to-primary/30">
            <div className="flex justify-center bg-card w-1/3 h-full rounded-xl items-center">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col p-6 gap-6 mx-auto w-[400px]"
                >
                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-3xl font-bold text-center">
                            Check your inbox
                        </h1>
                        <p className="text-sm text-caption">
                            We have sent you an OTP to
                        </p>
                        <p className="text-sm text-black font-semibold">
                            {email}
                        </p>
                    </div>
                    {serverError && (
                        <p className="text-sm text-red-500 bg-red-50 p-2.5 rounded-md border border-red-200 text-center font-medium">
                            {serverError}
                        </p>
                    )}
                    <div className="flex flex-col gap-2">
                        <Controller
                            control={control}
                            name="otp"
                            render={({ field: { value, onChange } }) => (
                                <OTPInput
                                    value={value}
                                    onChange={onChange}
                                    length={6}
                                    disabled={isLoading}
                                />
                            )}
                        />

                        {/* Client Validation Error Display */}
                        {errors.otp && (
                            <p className="text-sm text-red-500 text-center font-medium mt-1">
                                {errors.otp.message}
                            </p>
                        )}
                    </div>

                    <Button type="submit" className="text-md w-full mt-2">
                        {isLoading ? "Verifying..." : "Verify"}
                    </Button>
                </form>
            </div>
            <div className="flex justify-center w-2/3 h-full ">
                <img src="otp.svg" className="object-contain w-1/2" />
            </div>
        </div>
    );
};

export default VerifyOTPPage;
