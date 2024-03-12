import { todolistsAPI, TodolistType } from "api/todolists-api";
import { appActions, RequestStatusType } from "app/appSlice";
import { handleServerNetworkError } from "utils/error-utils";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createAppAsyncThunk } from "utils/createAppAsyncThunk";

const slice = createSlice({
    name: "todolists",
    initialState: [] as TodolistDomainType[],
    reducers: {
        changeTodolistFilter: (state, action: PayloadAction<{ id: string; filter: FilterValuesType }>) => {
            const index = state.findIndex((todo) => todo.id === action.payload.id);
            if (index !== -1) {
                state[index].filter = action.payload.filter;
            }
        },
        changeTodolistEntityStatus: (state, action: PayloadAction<{ id: string; status: RequestStatusType }>) => {
            const index = state.findIndex((todo) => todo.id === action.payload.id);
            if (index !== -1) {
                state[index].entityStatus = action.payload.status;
            }
        },
        deleteAllTodoLists: () => {
            return [];
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchTodolists.fulfilled, (state, action) => {
                action.payload.todolists.forEach((tl) => {
                    state.push({ ...tl, filter: "all", entityStatus: "idle" });
                });
            })
            .addCase(removeTodolist.fulfilled, (state, action) => {
                const index = state.findIndex((todo) => todo.id === action.payload.id);
                if (index !== -1) {
                    state.splice(index, 1);
                }
            })
            .addCase(addTodolist.fulfilled, (state, action) => {
                state.unshift({ ...action.payload.todoList, filter: "all", entityStatus: "idle" });
            })
            .addCase(changeTodolistTitle.fulfilled, (state, action) => {
                const index = state.findIndex((todo) => todo.id === action.payload.id);
                if (index !== -1) {
                    state[index].title = action.payload.title;
                }
            });
    },
});

// thunks
const fetchTodolists = createAppAsyncThunk<{ todolists: TodolistType[] }>(
    `${slice.name}/fetchTodolists`,
    async (arg, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI;
        dispatch(appActions.setAppStatus({ status: "loading" }));
        try {
            const res = await todolistsAPI.getTodolists();
            dispatch(appActions.setAppStatus({ status: "succeeded" }));
            return { todolists: res.data };
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null);
        }
    },
);
const removeTodolist = createAppAsyncThunk<{ id: string }, { todolistId: string }>(
    `${slice.name}/removeTodolist`,
    async (arg, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI;
        dispatch(appActions.setAppStatus({ status: "loading" }));
        dispatch(todolistsActions.changeTodolistEntityStatus({ id: arg.todolistId, status: "loading" }));
        try {
            const res = await todolistsAPI.deleteTodolist(arg.todolistId);
            dispatch(appActions.setAppStatus({ status: "succeeded" }));
            return { id: arg.todolistId };
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null);
        }
    },
);

const addTodolist = createAppAsyncThunk<{ todoList: TodolistType }, { title: string }>(
    `${slice.name}/addTodolist`,
    async (arg, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI;
        dispatch(appActions.setAppStatus({ status: "loading" }));
        try {
            const res = await todolistsAPI.createTodolist(arg.title);
            dispatch(appActions.setAppStatus({ status: "succeeded" }));
            return { todoList: res.data.data.item };
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null);
        }
    },
);

const changeTodolistTitle = createAppAsyncThunk<{ id: string; title: string }, ChangeTodolistTitleArgs>(
    `${slice.name}/changeTodolistTitle`,
    async (arg, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI;
        try {
            const res = await todolistsAPI.updateTodolist(arg);
            return { id: arg.id, title: arg.title };
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null);
        }
    },
);

// types
export type ChangeTodolistTitleArgs = { id: string; title: string };
export type FilterValuesType = "all" | "active" | "completed";
export type TodolistDomainType = TodolistType & {
    filter: FilterValuesType;
    entityStatus: RequestStatusType;
};

export const todolistsReducer = slice.reducer;
export const todolistsActions = slice.actions;
export const todolistsThunks = { fetchTodolists, removeTodolist, addTodolist, changeTodolistTitle };
