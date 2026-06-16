import axios from "axios";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("access_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && typeof window !== "undefined") {
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data: { name: string; email: string; password: string }) =>
    api.post("/api/auth/register", data),
  login: (data: { email: string; password: string }) =>
    api.post("/api/auth/login", data),
};

export const notesAPI = {
  getAll: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get("/api/note/getAllNotes", { params }),
  create: (data: { title: string }) =>
    api.post("/api/note/createNote", data),
  update: (id: number, data: { title?: string; note_date?: string }) =>
    api.patch(`/api/note/updateNote/${id}`, data),
  delete: (ids: number[]) =>
    api.delete("/api/note/deleteNotes", { data: { id: ids } }),
};

export const todosAPI = {
  getAll: (
    noteId: number,
    params?: { page?: number; limit?: number; search?: string; status?: string; tag?: string }
  ) => api.get(`/api/note/getAllTodos/${noteId}`, { params }),
  create: (data: { body: string; tag?: string; status?: string; note_id: string }) =>
    api.post("/api/note/createTodo", data),
  update: (id: number, data: { body?: string; tag?: string; status?: string }) =>
    api.patch(`/api/note/updateTodo/${id}`, data),
  delete: (ids: number[]) =>
    api.delete("/api/note/deleteTodo", { data: { id: ids } }),
};
