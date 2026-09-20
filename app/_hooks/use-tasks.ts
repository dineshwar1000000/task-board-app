"use client";

import { useState, useEffect, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import type { Task, TaskStatus, TaskPriority } from "@/app/_lib/types";

const STORAGE_KEY = "taskflow-board-data";

function loadTasks(): Task[] {
  if (typeof window === "undefined") return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved) as Task[];
    }
  } catch (err) {
    console.error("Failed to load tasks from localStorage:", err);
  }
  return [];
}

function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (err) {
    console.error("Failed to save tasks to localStorage:", err);
  }
}

export function useTasks() {
  const [tasks, setTasks] = useState<Task[] | null>(null);

  // Load tasks from localStorage on mount
  useEffect(() => {
    const stored = loadTasks();
    setTasks(stored);
  }, []);

  // Persist tasks to localStorage whenever they change
  useEffect(() => {
    if (tasks !== null) {
      saveTasks(tasks);
    }
  }, [tasks]);

  const addTask = useCallback(
    (title: string, description: string, priority: TaskPriority) => {
      const newTask: Task = {
        id: uuidv4(),
        title: title.trim(),
        description: description.trim(),
        status: "todo",
        priority,
        createdAt: new Date().toISOString(),
      };
      setTasks((prev) => (prev === null ? [newTask] : [newTask, ...prev]));
    },
    []
  );

  const updateTask = useCallback(
    (id: string, updates: Partial<Omit<Task, "id" | "createdAt">>) => {
      setTasks((prev) =>
        prev === null
          ? null
          : prev.map((task) => (task.id === id ? { ...task, ...updates } : task))
      );
    },
    []
  );

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) =>
      prev === null ? null : prev.filter((task) => task.id !== id)
    );
  }, []);

  const moveTask = useCallback((id: string, newStatus: TaskStatus) => {
    setTasks((prev) =>
      prev === null
        ? null
        : prev.map((task) =>
            task.id === id ? { ...task, status: newStatus } : task
          )
    );
  }, []);

  const getTasksByStatus = useCallback(
    (status: TaskStatus): Task[] => {
      if (tasks === null) return [];
      return tasks.filter((task) => task.status === status);
    },
    [tasks]
  );

  return {
    tasks: tasks ?? [],
    isLoaded: tasks !== null,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    getTasksByStatus,
  };
}