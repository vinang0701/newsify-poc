import { Button } from "../../components/ui/button";
import { EyeIcon, EyeOffIcon, Plus } from "lucide-react";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import { useState } from "react";
import Loading from "@/components/loading";
import { useAuth } from "@/components/auth-provider";
import axios from "axios";
import * as z from "zod";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

//const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

const createUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").trim(),
    email: z.email("Please enter a valid email address").toLowerCase().trim(),
    password: z.string().min(8, "Password must be at least 8 characters long"),
    role: z.enum(
        ["institution_admin", "platform_admin"],
        Error("Please select a valid user role."),
    ),
});

type FilterStatus = "all" | "active" | "suspended" | "banned";
type FilterRole = "all_roles" | "community_admin" | "institution_admin" | "platform_admin";

const AdminUsersMgmtPage = () => {
    const { user } = useAuth();
    const inst_id = user?.inst_id ?? "";
    const queryClient = useQueryClient();
    const [showPassword, setShowPassword] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [sortStatus, setSortStatus] = useState<FilterStatus>("all");
    const [sortRole, setSortRole] = useState<FilterRole>("all_roles");

    const form = useForm<z.infer<typeof createUserSchema>>({
        resolver: zodResolver(createUserSchema),
        defaultValues: {
            name: "",
            email: "",
            password: "",
            role: "institution_admin",
        },
        mode: "onSubmit",
    });

    const handleDialogClose = () => {
        form.reset();
        setShowPassword(false);
        setDialogOpen(false);
    };

    const generateStrongPassword = (length = 12) => {
        const charset =
            "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=";
        let password = "";
        const values = new Uint32Array(length);
        window.crypto.getRandomValues(values);
        for (let i = 0; i < length; i++) {
            password += charset[values[i] % charset.length];
        }
        return password;
    };

    async function fetchAdminUsers(): Promise<User[]> {
        try {
            const response = await api.get<User[]>(`/${inst_id}/admin/users/admins`);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) throw error;
            throw new Error("An unexpected error occurred");
        }
    }

    const { isLoading, data, error } = useQuery<User[]>({
        queryKey: ["adminUsers", inst_id],
        queryFn: fetchAdminUsers,
    });

    const filteredData = data?.filter((user) => {
        const matchesSearch = searchQuery.trim() === ""
            ? true
            : user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              user.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = sortStatus === "all" ? true : user.status === sortStatus;
        const matchesRole = sortRole === "all_roles" ? true : user.role === sortRole;
        return matchesSearch && matchesStatus && matchesRole;
    }) ?? [];

    const onSubmit = async (data: z.infer<typeof createUserSchema>) => {
        try {
            const formData = new FormData();
            formData.append("new_user_name", data.name);
            formData.append("new_user_email", data.email);
            formData.append("password", data.password);
            formData.append("role", data.role);

            const response = await api.post(
                `${user?.inst_id}/admin/users`,
                formData,
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } },
            );

            if (response.status === 201) {
                form.reset();
                handleDialogClose();
                queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
            }
        } catch (error: any) {
            const errorMessage =
                error.response?.data?.detail || "An unexpected error occurred.";
            form.setError("root", { message: errorMessage });
        }
    };

    return (
        <div>
            {isLoading && <Loading />}
            <div className="flex flex-col gap-3">
                <div className="px-4 py-6 text-2xl font-bold border-b border-border">
                    Admin Account Management
                </div>
                <section className="flex flex-col py-3 px-4 gap-6">
                    {/* Search and Add */}
                    <div className="flex flex-row justify-end gap-4">
                        <ButtonGroup className="flex flex-row">
                            <Input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="placeholder:text-border pl-2 border-border rounded-sm"
                            />
                            {searchQuery && (
                                <Button
                                    className="rounded-sm border border-border text-foreground bg-card hover:bg-card/40 font-semibold"
                                    onClick={() => setSearchQuery("")}
                                >
                                    Clear
                                </Button>
                            )}
                        </ButtonGroup>
                        <Dialog
                            open={dialogOpen}
                            onOpenChange={() => {
                                dialogOpen ? handleDialogClose() : setDialogOpen(true);
                            }}
                        >
                            <form id="create-admin-form" onSubmit={form.handleSubmit(onSubmit)}>
                                <DialogTrigger asChild>
                                    <Button className="rounded-sm font-semibold border border-border" type="button">
                                        Add
                                        <Plus strokeWidth={3} />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="py-6 px-8">
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl">Add Admin</DialogTitle>
                                        <DialogDescription>
                                            Please fill in admin account details and click add to create a new account.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <FieldGroup>
                                        <Controller
                                            name="name"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid} className="flex flex-col items-center">
                                                    <Label htmlFor="name-3" className="w-xs">
                                                        Name <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        required
                                                        {...field}
                                                        aria-invalid={fieldState.invalid}
                                                        type="text"
                                                        id="name-3"
                                                        placeholder="Enter a name"
                                                        autoComplete="off"
                                                    />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="email"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field className="flex flex-col items-center">
                                                    <Label htmlFor="email-3" className="w-xs">
                                                        Email <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Input
                                                        {...field}
                                                        required
                                                        aria-invalid={fieldState.invalid}
                                                        type="text"
                                                        id="email-3"
                                                        placeholder="Enter an email"
                                                        autoComplete="off"
                                                    />
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="password"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid} className="flex flex-col items-center">
                                                    <Label htmlFor="password-3" className="w-xs">
                                                        Password <span className="text-destructive">*</span>
                                                    </Label>
                                                    <div className="flex flex-row items-center gap-2">
                                                        <div className="relative">
                                                            <Input
                                                                {...field}
                                                                type={showPassword ? "text" : "password"}
                                                                id="password-3"
                                                                autoComplete="off"
                                                                className="pr-10"
                                                                placeholder="Enter a strong password"
                                                                required
                                                                aria-invalid={fieldState.invalid}
                                                            />
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="sm"
                                                                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                                onClick={() => setShowPassword((prev) => !prev)}
                                                            >
                                                                {showPassword ? (
                                                                    <EyeOffIcon className="h-4 w-4 text-muted-foreground" />
                                                                ) : (
                                                                    <EyeIcon className="h-4 w-4 text-muted-foreground" />
                                                                )}
                                                            </Button>
                                                        </div>
                                                        <Button
                                                            variant="ghost"
                                                            className="cursor-pointer font-normal"
                                                            onClick={() => {
                                                                const newPassword = generateStrongPassword();
                                                                form.setValue("password", newPassword, {
                                                                    shouldValidate: true,
                                                                    shouldDirty: true,
                                                                });
                                                            }}
                                                        >
                                                            Generate
                                                        </Button>
                                                    </div>
                                                    {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                                                </Field>
                                            )}
                                        />
                                        <Controller
                                            name="role"
                                            control={form.control}
                                            render={({ field, fieldState }) => (
                                                <Field data-invalid={fieldState.invalid} className="flex flex-col items-center">
                                                    <Label htmlFor="role-3" className="w-xs">
                                                        Role <span className="text-destructive">*</span>
                                                    </Label>
                                                    <Select required value={field.value} onValueChange={field.onChange}>
                                                        <SelectTrigger className="w-full grow-2" aria-invalid={fieldState.invalid}>
                                                            <SelectValue placeholder="Select a role" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectGroup>
                                                                <SelectItem value="institution_admin">Institution Admin</SelectItem>
                                                                <SelectItem value="platform_admin">Platform Admin</SelectItem>
                                                            </SelectGroup>
                                                        </SelectContent>
                                                    </Select>
                                                </Field>
                                            )}
                                        />
                                        {form.formState.errors.root && (
                                            <p className="text-sm text-destructive">
                                                {form.formState.errors.root.message}
                                            </p>
                                        )}
                                    </FieldGroup>
                                    <DialogFooter className="bg-transparent border-0">
                                        <DialogClose asChild onClick={() => handleDialogClose()}>
                                            <Button variant="default" className="bg-foreground rounded-sm justify-self-end">
                                                Cancel
                                            </Button>
                                        </DialogClose>
                                        <Button variant="outline" type="submit" form="create-admin-form" className="rounded-sm justify-self-end">
                                            Add
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </form>
                        </Dialog>
                    </div>

                    {/* Filter by status */}
                    <div className="flex flex-row gap-2 items-center flex-wrap">
                        <span className="text-sm text-muted-foreground">Status:</span>
                        {(["all", "active", "suspended", "banned"] as const).map((status) => (
                            <Button
                                key={status}
                                variant="outline"
                                className={`rounded-sm text-sm ${
                                    sortStatus === status
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card text-foreground"
                                }`}
                                onClick={() => setSortStatus(status)}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </Button>
                        ))}
                    </div>

                    {/* Filter by role */}
                    <div className="flex flex-row gap-2 items-center flex-wrap">
                        <span className="text-sm text-muted-foreground">Role:</span>
                        {([
                            { value: "all_roles", label: "All" },
                            { value: "community_admin", label: "Community Admin" },
                            { value: "institution_admin", label: "Institution Admin" },
                            { value: "platform_admin", label: "Platform Admin" },
                        ] as const).map(({ value, label }) => (
                            <Button
                                key={value}
                                variant="outline"
                                className={`rounded-sm text-sm ${
                                    sortRole === value
                                        ? "bg-primary text-primary-foreground"
                                        : "bg-card text-foreground"
                                }`}
                                onClick={() => setSortRole(value)}
                            >
                                {label}
                            </Button>
                        ))}
                    </div>

                    {/* Results count */}
                    <div className="flex flex-row items-center font-bold text-2xl">
                        Results: {filteredData.length}
                    </div>

                    {error && <p>{error.message}</p>}
                    <DataTable data={filteredData} columns={UserMgmtColumns} />
                </section>
            </div>
        </div>
    );
};

export default AdminUsersMgmtPage;