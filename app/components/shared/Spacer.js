import React from 'react';
import {View} from 'react-native';
import {StyleSheet} from 'react-native';

export default () => {
    return (
        <View style={styles.spacer} />
    );
};

const styles = StyleSheet.create({
    spacer: {
        marginBottom: 10
    }
});
