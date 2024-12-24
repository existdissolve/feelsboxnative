import React from 'react';
import {StyleSheet, View} from 'react-native';

export default props => {
    const {children} = props;

    return (
        <View style={styles.toolbar}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    toolbar: {
        backgroundColor: '#111',
        flexDirection: 'row'
    }
});
