import React, {Fragment, useContext, useState} from 'react';
import {useMutation, useQuery} from '@apollo/client';
import {ScrollView, StyleSheet} from 'react-native';
import {Divider, IconButton, List, Paragraph} from 'react-native-paper';
import {get} from 'lodash';
import moment from 'moment';

import {getHistory} from '-/graphql/history';
import {cloneFromHistory as cloneFromHistoryMutation} from '-/graphql/feel';
import {Container, Dialog, Feel, Loading, SnackbarContext} from '-/components/shared';

export default props => {
    const _id = get(props, 'route.params._id');
    const [currentItem, setCurrentItem] = useState(null);
    const [isOpen, setIsOpen] = useState(false);
    const [cloneFromHistory] = useMutation(cloneFromHistoryMutation);
    const results = useQuery(getHistory, {
        notifyOnNetworkStatusChange: true,
        variables: {
            criteria: {
                device: _id
            }
        }
    });
    const history = get(results, 'data.history', []);
    const loading = get(results, 'loading');
    const {show} = useContext(SnackbarContext);

    const onAddFeelPress = _id => {
        setCurrentItem(_id);
        setIsOpen(true);
    };

    const onDialogClose = () => {
        setCurrentItem(null);
        setIsOpen(false);
    };

    const onSavePress = async() => {
        const _id = currentItem;

        await cloneFromHistory({
            variables: {_id}
        });

        show('Feel was added successfully!');

        onDialogClose();
    };

    return (
        <Container>
            {!loading &&
                <ScrollView>
                    {history.map((item, idx) => {
                        const {_id, createdAt, feelSnapshot = {}} = item;
                        const title = moment(createdAt).format('MM/DD/YY hh:mm a');
                        const AddIcon = () => <IconButton icon="plus" onPress={onAddFeelPress.bind(null, _id)} style={styles.listicon} />;
                        const feel = () => <Feel feel={feelSnapshot} wrapperStyle={{flex: .5}} pixelSize={4} />;

                        return (
                            <Fragment key={idx}>
                                <List.Item title={title} right={AddIcon} left={feel} />
                                {idx < history.length - 1 &&
                                    <Divider />
                                }
                            </Fragment>
                        );
                    })}
                </ScrollView>
            }
            <Loading loading={loading} text="Loading Device History..." />
            <Dialog
                isOpen={isOpen}
                title="Create New Feel?"
                onCancelPress={onDialogClose}
                onDialogClose={onDialogClose}
                onSavePress={onSavePress}
                cancelText="Nevermind"
                saveText="Yes">
                <Paragraph>
                    Are you sure you want to create a new Feel from this history item? 
                    Don&apos;t worry...it will start off uncategorized, and you can tweak it however you like when you&apos;re ready!
                </Paragraph>
            </Dialog>
        </Container>
    );
};

const styles = StyleSheet.create({
    listicon: {
        marginLeft: 4,
        marginRight: 4
    }
});
