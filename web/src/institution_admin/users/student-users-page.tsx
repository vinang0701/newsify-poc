import { Button } from "../../components/ui/button";
import { ChevronDown, EyeIcon, EyeOffIcon, Plus } from "lucide-react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldError } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ButtonGroup } from "@/components/ui/button-group";
import type { User } from "@/types";
import { UserMgmtColumns } from "./columns";
import { DataTable } from "./data-table";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useState } from "react";
import Loading from "@/components/loading";
import { useAuth } from "@/components/auth-provider";
import axios from "axios";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

const createUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").trim(),

    email: z.email("Please enter a valid email address").toLowerCase().trim(),

    password: z.string().min(8, "Password must be at least 8 characters long"),

    role: z.enum(
        ["student", "staff", "admin"],
        Error("Please select a valid user role."),
    ),
});

const StudentUsersMgmtPage = () => {
    const { user } = useAuth();
    const [showPassword, setShowPassword] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const form = useForm<z.infer<typeof createUserSchema>>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "student",
        },
        mode: "onSubmit",
    });

    const handleDialogClose = () => {
        form.reset();
        setShowPassword(false);
        setDialogOpen(false);
    };

    // generate password
    const generateStrongPassword = (length = 12) => {
        const charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let password = "";

        // Create an array of random bytes
        const values = new Uint32Array(length);
        window.crypto.getRandomValues(values);

        for (let i = 0; i < length; i++) {
            password += charset[values[i] % charset.length];
        }

        return password;
    };

    // Data fetching
    async function fetchStudentUsers(): Promise<User[]> {
        try {
            const response = await api.get<User[]>(
                `/${inst_id}/admin/users/students`,
            );
            return response.data;
        } catch (error) {
            console.log("Error: " + error);
            // Re-throwing the error allows TanStack Query to "see" the failure
            if (axios.isAxiosError(error)) {
                console.log(error);
                throw error;
            }
            throw new Error("An unexpected error occurred");
        }
    }

    const { isLoading, data, error } = useQuery<User[]>({
        queryKey: ["studentUsers", inst_id],
        queryFn: fetchStudentUsers,
    });

    const parsedUserData = data ? (data as User[]) : [];

    // Form submission
    const onSubmit = async (data: z.infer<typeof createUserSchema>) => {
        // This only runs if the data passes all Zod checks

        console.log("Validated Data:", data);
        console.log(user?.inst_id);
        try {
            // 1. Prepare data as Form Data (matching FastAPI's Form(...) requirements)
            const formData = new FormData();
            formData.append("new_user_name", data.name);
            formData.append("new_user_email", data.email);
            formData.append("password", data.password);
            formData.append("role", data.role);

            // 2. Post to the backend
            const response = await api.post(
                `${user?.inst_id}/admin/users`,
                formData,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                },
            );

            if (response.status === 201) {
                console.log("User successfully created:", response.data);
                // Optional: Reset form or close dialog here
                form.reset();
                handleDialogClose();
            }
        } catch (error: any) {
            // 3. Handle Backend Errors (e.g., 400 Bad Request, 403 Forbidden)
            const errorMessage =
                error.response?.data?.detail || "An unexpected error occurred.";
            console.error("Submission failed:", errorMessage);

            // Pro-tip: You can set a manual error back into Zod/React Hook Form
            form.setError("root", { message: errorMessage });
        }
    };

    return (
        <div>
            {isLoading && <Loading />}
            {/* Right Section */}
            <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="px-4 py-6 text-2xl font-bold border-b border-border">
                    User Account Management
                </div>
                <section className="flex flex-col py-3 px-4 gap-6">
                    {/* Search and Add */}
                    <div className="flex flex-row justify-end gap-4">
                        <ButtonGroup className="flex flex-row">
                            <Input
                                type="text"
                                placeholder="Type to search..."
                                className="placeholder:text-border pl-2 border-border rounded-sm"
                            />
                            <Button className="rounded-sm border border-border text-foreground bg-card hover:bg-card/40 font-semibold">
                                Search
                            </Button>
                        </ButtonGroup>
                        <Dialog
                            open={dialogOpen}
                            onOpenChange={() => {
                                dialogOpen
                                    ? handleDialogClose()
                                    : setDialogOpen(true);
                            }}
                        >
                            <form
                                id="create-user-form"
                                onSubmit={form.handleSubmit(onSubmit)}
                            >
                                <DialogTrigger asChild>
                                    <Button
                                        className="rounded-sm font-semibold border border-border"
                                        type="button"
                                    >
                                        Add
                                        <Plus strokeWidth={3} />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="py-6 px-8">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl">
                                            Add User
                                        </DialogTitle>
                                        <DialogDescription>
                                            Please fill in user account details
                                            and click add to create a new
                                            account.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <FieldGroup>
                                        <Controller
                                            name="name"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                    className="flex flex-col items-center"
                                                >
                                                    <Label
                                                        htmlFor="name-1"
                                                        className="w-xs"
                                                    >
                                                        Name{" "}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        required
                                                        {...field}
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                        type="text"
                                                        className=""
                                                        id="name-1"
                                                        name="name"
                                                        placeholder="Enter a name"
                                                        autoComplete="off"
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="email"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field className="flex flex-col items-center">
                                                    <Label
                                                        htmlFor="email-1"
                                                        className="w-xs"
                                                    >
                                                        Email{" "}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Input
                                                        {...field}
                                                        required
                                                        aria-invalid={
                                                            fieldState.invalid
                                                        }
                                                        type="text"
                                                        className="w-xs"
                                                        id="email-1"
                                                        name="email"
                                                        placeholder="Enter an email"
                                                        autoComplete="off"
                                                    />
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="password"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                    className="flex flex-col items-center"
                                                >
                                                    <Label
                                                        htmlFor="password-1"
                                                        className="w-xs"
                                                    >
                                                        Password{" "}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </Label>

                                                    <div className="flex flex-row items-center gap-2">
                                                        <div className="relative">
                                                            <Input
                                                                {...field}
                                                                type={
                                                                    showPassword
                                                                        ? "text"
                                                                        : "password"
                                                                }
                                                                id="password-1"
                                                                name="password-1"
                                                                autoComplete="off"
                                                                className="pr-10"
                                                                placeholder="Enter a strong password"
                                                                required
                                                                aria-invalid={
                                                                    fieldState.invalid
                                                                }
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                onClick={() =>
                                                                    setShowPassword(
                                                                        (
                                                                            prev,
                                                                        ) =>
                                                                            !prev,
                                                                    )
                                                                }
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                                                                ) : (
                                                                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                                <span className="sr-only">
                                                                    {showPassword
                                                                        ? "Hide password"
                                                                        : "Show password"}
                                                                </span>
                                                            </Button>
                                                        </div>

                                                        <Button
                                                            variant="ghost"
                                                            className="cursor-pointer font-normal"
                                                            onClick={() => {
                                                                const newPassword =
                                                                    generateStrongPassword();

                                                                form.setValue(
                                                                    "password",
                                                                    newPassword,
                                                                    {
                                                                        shouldValidate: true,
                                                                        shouldDirty: true,
                                                                    },
                                                                );
                                                            }}
                                                        >
                                                            Generate
                                                        </Button>
                                                    </div>
                                                    {fieldState.invalid && (
                                                        <FieldError
                                                            errors={[
                                                                fieldState.error,
                                                            ]}
                                                        />
                                                    )}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="role"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field
                                                    data-invalid={
                                                        fieldState.invalid
                                                    }
                                                    className="flex flex-col items-center"
                                                >
                                                    <Label
                                                        htmlFor="pu-1"
                                                        className="w-xs"
                                                    >
                                                        Role{" "}
                                                        <span className="text-destructive">
                                                            *
                                                        </span>
                                                    </Label>
                                                    <Select
                                                        required
                                                        value={field.value}
                                                        onValueChange={
                                                            field.onChange
                                                        }
                                                    >
                                                        <SelectTrigger
                                                            className="w-full grow-2"
                                                            aria-invalid={
                                                                fieldState.invalid
                                                            }
                                                        >
                                                            <SelectValue
                                                                placeholder="Select a role"
                                                                {...field}
                                                                aria-invalid={
                                                                    fieldState.invalid
                                                                }
                                                            />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectItem value="student">
                                                                    Student
                                                                </SelectItem>
                                                                <SelectItem value="staff">
                                                                    Staff
                                                                </SelectItem>
                                                                <SelectItem value="admin">
                                                                    Admin
                                                                </SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            )}
                                        />
                                    </FieldGroup>
                                    <DialogFooter className="bg-transparent border-0">
                                        <DialogClose
                                            asChild
                                            onClick={() => handleDialogClose()}
                                        >
                                            <Button
                                                variant="default"
                                                className="bg-foreground rounded-sm justify-self-end"
                                            >
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button
                                            variant="outline"
                                            type="submit"
                                            form="create-user-form"
                                            className="rounded-sm justify-self-end"
                                        >
                                            Add
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </form>
                        </Dialog>
                    </div>
                    {/* Results and Pagination */}
                    <div className="flex flex-row justify-between items-center">
                        <div className="flex flex-row items-center font-bold text-2xl">
                            Results: {parsedUserData.length}
                        </div>
                        <Pagination className="">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationLink href="#" isActive>
                                        1
                                    </PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href="#">2</PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href="#">3</PaginationLink>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                    {/* Sort Button */}
                    <Button
                        variant="outline"
                        className="flex flex-row items-center gap-1 text-foreground bg-card hover:bg-card/40 rounded-sm w-fit"
                    >
                        Sort
                        <ChevronDown />
                    </Button>
                    {error && <p>{error.message}</p>}
                    <DataTable
                        data={parsedUserData}
                        columns={UserMgmtColumns}
                    />
                </section>
            </div>
        </div>
    );
};

export default StudentUsersMgmtPage;
