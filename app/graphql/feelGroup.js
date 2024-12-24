import gql from 'graphql-tag';

export const addFeelGroup = gql`
    mutation addFeelGroup($data: FeelGroupInput!) {
        addFeelGroup(data: $data) {
            _id
        }
    }
`;

export const editFeelGroup = gql`
    mutation editFeelGroup($_id: ID!, $data: FeelGroupInput!) {
        editFeelGroup(_id: $_id, data: $data) {
            _id
        }
    }
`;

export const getFeelGroup = gql`
    query getFeelGroup($_id: ID!) {
        feelGroup(_id: $_id) {
            _id
            duration
            feels {
                _id
                frames {
                    isThumb
                    uri
                }
                name
            }
            name
        }
    }
`;

export const getFeelGroups = gql`
    query getFeelGroups {
        feelGroups {
            _id
            duration
            feels {
                _id
                frames {
                    isThumb
                    uri
                }
                name
            }
            name
        }
    }
`;

export const removeFeelGroup = gql`
    mutation removeFeelGroup($_id: ID!) {
        removeFeelGroup(_id: $_id) {
            _id
            active
        }
    }
`;

export const sendFeelGroup = gql`
    mutation sendFeelGroup($_id: ID!, $data: FeelGroupSendInput) {
        sendFeelGroup(_id: $_id, data: $data)
    }
`;
