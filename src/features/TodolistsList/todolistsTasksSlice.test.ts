import { TodolistDomainType, todolistsReducer, todolistsThunks } from "features/TodolistsList/todolistsSlice";
import { tasksReducer, TasksStateType } from "features/TodolistsList/tasksSlice";
import { TodolistType } from "api/todolists-api";

test("ids should be equals", () => {
    const startTasksState: TasksStateType = {};
    const startTodolistsState: Array<TodolistDomainType> = [];

    let todolist: TodolistType = {
        title: "new todolist",
        id: "any id",
        addedDate: "",
        order: 0,
    };

    const action = todolistsThunks.addTodolist.fulfilled({ todoList: todolist }, "requiredId", {
        title: "new todolist",
    });

    const endTasksState = tasksReducer(startTasksState, action);
    const endTodolistsState = todolistsReducer(startTodolistsState, action);

    const keys = Object.keys(endTasksState);
    const idFromTasks = keys[0];
    const idFromTodolists = endTodolistsState[0].id;

    expect(idFromTasks).toBe(action.payload.todoList.id);
    expect(idFromTodolists).toBe(action.payload.todoList.id);
});
