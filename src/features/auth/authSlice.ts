import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IAuthState {
    isLogin: boolean;
}

const initialState: IAuthState = {
    isLogin: false,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthProperty: (state:any, action: PayloadAction<boolean>) => {
            state.isLogin = action.payload
        },
        resetAuthProperty: () => initialState,
    }
});
export const { setAuthProperty, resetAuthProperty } = authSlice.actions;