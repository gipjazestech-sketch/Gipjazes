import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/Ionicons';

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
                    borderTopColor: '#333',
                    height: 60,
                    paddingBottom: 8,
                },
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: '#888',
                tabBarIcon: ({ color, size }) => {
                    let iconName = 'home';

                    if (route.name === 'Home') {
                        iconName = 'home';
                    } else if (route.name === 'Marketplace') {
                        iconName = 'bag-handle';
                    } else if (route.name === 'Create') {
                        iconName = 'add-circle';
                        size = 40;
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

export default AppNavigator;
