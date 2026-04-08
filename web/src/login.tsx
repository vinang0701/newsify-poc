import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";
import { FieldSet, FieldGroup, Field, FieldLabel } from "./components/ui/field";

const LoginPage = () => {
    return (
        <div className="flex flex-row bg-card h-screen items-center justify-between p-2 bg-linear-to-r from-primary/60 to-primary/30">
            <div className="flex justify-center bg-card w-1/3 h-full rounded-xl items-center">
                <div className="flex flex-col p-6 gap-3 mx-auto">
                    <h1 className="text-3xl font-bold text-center">Log in</h1>
                    <p className="text-sm text-caption">
                        Enter your email and password to log in to your account.
                    </p>
                    <FieldSet className="flex w-full">
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="text"
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
                                    placeholder="••••••••"
                                    className="w-full border border-border"
                                />
                            </Field>
                        </FieldGroup>
                    </FieldSet>
                    <p className="text-sm text-caption underline self-end cursor-pointer">
                        Forgot your password?
                    </p>
                    <Button type="button" className=" text-md">
                        Log in
                    </Button>
                </div>
            </div>
            <div className="flex justify-center w-2/3 h-full ">
                <img src="login_bg_2.svg" className="object-contain w-1/2" />
            </div>
        </div>
    );
};

export default LoginPage;
