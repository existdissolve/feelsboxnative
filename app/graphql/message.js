import gql from 'graphql-tag';

export const getMessages = gql`
    query getMessages {
        messages {
            _id
            createdAt
            createdBy {
                name
            }
            feelSnapshot {
                duration
                frames {
                    brightness
                    duration
                    isThumb
                    uri
                }
                name
                repeat
                reverse
            }
            message
        }
    }
`;
