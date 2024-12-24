import React, {Fragment, useRef, useState} from 'react';
import {useQuery} from '@apollo/client';
import {TouchableOpacity, View, useWindowDimensions} from 'react-native';
import {Divider, IconButton, Menu, Paragraph, useTheme} from 'react-native-paper';
import {get} from 'lodash';

import {getMyCategories} from '-/graphql/category';

export default props => {
    const {mode = 'inline'} = props;
    const theme = useTheme();
    const [isActive, setIsActive] = useState(false);
    const [selected, setSelected] = useState([]);
    const [anchor, setAnchor] = useState(null);
    const [menuWidth, setMenuWidth] = useState(null);
    const touchable = useRef(null);
    const results = useQuery(getMyCategories, {
        options: {notifyOnNetworkStatusChange: true}
    });
    const categories = get(results, 'data.myCategories', []);
    const loading = get(results, 'loading');
    const maxWidth = useWindowDimensions().width - 20;
    const primaryColor = get(theme, 'colors.primary');
    const accentColor = get(theme, 'colors.accent');
    const mainColor = mode === 'inline' ? accentColor : primaryColor;
    const pickerStyle = {
        flex: 1,
        ...mode === 'inline' && {margin: 5},
        ...mode === 'form' && {padding: 2, marginTop: 6},
        borderRadius: theme.roundness,
        borderWidth: 1,
        backgroundColor: get(theme, 'colors.background'),
        borderColor: isActive ? mainColor : get(theme, 'colors.placeholder'),
        flexDirection: 'row'
    };

    const onPress = () => {
        touchable.current.measure((fx, fy, width, height, px, py) => {
            setMenuWidth(Math.min(width, maxWidth));
            setAnchor({x: px, y: py + (height)});
            setIsActive(true);
        });
    };

    const onDismiss = () => {
        setIsActive(false);
    };

    const onSelect = (_id, select) => {
        const {onSelectionChange} = props;
        const selections = selected.slice();

        if (select && !selections.includes(_id)) {
            selections.push(_id);
        } else if (!select) {
            const idx = selections.indexOf(_id);

            if (idx !== -1) {
                selections.splice(idx, 1);
            }
        }

        setSelected(selections);
        onSelectionChange(selections);
    };    

    return (
        <>
            <TouchableOpacity activeOpacity={1} onPress={onPress} style={pickerStyle} ref={touchable}>
                <IconButton icon="view-list-outline" size={16} />
                <View style={{flex: 1}}>
                    <Paragraph numberOfLines={1} style={{marginTop: 7}}>
                        {selected.map(_id => {
                            const category = categories.find(item => item._id === _id);
                            const {name} = category;

                            return name;                            
                        }).join(', ')}
                    </Paragraph>
                </View>
                <IconButton icon="chevron-down" size={16} />
            </TouchableOpacity>
            <Menu visible={isActive} onDismiss={onDismiss} anchor={anchor} style={{width: menuWidth}}>
                {!loading && categories.map((category, idx) => {
                    const {_id, name} = category;
                    const isSelected = selected.includes(_id);
                    const itemStyle = {
                        ...isSelected && {backgroundColor: '#3E3E3E'}
                    };

                    return (
                        <Fragment key={_id}>
                            <Menu.Item onPress={onSelect.bind(null, _id, isSelected ? false : true)} title={name} style={itemStyle} />
                            {idx < categories.length - 1 && 
                                <Divider />
                            }
                        </Fragment>
                    );
                })}
            </Menu>
        </>
    );
};
