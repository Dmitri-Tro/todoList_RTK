import { AppRootState } from "app/store";

export const selectStatus = (state: AppRootState) => state.app.status;
export const selectIsInitialized = (state: AppRootState) => state.app.isInitialized;
