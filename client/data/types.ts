export interface News {
    title: string;
    author: string;
    desc: string;
    url: string;
    urlToImage: string;
    content: any; // needs changing
};

export interface Community {
    id: string;
    name: string;
    desc: string;
    member_count: number;
    category: string;
    public: boolean;
    joined: boolean;
};

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