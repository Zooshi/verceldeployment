"use client";

import { useState, useEffect } from "react";
import type { Todo, TodoStatus } from "@/lib/types/todo";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Trash2, Tag as TagIcon } from "lucide-react";

interface TodoModalProps {
  todo: Todo | null;
  open: boolean;
  onClose: () => void;
  onSave: (todoId: string, updates: Partial<Todo>) => Promise<void>;
  onDelete: (todoId: string) => Promise<void>;
}

export function TodoModal({
  todo,
  open,
  onClose,
  onSave,
  onDelete,
}: TodoModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [additionalInfo, setAdditionalInfo] = useState("");
  const [status, setStatus] = useState<TodoStatus>("green");
  const [dueDate, setDueDate] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (todo) {
      setTitle(todo.title || "");
      setDescription(todo.description || "");
      setAdditionalInfo(todo.additional_info || "");
      setStatus(todo.status);
      setDueDate(todo.due_date ? todo.due_date.split("T")[0] : "");
      setTags(todo.tags || []);
    } else {
      resetForm();
    }
  }, [todo]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAdditionalInfo("");
    setStatus("green");
    setDueDate("");
    setTags([]);
    setTagInput("");
  };

  const handleSave = async () => {
    if (!todo || !title.trim()) return;

    setIsSaving(true);
    try {
      await onSave(todo.id, {
        title: title.trim(),
        description: description.trim() || undefined,
        additional_info: additionalInfo.trim() || undefined,
        status,
        due_date: dueDate || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      onClose();
    } catch (error) {
      console.error("Error saving todo:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!todo) return;

    const confirmed = confirm("Are you sure you want to delete this todo?");
    if (!confirmed) return;

    setIsDeleting(true);
    try {
      await onDelete(todo.id);
      onClose();
    } catch (error) {
      console.error("Error deleting todo:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-nvidia-gray border-nvidia-gray-light">
        <DialogHeader>
          <DialogTitle className="text-nvidia-green">Edit Todo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title" className="text-white">
              Title *
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter todo title"
              className="bg-nvidia-dark border-nvidia-gray-light text-white"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-white">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter description"
              className="min-h-[100px]"
            />
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-white">Priority Status *</Label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStatus("green")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  status === "green"
                    ? "border-status-green bg-status-green/20 text-white"
                    : "border-nvidia-gray-light bg-nvidia-dark text-gray-400 hover:border-status-green/50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-green" />
                  <span>Low</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setStatus("yellow")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  status === "yellow"
                    ? "border-status-yellow bg-status-yellow/20 text-white"
                    : "border-nvidia-gray-light bg-nvidia-dark text-gray-400 hover:border-status-yellow/50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-yellow" />
                  <span>Medium</span>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setStatus("red")}
                className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all ${
                  status === "red"
                    ? "border-status-red bg-status-red/20 text-white"
                    : "border-nvidia-gray-light bg-nvidia-dark text-gray-400 hover:border-status-red/50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-red" />
                  <span>High</span>
                </div>
              </button>
            </div>
          </div>

          {/* Due Date */}
          <div className="space-y-2">
            <Label htmlFor="dueDate" className="text-white">
              Due Date
            </Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="bg-nvidia-dark border-nvidia-gray-light text-white"
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags" className="text-white">
              Tags
            </Label>
            <div className="flex gap-2">
              <Input
                id="tags"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a tag and press Enter"
                className="bg-nvidia-dark border-nvidia-gray-light text-white"
              />
              <Button
                type="button"
                onClick={handleAddTag}
                variant="outline"
                className="bg-nvidia-green hover:bg-nvidia-green-light text-black border-0"
              >
                <TagIcon className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="bg-nvidia-gray-light text-nvidia-green px-3 py-1 rounded-full text-sm flex items-center gap-2"
                  >
                    <span>{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Info */}
          <div className="space-y-2">
            <Label htmlFor="additionalInfo" className="text-white">
              Additional Information
            </Label>
            <Textarea
              id="additionalInfo"
              value={additionalInfo}
              onChange={(e) => setAdditionalInfo(e.target.value)}
              placeholder="Any extra notes or details"
              className="min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="flex justify-between sm:justify-between">
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isDeleting || isSaving}
            className="bg-red-600 hover:bg-red-700"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSaving || isDeleting}
              className="border-nvidia-gray-light text-gray-300 hover:bg-nvidia-gray-light"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              disabled={!title.trim() || isSaving || isDeleting}
              className="bg-nvidia-green hover:bg-nvidia-green-light text-black"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
