import gql from 'graphql-tag';

export const getHistory = gql`
    query getHistory($criteria: HistoryCriteriaInput) {
        history(criteria: $criteria) {
            _id
            createdAt
            feelSnapshot {
                duration
                frames {
                    brightness
                    duration
                    isThumb
                    pixels {
                        color
                        position
                    }
                }
                name
                repeat
                reverse
            }
        }
    }
`;
