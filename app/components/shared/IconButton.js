import React, {memo, useCallback} from 'react';
import {IconButton} from 'react-native-paper';

const SharedIconButton = props => {
    const {showRender, onPress: onPressHandler, onPressOpts, ...rest} = props;
    
    const onPress = e => {
        onPressHandler(e, onPressOpts);
    };

    return (
        <IconButton onPress={onPress} {...rest} />
    );
};

export default memo(SharedIconButton);