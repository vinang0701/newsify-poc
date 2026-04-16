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
	image_url: string;
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
	id: string;
	category_name: string;
	status: string;
	created_by: string;
	created_at: string;
	updated_at: string;
}
