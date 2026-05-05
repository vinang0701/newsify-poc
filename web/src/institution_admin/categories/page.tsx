import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import { ChevronDown, Plus } from "lucide-react";
import { useState } from "react";
import CategoriesDataTable from "./data-table";
import { CategoriesColumns } from "./columns";
import type { CategoryTable } from "@/types";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const inst_id = "391848ae-e6c6-43ec-a34c-e6ce06f0d842";

const CategoriesMgmtPage = () => {
    const queryClient = useQueryClient();
    const [addOpen, setAddOpen] = useState(false);
    const [newName, setNewName] = useState("");
    const [newStatus, setNewStatus] = useState("active");
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    // Fetch all categories from backend
    const { data: categories, isLoading } = useQuery<CategoryTable[]>({
        queryKey: ["adminCategories"],
        queryFn: async () => {
            const response = await api.get(`/${inst_id}/admin/categories`);
            return response.data;
        },
    });

    // Filter categories by search query
    const filteredCategories = categories?.filter((cat) =>
        searchQuery.trim() === ""
            ? true
            : cat.category_name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAdd = async () => {
        if (!newName.trim()) return;
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("category_name", newName);
            formData.append("status", newStatus);

            await api.post(
                `/${inst_id}/admin/categories`,
                formData,
                { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
            );
            queryClient.invalidateQueries({ queryKey: ["adminCategories"] });
            setNewName("");
            setNewStatus("active");
            setAddOpen(false);
        } catch (err) {
            console.error("Add failed:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            {isLoading && <Loading />}

            {/* Add Category Dialog */}
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add Category</DialogTitle>
                        <DialogDescription>
                            Fill in the details to add a new category.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">
                                Category Name <span className="text-destructive">*</span>
                            </label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Enter category name"
                                autoComplete="off"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium">Status</label>
                            <Select value={newStatus} onValueChange={setNewStatus}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="inactive">Inactive</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline" onClick={() => { setNewName(""); setNewStatus("active"); }}>
                                Cancel
                            </Button>
                        </DialogClose>
                        <Button
                            onClick={handleAdd}
                            disabled={loading || !newName.trim()}
                        >
                            {loading ? "Adding..." : "Add"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex flex-col gap-3">
                {/* Header */}
                <div className="px-4 py-6 text-2xl font-bold border-b border-border">
                    Categories
                </div>
                <section className="flex flex-col py-3 px-4 gap-6">
                    {/* Search and Add */}
                    <div className="flex flex-row justify-end gap-4">
                        <ButtonGroup className="flex flex-row">
                            <Input
                                type="text"
                                placeholder="Type to search..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="placeholder:text-border pl-2 border-border rounded-sm"
                            />
                            <Button className="rounded-sm border border-border text-foreground bg-card hover:bg-card/40 font-semibold">
                                Search
                            </Button>
                        </ButtonGroup>
                        <Button
                            className="rounded-sm font-semibold border border-border"
                            onClick={() => setAddOpen(true)}
                        >
                            Add
                            <Plus strokeWidth={3} />
                        </Button>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                        <div className="font-bold text-2xl">
                            Results: {filteredCategories?.length ?? 0}
                        </div>
                        <Button
                            variant="outline"
                            className="flex flex-row items-center gap-1 text-foreground bg-card hover:bg-card/40 rounded-sm w-fit"
                        >
                            Sort
                            <ChevronDown />
                        </Button>
                    </div>
                    <CategoriesDataTable
                        data={filteredCategories ?? []}
                        columns={CategoriesColumns}
                    />
                </section>
            </div>
        </div>
    );
};

export default CategoriesMgmtPage;