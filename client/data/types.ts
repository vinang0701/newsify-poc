export interface News {
    id: string;
    title: string;
    author: string;
    author_id: string;
    description: string;
    url: string;
    image_url: string;
    content: string; // needs changing
    likes_count: number;
    comments_count: number;
    has_liked: boolean;
    has_saved: boolean;
    created_at: string;
    community_id: string | null;
    community_name: string | null;
    community_image: string | null;
    category_id: string | null;
}

// export interface Community {
//     id: string;
//     name: string;
//     description: string;
//     category: string;
//     public: boolean;
//     joined: boolean;
// }
export interface Community {
    id: string;
    inst_id: string;
    created_by_user_id: string;
    name: string;
    description: string;
    status: string;
    image_url: string | null;
    created_at: string;
    updated_at: string | null;
    role: string | null;
    isMember: boolean;
    member_count: number;
    member_status: string | null;
    public: boolean;
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
export interface UserFollowing {
    followed_user_id: string;
    name: string;
}

export interface UserFollowers {
    follower_user_id: string;
    name: string;
}

export interface PostRequest {
    request_id: string;
    requested_by_user_id: string;
    community_name: string;
    description: string;
    status: string;
    created_at: string;
    reviewed_at: string;
    reviewed_by_user_id: string;
    rejection_reason: string;
}

export interface CommunityPostRequest {
    request_id: string;
    author_name: string;
    image_url: string;
    title: string;
    description: string;
    status: string;
    created_at: string;
    reviewed_at?: string | null;
    reviewed_by?: string | null;
    rejection_reason?: string | null;
}

// User Preference
export interface UserPreference {
    user_id: string;
    category: {
        category_id: string;
        category_name: string;
        category_status: string;
    };
    preference_type: string;
    created_at: string;
}

// Server response
export interface ServerReponse {
    status: string;
    message: string;
}

export type PostDestination = "FOLLOWERS" | "COMMUNITY" | "PUBLIC";

export interface PostData {
    title: string;
    description: string;
    content: string;
    destination: PostDestination;
    is_public: boolean;
    selectedCategoryId: string;
    selectedCommunityId?: string;
    thumbnail?: string;
}

export interface DraftData {
    draft_id?: string;
    thumbnail?: string;
    title?: string;
    content?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Category {
    category_id: string;
    category_name: string;
    created_at?: string;
    status?: string;
    created_by?: string;
}
