import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { FieldSet, FieldGroup, Field, FieldLabel } from "./components/ui/field";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

const LoginPage = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const supabase_client = supabase;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { error } = await supabase_client.auth.signInWithPassword({
                email,
                password,
            });
            if (error) throw error;
            // // Update this route to redirect to an authenticated route. The user already has an active session.
            location.href = "/admin";
        } catch (error: unknown) {
            setError(
                error instanceof Error ? error.message : "An error occurred",
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-row bg-card h-screen items-center justify-between p-2 bg-linear-to-r from-primary/60 to-primary/30">
            <div className="flex justify-center bg-card w-1/3 h-full rounded-xl items-center">
                <form
                    onSubmit={handleLogin}
                    className="flex flex-col p-6 gap-3 mx-auto"
                >
                    <h1 className="text-3xl font-bold text-center">Log in</h1>
                    <p className="text-sm text-caption">
                        Enter your email and password to log in to your account.
                    </p>

                    <FieldSet className="flex w-full">
                        <FieldGroup>
                            <Field>
                                {error && (
                                    <p className="text-sm text-red-500">
                                        {error}
                                    </p>
                                )}
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="text"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="youremail@mymail.edu.sg"
                                    className="w-full border border-border"
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="password">
                                    Password
                                </FieldLabel>

                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) =>
                                        setPassword(e.target.value)
                                    }
                                    placeholder="••••••••"
                                    className="w-full border border-border"
                                />
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                    <p className="text-sm text-caption underline self-end cursor-pointer">
                        Forgot your password?
                    </p>
                    <Button type="submit" className=" text-md">
                        Log in
                    </Button>
                </form>
            </div>
            <div className="flex justify-center w-2/3 h-full ">
                <img src="login_bg_2.svg" className="object-contain w-1/2" />
            </div>
        </div>
    );
};

export default LoginPage;
