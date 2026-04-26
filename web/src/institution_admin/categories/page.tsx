import Loading from "@/components/loading";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Input } from "@/components/ui/input";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
} from "@/components/ui/pagination";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import CategoriesDataTable from "./data-table";
import { CategoriesColumns } from "./columns";
import type { CategoryTable } from "@/types";

const data: CategoryTable[] = [
    {
        id: "1111111111111111",
        category_name: "Sports",
        created_at: "10/01/26",
        updated_at: "10/01/26",
        created_by: "Victor Lim",
        status: "active",
    },
    {
        id: "1111111111111111",
        category_name: "Geography",
        created_at: "10/01/26",
        updated_at: "10/01/26",
        created_by: "Victor Lim",
        status: "active",
    },
    {
        id: "1111111111111111",
        category_name: "Technology",
        created_at: "10/01/26",
        updated_at: "10/01/26",
        created_by: "Victor Lim",
        status: "active",
    },
    {
        id: "1111111111111111",
        category_name: "Arts",
        created_at: "10/01/26",
        updated_at: "10/01/26",
        created_by: "Victor Lim",
        status: "active",
    },
    {
        id: "1111111111111111",
        category_name: "History",
        created_at: "10/01/26",
        updated_at: "10/01/26",
        created_by: "Victor Lim",
        status: "active",
    },
    {
        id: "1111111111111111",
        category_name: "Politics",
        created_at: "10/01/26",
        updated_at: "10/01/26",
        created_by: "Victor Lim",
        status: "active",
    },
];

const CategoriesMgmtPage = () => {
    const [isLoading, setIsLoading] = useState(false);

    return (
        <div>
            {isLoading && <Loading />}
            {/* Right Section */}
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
                                className="placeholder:text-border pl-2 border-border rounded-sm"
                            />
                            <Button className="rounded-sm border border-border text-foreground bg-card hover:bg-card/40 font-semibold">
                                Search
                            </Button>
                        </ButtonGroup>
                    </div>
                    <div className="flex flex-row justify-between items-center">
                        <Button
                            variant="outline"
                            className="flex flex-row items-center gap-1 text-foreground bg-card hover:bg-card/40 rounded-sm w-fit"
                        >
                            Sort
                            <ChevronDown />
                        </Button>
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
                    <CategoriesDataTable
                        data={data}
                        columns={CategoriesColumns}
                    />
                </section>
            </div>
        </div>
    );
};

export default CategoriesMgmtPage;
