import React, {useContext, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {ScrollView, StyleSheet, View} from 'react-native';
import {IconButton, Paragraph} from 'react-native-paper';
import {get} from 'lodash';

import {
    getDeviceGroups,
    removeDeviceGroup as removeDeviceGroupMutation,
    turnOffDeviceGroup as turnOffDeviceGroupMutation
} from '-/graphql/deviceGroup';
import {Container, Dialog, Fab, Loading, Pill, SnackbarContext, Section, Subheader} from '-/components/shared';

export default props => {
    const {navigation} = props;
    const [currentItem, setCurrentItem] = useState(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [removeDeviceGroup] = useMutation(removeDeviceGroupMutation);
    const [turnOffDeviceGroup] = useMutation(turnOffDeviceGroupMutation);
    const results = useQuery(getDeviceGroups, {
        options: {notifyOnNetworkStatusChange: true}
    });
    const deviceGroups = get(results, 'data.deviceGroups', []);
    const loading = get(results, 'loading');
    const {show} = useContext(SnackbarContext);

    const onAddPress = () => {
        navigation.navigate('editdevicegroup', {});
    };

    const onEditPress = _id => {
        navigation.navigate('editdevicegroup', {_id});
    };

    const onRemovePress = _id => {
        setCurrentItem(_id);
        setIsDialogOpen(true);
    };

    const onTurnOffPress = async _id => {
        await turnOffDeviceGroup({
            variables: {_id}
        });

        show('Device displays were turned off successfully!');
    };

    const onDialogClose = () => {
        setCurrentItem(null);
        setIsDialogOpen(false);
    };

    const onSavePress = async() => {
        await removeDeviceGroup({
            variables: {_id: currentItem},
            refetchQueries: [{
                fetchPolicy: 'network-only',
                query: getDeviceGroups
            }]
        }); 

        show('Device Group was successfully removed!');
    };

    return (
        <Container>
            {!loading &&
                <ScrollView>
                    {deviceGroups.map(group => {
                        const {_id, devices = [], name} = group;

                        return (
                            <Section key={_id}>
                                <Subheader label={name}>
                                    <IconButton size={20} style={styles.icons} icon="flash-off" onPress={onTurnOffPress.bind(null, _id)} />
                                    <IconButton size={20} style={styles.icons} icon="pencil" onPress={onEditPress.bind(null, _id)} />
                                    <IconButton size={20} style={styles.icons} icon="close" onPress={onRemovePress.bind(null, _id)} />
                                </Subheader>
                                <View style={styles.pills}>
                                    {devices.map((device, idx) => {
                                        const {_id, name} = device;
                                        const isEven = idx % 2 === 0;
                                        const pillStyle = {
                                            ...isEven && idx !== devices.length - 1 && {
                                                marginRight: 10
                                            }
                                        };
                                        
                                        return (
                                            <Pill key={_id} label={name} icon="tablet" style={pillStyle} />
                                        );
                                    })}
                                </View>
                            </Section>
                        );
                    })}
                </ScrollView>
            }
            <Loading loading={loading} text="Loading Device Groups..." />
            <Fab pressHandler={onAddPress} />
            <Dialog
                isOpen={isDialogOpen}
                title="Remove Device Group?"
                onCancelPress={onDialogClose}
                onDialogClose={onDialogClose}
                onSavePress={onSavePress}
                saveText="Yes">
                <Paragraph>
                    Are you sure you want to remove this Device Group from your collection permanently?
                </Paragraph>
            </Dialog>
        </Container>
    );
};

const styles = StyleSheet.create({
    icons: {
        padding: 0,
        marginVertical: 0
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