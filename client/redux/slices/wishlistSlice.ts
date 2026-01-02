import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';

interface WishlistState {
    items: string[]; // Store Product IDs
    loading: boolean;
    error: string | null;
}

const initialState: WishlistState = {
    items: [],
    loading: false,
    error: null,
};

// Async Thunks
export const fetchWishlist = createAsyncThunk('wishlist/fetch', async (_, { getState, rejectWithValue }) => {
    try {
         const token = localStorage.getItem('token');
         if (!token) return [];

         const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
         const { data } = await axios.get(`${apiUrl}/user/wishlist`, {
            headers: { Authorization: `Bearer ${token}` }
         });
         return data.wishlist; // Array of full product objects or IDs depending on populate
    } catch (error: any) {
        return rejectWithValue(error.response?.data?.error || 'Failed to fetch wishlist');
    }
});

export const toggleWishlist = createAsyncThunk('wishlist/toggle', async (productId: string, { getState, dispatch, rejectWithValue }) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) throw new Error('Not authenticated');

        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        
        // Optimistic update logic check could be done here, but let's rely on server response for simplicity or implement later
        // Check if item exists to decide Add vs Remove? The backend routes are separate. We need to know state.
        
        // Let's check state
        const state = (getState() as any).wishlist;
        const exists = state.items.includes(productId);

        if (exists) {
            await axios.delete(`${apiUrl}/user/wishlist/${productId}`, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            return { productId, action: 'remove' };
        } else {
            await axios.post(`${apiUrl}/user/wishlist`, { productId }, {
                 headers: { Authorization: `Bearer ${token}` }
            });
            return { productId, action: 'add' };
        }

    } catch (error: any) {
        return rejectWithValue(error.response?.data?.error || 'Failed to toggle wishlist');
    }
});

const wishlistSlice = createSlice({
    name: 'wishlist',
    initialState,
    reducers: {
        setWishlist: (state, action: PayloadAction<string[]>) => {
            state.items = action.payload;
        },
        clearWishlist: (state) => {
            state.items = [];
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchWishlist.pending, (state) => {
                state.loading = true;
            })
            .addCase(fetchWishlist.fulfilled, (state, action) => {
                state.loading = false;
                // Assuming payload is array of objects from population, map to IDs for easy checking
                // If the API returns populated objects:
                state.items = action.payload.map((p: any) => typeof p === 'string' ? p : p._id);
            })
            .addCase(fetchWishlist.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload as string;
            })
            .addCase(toggleWishlist.fulfilled, (state, action) => {
                if (action.payload.action === 'add') {
                    state.items.push(action.payload.productId);
                } else {
                    state.items = state.items.filter(id => id !== action.payload.productId);
                }
            });
    },
});

export const { setWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
