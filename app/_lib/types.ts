export type TaskStatus = "todo" | "in-progress" | "done";

export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  createdAt: string;
}

export interface Column {
  id: TaskStatus;
  title: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
}

export const COLUMNS: Column[] = [
  {
    id: "todo",
    title: "To Do",
    color: "text-brand-600",
    bgColor: "bg-brand-50",
    borderColor: "border-brand-200",
    icon: "📋",
  },
  {
    id: "in-progress",
    title: "In Progress",
    color: "text-amber-600",
    bgColor: "bg-amber-50",
    borderColor: "border-amber-200",
    icon: "⚡",
  },
  {
    id: "done",
    title: "Done",
    color: "text-emerald-600",
    bgColor: "bg-emerald-50",
    borderColor: "border-emerald-200",
    icon: "✅",
  },
];
