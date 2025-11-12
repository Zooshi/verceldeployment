import { createClient } from "@/lib/supabase/client";
import type { Todo, CreateTodoInput, UpdateTodoInput, ColumnId } from "@/lib/types/todo";

export interface TodoServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Fetch all todos for the current user
 */
export async function fetchTodos(): Promise<TodoServiceResult<Todo[]>> {
  try {
    const supabase = createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("todos")
      .select("*")
      .eq("user_id", user.id)
      .order("position", { ascending: true });

    if (error) {
      console.error("Error fetching todos:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Todo[] };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error fetching todos:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Create a new todo
 */
export async function createTodo(
  input: CreateTodoInput
): Promise<TodoServiceResult<Todo>> {
  try {
    const supabase = createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("todos")
      .insert({
        ...input,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating todo:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Todo };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error creating todo:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Update an existing todo
 */
export async function updateTodo(
  id: string,
  input: UpdateTodoInput
): Promise<TodoServiceResult<Todo>> {
  try {
    const supabase = createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { data, error } = await supabase
      .from("todos")
      .update(input)
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error updating todo:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Todo };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error updating todo:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Delete a todo
 */
export async function deleteTodo(id: string): Promise<TodoServiceResult<void>> {
  try {
    const supabase = createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    const { error } = await supabase
      .from("todos")
      .delete()
      .eq("id", id)
      .eq("user_id", user.id);

    if (error) {
      console.error("Error deleting todo:", error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error deleting todo:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Move a todo to a different column and update positions
 */
export async function moveTodo(
  id: string,
  targetColumnId: ColumnId,
  targetPosition: number
): Promise<TodoServiceResult<Todo>> {
  try {
    const supabase = createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Update the todo's column and position
    const { data, error } = await supabase
      .from("todos")
      .update({
        column_id: targetColumnId,
        position: targetPosition,
      })
      .eq("id", id)
      .eq("user_id", user.id)
      .select()
      .single();

    if (error) {
      console.error("Error moving todo:", error);
      return { success: false, error: error.message };
    }

    return { success: true, data: data as Todo };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error moving todo:", errorMessage);
    return { success: false, error: errorMessage };
  }
}

/**
 * Batch update positions of todos
 */
export async function batchUpdatePositions(
  updates: Array<{ id: string; position: number; column_id: ColumnId }>
): Promise<TodoServiceResult<void>> {
  try {
    const supabase = createClient();

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return { success: false, error: "User not authenticated" };
    }

    // Execute all updates in parallel
    const promises = updates.map(({ id, position, column_id }) =>
      supabase
        .from("todos")
        .update({ position, column_id })
        .eq("id", id)
        .eq("user_id", user.id)
    );

    const results = await Promise.all(promises);

    // Check if any update failed
    const failed = results.find(result => result.error);
    if (failed?.error) {
      console.error("Error in batch update:", failed.error);
      return { success: false, error: failed.error.message };
    }

    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    console.error("Unexpected error in batch update:", errorMessage);
    return { success: false, error: errorMessage };
  }
}
