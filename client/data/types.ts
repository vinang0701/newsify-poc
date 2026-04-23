export interface News {
    id: string;
    title: string;
    author: string;
    author_id: string;
    desc: string;
    url: string;
    image_url: string;
    content: string | any; // needs changing
    likes_count: number;
    comments_count: number;
    has_liked: boolean;
    has_saved: boolean;
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

export interface Users {
    id: string;
    name: string;
    email: string;
    status: string;
    created_at: string;
    updated_at: string;
}

// Comments
export interface PostComment {
    comment_id: string;
    post_id: string;
    commented_by_user_id: string;
    commented_by_user_name: string;
    comment_text: string;
    parent_comment_id: string | null;
    created_at: string;
    updated_at: string | null;
}
