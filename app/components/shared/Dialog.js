import React from 'react';
import {ScrollView, StyleSheet} from 'react-native';
import {Button, Dialog, Portal, useTheme} from 'react-native-paper';
import {get} from 'lodash';

export default props => {
    const {
        children,
        cancelText = 'Cancel',
        isOpen,
        onCancelPress,
        onDialogClose,
        onSavePress,
        saveText = 'Save',
        title,
        useCancel = true,
        useSave = true
    } = props;
    const theme = useTheme();
    const accentColor = get(theme, 'colors.accent');
    const defaultColor = get(theme, 'colors.default');

    return (
        <Portal>
            <Dialog visible={isOpen} onDismiss={onDialogClose} styles={{display: 'flex'}}>
                <Dialog.Title>{title}</Dialog.Title>
                <Dialog.ScrollArea>
                    <ScrollView>{children}</ScrollView>
                </Dialog.ScrollArea>
                <Dialog.Actions style={styles.actions}>
                    {useCancel &&
                        <Button buttonColor={defaultColor} textColor={theme.colors.inversePrimary} mode="contained-tonal" onPress={onCancelPress} style={styles.cancelBtn}>{cancelText}</Button>
                    }
                    {useSave &&
                        <Button buttonColor={accentColor} mode="contained-tonal" onPress={onSavePress}>{saveText}</Button>
                    }
                </Dialog.Actions>
            </Dialog>
        </Portal>
    );
};

const styles = StyleSheet.create({
    actions: {
        display: 'flex',
        paddingHorizontal: 25,
        paddingVertical: 15,
        marginTop: 15,
        borderTopColor: '#3E3E3E',
        borderTopWidth: 1
    },
    cancelBtn: {
        marginRight: 10
    }
});
