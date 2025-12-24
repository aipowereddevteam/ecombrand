'use client';

import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { useDispatch } from 'react-redux';
import { useEffect } from 'react';
import UserNotifications from './UserNotifications';
import { fetchWishlist } from '../redux/slices/wishlistSlice';

export default function ClientProvider({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <InitWishlist>
                <UserNotifications />
                {children}
            </InitWishlist>
        </Provider>
    );
}

function InitWishlist({ children }: { children: React.ReactNode }) {
    const dispatch = useDispatch();
    useEffect(() => {
         // fetch wishlist if logged in (token check is inside thunk)
         (dispatch as any)(fetchWishlist());
    }, [dispatch]);
    return <>{children}</>;
}
