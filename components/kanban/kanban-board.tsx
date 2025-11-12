"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import type { Todo, ColumnId, Column } from "@/lib/types/todo";
import {
  fetchTodos,
  createTodo,
  updateTodo,
  deleteTodo,
  batchUpdatePositions,
} from "@/lib/services/todo-service";
import { KanbanColumn } from "./kanban-column";
import { TodoCard } from "./todo-card";
import { TodoModal } from "./todo-modal";
import { Loader2 } from "lucide-react";

const COLUMNS: Array<{ id: ColumnId; title: string }> = [
  { id: "todo", title: "To Do" },
  { id: "in-progress", title: "In Progress" },
  { id: "review", title: "Review" },
  { id: "done", title: "Done" },
];

export function KanbanBoard() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [activeTodo, setActiveTodo] = useState<Todo | null>(null);
  const [originalActiveTodo, setOriginalActiveTodo] = useState<Todo | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Load todos on mount
  useEffect(() => {
    loadTodos();
  }, []);

  const loadTodos = async () => {
    setIsLoading(true);
    const result = await fetchTodos();
    if (result.success && result.data) {
      setTodos(result.data);
    } else {
      console.error("Failed to load todos:", result.error);
    }
    setIsLoading(false);
  };

  // Organize todos by column
  const columns = useMemo<Column[]>(() => {
    return COLUMNS.map((col) => ({
      ...col,
      todos: todos
        .filter((todo) => todo.column_id === col.id)
        .sort((a, b) => a.position - b.position),
    }));
  }, [todos]);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const todo = todos.find((t) => t.id === active.id);
    setActiveTodo(todo || null);
    // Store original state to detect changes after drag
    setOriginalActiveTodo(todo ? { ...todo } : null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeTodo = todos.find((t) => t.id === activeId);
    const overTodo = todos.find((t) => t.id === overId);

    if (!activeTodo) return;

    // Determine if we're over a column or a todo
    const overColumn = COLUMNS.find((col) => col.id === overId);
    const targetColumnId = overColumn
      ? overColumn.id
      : overTodo?.column_id || activeTodo.column_id;

    if (activeTodo.column_id === targetColumnId && activeId === overId) {
      return;
    }

    setTodos((prevTodos) => {
      const activeTodoIndex = prevTodos.findIndex((t) => t.id === activeId);
      const overTodoIndex = prevTodos.findIndex((t) => t.id === overId);

      const updatedTodos = [...prevTodos];

      // Update the column of the active todo
      updatedTodos[activeTodoIndex] = {
        ...updatedTodos[activeTodoIndex],
        column_id: targetColumnId,
      };

      // If moving within the same column
      if (activeTodo.column_id === targetColumnId && overTodoIndex !== -1) {
        const reordered = arrayMove(
          updatedTodos,
          activeTodoIndex,
          overTodoIndex
        );
        return reordered;
      }

      // If moving to a different column
      if (activeTodo.column_id !== targetColumnId) {
        // Remove from old position
        const [movedTodo] = updatedTodos.splice(activeTodoIndex, 1);

        // Insert at new position
        if (overTodoIndex !== -1) {
          updatedTodos.splice(overTodoIndex, 0, movedTodo);
        } else {
          // If dropped on column (not on a todo), add to end
          const columnTodos = updatedTodos.filter(
            (t) => t.column_id === targetColumnId
          );
          const lastIndex = updatedTodos.lastIndexOf(
            columnTodos[columnTodos.length - 1]
          );
          updatedTodos.splice(lastIndex + 1, 0, movedTodo);
        }
      }

      return updatedTodos;
    });
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const draggedTodo = originalActiveTodo;
    setActiveTodo(null);
    setOriginalActiveTodo(null);

    const { active, over } = event;
    if (!over || !draggedTodo) {
      return;
    }

    const activeId = active.id as string;

    // Find the current state of the dragged todo (after handleDragOver updated it)
    const currentTodo = todos.find((t) => t.id === activeId);
    if (!currentTodo) {
      console.error("Could not find dragged todo in current state");
      return;
    }

    // Check if anything actually changed
    const columnChanged = draggedTodo.column_id !== currentTodo.column_id;
    const positionChanged = draggedTodo.position !== currentTodo.position;

    if (!columnChanged && !positionChanged) {
      // Nothing changed, no need to update
      return;
    }

    console.log("Drag ended - changes detected:", {
      todoId: activeId,
      oldColumn: draggedTodo.column_id,
      newColumn: currentTodo.column_id,
      oldPosition: draggedTodo.position,
      newPosition: currentTodo.position,
    });

    // Prepare batch updates for all todos that need position updates
    const updates: Array<{
      id: string;
      position: number;
      column_id: ColumnId;
    }> = [];

    // Group todos by their current column
    const columnGroups = new Map<ColumnId, Todo[]>();
    todos.forEach((todo) => {
      const group = columnGroups.get(todo.column_id) || [];
      group.push(todo);
      columnGroups.set(todo.column_id, group);
    });

    // For each column, ensure todos are positioned correctly (0, 1, 2, ...)
    columnGroups.forEach((columnTodos, columnId) => {
      columnTodos
        .sort((a, b) => a.position - b.position)
        .forEach((todo, index) => {
          // Always update position to match array index
          // And update column_id to current column
          if (todo.position !== index || todo.id === activeId) {
            updates.push({
              id: todo.id,
              position: index,
              column_id: columnId,
            });
          }
        });
    });

    console.log("Sending updates to database:", updates);

    if (updates.length > 0) {
      const result = await batchUpdatePositions(updates);
      if (!result.success) {
        console.error("Failed to update positions:", result.error);
        // Reload todos to ensure consistency
        await loadTodos();
      } else {
        console.log("Database update successful");
        // Reload to ensure we have the latest from database
        await loadTodos();
      }
    }
  };

  const handleAddTodo = async (columnId: ColumnId) => {
    const columnTodos = todos.filter((t) => t.column_id === columnId);
    const maxPosition =
      columnTodos.length > 0
        ? Math.max(...columnTodos.map((t) => t.position))
        : -1;

    const result = await createTodo({
      title: "New Todo",
      status: "green",
      column_id: columnId,
      position: maxPosition + 1,
    });

    if (result.success && result.data) {
      setTodos([...todos, result.data]);
      setSelectedTodo(result.data);
      setIsModalOpen(true);
    } else {
      console.error("Failed to create todo:", result.error);
    }
  };

  const handleEditTodo = (todo: Todo) => {
    setSelectedTodo(todo);
    setIsModalOpen(true);
  };

  const handleSaveTodo = async (
    todoId: string,
    updates: Partial<Todo>
  ): Promise<void> => {
    const result = await updateTodo(todoId, updates);
    if (result.success && result.data) {
      setTodos(todos.map((t) => (t.id === todoId ? result.data! : t)));
    } else {
      console.error("Failed to update todo:", result.error);
      throw new Error(result.error);
    }
  };

  const handleDeleteTodo = async (todoId: string): Promise<void> => {
    const result = await deleteTodo(todoId);
    if (result.success) {
      setTodos(todos.filter((t) => t.id !== todoId));
    } else {
      console.error("Failed to delete todo:", result.error);
      throw new Error(result.error);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedTodo(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="w-8 h-8 text-nvidia-green animate-spin" />
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 overflow-x-auto pb-4 px-2">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              todos={column.todos}
              onEdit={handleEditTodo}
              onAddTodo={handleAddTodo}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTodo ? (
            <div className="opacity-80 rotate-3">
              <TodoCard todo={activeTodo} onEdit={() => {}} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <TodoModal
        todo={selectedTodo}
        open={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveTodo}
        onDelete={handleDeleteTodo}
      />
    </>
  );
}
