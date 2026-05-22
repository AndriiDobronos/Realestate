import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction, Middleware } from '@reduxjs/toolkit'
import type { RootState } from '../../app/store'

export type UserRole = 'admin' | 'user' | null;

export interface IRegistrationState {
    isRegistered: boolean;
    userName: string;
    userId: string;
    role: UserRole;
}

const loadState = (): IRegistrationState => {
    try {
        const serializedState = localStorage.getItem('registrationState');
        if (!serializedState) return { isRegistered: false, userName: '', userId: '', role: null };

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
            return {
                ...parsed,
                role: parsed.role === 'admin' || parsed.role === 'user' ? parsed.role : null,
            };
        }

        return { isRegistered: false, userName: '', userId: '', role: null };
    } catch (e) {
        console.warn('Failed to load registration state:', e);
        return { isRegistered: false, userName: '', userId: '', role: null };
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
        setRole: (state: IRegistrationState, action: PayloadAction<UserRole>) => {
            state.role = action.payload;
        },
        resetRegistration: (state: IRegistrationState) => {
            state.isRegistered = false;
            state.userName = '';
            state.userId = '';
            state.role = null;
        },
    },
});

// Middleware для автосохранения
export const registrationMiddleware: Middleware = (store) => (next) => (action) => {
    const result = next(action);
    const act = action as { type?: string };
    if (act.type?.startsWith('registration/')) {
        const state = store.getState().registration;
        localStorage.setItem('registrationState', JSON.stringify(state));
    }
    return result;
};

export const { setIsRegistration, setUserName, setUserId, setRole, resetRegistration } = registrationSlice.actions;
export const selectName = (state: RootState) => state.registration.userName;
export default registrationSlice.reducer;
