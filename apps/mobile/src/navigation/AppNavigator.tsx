import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';
import { View, StyleSheet, TouchableOpacity } from 'react-native';

import FeedScreen from '../screens/FeedScreen';
import CreatorScreen from '../screens/CreatorScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DiscoverScreen from '../screens/DiscoverScreen';
import MarketplaceScreen from '../screens/MarketplaceScreen';
import ChatListScreen from '../screens/ChatListScreen';
import ChatDetailScreen from '../screens/ChatDetailScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import EditProfileScreen from '../screens/EditProfileScreen';
import { useAuthStore } from '../store/useAuthStore';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const MainTabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: '#000',
                    borderTopWidth: 0.5,
                    borderTopColor: '#D4AF37', // Golden border
                    height: 65,
                    paddingBottom: 10,
                },
                tabBarActiveTintColor: '#D4AF37', // Golden Active Tab
                tabBarInactiveTintColor: '#666',
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName = 'home';

                    if (route.name === 'Home') {
                        iconName = 'home';
                    } else if (route.name === 'Marketplace') {
                        iconName = 'bag-handle';
                    } else if (route.name === 'Create') {
                        return (
                            <View style={styles.createButtonContainer}>
                                <View style={styles.createButtonGlow} />
                                <View style={[styles.createButton, focused && styles.createButtonActive]}>
                                    <Icon name="add" size={32} color="#000" />
                                </View>
                            </View>
                        );
                    } else if (route.name === 'Inbox') {
                        iconName = 'chatbubble-ellipses';
                    } else if (route.name === 'Profile') {
                        iconName = 'person';
                    }

                    return <Icon name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={FeedScreen} />
            <Tab.Screen name="Marketplace" component={MarketplaceScreen} />
            <Tab.Screen name="Create" component={CreatorScreen} />
            <Tab.Screen name="Inbox" component={ChatListScreen} />
            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
};

const AppStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Main" component={MainTabNavigator} />
            <Stack.Screen name="ChatDetail" component={ChatDetailScreen} />
            <Stack.Screen name="Discover" component={DiscoverScreen} />
            <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        </Stack.Navigator>
    );
};

const AuthStack = () => {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
        </Stack.Navigator>
    );
};

const AppNavigator = () => {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    return (
        <NavigationContainer>
            {isAuthenticated ? <AppStack /> : <AuthStack />}
        </NavigationContainer>
    );
};

const styles = StyleSheet.create({
    createButtonContainer: {
        width: 60,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        bottom: 20, // Lifted up like TikTok
    },
    createButtonGlow: {
        position: 'absolute',
        width: 50,
        height: 50,
        borderRadius: 15,
        backgroundColor: '#D4AF37',
        opacity: 0.4,
        transform: [{ scale: 1.2 }],
    },
    createButton: {
        width: 48,
        height: 48,
        borderRadius: 14,
        backgroundColor: '#D4AF37', // Premium Golden
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.5,
        shadowRadius: 10,
        elevation: 10,
        borderWidth: 2,
        borderColor: '#FFF',
    },
    createButtonActive: {
        backgroundColor: '#FFD700',
        transform: [{ scale: 1.1 }],
        borderColor: '#000',
    }
});

export default AppNavigator;
