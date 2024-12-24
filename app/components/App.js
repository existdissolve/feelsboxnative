import React, {useEffect, useMemo, useState} from 'react';
import {MD3DarkTheme, Provider as PaperProvider} from 'react-native-paper';
import {NavigationContainer} from '@react-navigation/native';
import {createDrawerNavigator} from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import Authentication from '-/components/Authentication';
import SnackbarProvider from '-/components/shared/Snackbar';
import {PreferencesContext} from '-/components/shared/Preferences';
import DrawerMenu from '-/components/Drawer';
import Stack from '-/components/Stack';

MaterialCommunityIcon.loadFont(); 

const DrawerNav = createDrawerNavigator();
const themes = {
    blue: {
        colors: {
            accent: '#f50057',
            default: '#e0e0e0',
            primary: '#3f51b5'
        }
    },
    sorbet: {
        colors: {
            accent: '#d500f9',
            default: '#e0e0e0',
            primary: '#e91e63'
        }
    },
    grassy: {
        colors: {
            accent: '#c6ff00',
            default: '#e0e0e0',
            primary: '#4caf50'
        }
    },
    ocean: {
        colors: {
            accent: '#00e5ff',
            default: '#e0e0e0',
            primary: '#009688'
        }
    },
    sunrise: {
        colors: {
            accent: '#ffea00',
            default: '#e0e0e0',
            primary: '#ff9800'
        }
    }
};

export default () => {
    const [theme, setTheme] = useState('blue');

    useEffect(() => {
        const fetchStorage = async() => {
            const appThemeValue = await AsyncStorage.getItem('appTheme');

            if (appThemeValue) {
                setTheme(appThemeValue);
            }
        };

        fetchStorage();
    }, []);

    const toggleTheme = theme => {
        setTheme(theme);
    };
    
    const preferences = useMemo(() => ({
        toggleTheme,
        theme
    }), [toggleTheme, theme]);

    const themeData = {
        ...MD3DarkTheme,
        colors: {
            ...MD3DarkTheme.colors,
            ...themes[theme].colors,
            background: '#3E3E3E',
        },
        roundness: 4
    };

    return (
        <SafeAreaProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <SnackbarProvider>
                    <Authentication>
                        <PreferencesContext.Provider value={preferences}>
                            <PaperProvider theme={themeData}>
                                <NavigationContainer>
                                    <DrawerNav.Navigator drawerContent={props => <DrawerMenu {...props} />}>
                                        <DrawerNav.Screen name="initial" component={Stack} options={{header: () => {}, title: false}} />
                                    </DrawerNav.Navigator>
                                </NavigationContainer>
                            </PaperProvider>
                        </PreferencesContext.Provider>
                    </Authentication>
                </SnackbarProvider>
            </GestureHandlerRootView>
        </SafeAreaProvider>
    );
};
