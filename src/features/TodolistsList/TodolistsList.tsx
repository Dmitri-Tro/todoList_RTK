import React, { useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import { AppRootState } from "app/store";
import {
    FilterValuesType,
    TodolistDomainType,
    todolistsActions,
    todolistsThunks,
} from "features/TodolistsList/todolistsSlice";
import { TasksStateType, tasksThunks } from "features/TodolistsList/tasksSlice";
import { TaskStatuses } from "api/todolists-api";
import { Grid, Paper } from "@mui/material";
import { AddItemForm } from "components/AddItemForm/AddItemForm";
import { Todolist } from "./Todolist/Todolist";
import { Navigate } from "react-router-dom";
import { useAppDispatch } from "hooks/useAppDispatch";
import { selectIsLoggedIn } from "features/Login/authSelectors";
import { selectTasks, selectTodoLists } from "features/TodolistsList/todoListsSelectors";

type PropsType = {
    demo?: boolean;
};

export const TodolistsList: React.FC<PropsType> = ({ demo = false }) => {
    const todolists = useSelector<AppRootState, Array<TodolistDomainType>>(selectTodoLists);
    const tasks = useSelector<AppRootState, TasksStateType>(selectTasks);
    const isLoggedIn = useSelector<AppRootState, boolean>(selectIsLoggedIn);

    const dispatch = useAppDispatch();

    useEffect(() => {
        if (demo || !isLoggedIn) {
            return;
        }
        dispatch(todolistsThunks.fetchTodolists());
    }, [dispatch, demo, isLoggedIn]);

    const removeTask = useCallback(
        function (id: string, todolistId: string) {
            dispatch(tasksThunks.removeTask({ taskId: id, todolistId }));
        },
        [dispatch],
    );

    const addTask = useCallback(
        function (title: string, todolistId: string) {
            dispatch(tasksThunks.addTask({ title, todolistId }));
        },
        [dispatch],
    );

    const changeStatus = useCallback(
        function (id: string, status: TaskStatuses, todolistId: string) {
            dispatch(tasksThunks.updateTask({ taskId: id, domainModel: { status }, todolistId }));
        },
        [dispatch],
    );

    const changeTaskTitle = useCallback(
        function (id: string, newTitle: string, todolistId: string) {
            dispatch(tasksThunks.updateTask({ taskId: id, domainModel: { title: newTitle }, todolistId }));
        },
        [dispatch],
    );

    const changeFilter = useCallback(
        function (value: FilterValuesType, todolistId: string) {
            dispatch(todolistsActions.changeTodolistFilter({ id: todolistId, filter: value }));
        },
        [dispatch],
    );

    const removeTodolist = useCallback(
        function (id: string) {
            dispatch(todolistsThunks.removeTodolist({ todolistId: id }));
        },
        [dispatch],
    );

    const changeTodolistTitle = useCallback(
        function (id: string, title: string) {
            dispatch(todolistsThunks.changeTodolistTitle({ id, title }));
        },
        [dispatch],
    );

    const addTodolist = useCallback(
        (title: string) => {
            dispatch(todolistsThunks.addTodolist({ title }));
        },
        [dispatch],
    );

    if (!isLoggedIn) {
        return <Navigate to={"/login"} />;
    }

    return (
        <>
            <Grid container style={{ padding: "20px" }}>
                <AddItemForm addItem={addTodolist} />
            </Grid>
            <Grid container spacing={3}>
                {todolists.map((tl) => {
                    let allTodolistTasks = tasks[tl.id];

                    return (
                        <Grid item key={tl.id}>
                            <Paper style={{ padding: "10px" }}>
                                <Todolist
                                    todolist={tl}
                                    tasks={allTodolistTasks}
                                    removeTask={removeTask}
                                    changeFilter={changeFilter}
                                    addTask={addTask}
                                    changeTaskStatus={changeStatus}
                                    removeTodolist={removeTodolist}
                                    changeTaskTitle={changeTaskTitle}
                                    changeTodolistTitle={changeTodolistTitle}
                                    demo={demo}
                                />
                            </Paper>
                        </Grid>
                    );
                })}
            </Grid>
        </>
    );
};
