import React from 'react';
import {useTheme} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {get} from 'lodash';

export default props => {
    const {children, style} = props;
    const theme = useTheme();
    const componentStyles = {
        ...styles.container,
        ...style,
        backgroundColor: get(theme, 'colors.background')
    };

    return (
        <View style={componentStyles}>
            {children}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column'
    }
});
