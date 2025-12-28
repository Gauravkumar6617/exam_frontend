import  { createSlice, createAsyncThunk,  } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import { createTaskApi } from "./taskApi"; // Your Axios function

// Define the shape of a Task
interface Task {
  id: number;
  title: string;
  due_date: string;
  status: number;
}

interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null,
};

// --- The Async Thunk ---
export const createNewTask = createAsyncThunk(
  "tasks/createNewTask",
  async ({ title, due_date }: { title: string; due_date: string }, thunkAPI) => {
    try {
      const data = await createTaskApi(title, due_date);
      return data; // This becomes the 'payload'
    } catch (error: any) {
      return thunkAPI.rejectWithValue(error.response?.data?.detail || "Failed to create task");
    }
  }
);

const taskSlice = createSlice({
  name: "tasks",
  initialState,
  reducers: {
    // Standard reducers (optional)
    clearError: (state) => { state.error = null; }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createNewTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createNewTask.fulfilled, (state, action: PayloadAction<Task>) => {
        state.loading = false;
        state.tasks.push(action.payload); // Add the new task to the list
      })
      .addCase(createNewTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = taskSlice.actions;
export default taskSlice.reducer;