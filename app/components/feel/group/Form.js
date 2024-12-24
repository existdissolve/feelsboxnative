import React, {useContext, useLayoutEffect, useMemo, useState} from 'react';
import {Divider, List, Paragraph, TextInput} from 'react-native-paper';
import {ScrollView, SectionList, StyleSheet, View} from 'react-native';
import {useMutation, useQuery} from '@apollo/client';
import {cloneDeep, get} from 'lodash';

import {CategoryPicker, Container, Dialog, Feel, IconButton, Loading, SnackbarContext, Subheader, Toolbar} from '-/components/shared';
import {groupFeels} from '-/components/feel/utils';
import {getFeels} from '-/graphql/feel';
import {
    addFeelGroup as addFeelGroupMutation, 
    editFeelGroup as editFeelGroupMutation, 
    getFeelGroup,
    getFeelGroups
} from '-/graphql/feelGroup';

const FeelButton = props => {
    const {_id, selections, ...rest} = props;
    const opts = useMemo(() => ({_id, selections}), []);

    return (
        <IconButton {...rest} onPressOpts={opts} />
    );
};

const Item = props => {
    const {feel, onAddFeel} = props;
    const {_id, name} = feel;
    
    const ActionIcons = (
        <View style={styles.row}>
            <FeelButton
                _id={_id}
                icon="plus" 
                onPress={onAddFeel}
                style={styles.listicon} />
        </View>
    );

    const FeelThumb = () => (
        <Feel
            feel={feel} 
            wrapperStyle={styles.listItem} 
            pixelSize={4} 
            mode="list" />
    );
    return (
        <List.Item title={name} left={FeelThumb} right={() => ActionIcons} />
    );
};

export default props => {
    const _id = get(props, 'route.params._id');
    const [activeItem, setActiveItem] = useState(null);
    const [duration, setDuration] = useState('1000');
    const [name, setName] = useState('New Feels Group');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selections, setSelections] = useState([]);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [addFeelGroup] = useMutation(addFeelGroupMutation);
    const [editFeelGroup] = useMutation(editFeelGroupMutation);
    const {show} = useContext(SnackbarContext);

    const onFeelGroupLoaded = data => {
        const name = get(data, 'feelGroup.name');
        const feels = get(data, 'feelGroup.feels');
        const duration = get(data, 'feelGroup.duration', '1000');

        setDuration(duration.toString());
        setName(name);
        setSelections(feels);
    };

    const onDialogClose = () => {
        setIsDialogOpen(false);
    };

    const onEditPress = () => {
        setIsDialogOpen(true);
    };

    const onSavePress = async() => {
        const data = {
            duration: Number(duration),
            feels: selections.map(item => item._id),
            name
        };

        if (!_id) {
            const {navigation} = props;
            const result = await addFeelGroup({
                variables: {data},
                refetchQueries: [{
                    fetchPolicy: 'network-only',
                    query: getFeelGroups
                }]
            });

            const newId = get(result, 'data.addFeelGroup._id');

            show('Feels Group was add successfully!');
            navigation.navigate('editfeelgroup', {_id: newId});
        } else {
            await editFeelGroup({
                variables: {_id, data}
            });

            show('Feels Group was edited successfully!');
        }

        onDialogClose();
    };

    const onClearPress = () => {
        setSelections([]);
    };

    const onRemovePress = () => {
        const newSelections = selections.slice();

        if (activeItem != null) {
            newSelections.splice(activeItem, 1);

            setSelections(newSelections);
        }

        setActiveItem(null);
    };

    const onAddPress = (e, opts = {}) => {
        const {_id} = opts;
        const newSelections = cloneDeep(selections);
        const item = feels.find(item => item._id === _id);

        if (item) {
            newSelections.push(item);

            setSelections(newSelections);
        }
    };

    const onPress = (e, opts = {}) => {
        const {idx} = opts;
        
        setActiveItem(idx === activeItem ? null : idx);
    };

    const onMoveBack = () => {
        const newSelections = selections.slice();
        const activeFeel = newSelections[activeItem];
        
        let nextIndex;

        newSelections.splice(activeItem, 1);

        if (activeItem === 0) {
            newSelections.push(activeFeel);
            
            nextIndex = newSelections.length - 1;
        } else {
            newSelections.splice(activeItem - 1, 0, activeFeel);
            nextIndex = activeItem - 1;
        }

        setSelections(newSelections);
        setActiveItem(nextIndex);
    };

    const onMoveForward = () => {
        const newSelections = selections.slice();
        const activeFeel = newSelections[activeItem];

        newSelections.splice(activeItem, 1);

        let nextIndex;

        if (activeItem < selections.length - 1) {
            newSelections.splice(activeItem + 1, 0, activeFeel);
            nextIndex = activeItem + 1;
        } else {
            newSelections.unshift(activeFeel);
            nextIndex = 0;
        }

        setSelections(newSelections);
        setActiveItem(nextIndex);
    };

    const onCategorySelect = categories => {
        setSelectedCategories(categories);
    };

    const result = useQuery(getFeelGroup, {
        notifyOnNetworkStatusChange: true,
        onCompleted: onFeelGroupLoaded,
        skip: !_id,
        variables: {_id}
    });

    const loading = get(result, 'loading');
    const feelsResults = useQuery(getFeels, {
        notifyOnNetworkStatusChange: true
    });
    const feelsLoading = get(feelsResults, 'loading');
    const feels = get(feelsResults, 'data.feels', []);
    const groupedFeels = groupFeels(feels, {filter: selectedCategories});
    
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
                <IconButton icon="close" onPress={onRemovePress} disabled={activeItem == null} />
                <IconButton icon="chevron-left" onPress={onMoveBack} disabled={activeItem == null} />
                <IconButton icon="chevron-right" onPress={onMoveForward} disabled={activeItem == null} />
            </Toolbar>
            <View style={styles.selectionView}>
                {!loading && 
                    <ScrollView>
                        <Subheader label={name} />
                        {selections.length < 1 ?
                            <Paragraph style={styles.emptyText}>You haven&apos;t added any feels to this group...yet!</Paragraph>
                            :
                            <View style={styles.grid}>
                                {selections.map((feel, idx) => {
                                    const {_id} = feel;

                                    return (
                                        <Feel 
                                            key={`${idx}_${_id}`} 
                                            feel={feel} 
                                            isSelected={idx === activeItem}
                                            pressHandlerOpts={{_id, idx}}
                                            pressHandler={onPress}
                                            wrapperStyle={styles.gridItem} pixelSize={8}
                                            mode="grid" />
                                    );
                                })}
                            </View>
                        }
                        
                    </ScrollView>
                }
                <Loading loading={loading} text="Loading Feels Group..." />
            </View>
            <View style={styles.basicView}>
                <Toolbar>
                    <CategoryPicker onSelectionChange={onCategorySelect} />
                </Toolbar>
                {!feelsLoading && 
                    <SectionList
                        sections={groupedFeels}
                        initialNumToRender={20}
                        ItemSeparatorComponent={Divider}
                        keyExtractor={(feel, index) => `${feel._id}_${index}`}
                        renderItem={({item}) => (
                            <Item 
                                feel={item}
                                onAddFeel={onAddPress} />
                        )}
                        renderSectionHeader={({section: {name}}) => (
                            <Subheader label={name} />
                        )} />
                }
                <Loading loading={feelsLoading} text="Loading My Feels..." />
            </View>
            <Dialog
                isOpen={isDialogOpen}
                title="Save Feels Group"
                onCancelPress={onDialogClose}
                onDialogClose={onDialogClose}
                onSavePress={onSavePress}>
                <TextInput 
                    mode="outlined" 
                    label="Feels Group Name" 
                    value={name} 
                    onChangeText={value => setName(value)}
                    style={styles.formSpacing} />
                <TextInput 
                    mode="outlined" 
                    label="Duration" 
                    value={duration} 
                    numberOfLines={1} 
                    onChangeText={text => setDuration(text)} 
                    keyboardType="numeric" />    
            </Dialog>
        </Container>
    );
};

const styles = StyleSheet.create({
    selectionView: {
        flexShrink: 1,
        maxHeight: '50%'
    },
    basicView: {
        flex: 1
    },  
    emptyText: {
        padding: 15
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
    },
    listicon: {
        marginLeft: 0,
        marginRight: 0
    },
    listItem: {
        flex: .25, 
        marginTop: 5
    },
    formSpacing: {
        marginBottom: 15
    }
});
