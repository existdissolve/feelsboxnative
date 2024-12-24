import React from 'react';

import {Container, Section, Subheader} from '-/components/shared';
import Form from '-/components/account/Form';
import Messages from '-/components/account/Messages';

export default () => {
    return (
        <Container>
            <Section>
                <Subheader label="App Preferences" />
                <Form />
            </Section>
            <Section>
                <Subheader label="Messages from Friends" />
                <Messages />
            </Section>
        </Container>
    );
};
