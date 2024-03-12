import { AppRootState } from "app/store";

export const selectTodoLists = (state: AppRootState) => state.todolists;
export const selectTasks = (state: AppRootState) => state.tasks;
