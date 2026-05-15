import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldSet, FieldGroup, Field, FieldLabel } from "@/components/ui/field";

import { useState } from "react";
import { useNavigate } from "react-router";
import Loading from "@/components/loading";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/lib/supabase";

const ForgotPasswordSchema = z.object({
    email: z.email("Please enter a valid email address").toLowerCase().trim(),
});

type ForgotPasswordData = z.infer<typeof ForgotPasswordSchema>;

const ForgotPasswordPage = () => {
    const [serverError, setServerError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordData>({
        resolver: zodResolver(ForgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    });

    const onSubmit = async (formData: ForgotPasswordData) => {
        setIsLoading(true);
        setServerError(null); // Clear previous errors on new attempt

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(
                formData.email,
            );

            if (error) {
                console.error(error.message);
                setServerError(error.message);
            } else {
                // 3. Fixed: react-router uses standard string pathing.
                // We pass the email forward via state context to secure the next layout.
                navigate("/verify_otp", { state: { email: formData.email } });
            }
        } catch (e) {
            console.error(e);
            setServerError("An unexpected error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="flex flex-row bg-card h-screen items-center justify-between p-2 bg-linear-to-r from-primary/60 to-primary/30">
            <div className="flex justify-center bg-card w-1/3 h-full rounded-xl items-center">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="flex flex-col p-6 gap-3 mx-auto w-[400px]"
                >
                    <h1 className="text-3xl font-bold text-center">
                        Forgot password?
                    </h1>
                    <p className="text-sm text-caption">
                        Enter your email to receive an OTP.
                    </p>

                    <FieldSet className="flex w-full">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="youremail@mymail.edu.sg"
                                    className="w-full border border-border"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-500 mt-1">
                                        {errors.email.message}
                                    </p>
                                )}
                                {serverError && (
                                    <p className="text-sm text-red-500 mt-1 font-medium">
                                        {serverError}
                                    </p>
                                )}
                            </Field>
                        </FieldGroup>
                    </FieldSet>

                    <Button type="submit" className="text-md w-full mt-2">
                        Send OTP
                    </Button>
                </form>
            </div>
            <div className="flex justify-center w-2/3 h-full ">
                <img
                    src="forgot_password.svg"
                    className="object-contain w-1/2"
                />
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
