import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Alert,
    Animated,
    useColorScheme,
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import BooksScreen from './BooksScreen';
import EmpruntsScreen from './MyBorrowsScreen';
import ProfileScreen from './ProfileScreen';
import AdminPanelScreen from './AdminPanelScreen';
import api from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import {
    Ionicons,
    FontAwesome5,
    MaterialIcons,
} from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

export default function MainTabs() {
    const navigation = useNavigation();
    const scheme = useColorScheme();

    const [isAdmin, setIsAdmin] = useState(false);
    const [badgeCount, setBadgeCount] = useState<number>(0);

    const fetchUser = async () => {
        try {
            const res = await api.get('auth/me/');
            setIsAdmin(res.data.is_staff || res.data.is_superuser);
        } catch (e) {
            console.log('Erreur rôle utilisateur :', e.message);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Déconnexion',
            'Voulez-vous vraiment vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Se déconnecter',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const refresh = await AsyncStorage.getItem('refresh_token');
                            if (refresh) await api.post('auth/logout/', { refresh });
                        } catch (e) {
                            console.log('Erreur logout :', e.message);
                        } finally {
                            await AsyncStorage.clear();
                            Alert.alert('Déconnexion', 'Vous avez été déconnecté.');
                            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
                        }
                    },
                },
            ]
        );
    };

    useEffect(() => {
        fetchUser();
    }, []);

    useFocusEffect(
        React.useCallback(() => {
            // fetchBorrowCount();
        }, [])
    );

    const activeColor = isAdmin ? '#f39c12' : '#1e90ff';

    return (
        <Tab.Navigator
            initialRouteName="Livres"
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: activeColor,
                tabBarInactiveTintColor: scheme === 'dark' ? '#ccc' : '#777',
                tabBarStyle: {
                    backgroundColor: scheme === 'dark' ? '#000' : '#fff',
                    borderTopWidth: 0.5,
                    borderTopColor: '#ddd',
                    height: 60,
                },
                tabBarLabelStyle: { fontSize: 13 },
            }}
        >
            <Tab.Screen
                name="Livres"
                component={BooksScreen}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Animated.View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
                            <Ionicons
                                name={isAdmin ? 'library-outline' : 'book'}
                                color={color}
                                size={size}
                            />
                        </Animated.View>
                    ),
                }}
            />

            {!isAdmin && (
                <Tab.Screen
                    name="Mes emprunts"
                    component={EmpruntsScreen}
                    options={{
                        tabBarIcon: ({ focused, color, size }) => (
                            <Animated.View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
                                <FontAwesome5 name="clipboard-list" color={color} size={size} />
                            </Animated.View>
                        ),
                    }}
                />
            )}

            {isAdmin && (
                <Tab.Screen
                    name="Admin Panel"
                    component={AdminPanelScreen}
                    options={{
                        tabBarIcon: ({ color, size }) => (
                            <MaterialIcons name="admin-panel-settings" color={color} size={size} />
                        ),
                    }}
                />
            )}

            <Tab.Screen
                name="Profil"
                component={ProfileScreen}
                options={{
                    tabBarIcon: ({ focused, color, size }) => (
                        <Animated.View style={{ transform: [{ scale: focused ? 1.15 : 1 }] }}>
                            <Ionicons name="person-circle-outline" color={color} size={size} />
                        </Animated.View>
                    ),
                }}
            />

            <Tab.Screen
                name="Déconnexion"
                component={View}
                options={{
                    tabBarIcon: ({ color, size }) => (
                        <MaterialIcons name="logout" color={color} size={size} />
                    ),
                    tabBarButton: (props) => (
                        <TouchableOpacity {...props} onPress={handleLogout} />
                    ),
                }}
            />
        </Tab.Navigator>
    );
}
