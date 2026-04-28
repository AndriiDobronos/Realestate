import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export interface IRegistrationState {
    isRegistered: boolean;
    userName: string;
    userId: string;
}

const loadState = (): IRegistrationState => {
    try {
        const serializedState = localStorage.getItem('registrationState');
        if (!serializedState) return { isRegistered: false, userName: '',userId: ''};

        const parsed = JSON.parse(serializedState);

        if (
            typeof parsed === 'object' &&
            'isRegistered' in parsed &&
            'userName' in parsed &&
            'userId' in parsed &&
            typeof parsed.isRegistered === 'boolean' &&
            typeof parsed.userName === 'string' &&
            typeof parsed.userId === 'string'
        ) {
            return parsed;
        }

        return { isRegistered: false, userName: '', userId: '' };
    } catch (e) {
        console.warn('Failed to load registration state:', e);
        return { isRegistered: false, userName: '', userId: '' };
    }
};

const initialState: IRegistrationState = loadState();

export const registrationSlice = createSlice({
    name: 'registration',
    initialState,
    reducers: {
        setIsRegistration: (state: IRegistrationState, action: PayloadAction<boolean>) => {
            state.isRegistered = action.payload;
        },
        setUserName: (state: IRegistrationState, action: PayloadAction<string>) => {
            state.userName = action.payload;
        },
        setUserId: (state: IRegistrationState, action: PayloadAction<string>) => {
            state.userId = action.payload;
        },
        resetRegistration: (state: IRegistrationState) => {
            state.isRegistered = false;
            state.userName = '';
            state.userId = '';
        },
    },
});

// Middleware для автосохранения
export const registrationMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);
    if (action.type.startsWith('registration/')) {
        const state = store.getState().registration;
        localStorage.setItem('registrationState', JSON.stringify(state));
    }
    return result;
};

export const { setIsRegistration, setUserName, setUserId, resetRegistration } = registrationSlice.actions;
export const selectName = (state: RootState) => state.registration.userName;
export default registrationSlice.reducer;