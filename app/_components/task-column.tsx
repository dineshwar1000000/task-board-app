"use client";

import { useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, TaskStatus, Column as ColumnType } from "@/app/_lib/types";
import TaskCard from "./task-card";

const easeOut = [0.4, 0, 0.2, 1] as const;

interface TaskColumnProps {
  column: ColumnType;
  tasks: Task[];
  onDelete: (id: string) => void;
  onMove: (id: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  isDragTarget: boolean;
  onDragEnter: () => void;
  onDragLeave: () => void;
  draggedTaskId: string | null;
  dragPosition: { x: number; y: number } | null;
  onDragStart: (taskId: string, status: string, e: React.MouseEvent, rect: DOMRect) => void;
  onCloseMoveMenu: () => void;
}

const taskListVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.1,
    },
  },
};

const taskItemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      ease: easeOut,
    },
  },
};

const emptyStateVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      ease: easeOut,
    },
  },
};

export default function TaskColumn({
  column,
  tasks,
  onDelete,
  onMove,
  onEdit,
  isDragTarget,
  onDragEnter,
  onDragLeave,
  draggedTaskId,
  dragPosition,
  onDragStart,
  onCloseMoveMenu,
}: TaskColumnProps) {
  const columnRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = useCallback(() => {
    onDragEnter();
  }, [onDragEnter]);

  const handleMouseLeave = useCallback(() => {
    onDragLeave();
  }, [onDragLeave]);

  return (
    <motion.div
      ref={columnRef}
      data-column-id={column.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={() => { handleMouseLeave(); onCloseMoveMenu(); }}
      animate={{
        boxShadow: isDragTarget ? "0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1)" : undefined,
        borderColor: isDragTarget ? "rgb(147, 197, 253)" : undefined,
      }}
      transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
      className={`flex flex-col h-full rounded-2xl border bg-slate-50/50 transition-all duration-200 dark:bg-slate-900/50 ${draggedTaskId ? 'cursor-grab' : ''} ${
        isDragTarget
          ? "border-brand-300 bg-brand-50/30 dark:border-brand-700 dark:bg-slate-900/50"
          : "border-slate-200 dark:border-slate-800"
      }`}
    >
      {/* Column header */}
      <div className="flex items-center justify-between rounded-t-2xl border-b border-slate-200 px-4 py-3.5 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <motion.span
            initial={{ scale: 0, rotate: -90 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
            className="text-lg"
          >
            {column.icon}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.15, ease: [0.4, 0, 0.2, 1] }}
            className={`text-sm font-bold tracking-wide ${column.color}`}
          >
            {column.title}
          </motion.h2>
        </div>
        <motion.span
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2, type: "spring", stiffness: 300, damping: 20 }}
          className={`flex h-6 min-w-[24px] items-center justify-center rounded-full px-2 text-xs font-bold ${column.bgColor} ${column.color}`}
        >
          {tasks.length}
        </motion.span>
      </div>

      {/* Task list */}
      <AnimatePresence mode="wait">
        {tasks.length === 0 ? (
          <motion.div
            key="empty"
            variants={emptyStateVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={`flex flex-1 flex-col items-center justify-center rounded-b-2xl border-2 border-dashed p-6 transition-colors md:max-h-[400px] ${
              isDragTarget
                ? "border-brand-300 bg-brand-50/50 dark:border-brand-700 dark:bg-slate-900/50"
                : "border-slate-200 dark:border-slate-700"
            }`}
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="text-4xl opacity-30"
            >
              {column.id === "todo" && "📝"}
              {column.id === "in-progress" && "🚀"}
              {column.id === "done" && "🎉"}
            </motion.div>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.3 }}
              className="mt-3 text-xs font-medium text-slate-400 dark:text-slate-500 text-center px-4"
            >
              {column.id === "todo" && "No tasks yet — add one above!"}
              {column.id === "in-progress" && "Drag tasks here to start working"}
              {column.id === "done" && "Completed tasks will appear here"}
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="list"
            variants={taskListVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="task-column flex-1 space-y-2.5 overflow-y-auto p-3 md:max-h-[400px]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            {tasks.map((task, index) => (
              <motion.div key={task.id} variants={taskItemVariants} transition={{ delay: index * 0.05 }}>
                <TaskCard
                  task={task}
                  onDelete={onDelete}
                  onMove={onMove}
                  onEdit={onEdit}
                  onDragStart={onDragStart}
                  draggedTaskId={draggedTaskId}
                  dragPosition={dragPosition}
                  onCloseMoveMenu={onCloseMoveMenu}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}