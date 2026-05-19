import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import type { User } from "@/types";
import { useAuth } from "@/components/auth-provider";
import { useEffect } from "react";

//const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

// Validation schema — no password needed for update
const updateUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").trim(),
    email: z.string().email("Please enter a valid email").toLowerCase().trim(),
    role: z.enum(["student", "staff", "institution_admin"]),
});

type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface UpdateUserDialogProps {
    user: User;           // the user being updated
    open: boolean;        // whether dialog is open
    onClose: () => void;  // called when dialog closes
}

const UpdateUserDialog = ({ user, open, onClose }: UpdateUserDialogProps) => {
    const { user: authUser } = useAuth();
    const inst_id = authUser?.inst_id ?? "";
    
    const queryClient = useQueryClient();

    const form = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
        name: user.name,
        email: user.email,
        role: user.role as "student" | "staff" | "institution_admin",
        },
    });

    useEffect(() => {
        form.reset({
            name: user.name,
            email: user.email,
            role: user.role as "student" | "staff" | "institution_admin",
        });
    }, [user]);

    const handleClose = () => {
        form.reset();
        onClose();
    };

    const onSubmit = async (formData: UpdateUserFormData) => {
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("email", formData.email);
            data.append("role", formData.role);

            await api.patch(
                `/${inst_id}/admin/users/${user.id}`,
                data,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded",
                    },
                }
            );

            // Refetch users table so changes show immediately
            queryClient.invalidateQueries({ queryKey: ["studentUsers"] });
            queryClient.invalidateQueries({ queryKey: ["staffUsers"] });
            queryClient.invalidateQueries({ queryKey: ["adminUsers"] });
            handleClose();
        } catch (err) {
            console.error("Update failed:", err);
            form.setError("root", {
                message: "Failed to update user. Please try again.",
            });
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="py-6 px-8">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Update User</DialogTitle>
                    <DialogDescription>
                        Update the user's account details below.
                    </DialogDescription>
                </DialogHeader>
                <form
                    id="update-user-form"
                    onSubmit={form.handleSubmit(onSubmit)}
                >
                    <FieldGroup>
                        <Controller
                            name="name"
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field
                                    data-invalid={fieldState.invalid}
                                    className="flex flex-col items-center"
                                >
                                    <Label
                                        htmlFor="update-name"
                                        className="w-xs"
                                    >
                                        Name{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        {...field}
                                        id="update-name"
                                        type="text"
                                        placeholder="Enter a name"
                                        autoComplete="off"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
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
                                        htmlFor="update-email"
                                        className="w-xs"
                                    >
                                        Email{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Input
                                        {...field}
                                        id="update-email"
                                        type="text"
                                        placeholder="Enter an email"
                                        autoComplete="off"
                                        aria-invalid={fieldState.invalid}
                                    />
                                    {fieldState.invalid && (
                                        <FieldError
                                            errors={[fieldState.error]}
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
                                    data-invalid={fieldState.invalid}
                                    className="flex flex-col items-center"
                                >
                                    <Label
                                        htmlFor="update-role"
                                        className="w-xs"
                                    >
                                        Role{" "}
                                        <span className="text-destructive">
                                            *
                                        </span>
                                    </Label>
                                    <Select
                                        value={field.value}
                                        onValueChange={field.onChange}
                                    >
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder="Select a role" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectGroup>
                                                <SelectItem value="student">
                                                    Student
                                                </SelectItem>
                                                <SelectItem value="staff">
                                                    Staff
                                                </SelectItem>
                                                <SelectItem value="institution_admin">
                                                    Admin
                                                </SelectItem>
                                            </SelectGroup>
                                        </SelectContent>
                                    </Select>
                                </Field>
                            )}
                        />
                        {/* Show root error if update fails */}
                        {form.formState.errors.root && (
                            <p className="text-sm text-destructive">
                                {form.formState.errors.root.message}
                            </p>
                        )}
                    </FieldGroup>
                </form>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button
                            variant="default"
                            className="bg-foreground rounded-sm"
                            onClick={handleClose}
                        >
                            Cancel
                        </Button>
                    </DialogClose>
                    <Button
                        variant="outline"
                        type="submit"
                        form="update-user-form"
                        className="rounded-sm"
                    >
                        Update
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateUserDialog;