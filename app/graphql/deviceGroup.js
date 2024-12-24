import gql from 'graphql-tag';

export const addDeviceGroup = gql`
    mutation addDeviceGroup($data: DeviceGroupInput!) {
        addDeviceGroup(data: $data) {
            _id
            devices {
                _id
                name
            }
            name
        }
    }
`;

export const editDeviceGroup = gql`
    mutation editDeviceGroup($_id: ID!, $data: DeviceGroupInput!) {
        editDeviceGroup(_id: $_id, data: $data) {
            _id
            devices {
                _id
                name
            }
            name
        }
    }
`;

export const removeDeviceGroup = gql`
    mutation removeDeviceGroup($_id: ID!) {
        removeDeviceGroup(_id: $_id)
    }
`;

export const turnOffDeviceGroup = gql`
    mutation turnOffDeviceGroup($_id: ID!) {
        turnOffDeviceGroup(_id: $_id)
    }
`;

export const getDeviceGroup = gql`
    query getDeviceGroup($_id: ID!) {
        deviceGroup(_id: $_id) {
            _id
            devices {
                _id
                name
            }
            name
        }
    }
`;

export const getDeviceGroups = gql`
    query getDeviceGroups {
        deviceGroups {
            _id
            devices {
                _id
                capabilities {
                    messages
                    updates
                }
                name
            }
            name
        }
    }
`;
