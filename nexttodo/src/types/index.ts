export type TodoStatus = "NEW" | "IN_PROGRESS" | "DONE";

export interface User {
  id: number;
  name: string;
  email: string;
}

export interface Note {
  id: number;
  title: string;
  note_date?: string;
  created_at: string;
  updated_at?: string;
  user?: { name: string };
}

export interface Todo {
  id: number;
  body: string;
  tag?: string;
  status: TodoStatus;
  note_id: number;
  created_at: string;
  updated_at: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}
