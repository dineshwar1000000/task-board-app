"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { TaskPriority } from "@/app/_lib/types";

interface AddTaskFormProps {
  onAdd: (title: string, description: string, priority: TaskPriority) => void;
  onUpdate?: (id: string, title: string, description: string, priority: TaskPriority) => void;
  initialTask?: Task | null;
  isOpen?: boolean;
  onClose?: () => void;
  showTrigger?: boolean;
}

interface Task {
  id: string;
  title: string;
  description: string;
  priority: TaskPriority;
}

const easeOut = [0.4, 0, 0.2, 1] as const;

const PRIORITY_OPTIONS: { value: TaskPriority; label: string; dot: string }[] = [
  { value: "low", label: "Low", dot: "bg-emerald-400" },
  { value: "medium", label: "Medium", dot: "bg-amber-400" },
  { value: "high", label: "High", dot: "bg-rose-500" },
];

const modalVariants = {
  initial: { opacity: 0, scale: 0.95, y: 20 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -20 },
};

const overlayVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

const buttonVariants = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.95, y: -10 },
};

const inputVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -10 },
};

const priorityButtonVariants = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const actionButtonVariants = {
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export default function AddTaskForm({ onAdd, onUpdate, initialTask, isOpen: controlledIsOpen, onClose, showTrigger = true }: AddTaskFormProps) {
  const [uncontrolledIsOpen, setUncontrolledIsOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const modalRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);

  const isControlled = controlledIsOpen !== undefined;
  const isOpen = isControlled ? controlledIsOpen : uncontrolledIsOpen;

  const isEditing = !!initialTask;

  const closeModal = useCallback(() => {
    setTitle("");
    setDescription("");
    setPriority("medium");
    if (isControlled) {
      onClose?.();
    } else {
      setUncontrolledIsOpen(false);
    }
  }, [isControlled, onClose]);

  // Populate form when initialTask changes (for controlled mode)
  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description);
      setPriority(initialTask.priority);
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
    }
  }, [initialTask]);

  // Focus title input when modal opens
  useEffect(() => {
    if (isOpen && titleInputRef.current) {
      setTimeout(() => titleInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isEditing && initialTask && onUpdate) {
      onUpdate(initialTask.id, title, description, priority);
    } else {
      onAdd(title, description, priority);
    }
    setTitle("");
    setDescription("");
    setPriority("medium");
    closeModal?.();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.length <= 30) setTitle(value);
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= 150) setDescription(value);
  };

  const handleOpen = (task?: Task) => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description);
      setPriority(task.priority);
    } else {
      setTitle("");
      setDescription("");
      setPriority("medium");
    }
    setUncontrolledIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      closeModal?.();
    }
  };

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        closeModal?.();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen, closeModal]);

  return (
    <>
      {showTrigger && (
        <motion.button
          onClick={() => handleOpen(initialTask ?? undefined)}
          variants={buttonVariants}
          initial="initial"
          animate="animate"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          className="group flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-600 transition-all duration-200 hover:border-brand-400 hover:bg-brand-50 hover:text-brand-700 hover:shadow-sm dark:border-slate-600 dark:bg-slate-800/50 dark:hover:border-brand-500 dark:hover:bg-brand-900/50 dark:hover:text-brand-400 cursor-pointer"
        >
          <motion.svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            animate={{ rotate: [0, 90, 0] }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 4.5v15m7.5-7.5h-15"
            />
          </motion.svg>
          <span>{isEditing ? "Edit Task" : "Add Task"}</span>
        </motion.button>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
              variants={overlayVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              onClick={closeModal}
            />
            <motion.div
              ref={modalRef}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              variants={modalVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25, ease: easeOut }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
            >
              <motion.form
                onSubmit={handleSubmit}
                onKeyDown={handleKeyDown}
                className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900"
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                  <h2 id="modal-title" className="text-lg font-bold text-slate-900 dark:text-slate-50">
                    {isEditing ? "Edit Task" : "New Task"}
                  </h2>
                  <motion.button
                    type="button"
                    onClick={closeModal}
                    variants={actionButtonVariants}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                    aria-label="Close"
                  >
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </motion.button>
                </div>

                {/* Title input */}
                <motion.div variants={inputVariants} className="mb-4">
                  <label htmlFor="task-title" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Title <span className="text-rose-500">*</span>
                  </label>
                  <input
                    ref={titleInputRef}
                    id="task-title"
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    placeholder="What needs to be done?"
                    autoFocus
                    required
                    maxLength={30}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:text-slate-900 dark:focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-900"
                  />
                  <div className="mt-1 flex justify-end">
                    <span className="text-xs text-slate-400 dark:text-slate-500">{title.length}/30</span>
                  </div>
                </motion.div>

                {/* Description textarea */}
                <motion.div variants={inputVariants} className="mb-4">
                  <label htmlFor="task-description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                    Description
                  </label>
                  <textarea
                    id="task-description"
                    value={description}
                    onChange={handleDescriptionChange}
                    placeholder="Add a description (optional)"
                    rows={3}
                    maxLength={150}
                    className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:text-slate-900 dark:focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-brand-100 dark:border-slate-700 dark:bg-slate-800 dark:placeholder:text-slate-500 dark:focus:border-brand-500 dark:focus:ring-brand-900"
                  />
                  <div className="mt-1 flex justify-end">
                    <span className="text-xs text-slate-400 dark:text-slate-500">{description.length}/150</span>
                  </div>
                </motion.div>

                {/* Priority selector */}
                <motion.div variants={inputVariants} className="mb-5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Priority
                  </label>
                  <div className="flex items-center gap-2">
                    {PRIORITY_OPTIONS.map((opt, index) => (
                      <motion.button
                        key={opt.value}
                        type="button"
                        onClick={() => setPriority(opt.value)}
                        variants={priorityButtonVariants}
                        whileHover="hover"
                        whileTap="tap"
                        transition={{ delay: index * 0.05 }}
                        className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150 cursor-pointer ${
                          priority === opt.value
                            ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                        }`}
                      >
                        <motion.span
                          className={`h-2.5 w-2.5 rounded-full ${opt.dot}`}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20, delay: index * 0.05 }}
                        />
                        {opt.label}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>

                {/* Actions */}
                <motion.div variants={inputVariants} className="flex justify-end gap-3">
                  <motion.button
                    type="button"
                    onClick={closeModal}
                    variants={actionButtonVariants}
                    className="rounded-xl px-5 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    disabled={!title.trim()}
                    variants={actionButtonVariants}
                    className="rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all duration-200 hover:bg-brand-700 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40 dark:bg-brand-500 dark:hover:bg-brand-400 cursor-pointer"
                  >
                    {isEditing ? "Update Task" : "Add Task"}
                  </motion.button>
                </motion.div>
              </motion.form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}