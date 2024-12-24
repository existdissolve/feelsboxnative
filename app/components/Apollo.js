import React from 'react';
import {ApolloProvider} from '@apollo/client';

import client from '-/graphql/client';
import App from '-/components/App';

export default () => {
    return (
        <ApolloProvider client={client}>
            <App />
        </ApolloProvider>
    );
};
