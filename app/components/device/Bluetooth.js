import React, {Fragment, useContext, useEffect, useState} from 'react';
import {PermissionsAndroid, ScrollView} from 'react-native';
import {Divider, IconButton, List, Paragraph, TextInput} from 'react-native-paper';
import {get} from 'lodash';
import {BleManager} from 'react-native-ble-plx';
import base64 from 'base-64';
import Config from 'react-native-config';

import {Container, Dialog, Loading, Subheader, SnackbarContext} from '-/components/shared';

const ble = new BleManager();

export default () => {
    const [devices, setDevices] = useState([]);
    const [isSSIDOpen, setIsSSIDOpen] = useState(false);
    const [ssid, setSSID] = useState('');
    const [psk, setPSK] = useState('');
    const [deviceId, setDeviceId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(false);
    const {show} = useContext(SnackbarContext);

    const requestPermissions = async() => {
        const granted = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        await PermissionsAndroid.requestMultiple([ PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN, PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT]);

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            scanBluetooth();
        } else {
            requestPermissions();
        }
    };

    const onDevicesFound = async(err, device) => {
        const foundDevices = [];

        if (err) {
            requestPermissions();
        } else if (device) {
            const name = get(device, 'name', '');

            if (name && name.toUpperCase() === 'FEELSBOX') {
                foundDevices.push(device);
            }
        }

        if (foundDevices.length) {
            setDevices(foundDevices);
            setLoading(false);
            ble.stopDeviceScan();
        }
    };

    const scanBluetooth = () => {
        setTimeout(() => {
            if (loading) {
                setLoading(false);
                setError(true);
                ble.stopDeviceScan();
            }
        }, 30000);

        setLoading(true);
        // stop any existing scans
        ble.stopDeviceScan();
        ble.startDeviceScan(null, {}, onDevicesFound);
    };

    const onStartScanTap = () => {
        scanBluetooth();
    };

    const onDialogClose = () => {
        setIsSSIDOpen(false);
        setSSID('');
        setPSK('');
        setDeviceId(null);
    };

    const onErrorClose = () => {
        setError(false);
        onStartScanTap();
    };

    const onSavePress = async() => {
        if (deviceId && ssid && psk) {
            const connectedDevice = await ble.connectToDevice(deviceId);
            const populatedDevice = await connectedDevice.discoverAllServicesAndCharacteristics();
            const response = await populatedDevice.writeCharacteristicWithResponseForService(
                Config.BTS_UUID,
                Config.BTC_UUID,
                base64.encode(`${ssid}:${psk}`)
            );

            await connectedDevice.cancelConnection();

            show('Your FeelsBox was connected successfully!');
        }

        onDialogClose();
    };

    const onWifiPress = async id => {
        setDeviceId(id);
        setIsSSIDOpen(true);
    };

    useEffect(() => {
        return onStartScanTap();
    }, []);

    return (
        <Container>
            {!loading &&
                <ScrollView>
                    <Subheader label="Available FeelsBox Bluetooth Devices" />
                    {devices.map((device, deviceIdx) => {
                        const {id, name} = device;
                        const BluetoothIcon = () => <IconButton icon="bluetooth-connect" />;            
                        const WifiIcon = () => <IconButton icon="wifi" onPress={onWifiPress.bind(null, id)} />;

                        return (
                            <Fragment key={deviceIdx}>
                                <List.Item title={`${name} (${id})`} left={BluetoothIcon} right={WifiIcon} />
                                {deviceIdx < devices.length - 1 &&
                                    <Divider />
                                }
                            </Fragment>
                        );
                    })}
                </ScrollView>
            }
            <Dialog
                isOpen={isSSIDOpen}
                title="Enter Wi-fi Connection Details"
                onCancelPress={onDialogClose}
                onDialogClose={onDialogClose}
                onSavePress={onSavePress}>
                <Paragraph>
                    Enter your network connection details to enable your FeelsBox to connect to the wi-fi. Your FeelsBox will then restart and be ready to go!
                </Paragraph>
                <TextInput 
                    label="SSID (Network Name)" 
                    mode="outlined"
                    value={ssid} 
                    onChangeText={value => setSSID(value)} />
                <TextInput 
                    label="Password" 
                    mode="outlined"
                    value={psk} 
                    onChangeText={value => setPSK(value)} />
            </Dialog>
            <Loading loading={loading} text="Loading Bluetooth Devices..." />
            <Dialog 
                isOpen={!!error}
                onDialogClose={onErrorClose}
                onSavePress={onErrorClose} 
                useCancel={false} 
                saveText="OK"
                title="Bluetooth Connection Error">
                <Paragraph>
                    Sorry, I could not find a Feelsbox! Please ensure the device is powered on and within Bluetooth range.
                </Paragraph>
            </Dialog>
        </Container>
    );
};
