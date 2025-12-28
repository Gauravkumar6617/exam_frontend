import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../../features/auth/authSlice";
import { usersApi } from "../../services/userApi";
import TaskReducer from "../../features/users/taskSlice";
import { TaskApi } from "../../services/taskApi";
import examReducer from "../../features/exam/examSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    [usersApi.reducerPath]: usersApi.reducer,
    tasks: TaskReducer,
    [TaskApi.reducerPath]: TaskApi.reducer,
    exam: examReducer,
  },

  // ✅ RTK Query middleware (THIS FIXES YOUR ERROR)
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(usersApi.middleware)
      .concat(TaskApi.middleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
