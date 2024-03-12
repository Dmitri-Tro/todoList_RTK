import { createAsyncThunk } from "@reduxjs/toolkit";
import { AppDispatch, AppRootState } from "app/store";

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
    state: AppRootState;
    rejectValue: null;
    dispatch: AppDispatch;
}>();
