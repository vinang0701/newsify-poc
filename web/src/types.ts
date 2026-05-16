import type { ColumnDef } from "@tanstack/react-table";
import * as z from "zod";

export interface News {
    id: string;
    title: string;
    author: string;
    author_id: string;
    desc: string;
    url: string;
    image_url: string;
    content: string | any; // needs changing
}

export interface Community {
    id: string;
    name: string;
    description: string;
    image_url: string | null;
    status: string;
    created_at: string;
    updated_at: string | null;
    member_count?: number;
}

export interface ModalProps {
    onModalPress: () => void;
}

export interface LiveStream {
    id: string;
    title: string;
    community: string;
    desc: string;
    view_count: number;
}

// Temp
export interface UserProfileDetails {
    id: string;
    name: string;
    description: string;
}

export interface UserAuth {
    id: string;
    user_id: string;
    inst_id: string;
    name: string;
    email: string;
    role: string;
}

export interface User {
    id: string;
    inst_id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    created_at: string;
    updated_at: string;
}

// Table Props
export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

// Institution Admin
export const createUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters long").trim(),

    email: z.email("Please enter a valid email address").toLowerCase().trim(),

    password: z.string().min(8, "Password must be at least 8 characters long"),

    role: z.enum(
        ["student", "staff", "institution_admin"],
        Error("Please select a valid user role."),
    ),
});

export type CreateUserFormData = z.infer<typeof createUserSchema>;

export interface CategoryTable {
    category_id: string;
    category_name: string;
    created_at: string;
    status: string;
    updated_at: string;
    created_by: string;
}

export interface CommunityCreationRequest {
    request_id: string;
    requested_by_user_id: string;
    requested_by_user_name: string;
    requested_by_user_image_url: string | null;
    community_name: string;
    community_image_url: string | null;
    community_public: boolean;
    description: string;
    status: string;
    created_at: string;
    reviewed_at: string | null;
    reviewed_by_user_id: string | null;
    reviewed_by_user_name: string | null;
    rejection_reason: string | null;
}

export interface Institution {
    id: string;
    name: string;
    domain: string;
    phone: string | null;
    plan: string | null;
    status: string;
    start_date: string | null;
    end_date: string | null;
}

export interface InstitutionFormData {
    name: string;
    email: string;
    phone: string;
    plan: string;
    startDate: string;
    endDate: string;
}

export interface CommunityMember {
    user_id: string;
    role: string;
    joined_at: string;
    users: {
        id: string;
        name: string;
        email: string;
    };
}

export interface CommunityDetail {
    community: {
        id: string;
        name: string;
        description: string;
        status: string;
        image_url: string | null;
        created_at: string;
        users: { name: string; email: string };
    };
    members: CommunityMember[];
}
