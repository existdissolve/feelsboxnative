import React, {useState} from 'react';
import {Snackbar} from 'react-native-paper';

export const SnackbarContext = React.createContext();

export default props => {
    const {children} = props;
    const [isVisible, setIsVisible] = useState(false);
    const [text, setText] = useState(null);
    const show = text => {
        setIsVisible(true);
        setText(text);
    };
    const hide = () => {
        setIsVisible(false);
        setText(null);
    };
    const snackbar = {hide, show};

    return (
        <SnackbarContext.Provider value={snackbar}>
            {children}
            <Snackbar visible={isVisible} onDismiss={() => setIsVisible(false)}>{text}</Snackbar>
        </SnackbarContext.Provider>
    );
};
