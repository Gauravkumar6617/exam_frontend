import api from "../../services/api";

export const loginApi = async (email: string, password: string) => {
  const response = await api.post("/login", {
    email,
    password, // corrected
  });

  return response.data;
};
