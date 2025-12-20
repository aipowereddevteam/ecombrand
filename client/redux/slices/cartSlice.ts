import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ICartItem {
    product: string; // Product ID
    name: string;
    price: number;
    image: string;
    stock: number;
    quantity: number;
    size: string;
}

export interface IShippingInfo {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: number;
    phoneNo: number;
}

interface CartState {
    cartItems: ICartItem[];
    shippingInfo: IShippingInfo;
}

const initialState: CartState = {
    cartItems: typeof window !== 'undefined' && localStorage.getItem('cartItems')
        ? JSON.parse(localStorage.getItem('cartItems')!)
        : [],
    shippingInfo: typeof window !== 'undefined' && localStorage.getItem('shippingInfo')
        ? JSON.parse(localStorage.getItem('shippingInfo')!)
        : {} as IShippingInfo
};

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCart: (state, action: PayloadAction<ICartItem>) => {
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
        removeItemsFromCart: (state, action: PayloadAction<{ product: string; size: string }>) => {
            const { product, size } = action.payload;
            state.cartItems = state.cartItems.filter(
                (i) => !(i.product === product && i.size === size)
            );

            if (typeof window !== 'undefined') {
                localStorage.setItem('cartItems', JSON.stringify(state.cartItems));
            }
        },
        saveShippingInfo: (state, action: PayloadAction<IShippingInfo>) => {
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
