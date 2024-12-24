import React from 'react';
import {StyleSheet} from 'react-native';
import {FAB} from 'react-native-paper';

export default props => {
    const {icon = 'plus', pressHandler = () => {}} = props;

    return (
        <FAB style={styles.fab} icon={icon} onPress={pressHandler} />
    );
};

const styles = StyleSheet.create({
    fab: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        margin: 16
    }
});
