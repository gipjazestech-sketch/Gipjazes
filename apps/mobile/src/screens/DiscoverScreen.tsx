import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    FlatList,
    Image,
    Dimensions,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { videoService } from '../services/api';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_WIDTH = SCREEN_WIDTH / COLUMN_COUNT;

const DiscoverScreen = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;
        setLoading(true);
        try {
            const data = await videoService.searchVideos(searchQuery);
            setResults(data);
        } catch (error) {
            console.error('Search failed', error);
        } finally {
            setLoading(false);
        }
    };

    const renderResultItem = ({ item }: { item: any }) => (
        <TouchableOpacity style={styles.gridItem}>
            <Image
                source={{ uri: item.thumbnail || 'https://via.placeholder.com/300x500' }}
                style={styles.gridImage}
            />
            <View style={styles.viewCountOverlay}>
                <Icon name="play-outline" size={12} color="#fff" />
                <Text style={styles.viewCountText}>{item.likes} likes</Text>
            </View>
            <View style={styles.infoOverlay}>
                <Text style={styles.description} numberOfLines={1}>{item.description}</Text>
                <Text style={styles.username}>@{item.user.username}</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.searchHeader}>
                <Text style={styles.pageTitle}>Explore</Text>
                <View style={styles.searchBar}>
                    <Icon name="search-outline" size={20} color="#666" style={styles.searchIcon} />
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Songs, creators, hashtags..."
                        placeholderTextColor="#444"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    {searchQuery.length > 0 && (
                        <TouchableOpacity onPress={() => setSearchQuery('')}>
                            <Icon name="close-circle" size={20} color="#666" />
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            {!searchQuery && (
                <View style={styles.trendingHeader}>
                    <Text style={styles.trendingTitle}>Trending Now</Text>
                    <TouchableOpacity>
                        <Text style={styles.seeAllText}>See all</Text>
                    </TouchableOpacity>
                </View>
            )}

            {loading ? (
                <ActivityIndicator style={styles.loader} color="#fe2c55" size="large" />
            ) : (
                <FlatList
                    data={results}
                    renderItem={renderResultItem}
                    keyExtractor={(item) => item.id}
                    numColumns={COLUMN_COUNT}
                    contentContainerStyle={styles.listContent}
                    ListEmptyComponent={
                        <View style={styles.emptyState}>
                            <Icon name="search" size={60} color="#333" />
                            <Text style={styles.emptyText}>
                                {searchQuery ? 'No results found' : 'Search for your favorite content'}
                            </Text>
                        </View>
                    }
                />
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    searchHeader: {
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 20,
    },
    pageTitle: {
        color: '#fff',
        fontSize: 34,
        fontWeight: '900',
        marginBottom: 20,
        letterSpacing: -1,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        borderRadius: 14,
        paddingHorizontal: 15,
        height: 50,
        borderWidth: 1,
        borderColor: '#222',
    },
    searchIcon: {
        marginRight: 10,
    },
    searchInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '500',
        height: '100%',
    },
    trendingHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
    },
    trendingTitle: {
        color: '#fff',
        fontSize: 20,
        fontWeight: '800',
    },
    seeAllText: {
        color: '#fe2c55',
        fontSize: 14,
        fontWeight: '600',
    },
    loader: {
        marginTop: 50,
    },
    listContent: {
        padding: 1,
    },
    gridItem: {
        width: ITEM_WIDTH,
        height: ITEM_WIDTH * 1.5,
        padding: 1,
        position: 'relative',
    },
    gridImage: {
        width: '100%',
        height: '100%',
        backgroundColor: '#111',
    },
    viewCountOverlay: {
        position: 'absolute',
        bottom: 35,
        left: 8,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 4,
        paddingHorizontal: 4,
    },
    viewCountText: {
        color: '#fff',
        fontSize: 10,
        marginLeft: 4,
        fontWeight: '600',
    },
    infoOverlay: {
        position: 'absolute',
        bottom: 5,
        left: 8,
        right: 8,
    },
    description: {
        color: '#fff',
        fontSize: 11,
        fontWeight: '500',
    },
    username: {
        color: '#aaa',
        fontSize: 10,
        marginTop: 2,
    },
    emptyState: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 150,
    },
    emptyText: {
        color: '#555',
        fontSize: 16,
        marginTop: 15,
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default DiscoverScreen;
