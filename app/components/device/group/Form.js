import React, {Fragment, useContext, useLayoutEffect, useState} from 'react';
import {Divider, IconButton, Menu, Paragraph, TextInput, useTheme} from 'react-native-paper';
import {ScrollView, StyleSheet, View} from 'react-native';
import {useMutation, useLazyQuery, useQuery} from '@apollo/client';
import {get} from 'lodash';

import {getDevices} from '-/graphql/device';
import {Container, Dialog, Loading, Pill, SnackbarContext, Subheader, Toolbar} from '-/components/shared';
import {
    addDeviceGroup as addDeviceGroupMutation, 
    editDeviceGroup as editDeviceGroupMutation, 
    getDeviceGroup,
    getDeviceGroups
} from '-/graphql/deviceGroup';

export default props => {
    const _id = get(props, 'route.params._id');
    const [activeItem, setActiveItem] = useState(null);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [menuAnchor, setMenuAnchor] = useState(null);
    const [name, setName] = useState('New Device Group');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selections, setSelections] = useState([]);
    const [addDeviceGroup] = useMutation(addDeviceGroupMutation);
    const [editDeviceGroup] = useMutation(editDeviceGroupMutation);
    const {show} = useContext(SnackbarContext);
    const theme = useTheme();
    const color = get(theme, 'colors.primary');

    const onDeviceGroupLoaded = data => {
        const name = get(data, 'deviceGroup.name');
        const devices = get(data, 'deviceGroup.devices');

        setName(name);
        setSelections(devices);
    };

    const onAddPress = e => {
        callGetDevices();

        e.target.measure((fx, fy, width, height, px, py) => {
            setIsMenuOpen(true);
            setMenuAnchor({x: px, y: py});
        });
    };

    const onCloseMenu = () => {
        setIsMenuOpen(false);
        setMenuAnchor(null);
    };

    const onDialogClose = () => {
        setIsDialogOpen(false);
    };

    const onEditPress = () => {
        setIsDialogOpen(true);
    };

    const onSavePress = async() => {
        const data = {
            devices: selections.map(item => item._id),
            name
        };

        if (!_id) {
            const {navigation} = props;
            const result = await addDeviceGroup({
                variables: {data},
                refetchQueries: [{
                    fetchPolicy: 'network-only',
                    query: getDeviceGroups
                }]
            });

            const newId = get(result, 'data.addDeviceGroup._id');

            show('Device group was add successfully!');
            navigation.navigate('editdevicegroup', {_id: newId});
        } else {
            await editDeviceGroup({
                variables: {_id, data}
            });

            show('Device group was edited successfully!');
        }

        onDialogClose();
    };

    const onClearPress = () => {
        setSelections([]);
    };

    const onRemovePress = () => {
        const newSelections = selections.slice();
        const index = newSelections.findIndex(item => item._id === activeItem);

        if (index !== -1) {
            newSelections.splice(index, 1);

            setSelections(newSelections);
        }

        setActiveItem(null);
    };

    const onSelectDevicePress = deviceId => {
        const newSelections = selections.slice();
        const item = devices.find(item => item._id === deviceId);

        onCloseMenu();

        if (item) {
            newSelections.push(item);

            setSelections(newSelections);
        }
    };

    const onPillTouch = deviceId => {
        if (activeItem === deviceId) {
            setActiveItem(null);
        } else {
            setActiveItem(deviceId);
        }
    };

    const [callGetDevices, deviceResults]  = useLazyQuery(getDevices);
    const devices = get(deviceResults, 'data.devices', []);
    
    let loading = false;

    if (_id) {
        const result = useQuery(getDeviceGroup, {
            notifyOnNetworkStatusChange: true,
            onCompleted: onDeviceGroupLoaded,
            variables: {_id}
        });

        loading = get(result, 'loading');
    }
    
    useLayoutEffect(() => {
        const {navigation} = props;

        navigation.setOptions({
            actions: (
                <IconButton icon="content-save" onPress={onEditPress} />
            )
        });
    });

    return (
        <Container>
            <Toolbar>
                <IconButton icon="notification-clear-all" onPress={onClearPress} disabled={!selections.length} />
                <IconButton icon="close" onPress={onRemovePress} disabled={!activeItem} />
                <IconButton icon="plus" onPress={onAddPress} />
            </Toolbar>
            {!loading && 
                <ScrollView>
                    <Subheader label={name} />
                    {selections.length < 1 ?
                        <Paragraph style={styles.emptyText}>You haven&apos;t added any devices to this group...yet!</Paragraph>
                        :
                        <View style={styles.pills}>
                            {selections.map((device, idx) => {
                                const {_id, name} = device;
                                const isEven = idx % 2 === 0;
                                const isSelected = _id === activeItem;
                                const pillStyle = {
                                    ...isEven && idx !== selections.length - 1 && {
                                        marginRight: 10
                                    },
                                    ...isSelected && {
                                        backgroundColor: color
                                    }
                                };

                                return (
                                    <Pill key={_id} label={name} icon="tablet" style={pillStyle} onPress={onPillTouch.bind(null, _id)} />
                                );
                            })}
                        </View>
                    }
                    
                </ScrollView>
            }
            <Loading loading={loading} text="Loading Devices..." />
            <Menu visible={isMenuOpen} onDismiss={onCloseMenu} anchor={menuAnchor}>
                {devices
                    .filter(device => {
                        const {_id} = device;
                        const selectedIds = selections.map(item => item._id);

                        return !selectedIds.includes(_id);
                    })
                    .map((device, idx) => {
                        const {_id, name} = device;

                        return (
                            <Fragment key={_id}>
                                <Menu.Item icon="tablet" onPress={onSelectDevicePress.bind(null, _id)} title={name} />
                                {idx < devices.length - 1 && <Divider />}
                            </Fragment>
                        );
                    })
                }
            </Menu>
            <Dialog
                isOpen={isDialogOpen}
                title="Save Device Group"
                onCancelPress={onDialogClose}
                onDialogClose={onDialogClose}
                onSavePress={onSavePress}>
                <TextInput label="Device Group Name" value={name} onChangeText={value => setName(value)} />
            </Dialog>
        </Container>
    );
};

const styles = StyleSheet.create({
    emptyText: {
        padding: 15
    },
    pills: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        padding: 15,
        display: 'flex',
        justifyContent: 'space-evenly',
        paddingBottom: 0
    }
});
