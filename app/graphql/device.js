import gql from 'graphql-tag';

export const editDevice = gql`
    mutation editDevice($_id: ID!, $data: DeviceInput!) {
        editDevice(_id: $_id, data: $data)
    }
`;

export const generateCode = gql`
    mutation generateDeviceCode($_id: ID!) {
        generateDeviceCode(_id: $_id)
    }
`;

export const getDevice = gql`
    query getDevice($_id: ID!) {
        device(_id: $_id) {
            _id
            name
            access {
                user {
                    _id
                    email
                }
            }
        }
    }
`;

export const getDevices = gql`
    query getDevices {
        devices {
            _id
            capabilities {
                messages
                updates
            }
            isDefault
            isOwner
            name
        }
    }
`;

export const submitAccessCode = gql`
    mutation submitAccessCode($code: Int!) {
        submitAccessCode(code: $code)
    }
`;

export const restart = gql`
    mutation restart($_id: ID!) {
        restart(_id: $_id)
    }
`;

export const setBrightness = gql`
    mutation setBrightness($_id: ID!, $brightness: Int!) {
        setBrightness(_id: $_id, brightness: $brightness)
    }
`;

export const turnOff = gql`
    mutation turnOff($_id: ID!) {
        turnOff(_id: $_id)
    }
`;

export const updateDevice = gql`
    mutation updateDevice($_id: ID!) {
        updateDevice(_id: $_id)
    }
`;

export const viewWeather = gql`
    mutation viewWeather {
        viewWeather
    }
`;
