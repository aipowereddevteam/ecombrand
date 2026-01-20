import { describe, it, expect, beforeEach } from 'vitest';
import cartReducer, {
    addToCart,
    removeItemsFromCart,
    clearCart,
    saveShippingInfo,
    ICartItem,
    IShippingInfo
} from '../redux/slices/cartSlice';

describe('Cart Slice - Redux Logic', () => {
    const initialState = {
        cartItems: [],
        shippingInfo: {} as IShippingInfo
    };

    const mockItem: ICartItem = {
        product: '123',
        name: 'Premium T-Shirt',
        price: 999,
        image: 'http://test.jpg',
        stock: 10,
        quantity: 1,
        size: 'M'
    };

    describe('Initial State', () => {
        it('should return empty cart as initial state', () => {
            expect(cartReducer(undefined, { type: 'unknown' })).toEqual(initialState);
        });
    });

    describe('addToCart', () => {
        it('should add new item to empty cart', () => {
            const state = cartReducer(initialState, addToCart(mockItem));

            expect(state.cartItems).toHaveLength(1);
            expect(state.cartItems[0]).toEqual(mockItem);
        });

        it('should update quantity for existing item with same product and size', () => {
            const stateWithItem = {
                ...initialState,
                cartItems: [mockItem]
            };

            const updatedItem = { ...mockItem, quantity: 3 };
            const state = cartReducer(stateWithItem, addToCart(updatedItem));

            expect(state.cartItems).toHaveLength(1);
            expect(state.cartItems[0].quantity).toBe(3);
        });

        it('should add as separate item if size is different', () => {
            const stateWithItem = {
                ...initialState,
                cartItems: [mockItem]
            };

            const differentSize = { ...mockItem, size: 'L' };
            const state = cartReducer(stateWithItem, addToCart(differentSize));

            expect(state.cartItems).toHaveLength(2);
            expect(state.cartItems.find(i => i.size === 'M')).toBeDefined();
            expect(state.cartItems.find(i => i.size === 'L')).toBeDefined();
        });

        it('should add as separate item if product ID is different', () => {
            const stateWithItem = {
                ...initialState,
                cartItems: [mockItem]
            };

            const differentProduct = { ...mockItem, product: '456', name: 'Another Shirt' };
            const state = cartReducer(stateWithItem, addToCart(differentProduct));

            expect(state.cartItems).toHaveLength(2);
        });
    });

    describe('removeItemsFromCart', () => {
        it('should remove item by product and size', () => {
            const stateWithItems = {
                ...initialState,
                cartItems: [mockItem, { ...mockItem, size: 'L' }]
            };

            const state = cartReducer(
                stateWithItems,
                removeItemsFromCart({ product: '123', size: 'M' })
            );

            expect(state.cartItems).toHaveLength(1);
            expect(state.cartItems[0].size).toBe('L');
        });

        it('should handle removing non-existent item gracefully', () => {
            const state = cartReducer(
                initialState,
                removeItemsFromCart({ product: '999', size: 'XL' })
            );

            expect(state.cartItems).toHaveLength(0);
        });

        it('should remove all items with matching product and size', () => {
            const stateWithDuplicates = {
                ...initialState,
                cartItems: [
                    mockItem,
                    { ...mockItem, size: 'L' },
                    { ...mockItem, product: '456' }
                ]
            };

            const state = cartReducer(
                stateWithDuplicates,
                removeItemsFromCart({ product: '123', size: 'M' })
            );

            expect(state.cartItems).toHaveLength(2);
            expect(state.cartItems.every(item =>
                !(item.product === '123' && item.size === 'M')
            )).toBe(true);
        });
    });

    describe('saveShippingInfo', () => {
        const mockShippingInfo: IShippingInfo = {
            address: '123 Test St',
            city: 'Mumbai',
            state: 'MH',
            country: 'India',
            pinCode: 400001,
            phoneNo: 9876543210
        };

        it('should save shipping information', () => {
            const state = cartReducer(initialState, saveShippingInfo(mockShippingInfo));

            expect(state.shippingInfo).toEqual(mockShippingInfo);
        });

        it('should update existing shipping information', () => {
            const initialShipping: IShippingInfo = {
                address: 'Old Address',
                city: 'Delhi',
                state: 'DL',
                country: 'India',
                pinCode: 110001,
                phoneNo: 1234567890
            };

            const stateWithShipping = {
                ...initialState,
                shippingInfo: initialShipping
            };

            const state = cartReducer(stateWithShipping, saveShippingInfo(mockShippingInfo));

            expect(state.shippingInfo.address).toBe('123 Test St');
            expect(state.shippingInfo.city).toBe('Mumbai');
        });
    });

    describe('clearCart', () => {
        it('should empty cart items array', () => {
            const stateWithItems = {
                ...initialState,
                cartItems: [mockItem, { ...mockItem, product: '456' }]
            };

            const state = cartReducer(stateWithItems, clearCart());

            expect(state.cartItems).toHaveLength(0);
            expect(state.cartItems).toEqual([]);
        });

        it('should keep shipping info when clearing cart', () => {
            const mockShippingInfo: IShippingInfo = {
                address: '123 Test St',
                city: 'Mumbai',
                state: 'MH',
                country: 'India',
                pinCode: 400001,
                phoneNo: 9876543210
            };

            const stateWithData = {
                cartItems: [mockItem],
                shippingInfo: mockShippingInfo
            };

            const state = cartReducer(stateWithData, clearCart());

            expect(state.cartItems).toHaveLength(0);
            expect(state.shippingInfo).toEqual(mockShippingInfo);
        });
    });

    describe('Price Calculations (Derived Logic)', () => {
        it('should correctly calculate subtotal for single item', () => {
            const items: ICartItem[] = [
                { ...mockItem, price: 999, quantity: 2 }
            ];

            const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

            expect(subtotal).toBe(1998);
        });

        it('should correctly calculate subtotal for multiple items', () => {
            const items: ICartItem[] = [
                { ...mockItem, price: 999, quantity: 2 },
                { ...mockItem, price: 1499, quantity: 1, size: 'L' }
            ];

            const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

            expect(subtotal).toBe(3497);
        });

        it('should handle empty cart total', () => {
            const subtotal = initialState.cartItems.reduce(
                (acc, item) => acc + item.price * item.quantity,
                0
            );

            expect(subtotal).toBe(0);
        });

        it('should calculate total item count correctly', () => {
            const items: ICartItem[] = [
                { ...mockItem, quantity: 2 },
                { ...mockItem, quantity: 3, size: 'L' }
            ];

            const totalCount = items.reduce((acc, item) => acc + item.quantity, 0);

            expect(totalCount).toBe(5);
        });
    });
});
