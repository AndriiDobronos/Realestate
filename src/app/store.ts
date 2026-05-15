import { configureStore } from '@reduxjs/toolkit'
import counterReducer from './../features/counter/counterSlice'
import {upLoadImagesSlice} from "../features/upLoadImages/upLoadImagesSlice";
import {registrationSlice, registrationMiddleware} from "../features/registration/registrationSlice";
import {filterSlice} from "../features/filter/filterSlice";
import {filterMapSlice} from "../features/filterMap/filterMapSlice";
import scrollReducer from '../features/scroll/scrollSlice';
import {notificationSlice} from "../features/notification/notificationSlice";
import {authSlice} from "../features/auth/authSlice";

export const store = configureStore({
    reducer: {
        auth: authSlice.reducer,
        counter: counterReducer,
        registration: registrationSlice.reducer,
        upLoadImages: upLoadImagesSlice.reducer,
        filter: filterSlice.reducer,
        filterMap:  filterMapSlice.reducer,
        scroll: scrollReducer,
        notification: notificationSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(registrationMiddleware)
});

// Infer the `RootState` and `AppDispatch` types from the app itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch

