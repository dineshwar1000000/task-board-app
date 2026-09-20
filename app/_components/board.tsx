"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { useTasks } from "@/app/_hooks/use-tasks";
import { COLUMNS } from "@/app/_lib/types";
import type { Task, TaskPriority } from "@/app/_lib/types";
import Header from "./header";
import Footer from "./footer";
import AddTaskForm from "./add-task-form";
import TaskColumn from "./task-column";

const easeOut = [0.4, 0, 0.2, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: easeOut,
    },
  },
};

export default function Board() {
  const { isLoaded, addTask, updateTask, deleteTask, moveTask, getTasksByStatus } =
    useTasks();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragPosition, setDragPosition] = useState<{ x: number; y: number } | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const originalColumnRef = useRef<string | null>(null);
  const dropTargetIdRef = useRef<string | null>(null);
  const closeMoveMenuRef = useRef<() => void>(() => {});

  const showToast = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  const handleDragStart = useCallback((taskId: string, status: string, e: React.MouseEvent, rect: DOMRect) => {
    dragOffsetRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    originalColumnRef.current = status;
    setDraggedTaskId(taskId);
    setDragPosition({ x: e.clientX - dragOffsetRef.current.x, y: e.clientY - dragOffsetRef.current.y });
  }, []);

  useEffect(() => {
    if (!draggedTaskId) return;

    const handleMouseMove = (e: MouseEvent) => {
      setDragPosition({ x: e.clientX - dragOffsetRef.current.x, y: e.clientY - dragOffsetRef.current.y });
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (dropTargetIdRef.current && dropTargetIdRef.current !== originalColumnRef.current) {
        const targetCol = COLUMNS.find(c => c.id === dropTargetIdRef.current);
        if (targetCol) {
          const targetStatus = targetCol.id as Task['status'];
          const originalStatus = originalColumnRef.current as Task['status'] | null;
          const canMove = !(targetStatus === "done" && originalStatus !== "in-progress");
          if (canMove) {
            moveTask(draggedTaskId, targetStatus);
          } else {
            showToast("Tasks can only be moved to Done from In Progress");
          }
        }
      }
      setDraggedTaskId(null);
      setDragPosition(null);
      setDropTargetId(null);
      dropTargetIdRef.current = null;
      originalColumnRef.current = null;
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedTaskId, moveTask]);

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
  };

  const handleAddTask = (title: string, description: string, priority: TaskPriority) => {
    addTask(title, description, priority);
  };

  const handleUpdateTask = (id: string, title: string, description: string, priority: TaskPriority) => {
    updateTask(id, { title, description, priority });
    setEditingTask(null);
  };

  const handleCloseEditForm = () => {
    setEditingTask(null);
  };

  return (
    <div className="flex flex-1 flex-col">
      <Header />

      {toastMessage && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-md px-4"
        >
          <div className="bg-rose-600 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-3">
            <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-sm font-medium">{toastMessage}</span>
          </div>
        </motion.div>
      )}

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl h-full">
          <AddTaskForm
            onAdd={handleAddTask}
            onUpdate={handleUpdateTask}
            initialTask={editingTask}
            isOpen={!!editingTask}
            onClose={handleCloseEditForm}
            showTrigger={false}
          />

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-4 flex justify-end"
          >
            <AddTaskForm onAdd={handleAddTask} />
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5 lg:gap-6 h-full min-h-[calc(100vh-16rem)] md:min-h-[calc(100vh-16rem)]"
            style={{ gridAutoRows: "1fr" }}
          >
            {COLUMNS.map((column, index) => (
              <motion.div key={column.id} variants={itemVariants} transition={{ delay: index * 0.08 }} className="h-full">
                <TaskColumn
                  column={column}
                  tasks={getTasksByStatus(column.id)}
                  onDelete={deleteTask}
                  onMove={moveTask}
                  onEdit={handleEditTask}
                  isDragTarget={dropTargetId === column.id}
                  onDragEnter={() => { setDropTargetId(column.id); dropTargetIdRef.current = column.id; }}
                  onDragLeave={() => { setDropTargetId(null); dropTargetIdRef.current = null; }}
                  draggedTaskId={draggedTaskId}
                  dragPosition={dragPosition}
                  onDragStart={handleDragStart}
                  onCloseMoveMenu={() => { closeMoveMenuRef.current?.(); }}
                />
              </motion.div>
            ))}
          </motion.div>
        </div>
      </main>

      <Footer />
    </div>
  );
}