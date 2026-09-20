"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Task, TaskStatus, TaskPriority } from "@/app/_lib/types";

interface TaskCardProps {
  task: Task;
  onDelete: (id: string) => void;
  onMove: (id: string, newStatus: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDragStart: (taskId: string, status: string, e: React.MouseEvent, rect: DOMRect) => void;
  draggedTaskId: string | null;
  dragPosition: { x: number; y: number } | null;
  onCloseMoveMenu: () => void;
}

const PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string; bg: string; dot: string }> = {
  low: { label: "Low", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-950/30", dot: "bg-emerald-500" },
  medium: { label: "Medium", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30", dot: "bg-amber-500" },
  high: { label: "High", color: "text-rose-600 dark:text-rose-400", bg: "bg-rose-50 dark:bg-rose-950/30", dot: "bg-rose-500" },
};

const STATUS_TARGETS: { value: TaskStatus; label: string; icon: string }[] = [
  { value: "todo", label: "To Do", icon: "📋" },
  { value: "in-progress", label: "In Progress", icon: "⚡" },
  { value: "done", label: "Done", icon: "✅" },
];

const cardVariants = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8, scale: 0.98 },
  hover: { y: -2, boxShadow: "0 12px 30px -8px rgba(0, 0, 0, 0.12), 0 4px 12px -4px rgba(0, 0, 0, 0.06)" },
  press: { scale: 0.98 },
};

const menuVariants = {
  initial: { opacity: 0, scale: 0.9, y: 4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.9, y: -4 },
};

const confirmVariants = {
  initial: { opacity: 0, scale: 0.95, y: 4 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -4 },
};

const badgeVariants = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
};

const titleVariants = {
  initial: { opacity: 0, x: -10 },
  animate: { opacity: 1, x: 0 },
};

const descriptionVariants = {
  initial: { opacity: 0, y: 4 },
  animate: { opacity: 1, y: 0 },
};

const footerVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
};

const actionButtonVariants = {
  hover: { scale: 1.1 },
  tap: { scale: 0.9 },
};

export default function TaskCard({ task, onDelete, onMove, onEdit, onDragStart, draggedTaskId, dragPosition, onCloseMoveMenu }: TaskCardProps) {
  const [showMoveMenu, setShowMoveMenu] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (showMoveMenu || showDeleteConfirm) return;
    if ((e.target as HTMLElement).closest('[data-action]')) return;
    e.preventDefault();
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      onDragStart(task.id, task.status, e, rect);
    }
  }, [task.id, task.status, onDragStart, showMoveMenu, showDeleteConfirm]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    if (draggedTaskId === task.id) e.preventDefault();
  }, [draggedTaskId, task.id]);

  const handleDelete = () => onDelete(task.id);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const priority = PRIORITY_CONFIG[task.priority];
  const moveTargets = STATUS_TARGETS.filter((s) => {
    if (s.value === "done" && task.status !== "in-progress") return false;
    return s.value !== task.status;
  });
  const isDone = task.status === "done";

  return (
    <>
      <div
        ref={cardRef}
        onMouseDown={handleMouseDown}
        onContextMenu={handleContextMenu}
        onMouseLeave={() => { setShowMoveMenu(false); onCloseMoveMenu(); }}
        style={{ userSelect: "none", width: "100%" }}
        className={`group relative cursor-grab rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 active:cursor-grabbing dark:border-slate-700 dark:bg-slate-900 dark:hover:border-slate-600 ${priority.bg} ltr:pl-3 rtl:pr-3`}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-tl-xl rounded-bl-xl" style={{ backgroundColor: priority.dot.replace("bg-", "") }} />
        <motion.div
          variants={cardVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          whileHover={draggedTaskId === task.id ? {} : "hover"}
          whileTap={draggedTaskId === task.id ? {} : "press"}
          className="p-3.5"
        >
          {/* Top row: priority badge + actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start justify-between gap-2 mb-2"
          >
            <motion.span
              variants={badgeVariants}
              className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${priority.color} ${priority.bg}`}
            >
              <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
              {priority.label}
            </motion.span>

            {/* Action buttons – visible on hover */}
            <AnimatePresence mode="popLayout">
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
              >
                {/* Move button */}
                <motion.div className="relative">
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); setShowMoveMenu(true); }}
                    title="Move task"
                    variants={actionButtonVariants}
                    data-action="move"
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                    </svg>
                  </motion.button>

                  {/* Move dropdown */}
                  <AnimatePresence>
                    {showMoveMenu && (
                      <motion.div
                        key="move-menu"
                        variants={menuVariants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        className="absolute right-0 top-8 z-20 cursor-default"
                      >
                        <motion.div
                          className="fixed inset-0 z-10 cursor-default"
                          onClick={() => setShowMoveMenu(false)}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                        />
                        <motion.div
                          className="rounded-xl border border-slate-200 bg-white p-1.5 shadow-xl dark:border-slate-700 dark:bg-slate-900 relative z-10 w-52"
                          initial={{ opacity: 0, scale: 0.9, y: 4 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.9, y: -4 }}
                          transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        >
                          <p className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                            Move to
                          </p>
                          {moveTargets.map((target) => (
                            <motion.button
                              key={target.value}
                              onClick={(e) => {
                                e.stopPropagation();
                                onMove(task.id, target.value);
                                setShowMoveMenu(false);
                              }}
                              variants={actionButtonVariants}
                              className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 cursor-default"
                            >
                              <span>{target.icon}</span>
                              {target.label}
                            </motion.button>
                          ))}
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>

                {/* Edit and Delete buttons */}
                {!showMoveMenu && !showDeleteConfirm && (
                  <>
                    <motion.button
                      onClick={(e) => { e.stopPropagation(); onEdit(task); }}
                      title="Edit task"
                      variants={actionButtonVariants}
                      data-action="edit"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </motion.button>

                    <motion.button
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(true); }}
                      title="Delete task"
                      variants={actionButtonVariants}
                      data-action="delete"
                      className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-500 dark:hover:bg-rose-950 dark:hover:text-rose-400 cursor-pointer"
                    >
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </motion.button>
                  </>
                )}
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Title */}
          <motion.h3
            variants={titleVariants}
            className={`text-sm font-semibold leading-snug break-words ${isDone ? "text-slate-400 line-through dark:text-slate-500" : "text-slate-900 dark:text-slate-100"}`}
          >
            {task.title}
          </motion.h3>

          {/* Description */}
          <AnimatePresence>
            {task.description && (
              <motion.p
                key="description"
                variants={descriptionVariants}
                className="mt-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400 break-words overflow-wrap-anywhere"
              >
                {task.description}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Footer: date */}
          <motion.div
            variants={footerVariants}
            className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500"
          >
            <div className="flex items-center gap-1.5">
              <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {formatDate(task.createdAt)}
            </div>
            <span className="text-[10px] font-medium uppercase tracking-wide text-slate-300 dark:text-slate-600">
              {task.status.replace("-", " ")}
            </span>
          </motion.div>

          {/* Delete confirmation overlay */}
          <AnimatePresence>
            {showDeleteConfirm && (
              <motion.div
                key="delete-confirm"
                variants={confirmVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="mt-3 rounded-lg border border-rose-200 bg-rose-50 p-3 dark:border-rose-900 dark:bg-rose-950"
              >
                <p className="text-xs font-medium text-rose-700 dark:text-rose-400">
                  Delete this task?
                </p>
                <div className="mt-2 flex gap-2 justify-end">
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                    variants={actionButtonVariants}
                    className="rounded-lg px-3 py-1 text-xs font-medium text-slate-600 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-900 cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    onClick={(e) => { e.stopPropagation(); handleDelete(); }}
                    variants={actionButtonVariants}
                    className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
                  >
                    Delete
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Floating drag clone */}
      {draggedTaskId === task.id && dragPosition && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              position: "fixed",
              left: dragPosition.x,
              top: dragPosition.y,
              pointerEvents: "none",
              width: "300px",
              opacity: 1,
            }}
            className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
          >
            <div className="flex items-start justify-between gap-2">
              <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[10px] font-semibold ${priority.color} ${priority.bg}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${priority.dot}`} />
                {priority.label}
              </span>
            </div>
            <h3 className="mt-2 text-sm font-semibold leading-snug text-slate-900 dark:text-slate-100">
              {task.title}
            </h3>
            {task.description && (
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {task.description}
              </p>
            )}
            <div className="mt-3 flex items-center text-[11px] text-slate-400 dark:text-slate-500">
              <svg className="mr-1 h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
              {formatDate(task.createdAt)}
            </div>
          </div>
        </div>
      )}
    </>
  );
}