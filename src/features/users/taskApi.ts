import api from "../../services/api";

export const createTaskApi = async (title: string, due_date: string) => {
    // We wrap this in a try/catch or let the caller handle it
    const response = await api.post("/create-task", {
        title: title,
        due_date:due_date
    });
    return response.data;
};