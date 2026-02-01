import React, { useCallback, useRef, useState, useEffect } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { FlashList } from '@shopify/flash-list';
import VideoItem from './VideoItem';
import { videoService } from '../services/api';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const VideoFeed = () => {
    const [videos, setVideos] = useState<any[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [page, setPage] = useState(1);
    const [loading, setLoading] = useState(false);

    const fetchVideos = async (pageNum: number) => {
        if (loading) return;
        setLoading(true);
        try {
            const newVideos = await videoService.getFeed(pageNum);
            setVideos(prev => pageNum === 1 ? newVideos : [...prev, ...newVideos]);
        } catch (error) {
            console.error('Failed to fetch videos', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos(1);
    }, []);

    const loadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchVideos(nextPage);
    };

    // Viewable items changed callback (for autoplay logic)
    const onViewableItemsChanged = useCallback(({ viewableItems }: { viewableItems: any[] }) => {
        if (viewableItems.length > 0) {
            const visibleItem = viewableItems[0];
            if (visibleItem.isViewable) {
                setCurrentIndex(visibleItem.index ?? 0);
            }
        }
    }, []);

    const viewabilityConfig = useRef({
        itemVisiblePercentThreshold: 80, // Video must be 80% visible
    }).current;

    const renderItem = useCallback(
        ({ item, index }: { item: any; index: number }) => {
            return (
                <VideoItem
                    uri={item.uri}
                    isActive={index === currentIndex}
                    details={item}
                />
            );
        },
        [currentIndex]
    );

    return (
        <View style={styles.container}>
            <FlashList
                data={videos}
                renderItem={renderItem}
                estimatedItemSize={SCREEN_HEIGHT}
                pagingEnabled
                decelerationRate="fast"
                keyExtractor={(item) => item.id}
                onViewableItemsChanged={onViewableItemsChanged}
                viewabilityConfig={viewabilityConfig}
                showsVerticalScrollIndicator={false}
                drawDistance={SCREEN_HEIGHT * 2}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading ? <ActivityIndicator color="#fff" /> : null}
            />
        </View>
    );
};


const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
});

export default VideoFeed;
