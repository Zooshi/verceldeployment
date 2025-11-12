import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/kanban/kanban-board";

export default async function ProtectedPage() {
  const supabase = await createClient();

  const { data, error } = await supabase.auth.getClaims();
  if (error || !data?.claims) {
    redirect("/auth/login");
  }

  return (
    <div className="flex-1 w-full flex flex-col min-h-screen bg-nvidia-darker">
      {/* Header */}
      <div className="w-full mb-6 sm:mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
              Task Board
            </h1>
            <p className="text-sm sm:text-base text-gray-400">
              Manage your tasks with drag-and-drop functionality
            </p>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1">
        <KanbanBoard />
      </div>
    </div>
  );
}
