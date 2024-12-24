import React, {useState} from 'react';
import {useQuery} from '@apollo/client';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {Checkbox} from 'react-native-paper';
import {get} from 'lodash';

import {getPushFriends} from '-/graphql/user';

export default props => {
    const {onSelectionChange} = props;
    const [selectedFriends, setSelectedFriends] = useState([]);

    const toggleFriend = (_id, checked) => {
        const index = selectedFriends.findIndex(item => item === _id);
        const exists = index !== -1;
        const items = selectedFriends.slice();

        if (checked && !exists) {
            items.push(_id);
        } else if (!checked && exists) {
            items.splice(index, 1);
        }

        setSelectedFriends(items);
        onSelectionChange(items);
    };

    const friendResults = useQuery(getPushFriends, {
        options: {notifyOnNetworkStatusChange: true}
    });
    const friends = get(friendResults, 'data.pushFriends', []);

    return (
        <View>
            {friends.map(item => {
                const {_id, email, name} = item;
                const isChecked = selectedFriends.includes(_id);
                const status = isChecked ? 'checked' : 'unchecked';

                return (
                    <TouchableOpacity key={_id} style={styles.checkboxcontainer} onPress={() => toggleFriend(_id, !isChecked)} activeOpacity={1}>
                        <Checkbox status={status} />
                        <Text style={styles.checkboxlabel}>{name || email}</Text>
                    </TouchableOpacity>                            
                );
            })}
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
