import React from 'react';
import {get} from 'lodash';
import {Appbar, useTheme} from 'react-native-paper';

export default props => {
    const theme = useTheme();
    const style = {
        backgroundColor: get(theme, 'colors.primary'),
        marginTop: 0
    };
    const {navigation, previous} = props;
    const currentRoute = get(props, 'route.name');
    const actions = get(props, 'options.actions');
    const rootRoutes = ['feels', 'feelsgroups', 'findfeels', 'categories', 'devices', 'devicegroups', 'account'];
    const isRootRoute = rootRoutes.includes(currentRoute);
    const title = get(props, 'options.title');
    const backBtn = <Appbar.BackAction onPress={navigation.goBack} />;
    const drawerBtn = <Appbar.Action icon="menu" onPress={() => navigation.openDrawer()} />;

    return (
        <Appbar.Header style={style}>
            {previous && !isRootRoute && backBtn}
            {(!previous || isRootRoute) && drawerBtn}
            <Appbar.Content title={title} />
            {actions}
        </Appbar.Header>
    );
};
