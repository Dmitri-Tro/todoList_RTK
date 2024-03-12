import { TaskPriorities, TaskStatuses, TaskType, todolistsAPI, UpdateTaskModelType } from "api/todolists-api";
import { handleServerAppError, handleServerNetworkError } from "utils/error-utils";
import { appActions } from "app/appSlice";
import { createSlice } from "@reduxjs/toolkit";
import { todolistsActions, todolistsThunks } from "features/TodolistsList/todolistsSlice";
import { createAppAsyncThunk } from "utils/createAppAsyncThunk";

const slice = createSlice({
    name: "tasks",
    initialState: {} as TasksStateType,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchTasks.fulfilled, (state, action) => {
                state[action.payload.todoListId] = action.payload.tasks;
            })
            .addCase(addTask.fulfilled, (state, action) => {
                state[action.payload.task.todoListId].unshift(action.payload.task);
            })
            .addCase(removeTask.fulfilled, (state, action) => {
                const index = state[action.payload.todolistId].findIndex((task) => task.id === action.payload.taskId);
                if (index !== -1) {
                    state[action.payload.todolistId].splice(index, 1);
                }
            })
            .addCase(updateTask.fulfilled, (state, action) => {
                const index = state[action.payload.todolistId].findIndex((task) => task.id === action.payload.taskId);
                if (index !== -1) {
                    state[action.payload.todolistId][index] = {
                        ...state[action.payload.todolistId][index],
                        ...action.payload.model,
                    };
                }
            })
            .addCase(todolistsThunks.addTodolist.fulfilled, (state, action) => {
                state[action.payload.todoList.id] = [];
            })
            .addCase(todolistsThunks.removeTodolist.fulfilled, (state, action) => {
                delete state[action.payload.id];
            })
            .addCase(todolistsThunks.fetchTodolists.fulfilled, (state, action) => {
                action.payload.todolists.forEach((tl) => (state[tl.id] = []));
            })
            .addCase(todolistsActions.deleteAllTodoLists, () => {
                return {};
            });
    },
});

// thunks
const fetchTasks = createAppAsyncThunk<{ tasks: TaskType[]; todoListId: string }, string>(
    `${slice.name}/fetchTasks`,
    async (todoListId, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI;
        try {
            dispatch(appActions.setAppStatus({ status: "loading" }));
            const res = await todolistsAPI.getTasks(todoListId);
            const tasks = res.data.items;
            dispatch(appActions.setAppStatus({ status: "succeeded" }));
            return { tasks, todoListId };
        } catch (e) {
            handleServerNetworkError(e, dispatch);
            return rejectWithValue(null);
        }
    },
);
const addTask = createAppAsyncThunk<{ task: TaskType }, AddTaskArgs>(`${slice.name}/addTask`, async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue } = thunkAPI;
    try {
        dispatch(appActions.setAppStatus({ status: "loading" }));
        const res = await todolistsAPI.createTask(arg);
        if (res.data.resultCode === 0) {
            dispatch(appActions.setAppStatus({ status: "succeeded" }));
            return { task: res.data.data.item };
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null);
        }
    } catch (error) {
        handleServerNetworkError(error, dispatch);
        return rejectWithValue(null);
    }
});

const removeTask = createAppAsyncThunk<{ taskId: string; todolistId: string }, RemoveTaskArgs>(
    `${slice.name}/removeTask`,
    async (arg, thunkAPI) => {
        const { dispatch, rejectWithValue } = thunkAPI;
        try {
            const res = await todolistsAPI.deleteTask(arg);
            return arg;
        } catch (error) {
            handleServerNetworkError(error, dispatch);
            return rejectWithValue(null);
        }
    },
);

const updateTask = createAppAsyncThunk<
    { taskId: string; model: UpdateDomainTaskModelType; todolistId: string },
    UpdateTaskArgs
>(`${slice.name}/updateTask`, async (arg, thunkAPI) => {
    const { dispatch, rejectWithValue, getState } = thunkAPI;
    const state = getState();
    const task = state.tasks[arg.todolistId].find((t) => t.id === arg.taskId);
    try {
        if (!task) {
            //throw new Error("task not found in the state");
            console.warn("task not found in the state");
            return rejectWithValue(null);
        }

        const apiModel: UpdateTaskModelType = {
            deadline: task.deadline,
            description: task.description,
            priority: task.priority,
            startDate: task.startDate,
            title: task.title,
            status: task.status,
            ...arg.domainModel,
        };
        const res = await todolistsAPI.updateTask(arg.todolistId, arg.taskId, apiModel);
        if (res.data.resultCode === 0) {
            return { taskId: arg.taskId, model: arg.domainModel, todolistId: arg.todolistId };
        } else {
            handleServerAppError(res.data, dispatch);
            return rejectWithValue(null);
        }
    } catch (error) {
        handleServerNetworkError(error, dispatch);
        return rejectWithValue(null);
    }
});
// types
export type UpdateTaskArgs = { taskId: string; domainModel: UpdateDomainTaskModelType; todolistId: string };
export type RemoveTaskArgs = { taskId: string; todolistId: string };
export type AddTaskArgs = { title: string; todolistId: string };
export type UpdateDomainTaskModelType = {
    title?: string;
    description?: string;
    status?: TaskStatuses;
    priority?: TaskPriorities;
    startDate?: string;
    deadline?: string;
};
export type TasksStateType = {
    [key: string]: Array<TaskType>;
};

export const tasksReducer = slice.reducer;
export const tasksActions = slice.actions;
export const tasksThunks = { fetchTasks, addTask, removeTask, updateTask };
