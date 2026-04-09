import { Button } from "../components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
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
import type { Users } from "@/types";
import { UserMgmtColumns } from "./users/columns";
import { DataTable } from "./data-table";

const DATA: Users[] = [
    {
        id: "1",
        name: "Bob",
        email: "bob@email.com",
        role: "student",
        is_active: true,
        created_at: "08/08/2026",
        updated_at: "08/08/2026",
    },
    {
        id: "2",
        name: "Sally",
        email: "sally@email.com",
        role: "student",
        is_active: true,
        created_at: "08/08/2026",
        updated_at: "08/08/2026",
    },
    {
        id: "3",
        name: "John",
        email: "john@email.com",
        role: "student",
        is_active: true,
        created_at: "08/08/2026",
        updated_at: "08/08/2026",
    },
    {
        id: "4",
        name: "James",
        email: "james@email.com",
        role: "student",
        is_active: true,
        created_at: "08/08/2026",
        updated_at: "08/08/2026",
    },
    {
        id: "5",
        name: "Sam",
        email: "sam@email.com",
        role: "student",
        is_active: true,
        created_at: "08/08/2026",
        updated_at: "08/08/2026",
    },
];

const UsersDashboard = () => {
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
                        <Dialog>
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
                                <DialogContent className="sm:max-w-lg py-6 px-8">
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
                                        <Field className="flex flex-row items-center">
                                            <Label
                                                htmlFor="name-1"
                                                className="grow-0"
                                            >
                                                Name<span>*</span>
                                            </Label>
                                            <Input
                                                type="text"
                                                className="grow-2"
                                                id="name-1"
                                                name="name"
                                                placeholder="John Doe"
                                                autoComplete="off"
                                            />
                                        </Field>
                                        <Field className="flex flex-row items-center">
                                            <Label
                                                htmlFor="email-1"
                                                className="grow-0"
                                            >
                                                Email
                                            </Label>
                                            <Input
                                                type="text"
                                                className="grow"
                                                id="email-1"
                                                name="email"
                                                placeholder="johndoe@mymail.sim.edu.sg"
                                                autoComplete="off"
                                            />
                                        </Field>
                                        <Field className="flex flex-row items-center">
                                            <Label
                                                htmlFor="pu-1"
                                                className="grow-0"
                                            >
                                                Partner University
                                            </Label>
                                            <Select>
                                                <SelectTrigger className="w-full grow-2">
                                                    <SelectValue placeholder="Select a university" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>
                                                            Partner University
                                                        </SelectLabel>
                                                        <SelectItem value="apple">
                                                            Apple
                                                        </SelectItem>
                                                        <SelectItem value="banana">
                                                            Banana
                                                        </SelectItem>
                                                        <SelectItem value="blueberry">
                                                            Blueberry
                                                        </SelectItem>
                                                        <SelectItem value="grapes">
                                                            Grapes
                                                        </SelectItem>
                                                        <SelectItem value="pineapple">
                                                            Pineapple
                                                        </SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                        <Field className="flex flex-row items-center">
                                            <Label
                                                htmlFor="pu-1"
                                                className="grow-0"
                                            >
                                                Role
                                            </Label>
                                            <Select>
                                                <SelectTrigger className="w-full grow-2">
                                                    <SelectValue placeholder="Select a role" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectGroup>
                                                        <SelectLabel>
                                                            Role
                                                        </SelectLabel>
                                                        <SelectItem value="apple">
                                                            Apple
                                                        </SelectItem>
                                                        <SelectItem value="banana">
                                                            Banana
                                                        </SelectItem>
                                                        <SelectItem value="blueberry">
                                                            Blueberry
                                                        </SelectItem>
                                                        <SelectItem value="grapes">
                                                            Grapes
                                                        </SelectItem>
                                                        <SelectItem value="pineapple">
                                                            Pineapple
                                                        </SelectItem>
                                                    </SelectGroup>
                                                </SelectContent>
                                            </Select>
                                        </Field>
                                    </FieldGroup>
                                    <DialogFooter className="bg-transparent border-0">
                                        <DialogClose asChild>
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
                    <DataTable data={DATA} columns={UserMgmtColumns} />
                </section>
            </div>
        </div>
    );
};

export default UsersDashboard;
