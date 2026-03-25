import {
    View,
    Text,
    StyleSheet,
    Pressable,
    useColorScheme,
} from "react-native";
import React, { useEffect, useState } from "react";
import { Colors } from "@/constants/theme";

import NewsPostCard from "./news_post_card";
import newsArticles from "@/data/news.json";
import { News } from "@/data/types";
import { FlashList } from "@shopify/flash-list";

const DraftsTab = () => {
    const colorScheme = useColorScheme() ?? "light";
    const [news, setNews] = useState<News[]>([]);

    return (
        <View style={{ flex: 1 }}>
            <FlashList
                showsVerticalScrollIndicator={false}
                nestedScrollEnabled={false}
                data={news}
                renderItem={(item) => <NewsPostCard news={item.item} />}
            />
        </View>
    );
};

export default DraftsTab;
