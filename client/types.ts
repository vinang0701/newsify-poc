export interface News {
    title: string;
    author: string;
    desc: string;
    url: string;
    urlToImage: string;
    content: string;
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