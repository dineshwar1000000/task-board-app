"use client";

import { motion } from "framer-motion";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950"
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-center px-4 text-sm text-slate-500 dark:text-slate-400 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
        >
          &copy; {year} TaskFlow. Built with{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Next.js
          </span>{" "}
          &{" "}
          <span className="font-medium text-slate-700 dark:text-slate-300">
            Tailwind CSS
          </span>
        </motion.p>
      </div>
    </motion.footer>
  );
}