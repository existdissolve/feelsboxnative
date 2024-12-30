import React, {useContext} from 'react';
import {Drawer, useTheme} from 'react-native-paper';
import {View} from 'react-native';
import {get} from 'lodash';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {DrawerContentScrollView} from '@react-navigation/drawer';
import {useNavigation} from '@react-navigation/native';
import {useMutation} from '@apollo/client';
import GetLocation from 'react-native-get-location'

import {AuthenticationContext} from '-/components/Authentication';
import {viewWeather as viewWeatherMutation} from '-/graphql/device';
import {SnackbarContext} from '-/components/shared';

export default props => {
    const authentication = useContext(AuthenticationContext);
    const navigation = useNavigation();
    const [viewWeather] = useMutation(viewWeatherMutation);
    const {show} = useContext(SnackbarContext);
    const theme = useTheme();
    const style = {
        backgroundColor: get(theme, 'colors.background')
    };

    const onPress = destination => {
        navigation.navigate(destination);
        AsyncStorage.setItem('lastRoute', destination);
    };

    const onLogoutPress = async() => {
        await authentication.signOut();
        navigation.navigate('signin');
        AsyncStorage.removeItem('lastRoute');
    };

    const onWeatherPress = () => {
        GetLocation.getCurrentPosition({
            enableHighAccuracy: true,
            timeout: 60000,
        }).then(location => {
            const {latitude, longitude} = location;
            
            viewWeather({
                variables: {
                    latitude,
                    longitude
                }
            });
        }).catch(error => {
            const {code} = error;
            
            if (code === 'UNAUTHORIZED') {
                show('Please enable location services for this application.');
            } else {
                show('There was a problem getting your location.');
            }
        });
    };

    return (
        <DrawerContentScrollView {...props} style={style}>
            <View>
                <Drawer.Section>
                    <Drawer.Item label="My Feels" onPress={onPress.bind(null, 'feels')} icon="emoticon-outline" />
                    <Drawer.Item label="Feels Groups" onPress={onPress.bind(null, 'feelgroups')} icon="folder-multiple-image" />
                    <Drawer.Item label="Devices" onPress={onPress.bind(null, 'devices')} icon="tablet" />
                    <Drawer.Item label="Device Groups" onPress={onPress.bind(null, 'devicegroups')} icon="tablet-cellphone" />
                    <Drawer.Item label="Connect Device" onPress={onPress.bind(null, 'bluetooth')} icon="bluetooth-connect" />
                    <Drawer.Item label="My Account" onPress={onPress.bind(null, 'account')} icon="account-box" />
                    <Drawer.Item label="Show Weather" onPress={onWeatherPress} icon="weather-partly-cloudy" />
                    <Drawer.Item label="Logout" onPress={onLogoutPress} icon="logout-variant" />
                </Drawer.Section>
            </View>
        </DrawerContentScrollView>
    );
};
