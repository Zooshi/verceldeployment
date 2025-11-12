export type TodoStatus = "green" | "yellow" | "red";
export type ColumnId = "todo" | "in-progress" | "review" | "done";

export interface Todo {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  additional_info?: string;
  status: TodoStatus;
  column_id: ColumnId;
  position: number;
  due_date?: string;
  tags?: string[];
  created_at: string;
  updated_at: string;
}

export interface CreateTodoInput {
  title: string;
  description?: string;
  additional_info?: string;
  status: TodoStatus;
  column_id: ColumnId;
  position: number;
  due_date?: string;
  tags?: string[];
}

export interface UpdateTodoInput {
  title?: string;
  description?: string;
  additional_info?: string;
  status?: TodoStatus;
  column_id?: ColumnId;
  position?: number;
  due_date?: string;
  tags?: string[];
}

export interface Column {
  id: ColumnId;
  title: string;
  todos: Todo[];
}
