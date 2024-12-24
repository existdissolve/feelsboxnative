import React, {Fragment, useContext, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {ScrollView} from 'react-native';
import {Divider, IconButton, List, TextInput} from 'react-native-paper';
import {get} from 'lodash';

import {
    addCategory as addCategoryMutation,
    editCategory as editCategoryMutation,
    getMyCategories
} from '-/graphql/category';
import {Container, Dialog, Fab, Loading, SnackbarContext, Section, Subheader} from '-/components/shared';

export default () => {
    const [currentItem, setCurrentItem] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [category, setCategory] = useState('');
    const [addCategory] = useMutation(addCategoryMutation);
    const [editCategory] = useMutation(editCategoryMutation);
    const results = useQuery(getMyCategories, {
        options: {notifyOnNetworkStatusChange: true}
    });
    const loading = get(results, 'loading');
    const categories = get(results, 'data.myCategories', []);
    const action = currentItem ? 'Edit' : 'Add';
    const {show} = useContext(SnackbarContext);

    const onEditPress = _id => {
        const category = categories.find(category => category._id === _id);
        const {name} = category;

        setCurrentItem(_id);
        setCategory(name);
        setIsOpen(true);
    };

    const onAddPress = () => {
        setCurrentItem(null);
        setIsOpen(true);
        setCategory('');
    };

    const onDialogClose = () => {
        setCurrentItem(null);
        setIsOpen(false);
        setCategory('');
    };

    const onSavePress = async() => {
        const _id = currentItem;
        const name = category;

        if (!currentItem) {
            await addCategory({
                awaitRefetchQueries: true,
                refetchQueries: [{
                    fetchPolicy: 'network-only',
                    query: getMyCategories
                }],
                variables: {
                    data: {name}
                }
            });

            show(`"${name}" was added successfully!`);
        } else {
            await editCategory({
                variables: {
                    _id,
                    data: {name}
                }
            });

            show(`"${name}" was updated successfully!`);
        }

        onDialogClose();
    };

    return (
        <Container>
            {!loading &&
                <ScrollView>
                    <Section>
                        <Subheader label="My Categories" />
                        {categories.length > 0 && categories.map((category, idx) => {
                            const {_id, name} = category;
                            const Icon = () => <IconButton icon="pencil" onPress={onEditPress.bind(null, _id)} />;

                            return (
                                <Fragment key={idx}>
                                    <List.Item key={idx} title={name} right={Icon} />
                                    {idx < categories.length - 1 &&
                                        <Divider />
                                    }
                                </Fragment>
                            );
                        })}
                    </Section>
                </ScrollView>
            }
            <Loading loading={loading} text="Loading Categories..." />
            <Fab pressHandler={onAddPress} />
            <Dialog
                isOpen={isOpen}
                title={`${action} Category`}
                onCancelPress={onDialogClose}
                onDialogClose={onDialogClose}
                onSavePress={onSavePress}>
                <TextInput 
                    label="Category" 
                    mode="outlined"
                    value={category} 
                    onChangeText={value => setCategory(value)} />
            </Dialog>
        </Container>
    );
};
