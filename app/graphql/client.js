import {ApolloClient, InMemoryCache} from '@apollo/client';
import {HttpLink} from 'apollo-link-http';

export default new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
        credentials: 'same-origin',
        uri: 'https://bbd34eb49485.ngrok.app/api/graphql'
    })
});
