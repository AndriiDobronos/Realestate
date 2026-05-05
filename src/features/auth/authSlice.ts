import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IAuthState {
    isLogin: boolean;
    isChecking: boolean; // true пока checkAuth ещё не получил ответ от сервера
}

const initialState: IAuthState = {
    isLogin: false,
    isChecking: true,
}

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setAuthProperty: (state, action: PayloadAction<boolean>) => {
            state.isLogin = action.payload;
        },
        setAuthChecking: (state, action: PayloadAction<boolean>) => {
            state.isChecking = action.payload;
        },
        resetAuthProperty: () => initialState,
    }
});
export const { setAuthProperty, setAuthChecking, resetAuthProperty } = authSlice.actions;