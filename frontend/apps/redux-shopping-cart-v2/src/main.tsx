import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';

import App from '@/App.tsx';
import { setupStore } from '@/store';

import '@/index.scss';

const container = document.getElementById('root');
if (!container) {
    throw new Error('Failed to find the root element');
}
const root = ReactDOM.createRoot(container);

const store = setupStore();

if (!store) {
    throw new Error('Failed to create the store');
}

root.render(
    <React.StrictMode>
        <Provider store={store}>
            <App />
        </Provider>
    </React.StrictMode>
);
