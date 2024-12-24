import React, {useContext, useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Caption, RadioButton, Text} from 'react-native-paper';

import {PreferencesContext} from '-/components/shared/Preferences';

export default () => {
    const [displayMode, setDisplayMode] = useState('grid');
    const [appTheme, setAppTheme] = useState('blue');
    const {toggleTheme} = useContext(PreferencesContext);

    const setStorage = async(key, value) => {
        let fn;

        switch(key) {
            case 'displayMode':
                fn = setDisplayMode;
                break;
            case 'appTheme':
                fn = setAppTheme;
                toggleTheme(value);
                break;
        }

        await AsyncStorage.setItem(key, value);

        fn(value);
    };

    useEffect(() => {
        const fetchStorage = async() => {
            const displayModeValue = await AsyncStorage.getItem('displayMode');
            const appThemeValue = await AsyncStorage.getItem('appTheme');

            if (displayModeValue) {
                setDisplayMode(displayModeValue);
            }

            if (appThemeValue) {
                setAppTheme(appThemeValue);
            }
        };

        fetchStorage();
    }, []);

    return (
        <>
            <View style={styles.formgroup}>
                <Caption>Feels Display Style</Caption>
                <RadioButton.Group onValueChange={val => setStorage('displayMode', val)} value={displayMode}>
                    <View style={styles.radiogroup}>
                        <View style={styles.radio}>
                            <RadioButton value="grid" />
                            <Text style={styles.label}>Grid</Text>
                        </View>
                        <View style={styles.radio}>
                            <RadioButton value="list" />
                            <Text style={styles.label}>List</Text>
                        </View>
                    </View>
                </RadioButton.Group>
            </View>
            <View style={styles.formgroup}>
                <Caption>Theme</Caption>
                <RadioButton.Group onValueChange={val => setStorage('appTheme', val)} value={appTheme}>
                    <View style={styles.radiogroup}>
                        <View style={styles.radio}>
                            <RadioButton value="blue" />
                            <Text style={styles.label}>Blue</Text>
                        </View>
                        <View style={styles.radio}>
                            <RadioButton value="sorbet" />
                            <Text style={styles.label}>Sorbet</Text>
                        </View>
                        <View style={styles.radio}>
                            <RadioButton value="grassy" />
                            <Text style={styles.label}>Grassy</Text>
                        </View>
                        <View style={styles.radio}>
                            <RadioButton value="ocean" />
                            <Text style={styles.label}>Ocean</Text>
                        </View>
                        <View style={styles.radio}>
                            <RadioButton value="sunrise" />
                            <Text style={styles.label}>Sunrise</Text>
                        </View>
                    </View>
                </RadioButton.Group>
            </View>
        </>
    );
};

const styles = StyleSheet.create({
    formgroup: {
        padding: 15
    },
    radiogroup: {
        flexDirection: 'row',
        flexWrap: 'wrap'
    },
    label: {
        marginTop: 8
    },
    radio: {
        flexDirection: 'row',
        flexBasis: '25%'
    }
});
