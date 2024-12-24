import gql from 'graphql-tag';

export const addCategory = gql`
    mutation addCategory($data: CategoryInput!) {
        addCategory(data: $data) {
            _id
            name
        }
    }
`;

export const editCategory = gql`
    mutation editCategory($_id: ID!, $data: CategoryInput!) {
        editCategory(_id: $_id, data: $data) {
            _id
            name
        }
    }
`;

export const getCategories = gql`
    query getCategories {
        categories {
            _id
            isOwner
            name
        }
    }
`;

export const getMyCategories = gql`
    query getMyCategories {
        myCategories {
            _id
            name
        }
    }
`;
