import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ItemState {
	[inventoryItemId: string]: {
		quantity: number;
	};
}

const initialState: ItemState = {};

const inventoryItemSlice = createSlice({
    name: 'items',
    initialState,
    reducers: {
        // Set or update the quantity of an item
        setItemQuantity: (
            state,
            action: PayloadAction<{ inventoryItemId: string; quantity: number }>
        ) => {
            const { inventoryItemId, quantity } = action.payload;
            state[inventoryItemId] = { quantity };
        },
        // Increment quantity
        incrementQuantity: (
            state,
            action: PayloadAction<{ inventoryItemId: string }>
        ) => {
            const { inventoryItemId } = action.payload;
            if (state[inventoryItemId]) {
                state[inventoryItemId].quantity += 1;
            }
        },
        // Decrement quantity
        decrementQuantity: (
            state,
            action: PayloadAction<{ inventoryItemId: string }>
        ) => {
            const { inventoryItemId } = action.payload;
            if (state[inventoryItemId] && state[inventoryItemId].quantity > 0) {
                state[inventoryItemId].quantity -= 1;
            }
        },
    },
});

export const { setItemQuantity, incrementQuantity, decrementQuantity } = inventoryItemSlice.actions;
export default inventoryItemSlice.reducer;
