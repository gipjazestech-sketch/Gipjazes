import React from 'react';
import { View, StyleSheet, StatusBar, Text, TouchableOpacity } from 'react-native';
import VideoFeed from '../components/VideoFeed';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';

const FeedScreen = () => {
    const navigation = useNavigation<any>();

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
            <VideoFeed />

            {/* Overlay Header */}
            <SafeAreaView style={styles.header} edges={['top']}>
                <View style={styles.topBar}>
                    <TouchableOpacity onPress={() => navigation.navigate('Discover')} style={styles.searchButton}>
                        <Icon name="search" size={26} color="#fff" />
                    </TouchableOpacity>
                    <View style={styles.tabSwitcher}>
                        <Text style={styles.tabTextActive}>For You</Text>
                    </View>
                    <View style={{ width: 40 }} /> {/* Spacer to balance search button */}
                </View>
            </SafeAreaView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
    },
    topBar: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
    },
    searchButton: {
        width: 40,
        height: 40,
        justifyContent: 'center',
    },
    tabSwitcher: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabTextActive: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        borderBottomWidth: 2,
        borderBottomColor: '#fff',
        paddingBottom: 4,
    },
});

export default FeedScreen;
