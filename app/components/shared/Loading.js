import React from 'react';
import {ActivityIndicator, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';

export default props => {
    const {loading = false, size = 100, text} = props;
    const display = loading ? 'flex' : 'none';

    return (
        <View style={{...styles.view, display}}>
            <ActivityIndicator
                size={size}
                animating={loading}
                style={styles.loading} />
            {text &&
                <Text style={styles.text}>{text}</Text>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    loading: {},
    text: {
        fontSize: 25,
        textAlign: 'center',
        marginTop: 20
    },
    view: {
        flex: 1,
        backgroundColor: '#333',
        paddingVertical: '60%'
    }
});
