'use client';

import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { ReactNode } from 'react';
import UserNotifications from './UserNotifications';

export default function ClientProvider({ children }: { children: ReactNode }) {
    return (
        <Provider store={store}>
            <UserNotifications />
            {children}
        </Provider>
    );
}
