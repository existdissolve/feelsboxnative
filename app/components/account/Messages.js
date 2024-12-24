import React, {Fragment} from 'react';
import {useQuery} from '@apollo/client';
import {ScrollView, View} from 'react-native';
import {Divider, List, Text} from 'react-native-paper';
import {get} from 'lodash';
import moment from 'moment';

import {getMessages} from '-/graphql/message';
import {Feel, Loading} from '-/components/shared';

export default () => {
    const results = useQuery(getMessages, {
        notifyOnNetworkStatusChange: true
    });
    const messages = get(results, 'data.messages', []);
    const loading = get(results, 'loading');

    return (
        <>
            {!loading &&
                <ScrollView>
                    {messages.map((item, idx) => {
                        const {_id, createdAt, feelSnapshot = {}, message} = item;
                        const name = get(item, 'createdBy.name', 'N/A');
                        const feel = () => <Feel feel={feelSnapshot} wrapperStyle={{marginLeft: 10}} pixelSize={4} />;
                        const Content = () => (
                            <View>
                                <Text>
                                    {name.split(' ')[0]}{'\n'}
                                    {moment(createdAt).format('MM/DD/YY')}{'\n'}
                                    {moment(createdAt).format('hh:mm a')}
                                </Text>
                            </View>
                        );

                        return (
                            <Fragment key={_id}>
                                <List.Item title={message} right={Content} left={feel} titleNumberOfLines={3} titleStyle={{whiteSpace: 'pre-line', marginRight: 20, marginLeft: 10}} />
                                {idx < messages.length - 1 &&
                                    <Divider />
                                }
                            </Fragment>
                        );
                    })}
                </ScrollView>
            }
            <Loading loading={loading} text="Loading My Messages..." />
        </>
    );
};
