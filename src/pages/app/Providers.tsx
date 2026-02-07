// Reorganized imports
import React from 'react';
import { Provider } from 'react-redux';
import store from '../store';

const Providers: React.FC = ({ children }) => {
    const handleBlur = (event: React.FocusEvent) => {
        // Added trimmed check and guard clause
        const value = (event.target as HTMLInputElement).value.trim();
        if (!value) return;
        // Do something with the trimmed value
    };

    return (
        <Provider store={store}>
            {children}
        </Provider>
    );
};

export default Providers;