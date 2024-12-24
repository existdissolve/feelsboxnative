import React, {memo, useState} from 'react';
import {Image, StyleSheet, TouchableWithoutFeedback, View} from 'react-native';
import {Surface, useTheme} from 'react-native-paper';

const Feel = props => {
    const {feel, isSelected, longPressHandler, longPressHandlerOpts = {}, mode = 'list', pressHandler, pressHandlerOpts = {}, wrapperStyle, pixelSize} = props;
    const [isPressed, setIsPressed] = useState(false);
    const theme = useTheme();
    const {frames = []} = feel;
    const thumb = frames.find(frame => frame.isThumb) || frames[0];
    const {uri} = thumb;
    const pixelDim = pixelSize * 8;
    const dim = pixelDim + (pixelSize * 2);
    const feelStyle = {
        ...styles.feel,
        padding: pixelSize,
        height: dim,
        width: dim,
        ...(isPressed || isSelected) && {
            backgroundColor: theme.colors.accent
        },
        ...mode === 'grid' && {
            borderRadius: theme.roundness
        }
    };

    const onLongPress = e => {
        if (!longPressHandler) {
            return;
        }

        longPressHandler(e, longPressHandlerOpts);
    };

    const onPress = e => {
        if (!pressHandler) {
            return;
        }

        pressHandler(e, pressHandlerOpts);
    };

    const onPressIn = () => {
        if (!pressHandler) {
            return;
        }

        setIsPressed(true);
    };

    const onPressOut = () => {
        if (!pressHandler) {
            return;
        }

        setIsPressed(false);
    };

    return (
        <View style={wrapperStyle}>
            <TouchableWithoutFeedback onLongPress={onLongPress} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut} delayLongPress={600}>
                <Surface style={feelStyle}>
                    <Image style={{width: pixelDim, height: pixelDim}} source={{uri: `data:image/png;base64,${uri}`}} />
                </Surface>
            </TouchableWithoutFeedback>
        </View>
    );
};

const styles = StyleSheet.create({
    feel: {
        elevation: 2,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
        marginLeft: 0,
        marginVertical: 0
    }
});

export default memo(Feel);
