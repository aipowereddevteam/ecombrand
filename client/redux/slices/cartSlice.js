import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    cartItems: typeof window !== 'undefined' && localStorage.getItem('cartItems')
        ? JSON.parse(localStorage.getItem('cartItems'))
        : [],
    shippingInfo: typeof window !== 'undefined' && localStorage.getItem('shippingInfo')
        ? JSON.parse(localStorage.getItem('shippingInfo'))
        : {}
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action) => {
            const item = action.payload;
            const isItemExist = state.cartItems.find(
                (i) => i.product === item.product && i.size === item.size
            );

            if (isItemExist) {
                state.cartItems = state.cartItems.map((i) =>
                    i.product === isItemExist.product && i.size === isItemExist.size ? item : i
                );
            } else {
                state.cartItems.push(item);
            }

            if (typeof window !== 'undefined') {
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            }
        },
        removeItemsFromCart: (state, action) => {
            // Payload should be { product: 'id', size: 'S' }
            const { product, size } = action.payload;
            state.cartItems = state.cartItems.filter(
                (i) => !(i.product === product && i.size === size)
            );

            if (typeof window !== 'undefined') {
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            }
        },
        saveShippingInfo: (state, action) => {
            state.shippingInfo = action.payload;
            if (typeof window !== 'undefined') {
                localStorage.setItem('shippingInfo', JSON.stringify(state.shippingInfo));
            }
        },
        clearCart: (state) => {
            state.cartItems = [];
            if (typeof window !== 'undefined') {
                localStorage.removeItem('cartItems');
            }
        }
    },
});

export const { addToCart, removeItemsFromCart, saveShippingInfo, clearCart } = cartSlice.actions;

export default cartSlice.reducer;
