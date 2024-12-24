import React, {useEffect, useState} from 'react';
import {useQuery} from '@apollo/client';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Checkbox, Title} from 'react-native-paper';
import {get} from 'lodash';

import {getDevices} from '-/graphql/device';
import {getDeviceGroups} from '-/graphql/deviceGroup';

export default props => {
    const {onSelectionChange} = props;
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [selectedDeviceGroups, setSelectedDeviceGroups] = useState([]);

    useEffect(() => {
        onSelectionChange({
            deviceGroups: selectedDeviceGroups.slice(),
            devices: selectedDevices.slice()
        });
    }, [selectedDevices, selectedDeviceGroups]);

    const toggle = (_id, checked, collection, setterType) => {
        const index = collection.findIndex(item => item === _id);
        const exists = index !== -1;
        const items = collection.slice();

        if (checked && !exists) {
            items.push(_id);
        } else if (!checked && exists) {
            items.splice(index, 1);
        }

        if (setterType === 'device') {
            setSelectedDevices(items);
        } else {
            setSelectedDeviceGroups(items);
        }
    };

    const toggleGroup = (_id, checked) => {
        toggle(_id, checked, selectedDeviceGroups, 'group');
    };

    const toggleDevice = (_id, checked) => {
        toggle(_id, checked, selectedDevices, 'device');
    };

    const deviceResults = useQuery(getDevices, {
        options: {notifyOnNetworkStatusChange: true}
    });
    const deviceGroupResults = useQuery(getDeviceGroups, {
        options: {notifyOnNetworkStatusChange: true}
    });

    const devices = get(deviceResults, 'data.devices', []);
    const deviceGroups = get(deviceGroupResults, 'data.deviceGroups', []);

    return (
        <View>
            {deviceGroups.length > 0 &&
                <>
                    <Title>Device Groups</Title>
                    {deviceGroups.map(item => {
                        const {_id, name} = item;
                        const isChecked = selectedDeviceGroups.includes(_id);
                        const status = isChecked ? 'checked' : 'unchecked';

                        return (
                            <TouchableOpacity key={_id} style={styles.checkboxcontainer} onPress={() => toggleGroup(_id, !isChecked)} activeOpacity={1}>
                                <Checkbox status={status} />
                                <Text style={styles.checkboxlabel}>{name}</Text>
                            </TouchableOpacity>                            
                        );
                    })}
                </>
            }
            {devices.length > 0 &&
                <>
                    <Title>Devices</Title>
                    {devices.map(item => {
                        const {_id, name} = item;
                        const isChecked = selectedDevices.includes(_id);
                        const status = isChecked ? 'checked' : 'unchecked';

                        return (
                            <TouchableOpacity key={_id} style={styles.checkboxcontainer} onPress={() => toggleDevice(_id, !isChecked)} activeOpacity={1}>
                                <Checkbox status={status} />
                                <Text style={styles.checkboxlabel}>{name}</Text>
                            </TouchableOpacity>                            
                        );
                    })}
                </>
            }
        </View>
    );
};

const styles = StyleSheet.create({
    checkboxcontainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 0
    },
    checkbox: {
        margin: 0,
        padding: 0
    },
    checkboxlabel: {
        fontSize: 16,
        color: '#fafafa'
    }
});
