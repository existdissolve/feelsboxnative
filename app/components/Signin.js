import {React, useContext, useEffect} from 'react';
import {StyleSheet, Text} from 'react-native';
import {Button} from 'react-native-paper';
import {useNavigation} from '@react-navigation/native';

import {Container, Loading} from '-/components/shared';
import {AuthenticationContext} from '-/components/Authentication';

const styles = StyleSheet.create({
    button: {
        marginTop: 20,
        width: 100
    },
    container: {
        padding: 20
    },
    h3: {
        fontSize: 25,
        fontWeight: '600',
        marginBottom: 20
    },
    p: {
        fontSize: 15
    }
});

export default () => {
    const authentication = useContext(AuthenticationContext);
    const navigation = useNavigation();
    const {isLoggedIn, isLoggingIn = false} = authentication;

    const onLoginPress = async() => {
        await authentication.signIn();
    };

    useEffect(() => {
        if (isLoggedIn) {
            navigation.navigate('feels');
        }
    }, [isLoggedIn]);

    return (
        <Container>
            {!isLoggingIn &&
                <Container style={styles.container}>
                    <Text style={styles.h3}>Hi there!</Text>
                    <Text style={styles.p}>To begin using your FeelsBox, login with your Google account.</Text>
                    <Button icon="account" mode="contained" onPress={onLoginPress} style={styles.button}>
                        Login
                    </Button>
                </Container>
            }
            <Loading loading={isLoggingIn} text="One second, logging you in..." />
        </Container>
    );
};
