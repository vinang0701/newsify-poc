import { Button } from "../components/ui/button";
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
import { Field, FieldGroup } from "@/components/ui/field";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { ButtonGroup } from "@/components/ui/button-group";
import type { User } from "@/types";
import { UserMgmtColumns } from "./users/columns";
import { DataTable } from "./data-table";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useState } from "react";

const BASE_URL = "http://127.0.0.1:8000/api/v1";
const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

const StudentUsersMgmtPage = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [role, setRole] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    const handleDialogClose = () => {
        setName("");
        setEmail("");
        setPassword("");
        setRole("");
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
            const response = await axios.get<User[]>(
                `${BASE_URL}/${inst_id}/admin/users/students`,
            );

            return response.data;
        } catch (error) {
            // Re-throwing the error allows TanStack Query to "see" the failure
            if (axios.isAxiosError(error)) {
                console.log(error);
                throw error;
            }
            throw new Error("An unexpected error occurred");
        }
    }

    const { isLoading, data, error } = useQuery<User[]>({
        queryKey: ["studentUsers"],
        queryFn: fetchStudentUsers,
    });

    return (
        <div className="">
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
                            <form>
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
                                        <Field className="flex flex-col items-center">
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
                                                value={name}
                                                onChange={(e) =>
                                                    setName(e.target.value)
                                                }
                                                type="text"
                                                className=""
                                                id="name-1"
                                                name="name"
                                                placeholder="John Doe"
                                                autoComplete="off"
                                            />
                                        </Field>
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
                                                required
                                                value={email}
                                                onChange={(e) =>
                                                    setEmail(e.target.value)
                                                }
                                                type="text"
                                                className="w-xs"
                                                id="email-1"
                                                name="email"
                                                placeholder="johndoe@mymail.sim.edu.sg"
                                                autoComplete="off"
                                            />
                                        </Field>
                                        <Field className="flex flex-col items-center">
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
                                                        value={password}
                                                        onChange={(e) =>
                                                            setPassword(
                                                                e.target.value,
                                                            )
                                                        }
                                                    />
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="sm"
                                                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                                                        onClick={() =>
                                                            setShowPassword(
                                                                (prev) => !prev,
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
                                                    onClick={() =>
                                                        setPassword(
                                                            generateStrongPassword(),
                                                        )
                                                    }
                                                >
                                                    Generate
                                                </Button>
                                            </div>
                                        </Field>
                                        <Field className="flex flex-col items-center">
                                            <Label
                                                htmlFor="pu-1"
                                                className="w-xs"
                                            >
                                                Role{" "}
                                                <span className="text-destructive">
                                                    *
                                                </span>
                                            </Label>
                                            <Select required>
                                                <SelectTrigger className="w-full grow-2">
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectItem value="Student">
                                                            Student
                                                        </SelectItem>
                                                        <SelectItem value="Staff">
                                                            Staff
                                                        </SelectItem>
                                                        <SelectItem value="Admin">
                                                            Admin
                                                        </SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
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
                                            type="submit"
                                            variant="outline"
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
                            Results: 0
                        </div>
                        <Pagination className="">
                            <PaginationContent>
                                <PaginationItem>
                                    <PaginationLink href="#">1</PaginationLink>
                                </PaginationItem>
                                <PaginationItem>
                                    <PaginationLink href="#" isActive>
                                        2
                                    </PaginationLink>
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
                    <DataTable data={data} columns={UserMgmtColumns} />
                </section>
            </div>
        </div>
    );
};

export default StudentUsersMgmtPage;
