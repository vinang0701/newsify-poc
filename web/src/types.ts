import type { ColumnDef } from "@tanstack/react-table";

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
    category: string;
    public: boolean;
    joined: boolean;
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
    inst_id: string;
    name: string;
    email: string;
    role: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

// Table Props
export interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
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