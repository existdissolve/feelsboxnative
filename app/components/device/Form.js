import React, {Fragment, useContext, useLayoutEffect, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {StyleSheet, View} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import {Button, Divider, IconButton, List, Paragraph, Subheading, TextInput} from 'react-native-paper';
import {get} from 'lodash';

import {editDevice as editDeviceMutation, generateCode as generateCodeMutation, getDevice} from '-/graphql/device';
import {Container, Loading, SnackbarContext} from '-/components/shared';

export default props => {
    const _id = get(props, 'route.params._id');
    const [removals, setRemovals] = useState([]);
    const [access, setAccess] = useState([]);
    const [name, setName] = useState('');
    const [editDevice] = useMutation(editDeviceMutation);
    const [generateCode] = useMutation(generateCodeMutation);

    const onQueryComplete = data => {
        const name = get(data, 'device.name');
        const access = get(data, 'device.access', []);

        setName(name);
        setAccess(access.slice());
    };

    const onRemoveAccessPress = _id => {
        const newAccess = access.slice();
        const newRemovals = removals.slice();
        const index = access.findIndex(item => get(item, 'user._id') === _id);

        newRemovals.push(_id);

        if (index !== -1) {
            newAccess.splice(index, 1);
        }

        setAccess(newAccess);
        setRemovals(newRemovals);
    };

    const onGenerateCodePress = async() => {
        const result = await generateCode({
            variables: {_id}
        });
        const code = get(result, 'data.generateDeviceCode');

        if (code) {
            Clipboard.setString(code);
            show('Access code has been copied to your clipboard!');
        }
    };

    const onEditPress = async() => {
        const data = {name, removals};

        await editDevice({
            variables: {_id, data}
        });

        show('Device was successfully saved!');
    };

    const results = useQuery(getDevice, {
        notifyOnNetworkStatusChange: true,
        onCompleted: onQueryComplete,
        variables: {_id}
    });
    const loading = get(results, 'loading');
    const {show} = useContext(SnackbarContext);

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
            {!loading &&
                <View style={styles.paddedView}>
                    <View style={styles.section}>
                        <Subheading style={styles.sub}>Device Details</Subheading>
                        <TextInput 
                            dense={true}
                            label="Device Name" 
                            value={name} 
                            onChangeText={val => setName(val)} />
                    </View>
                    <View style={styles.section}>
                        <Subheading style={styles.sub}>Access Control</Subheading>
                        <Paragraph>
                            Feel the love! Generate a code to share with friends and family 
                            to let them send feels to this device!
                        </Paragraph>
                        <Button style={{marginTop: 10}} icon="security" mode="contained" onPress={onGenerateCodePress}>
                            Generate Access Code
                        </Button>
                    </View>
                    <Subheading style={styles.sub}>Authorized Users</Subheading>
                    {access.map((item, idx) => {
                        const email = get(item, 'user.email');
                        const _id = get(item, 'user._id');
                        const AccountIcon = () => <IconButton icon="account-supervisor-circle" />;
                        const RemoveIcon = () => <IconButton icon="close" onPress={onRemoveAccessPress.bind(null, _id)} />;

                        return (
                            <Fragment key={_id}>
                                <List.Item 
                                    key={_id} 
                                    title={email} 
                                    right={RemoveIcon} 
                                    left={AccountIcon}
                                    style={styles.access} />
                                {idx < access.length - 1 &&
                                    <Divider />
                                }
                            </Fragment>
                        );
                    })}
                </View>
            }
            <Loading loading={loading} text="Loading Device Information..." />
        </Container>
    );
};

const styles = StyleSheet.create({
    access: {
        paddingLeft: 0,
        paddingRight: 0,
        marginLeft: -15,
        marginRight: -15
    },
    paddedView: {
        padding: 20
    },
    sub: {
        fontWeight: 'bold',
        marginBottom: 10
    },
    section: {
        marginBottom: 30
    }
});
