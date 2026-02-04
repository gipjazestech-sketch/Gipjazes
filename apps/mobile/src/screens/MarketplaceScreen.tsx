import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { marketplaceService } from '../services/api';
import Icon from 'react-native-vector-icons/Ionicons';

const MarketplaceScreen = () => {
    const [products, setProducts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('All');

    const insets = useSafeAreaInsets();

    const categories = ['All', 'Fashion', 'Electronics', 'Home', 'Beauty', 'Sports'];

    useEffect(() => {
        fetchProducts();
    }, [activeCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const data = await marketplaceService.getProducts(activeCategory === 'All' ? undefined : activeCategory);
            setProducts(data);
        } catch (error) {
            console.error('Failed to fetch products', error);
        } finally {
            setLoading(false);
        }
    };

    const renderProduct = ({ item }: any) => (
        <TouchableOpacity style={styles.productCard} activeOpacity={0.9}>
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: item.image_url || 'https://via.placeholder.com/300' }}
                    style={styles.productImage}
                />
                <View style={styles.categoryBadge}>
                    <Text style={styles.categoryBadgeText}>{item.category || 'New'}</Text>
                </View>
                <TouchableOpacity style={styles.wishlistButton}>
                    <Icon name="heart-outline" size={18} color="#fff" />
                </TouchableOpacity>
            </View>
            <View style={styles.productInfo}>
                <Text style={styles.productTitle} numberOfLines={1}>{item.title}</Text>
                <View style={styles.priceRow}>
                    <Text style={styles.productPrice}>${item.price}</Text>
                    <View style={styles.ratingRow}>
                        <Icon name="star" size={12} color="#FFD700" />
                        <Text style={styles.ratingText}>4.8</Text>
                    </View>
                </View>
                <View style={styles.sellerRow}>
                    <Image
                        source={{ uri: `https://ui-avatars.com/api/?name=${item.username}&background=random` }}
                        style={styles.sellerAvatar}
                    />
                    <Text style={styles.sellerName}>{item.username}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerSubtitle}>Discover</Text>
                    <Text style={styles.headerTitle}>Marketplace</Text>
                </View>
                <TouchableOpacity style={styles.cartButton}>
                    <Icon name="bag-handle-outline" size={24} color="#fff" />
                    <View style={styles.cartBadge} />
                </TouchableOpacity>
            </View>

            <View style={styles.searchSection}>
                <View style={styles.searchBar}>
                    <Icon name="search-outline" size={20} color="#888" />
                    <TextInput
                        placeholder="Search items..."
                        placeholderTextColor="#555"
                        style={styles.searchInput}
                    />
                </View>
                <TouchableOpacity style={styles.filterButton}>
                    <Icon name="options-outline" size={22} color="#fff" />
                </TouchableOpacity>
            </View>

            <View style={styles.categoryContainer}>
                <FlatList
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    data={categories}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={[
                                styles.categoryTab,
                                activeCategory === item && styles.activeCategoryTab
                            ]}
                            onPress={() => setActiveCategory(item)}
                        >
                            <Text style={[
                                styles.categoryText,
                                activeCategory === item && styles.activeCategoryText
                            ]}>
                                {item}
                            </Text>
                        </TouchableOpacity>
                    )}
                />
            </View>

            {
                loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color="#fe2c55" />
                    </View>
                ) : (
                    <FlatList
                        data={products}
                        renderItem={renderProduct}
                        keyExtractor={(item) => item.id}
                        numColumns={2}
                        contentContainerStyle={styles.productList}
                        ListEmptyComponent={
                            <View style={styles.emptyState}>
                                <Icon name="bag-outline" size={60} color="#333" />
                                <Text style={styles.emptyText}>No items found in this category</Text>
                            </View>
                        }
                    />
                )
            }
        </View >
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 18,
        backgroundColor: '#000',
    },
    headerTitle: {
        color: '#fff',
        fontSize: 32,
        fontWeight: '900',
        letterSpacing: -1,
    },
    headerSubtitle: {
        color: '#fe2c55',
        fontSize: 12,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 2,
        marginBottom: 2,
    },
    cartButton: {
        backgroundColor: '#111',
        width: 45,
        height: 45,
        borderRadius: 23,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#222',
    },
    cartBadge: {
        position: 'absolute',
        top: 10,
        right: 10,
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#fe2c55',
        borderWidth: 2,
        borderColor: '#000',
    },
    searchSection: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        marginBottom: 20,
        alignItems: 'center',
    },
    searchBar: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#111',
        height: 45,
        borderRadius: 12,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: '#222',
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        color: '#fff',
        fontSize: 15,
    },
    filterButton: {
        width: 45,
        height: 45,
        backgroundColor: '#111',
        borderRadius: 12,
        marginLeft: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#222',
    },
    categoryContainer: {
        marginBottom: 15,
    },
    categoryTab: {
        paddingHorizontal: 22,
        paddingVertical: 10,
        borderRadius: 25,
        backgroundColor: '#111',
        marginHorizontal: 6,
        borderWidth: 1,
        borderColor: '#222',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeCategoryTab: {
        backgroundColor: '#fff',
        borderColor: '#fff',
    },
    categoryText: {
        color: '#888',
        fontWeight: '700',
        fontSize: 13,
    },
    activeCategoryText: {
        color: '#000',
    },
    productList: {
        paddingHorizontal: 8,
        paddingBottom: 40,
    },
    productCard: {
        flex: 0.5,
        backgroundColor: '#000',
        margin: 8,
        borderRadius: 16,
        overflow: 'hidden',
    },
    imageContainer: {
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        backgroundColor: '#111',
    },
    productImage: {
        width: '100%',
        height: 200,
        resizeMode: 'cover',
    },
    categoryBadge: {
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    categoryBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    wishlistButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0,0,0,0.4)',
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    productInfo: {
        paddingVertical: 12,
        paddingHorizontal: 4,
    },
    productTitle: {
        color: '#fff',
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 6,
    },
    priceRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    productPrice: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '800',
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        color: '#fff',
        fontSize: 12,
        fontWeight: '600',
        marginLeft: 4,
    },
    sellerRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    sellerAvatar: {
        width: 18,
        height: 18,
        borderRadius: 9,
        backgroundColor: '#333',
    },
    sellerName: {
        color: '#666',
        fontSize: 12,
        marginLeft: 6,
        fontWeight: '500',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 100,
    },
    emptyText: {
        color: '#666',
        marginTop: 15,
        fontSize: 15,
        fontWeight: '500',
        textAlign: 'center',
        paddingHorizontal: 40,
    },
});

export default MarketplaceScreen;
