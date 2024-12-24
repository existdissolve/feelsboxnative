import React from 'react';
import {get} from 'lodash';
import {StyleSheet, TouchableOpacity} from 'react-native';
import {IconButton, Text, useTheme} from 'react-native-paper';

export default props => {
    const {label, icon, onPress, style: pillStyle = {}} = props;
    const theme = useTheme();
    const color = get(theme, 'colors.accent');
    const style = {
        ...styles.pill,
        ...pillStyle,
        borderColor: color
    };

    return (
        <TouchableOpacity style={style} onPress={onPress} activeOpactity={1} activeOpacity={1}>
            <IconButton icon={icon} style={styles.icon} />
            <Text style={styles.text}>{label}</Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    pill: {
        borderWidth: 1,
        borderRadius: 4,
        flexDirection: 'row',
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: '45%',
        marginBottom: 15,
        backgroundColor: '#3E3E3E'
    },
    icon: {
        padding: 0,
        paddingLeft: 10,
        margin: 0,
        marginRight: 10
    },
    text: {
        marginTop: 8
    }
});
