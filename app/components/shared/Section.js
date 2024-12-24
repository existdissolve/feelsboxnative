import React from 'react';
import {StyleSheet} from 'react-native';
import {List} from 'react-native-paper';

export default props => {
    const {children} = props;

    return (
        <List.Section style={styles.section}>
            {children}
        </List.Section>
    );
};

const styles = StyleSheet.create({
    section: {
        marginVertical: 0
    }
});
