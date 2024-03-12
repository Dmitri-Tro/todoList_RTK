import { tasksReducer } from "features/TodolistsList/tasksSlice";
import { todolistsReducer } from "features/TodolistsList/todolistsSlice";
import { ThunkAction, ThunkDispatch } from "redux-thunk";
import { appReducer } from "app/appSlice";
import { authReducer } from "features/Login/authSlice";
import { configureStore, UnknownAction } from "@reduxjs/toolkit";

export const store = configureStore({
    reducer: {
        tasks: tasksReducer,
        todolists: todolistsReducer,
        app: appReducer,
        auth: authReducer,
    },
});

export type AppRootState = ReturnType<typeof store.getState>;

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, AppRootState, unknown, UnknownAction>;

export type AppDispatch = ThunkDispatch<AppRootState, unknown, UnknownAction>;
