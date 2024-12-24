import React, {useContext, useEffect, useState} from 'react';
import {useMutation} from '@apollo/client';
import {GoogleSignin, statusCodes} from '@react-native-google-signin/google-signin';
import auth from '@react-native-firebase/auth';
import Config from 'react-native-config';

import {login, logout} from '-/graphql/authentication';
import {SnackbarContext} from '-/components/shared';

export const AuthenticationContext = React.createContext();

export default props => {
    const {children} = props;
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [user, setUser] = useState(null);
    const [isLoggingIn, setIsLoggingIn] = useState(true);
    const [loginUser] = useMutation(login);
    const [logoutUser] = useMutation(logout);
    const {show} = useContext(SnackbarContext);

    const signIn = async() => {
        try {
            setIsLoggingIn(true);
            // check that play services exist so login can be attempted
            await GoogleSignin.hasPlayServices();
            // do the signin
            const {data} = await GoogleSignin.signIn();
            const {accessToken, idToken, user, ...rest} = data;
            // get credential so we can validate against firebase
            const credential = auth.GoogleAuthProvider.credential(idToken, accessToken);
            // auth against firebase
            await auth().signInWithCredential(credential);
            const {email} = user;
            // send to server to establish session
            await loginUser({variables: {email}});
            // update application state
            setIsLoggedIn(true);
            setUser(user);
            setIsLoggingIn(false);
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                setIsLoggingIn(false);
                setIsLoggedIn(false);
                setUser(null);
            } else if (error.code === statusCodes.IN_PROGRESS) {
                setIsLoggingIn(true);
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
            } else {
                setIsLoggingIn(false);
                setIsLoggedIn(false);
                setUser(null);
            }

            show(JSON.stringify(error));
        }
    };

    const signOut = async() => {
        try {
            //await GoogleSignin.revokeAccess();
            await auth().signOut();
            await GoogleSignin.signOut();
            await logoutUser();
        } catch (error) {
            // noop
        }

        setIsLoggingIn(false);
        setIsLoggedIn(false);
        setUser(null);
    };

    const onAuthStateChanged = async user => {
        if (user) {
            const {email} = user;
            // send to server to establish session
            await loginUser({variables: {email}});

            setUser(user);
            setIsLoggedIn(true);
        } else {
            await signIn();
        }
    };

    useEffect(() => {
        GoogleSignin.configure({
            scopes: ['email'],
            iosClientId: Config.IOS_CLIENT_ID,
            webClientId: Config.WEB_CLIENT_ID,
            offlineAccess: true
        });

        const subscriber = auth().onAuthStateChanged(onAuthStateChanged);

        return subscriber; // unsubscribe on unmount
    }, []);

    const feelsboxAuth = {
        isLoggedIn,
        isLoggingIn,
        signIn,
        signOut,
        user
    };

    return (
        <AuthenticationContext.Provider value={feelsboxAuth}>{children}</AuthenticationContext.Provider>
    );
};
