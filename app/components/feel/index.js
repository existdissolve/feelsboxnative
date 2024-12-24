import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {ScrollView, SectionList, StyleSheet, View} from 'react-native';
import {Divider, List, Menu, Paragraph, TextInput, Title, useTheme} from 'react-native-paper';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {get} from 'lodash';

import {
    copyFeel as copyFeelMutation, 
    getFeels, 
    removeFeel as removeFeelMutation, 
    sendFeel as sendFeelMutation, 
    sendMessage as sendMessageMutation, 
    subscribe as subscribeMutation, 
    unsubscribe as unsubscribeMutation
} from '-/graphql/feel';
import {CategoryPicker, Container, DevicePicker, Dialog, Fab, Feel, FriendPicker, IconButton, Loading, SnackbarContext, Section, Subheader, Toolbar} from '-/components/shared';
import {groupFeels} from '-/components/feel/utils';

const FeelButton = props => {
    const {_id, ...rest} = props;
    const opts = useMemo(() => ({_id}), []);

    return (
        <IconButton {...rest} onPressOpts={opts} showRender={false} />
    );
};

const FeelWrap = props => {
    const {feel, mode, longPressHandler = () => {}, pixelSize, wrapperStyle} = props;
    const {_id} = feel;
    const [sendFeel] = useMutation(sendFeelMutation);

    const onLongPressFeel = useCallback((e, opts = {}) => {
        const {_id} = opts;

        e.target.measure((fx, fy, width, height, px, py) => {
            longPressHandler({_id, x: px, y: py});
        });
    }, []);

    const onPressFeel = useCallback((e, opts = {}) => {
        const {_id} = opts;

        sendFeel({
            variables: {_id}
        });
    }, []);
    const opts = useMemo(() => {
        return {_id};
    }, []);

    return (
        <Feel 
            feel={feel} 
            wrapperStyle={wrapperStyle} 
            pixelSize={pixelSize}
            longPressHandler={onLongPressFeel}
            longPressHandlerOpts={opts}
            pressHandler={onPressFeel}
            pressHandlerOpts={opts}
            mode={mode} />
    );
};

const Item = props => {
    const {feel, isSearch, onCopyFeel, onEditFeel, onNotifyFeel, onPushFeel, onRemoveFeel, onSubscribeFeel, onUnsubscribeFeel} = props;
    const {_id, isOwner, isSubscribed, isSubscriptionOwner, name} = feel;

    const pushIcon = (
        <FeelButton
            _id={_id}
            icon="remote" 
            onPress={onPushFeel}
            style={styles.listicon} />
    );

    const notifyIcon = (
        <FeelButton
            _id={_id}
            icon="account-voice" 
            onPress={onNotifyFeel}
            style={styles.listicon} />
    );
    
    const ActionIcons = (
        <View style={styles.row}>
            {isOwner && 
                <>
                    {!isSearch &&
                        <>
                            <FeelButton
                                _id={_id}
                                icon="pencil" 
                                onPress={onEditFeel}
                                style={styles.listicon} />
                            <FeelButton
                                _id={_id}
                                icon="close" 
                                onPress={onRemoveFeel}
                                style={styles.listicon} />
                        </>
                    }
                    {pushIcon} 
                </>
            }
            {!isOwner &&
                <>
                    {isSubscriptionOwner && 
                        <FeelButton
                            _id={_id}
                            icon="minus-box" 
                            onPress={onUnsubscribeFeel}
                            style={styles.listicon} />
                    }
                    {!isSubscribed &&
                        <FeelButton
                            _id={_id}
                            icon="plus-box" 
                            onPress={onSubscribeFeel} 
                            style={styles.listicon} />
                    }
                    <FeelButton
                        _id={_id}
                        icon="flip-to-back" 
                        onPress={onCopyFeel}
                        style={styles.listicon} />
                    {pushIcon}
                </>
            }    
        </View>
    );

    const FeelThumb = () => (
        <FeelWrap
            feel={feel} 
            wrapperStyle={{...styles.listItem, marginLeft: 10}} 
            pixelSize={4}
            mode="list" />
    );
    return (
        <List.Item title={name} left={FeelThumb} right={() => ActionIcons} />
    );
};

export default props => {
    const {navigation, route} = props;
    const {name: routeName} = route;
    const isSearch = routeName === 'search';
    const theme = useTheme();
    const [currentItem, setCurrentItem] = useState(null);
    const [displayMode, setDisplayMode] = useState('grid');
    const [contextMenuAnchor, setContextMenuAnchor] = useState(null);
    const [selectedDeviceGroups, setSelectedDeviceGroups] = useState([]);
    const [selectedDevices, setSelectedDevices] = useState([]);
    const [selectedFriends, setSelectedFriends] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState();
    const [friendMessage, setFriendMessage] = useState('');
    const [deviceMessage, setDeviceMessage] = useState('');
    const [messageDuration, setMessageDuration] = useState('');
    const [isContextMenuOpen, setIsContextMenuOpen] = useState(false);
    const [isDevicePickerOpen, setIsDevicePickerOpen] = useState(false);
    const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false);
    const [isFriendDialogOpen, setIsFriendDialogOpen] = useState(false);
    const [isConfirmRemoveOpen, setIsConfirmRemoveOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [copyFeel] = useMutation(copyFeelMutation);
    const [removeFeel] = useMutation(removeFeelMutation);
    const [sendFeel] = useMutation(sendFeelMutation);
    const [sendMessage] = useMutation(sendMessageMutation);
    const [subscribe] = useMutation(subscribeMutation);
    const [unsubscribe] = useMutation(unsubscribeMutation);

    const results = useQuery(getFeels, {
        options: {notifyOnNetworkStatusChange: true}
    });
    const loading = get(results, 'loading');
    const feels = get(results, 'data.feels', []);
    const {show} = useContext(SnackbarContext);
    const groupedFeels = groupFeels(feels, {filter: selectedCategories});

    const onAddPress = () => {
        navigation.navigate('feel');
    };

    const onDeviceSelectionChange = selections => {
        const {deviceGroups, devices} = selections;

        setSelectedDeviceGroups(deviceGroups);
        setSelectedDevices(devices);
    };

    const onFriendSelectionChange = selections => {
        setSelectedFriends(selections);
    };

    const onPushFeelPress = async() => {
        onDevicePickerDismiss();

        await sendFeel({
            variables: {
                _id: currentItem,
                data: {
                    devices: selectedDevices,
                    deviceGroups: selectedDeviceGroups
                }
            }
        });

        show('Feel was sent successfully!');
    };

    const onRemoveFeelPress = async() => {
        onConfirmDialogDismiss();

        await removeFeel({
            variables: {_id: currentItem}
        });

        show('Feel was successfully removed!');
    };

    const onSendToFriendsPress = async() => {
        onFriendDialogDismiss();

        await sendFeel({
            variables: {
                _id: currentItem,
                data: {
                    isNotification: true,
                    notification: friendMessage,
                    users: selectedFriends
                }
            }
        });

        show('Feel was sent successfully!');
    };

    const onDisplayModePress = (e, opts = {}) => {
        const {mode} = opts;

        setDisplayMode(mode);
    };

    const onFeelGroupPress = () => {
        navigation.navigate('feelgroups');
        AsyncStorage.setItem('lastRoute', 'feelgroups');
    };

    const onSendMessagePress = async() => {
        onMessageDialogDismiss();

        await sendMessage({
            variables: {
                _id: currentItem,
                data: {
                    devices: selectedDevices,
                    deviceGroups: selectedDeviceGroups,
                    duration: parseInt(messageDuration),
                    message: deviceMessage
                }
            }
        });

        show('Message was sent successfully!');
    };

    const onLongPressFeel = (opts = {}) => {
        const {_id, x, y} = opts;

        setCurrentItem(_id);
        setIsContextMenuOpen(true);
        setContextMenuAnchor({x, y});
    };

    const onCategorySelect = categories => {
        setSelectedCategories(categories);
    };

    const onDevicePickerDismiss = () => {
        setIsDevicePickerOpen(false);
    };
    
    const onMessageDialogDismiss = () => {
        setIsMessageDialogOpen(false);
    };

    const onFriendDialogDismiss = () => {
        setIsFriendDialogOpen(false);
    };

    const onConfirmDialogDismiss = () => {
        setIsConfirmRemoveOpen(false);
    };

    const onContextMenuDismiss = () => {
        setIsContextMenuOpen(false);
        setCurrentItem(null);
    };

    const onContextMenuPress = fn => {
        onContextMenuDismiss();

        fn(null, {_id: currentItem});
    };

    const onEditFeel = useCallback((e, opts = {}) => {
        const {_id} = opts;

        navigation.navigate('feel', {_id});
    }, []);

    const onRemoveFeel = useCallback((e, opts = {}) => {
        const {_id} = opts;

        setCurrentItem(_id);
        setIsConfirmRemoveOpen(true);
    }, []);

    const onPushFeel = useCallback((e, opts = {}) => {
        const {_id} = opts;

        setCurrentItem(_id);
        setIsDevicePickerOpen(true);
    }, []);

    const onNotifyFeel = useCallback((e, opts = {}) => {
        const {_id} = opts;

        setCurrentItem(_id);
        setIsFriendDialogOpen(true);
    }, []);

    const onSubscribeFeel = useCallback(async(e, opts = {}) => {
        const {_id} = opts;

        await subscribe({
            variables: {_id}
        });

        show('Removed from Favs!');
    }, []);

    const onUnsubscribeFeel = useCallback(async(e, opts = {}) => {
        const {_id} = opts;

        await unsubscribe({
            variables: {_id}
        });

        show('Removed from Favs!');
    }, []);

    const onCopyFeel = useCallback(async(e, opts = {}) => {
        const {_id} = opts;

        await copyFeel({
            awaitRefetchQueries: true,
            refetchQueries: [{
                fetchPolicy: 'network-only',
                query: getFeels
            }],
            variables: {_id}
        });

        show('Added to My Feels!');
    }, []);

    useEffect(() => {
        const fetchStorage = async() => {
            const displayMode = await AsyncStorage.getItem('displayMode');

            if (displayMode) {
                setDisplayMode(displayMode);
            }
        };

        fetchStorage();
    }, []);

    const currentFeel = feels.find(feel => feel._id === currentItem);
    const currentFeelName = get(currentFeel, 'name');
    const isCurrentFeelOwner = get(currentFeel, 'isOwner', false);
    const isCurrentFeelSubscribed = get(currentFeel, 'isSubscribed', false);
    const isCurrentFeelSubscriptionOwner = get(currentFeel, 'isSubscriptionOwner', false);
    
    return (
        <Container>
            <Toolbar>
                <IconButton 
                    icon="grid" 
                    onPress={onDisplayModePress}
                    onPressOpts={{mode: 'grid'}} 
                    iconColor={displayMode === 'grid' ? theme.colors.accent : undefined} />
                <IconButton 
                    icon="view-list" 
                    onPress={onDisplayModePress} 
                    onPressOpts={{mode: 'list'}}
                    iconColor={displayMode === 'list' ? theme.colors.accent : undefined} />
                <CategoryPicker onSelectionChange={onCategorySelect} />
                {!isSearch &&
                    <>
                        <IconButton icon="message-text" onPress={() => setIsMessageDialogOpen(true)} />
                        <IconButton icon="group" onPress={onFeelGroupPress} />
                    </>
                }
                {isSearch &&
                    <TextInput 
                        mode="outlined" 
                        dense={true}
                        value={search} 
                        style={{fontSize: 12, padding: 0, height: 32, margin: 0}}
                        onChangeText={text => setSearch(text)} />
                }
            </Toolbar>
            {!loading && displayMode === 'list' && 
                <SectionList
                    sections={groupedFeels}
                    initialNumToRender={20}
                    ItemSeparatorComponent={Divider}
                    keyExtractor={(feel, index) => `${feel._id}_${index}`}
                    renderItem={({item}) => (
                        <Item 
                            feel={item}
                            isSearch={isSearch}
                            onCopyFeel={onCopyFeel}
                            onEditFeel={onEditFeel}
                            onNotifyFeel={onNotifyFeel}
                            onPushFeel={onPushFeel}
                            onRemoveFeel={onRemoveFeel}
                            onSubscribeFeel={onSubscribeFeel}
                            onUnsubscribeFeel={onUnsubscribeFeel} />
                    )}
                    renderSectionHeader={({section: {name}}) => (
                        <Subheader label={name} />
                    )} />
            }
            {!loading && displayMode === 'grid' &&
                <ScrollView>
                    {groupedFeels.map(group => {
                        const {_id, name, feels = []} = group;

                        return (
                            <Section key={_id}>
                                <Subheader label={name} />
                                <View style={styles.grid}>
                                    {feels.map(feel => {
                                        const {_id} = feel;

                                        return (
                                            <FeelWrap 
                                                key={`${name}_${_id}`} 
                                                feel={feel} 
                                                wrapperStyle={styles.gridItem} 
                                                pixelSize={8}
                                                longPressHandler={onLongPressFeel}
                                                mode={displayMode} />
                                        );
                                    })}
                                </View>
                            </Section>
                        );
                    })}
                </ScrollView>
            }
            <Menu visible={isContextMenuOpen} onDismiss={onContextMenuDismiss} anchor={contextMenuAnchor}>
                <Title style={styles.menuTitle}>{currentFeelName}</Title>
                {isCurrentFeelOwner && 
                    <>
                        {!isSearch &&
                            <>
                                <Menu.Item icon="pencil" onPress={onContextMenuPress.bind(null, onEditFeel)} title="Edit Feel" />
                                <Divider />
                                <Menu.Item icon="close" onPress={onContextMenuPress.bind(null, onRemoveFeel)} title="Remove Feel" />
                                <Divider />
                            </>
                        }
                        <Menu.Item icon="remote" onPress={onContextMenuPress.bind(null, onPushFeel)} title="Send to Devices" />
                    </>
                }
                {!isCurrentFeelOwner &&
                    <>
                        {isCurrentFeelSubscriptionOwner && 
                            <>
                                <Menu.Item icon="minus-box" onPress={onContextMenuPress.bind(null, onUnsubscribeFeel)} title="Remove from Favs" />
                                <Divider />
                            </>
                        }
                        {!isCurrentFeelSubscribed &&
                            <>
                                <Menu.Item icon="plus-box" onPress={onContextMenuPress.bind(null, onSubscribeFeel)} title="Save to Favs" />
                                <Divider />
                            </>
                        }
                        <Menu.Item icon="flip-to-back" onPress={onContextMenuPress.bind(null, onCopyFeel)} title="Copy to My Feels" />
                        <Divider />
                        <Menu.Item icon="remote" onPress={onContextMenuPress.bind(null, onPushFeel)} title="Send to Devices" />
                    </>
                }    
            </Menu>
            <Dialog
                isOpen={isDevicePickerOpen}
                title="Send To Devices"
                saveText="Send"
                onCancelPress={onDevicePickerDismiss}
                onDialogClose={onDevicePickerDismiss}
                onSavePress={onPushFeelPress}>
                <DevicePicker onSelectionChange={onDeviceSelectionChange} />
            </Dialog>
            <Dialog
                isOpen={isMessageDialogOpen}
                title="Send Message To Devices"
                saveText="Send"
                onCancelPress={onMessageDialogDismiss}
                onDialogClose={onMessageDialogDismiss}
                onSavePress={onSendMessagePress}>
                <TextInput 
                    mode="outlined" 
                    label="Message" 
                    value={deviceMessage} 
                    numberOfLines={1} 
                    onChangeText={text => setDeviceMessage(text)} />
                <TextInput 
                    mode="outlined" 
                    label="Duration" 
                    value={messageDuration} 
                    numberOfLines={1} 
                    onChangeText={text => setMessageDuration(text)} 
                    keyboardType="numeric" />    
                <DevicePicker onSelectionChange={onDeviceSelectionChange} />
            </Dialog>
            <Dialog
                isOpen={isFriendDialogOpen}
                title="Send to Friends"
                saveText="Send"
                onCancelPress={onFriendDialogDismiss}
                onDialogClose={onFriendDialogDismiss}
                onSavePress={onSendToFriendsPress}>
                <FriendPicker onSelectionChange={onFriendSelectionChange} />
                <TextInput 
                    label="Message" 
                    mode="outlined"
                    value={friendMessage} 
                    numberOfLines={3} 
                    onChangeText={text => setFriendMessage(text)} 
                    style={{marginTop: 10}} />
            </Dialog>
            {!isSearch &&
                <Dialog
                    isOpen={isConfirmRemoveOpen}
                    title="Remove Feel?"
                    saveText="Yes"
                    onCancelPress={onConfirmDialogDismiss}
                    onDialogClose={onConfirmDialogDismiss}
                    onSavePress={onRemoveFeelPress}>
                    <Paragraph>Are you sure you want to remove this Feel from your collection permanently?</Paragraph>
                </Dialog>
            }

            <Loading loading={loading} text="Loading My Feels..." />
            <Fab pressHandler={onAddPress} />
        </Container>
    );
};

const styles = StyleSheet.create({
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
    },
    row: {
        flexDirection: 'row'
    },
    listItem: {
        flex: .25, 
        marginTop: 5
    },
    menuTitle: {
        marginLeft: 15
    },
    dropdown: {
        flex: 1,
        marginHorizontal: 10,
        borderStyle: 'solid',
        borderWidth: 1,
        borderColor: 'green'
    },
    listicon: {
        marginLeft: 0,
        marginRight: 0
    },
    sliderContainer: {
        flexDirection: 'row'
    }
});