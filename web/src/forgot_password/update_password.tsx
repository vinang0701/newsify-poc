import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FieldSet, FieldGroup, Field, FieldLabel } from "@/components/ui/field";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate } from "react-router";
import Loading from "@/components/loading";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";

const UpdatePasswordSchema = z
    .object({
        password: z
            .string()
            .min(1, "Password is required")
            .min(8, "Must be at least 8 characters")
            .regex(/[A-Z]/, "Must contain at least one uppercase letter")
            .regex(/[0-9]/, "Must contain at least one number")
            .regex(
                /[^A-Za-z0-9]/,
                "Must contain at least one special character",
            ),
        confirmPassword: z.string().min(1, "Please confirm your password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

type UpdatePasswordData = z.infer<typeof UpdatePasswordSchema>;

const UpdatePasswordPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [serverError, setServerError] = useState<string | null>(null);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        formState: { errors },
    } = useForm<UpdatePasswordData>({
        resolver: zodResolver(UpdatePasswordSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    // Dynamic verification rules tracking
    const watchedPassword = useWatch({ control, name: "password" }) || "";

    const rules = [
        { label: "Minimum 8 characters", valid: watchedPassword.length >= 8 },
        {
            label: "At least 1 uppercase letter",
            valid: /[A-Z]/.test(watchedPassword),
        },
        { label: "At least 1 number", valid: /[0-9]/.test(watchedPassword) },
        {
            label: "At least 1 special character",
            valid: /[^A-Za-z0-9]/.test(watchedPassword),
        },
    ];

    const onSubmit = async (data: UpdatePasswordData) => {
        setIsLoading(true);
        setServerError(null);
        try {
            const { error } = await supabase.auth.updateUser({
                password: data.password,
            });

            if (error) {
                setServerError(error.message);
            } else {
                navigate("/password_update_sucess"); // Open the shadcn Dialog on success
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
                    className="flex flex-col p-6 gap-5 mx-auto w-[400px]"
                >
                    <div className="flex flex-col items-center gap-2">
                        <h1 className="text-3xl font-bold text-center">
                            Reset password
                        </h1>
                        <p className="text-sm text-caption text-center">
                            Please enter a new password to reset your password.
                        </p>
                    </div>

                    {serverError && (
                        <p className="text-sm text-red-500 bg-red-50 p-2 rounded-md border border-red-200 text-center font-medium">
                            {serverError}
                        </p>
                    )}

                    <FieldSet className="flex w-full">
                        <FieldGroup className="w-full">
                            {/* New Password Input Field */}
                            <Field className="flex flex-col w-full">
                                <FieldLabel htmlFor="password">
                                    Password
                                </FieldLabel>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        placeholder="••••••••"
                                        className="w-full border border-border pr-10"
                                        {...register("password")}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                        onClick={() =>
                                            setShowPassword((prev) => !prev)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                            </Field>

                            {/* Password Rules Real-time UI Checklist */}
                            <div className="flex flex-col gap-2">
                                {rules.map((rule, idx) => {
                                    const isFilled = rule.valid;
                                    const textColor = isFilled
                                        ? "text-emerald-500"
                                        : watchedPassword.length > 0
                                          ? "text-rose-400"
                                          : "text-muted-foreground/70";

                                    return (
                                        <div
                                            key={idx}
                                            className={`flex items-center gap-2 text-xs transition-colors duration-200 ${textColor}`}
                                        >
                                            {isFilled ? (
                                                <CheckCircle2 className="h-3.5 w-3.5 stroke-[2.5]" />
                                            ) : (
                                                <Circle className="h-3.5 w-3.5 stroke-[2]" />
                                            )}
                                            <span>{rule.label}</span>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Confirm Password Input Field */}
                            <Field className="flex flex-col gap-1.5 w-full">
                                <FieldLabel htmlFor="confirmPassword">
                                    Confirm password
                                </FieldLabel>
                                <div className="relative">
                                    <Input
                                        id="confirmPassword"
                                        type={
                                            showConfirmPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="••••••••"
                                        className="w-full border border-border pr-10"
                                        {...register("confirmPassword")}
                                    />
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent text-muted-foreground hover:text-foreground"
                                        onClick={() =>
                                            setShowConfirmPassword(
                                                (prev) => !prev,
                                            )
                                        }
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                {errors.confirmPassword && (
                                    <p className="text-xs font-medium text-red-500 mt-0.5">
                                        {errors.confirmPassword.message}
                                    </p>
                                )}
                            </Field>
                        </FieldGroup>
                    </FieldSet>

                    <Button
                        type="submit"
                        className="text-base w-full py-3 cursor-pointer"
                    >
                        Reset password
                    </Button>
                </form>
            </div>
            <div className="flex justify-center w-2/3 h-full">
                <img
                    src="change_password.svg"
                    alt="Reset visual asset"
                    className="object-contain w-1/2"
                />
            </div>
        </div>
    );
};

export default UpdatePasswordPage;
