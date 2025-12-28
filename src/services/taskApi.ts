import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { BASE_URL } from "../component/Constant/BaseUrl";

export const TaskApi = createApi({
  reducerPath: "taskApi", // Changed from "gettask" for better naming conventions
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    // Change "getUsers" to "getTask"
    getTask: builder.query<any[], void>({
      query: () => "/get-task",
    }),
  }),
});

// Now "useGetTaskQuery" will work because it matches the endpoint name above
export const { useGetTaskQuery } = TaskApi;