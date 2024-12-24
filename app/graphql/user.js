import gql from 'graphql-tag';

export const getPushFriends = gql`
    query pushFriends {
        pushFriends {
            _id
            email
            name
        }
    }
`;

export const setDefaultDevice = gql`
    mutation setDefaultDevice($_id: ID!) {
        setDefaultDevice(_id: $_id)
    }
`;

export const subscribeToPush = gql`
    mutation subscribeToPush($push: UserPushInput!) {
        subscribeToPush(push: $push)
    }
`;
