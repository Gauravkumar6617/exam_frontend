import { createAsyncThunk,createSlice } from "@reduxjs/toolkit";
import { loginApi } from "./loginApi";

interface AuthState{
isAuthenticated:boolean
token:string | null,
loading:boolean

}

const initialState: AuthState = {
    token: localStorage.getItem("token"),
    isAuthenticated: !!localStorage.getItem("token"),
    loading: false,
  };

  export const login = createAsyncThunk(
    "auth/login",
    async (data: { email: string; password: string }) => {
      return await loginApi(data.email, data.password);
    }
  );
  
  const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        logout: (state) => {
          localStorage.removeItem("token");
          state.token = null;
          state.isAuthenticated = false;
        },
    },
    extraReducers(builder) {
      builder
        .addCase(login.pending, (state) => {
          state.loading = true;
        })
        .addCase(login.fulfilled, (state, action) => {
          state.loading = false;
          state.token = action.payload.access_token;
          state.isAuthenticated = true;
          localStorage.setItem("token", action.payload.access_token);
        })
        .addCase(login.rejected, (state) => {
          state.loading = false;
       
        });
    },
  });
  
  export const { logout } = authSlice.actions;
  export default authSlice.reducer;