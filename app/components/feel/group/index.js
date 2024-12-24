import React, {useContext, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {ScrollView, StyleSheet, View} from 'react-native';
import {IconButton, Paragraph} from 'react-native-paper';
import {get} from 'lodash';

import {
    getFeelGroups,
    removeFeelGroup as removeFeelGroupMutation,
    sendFeelGroup as sendFeelGroupMutation
} from '-/graphql/feelGroup';
import {Container, DevicePicker, Dialog, Fab, Feel, Loading, SnackbarContext, Section, Subheader} from '-/components/shared';

export default props => {
    const {navigation} = props;
    const [currentItem, setCurrentItem] = useState(null);
    const [selectedDeviceGroups, setSelectedDeviceGroups] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDevicePickerOpen, setIsDevicePickerOpen] = useState(false);
    const [removeFeelGroup] = useMutation(removeFeelGroupMutation);
    const [sendFeelGroup] = useMutation(sendFeelGroupMutation);
    const results = useQuery(getFeelGroups, {
        options: {notifyOnNetworkStatusChange: true}
    });
    const feelGroups = get(results, 'data.feelGroups', []);
    const loading = get(results, 'loading');
    const {show} = useContext(SnackbarContext);

    const onAddPress = () => {
        navigation.navigate('editfeelgroup', {});
    };

    const onEditPress = _id => {
        navigation.navigate('editfeelgroup', {_id});
    };

    const onRemovePress = _id => {
        setCurrentItem(_id);
        setIsDialogOpen(true);
    };

    const onPushFeelPress = async _id => {
        setCurrentItem(_id);
        setIsDevicePickerOpen(true);
    };

    const onDialogClose = () => {
        setCurrentItem(null);
        setIsDialogOpen(false);
    };

    const onDevicePickerDismiss = () => {
        setIsDevicePickerOpen(false);
    };

    const onSendPress = async() => {
        await sendFeelGroup({
            variables: {
                _id: currentItem,
                data: {
                    devices: selectedDevices,
                    deviceGroups: selectedDeviceGroups
                }
            }
        });

        onDevicePickerDismiss();
        show('Feels Group was sent successfully!');
    };

    const onDeviceSelectionChange = selections => {
        const {deviceGroups, devices} = selections;

        setSelectedDeviceGroups(deviceGroups);
        setSelectedDevices(devices);
    };

    const onSavePress = async() => {
        await removeFeelGroup({
            variables: {_id: currentItem},
            refetchQueries: [{
                fetchPolicy: 'network-only',
                query: getFeelGroups
            }]
        }); 

        show('Feels Group was successfully removed!');
    };

    return (
        <Container>
            {!loading &&
                <ScrollView>
                    {feelGroups.map(group => {
                        const {_id, feels = [], name} = group;

                        return (
                            <Section key={_id}>
                                <Subheader label={name}>
                                    <IconButton size={20} style={styles.icons} icon="remote" onPress={onPushFeelPress.bind(null, _id)} />
                                    <IconButton size={20} style={styles.icons} icon="pencil" onPress={onEditPress.bind(null, _id)} />
                                    <IconButton size={20} style={styles.icons} icon="close" onPress={onRemovePress.bind(null, _id)} />
                                </Subheader>
                                <View style={styles.grid}>
                                    {feels.map(feel => {
                                        const {_id} = feel;

                                        return (
                                            <Feel 
                                                key={`${name}_${_id}`} 
                                                feel={feel} 
                                                wrapperStyle={styles.gridItem} pixelSize={8}
                                                mode="grid" />
                                        );
                                    })}
                                </View>
                            </Section>
                        );
                    })}
                </ScrollView>
            }
            <Loading loading={loading} text="Loading Feels Groups..." />
            <Fab pressHandler={onAddPress} />
            <Dialog
                isOpen={isDialogOpen}
                title="Remove Feels Group?"
                onCancelPress={onDialogClose}
                onDialogClose={onDialogClose}
                onSavePress={onSavePress}
                saveText="Yes">
                <Paragraph>
                    Are you sure you want to remove this Feels Group from your collection permanently?
                </Paragraph>
            </Dialog>
            <Dialog
                isOpen={isDevicePickerOpen}
                title="Send To Devices"
                saveText="Send"
                onCancelPress={onDevicePickerDismiss}
                onDialogClose={onDevicePickerDismiss}
                onSavePress={onSendPress}>
                <DevicePicker onSelectionChange={onDeviceSelectionChange} />
            </Dialog>
        </Container>
    );
};

const styles = StyleSheet.create({
    icons: {
        padding: 0,
        marginVertical: 0
    },
    grid: {
        flex: 1,
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingTop: 15
    },
    gridItem: {
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: '33%',
        alignItems: 'center',
        marginBottom: 15,
        borderRadius: 5
    }
});