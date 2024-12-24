import React, {useContext, useEffect, useState} from 'react';
import {createStackNavigator} from '@react-navigation/stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import Account from '-/components/account';
import {AuthenticationContext} from '-/components/Authentication';
import Bluetooth from '-/components/device/Bluetooth';
import Categories from '-/components/category';
import Devices from '-/components/device';
import DeviceForm from '-/components/device/Form';
import DeviceGroups from '-/components/device/group';
import DeviceGroupForm from '-/components/device/group/Form';
import Feels from '-/components/feel';
import FeelGroups from '-/components/feel/group';
import FeelGroupForm from '-/components/feel/group/Form';
import FeelPlayground from '-/components/feel/playground';
import History from '-/components/device/History';
import Navbar from '-/components/Navbar';
import Signin from '-/components/Signin';

export default () => {
    const authentication = useContext(AuthenticationContext);
    const Stack = createStackNavigator();
    const [initialRoute, setInitialRoute] = useState(null);

    useEffect(() => {
        const fetchStorage = async() => {
            const {isLoggedIn} = authentication;
            const lastRoute = await AsyncStorage.getItem('lastRoute');

            if (!isLoggedIn) {
                setInitialRoute('signin');
            } else {
                if (lastRoute) {
                    setInitialRoute(lastRoute);
                } else {
                    setInitialRoute('feels');
                }
            }
        };

        fetchStorage();
    }, []);

    if (!initialRoute) {
        return null;
    }

    return (
        <Stack.Navigator initialRouteName={initialRoute} screenOptions={{header: Navbar}}>
            <Stack.Screen name="account" component={Account} options={{title: 'My Account', animationEnabled: false}} />
            <Stack.Screen name="bluetooth" component={Bluetooth} options={{title: 'Connect to Device', animationEnabled: false}} />
            <Stack.Screen name="signin" component={Signin} options={{title: 'Sign In'}} />
            <Stack.Screen name="categories" component={Categories} options={{title: 'Categories', animationEnabled: false}} />
            <Stack.Screen name="devices" component={Devices} options={{title: 'Devices', animationEnabled: false}} />
            <Stack.Screen name="devicehistory" component={History} options={{title: 'Devices', animationEnabled: false}} />
            <Stack.Screen name="editdevice" component={DeviceForm} options={{title: 'Edit Device', animationEnabled: false}} />
            <Stack.Screen name="devicegroups" component={DeviceGroups} options={{title: 'My Device Groups', animationEnabled: false}} />
            <Stack.Screen name="editdevicegroup" component={DeviceGroupForm} options={{title: 'Edit Device Group', animationEnabled: false}} />
            <Stack.Screen name="feel" component={FeelPlayground} options={{title: 'Feel Maker', animationEnabled: false}} />
            <Stack.Screen name="feels" component={Feels} options={{title: 'My Feels', animationEnabled: false}} />
            <Stack.Screen name="search" component={Feels} options={{title: 'Find Feels', animationEnabled: false, isSearch: true}} />
            <Stack.Screen name="feelgroups" component={FeelGroups} options={{title: 'My Feels Groups', animationEnabled: false}} />
            <Stack.Screen name="editfeelgroup" component={FeelGroupForm} options={{title: 'Edit Feels Group', animationEnabled: false}} />
        </Stack.Navigator>
    );
};
