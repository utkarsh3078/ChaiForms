"use client";

import React from "react";
import { motion } from "framer-motion";

export function DashboardGrid({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
    >
      {children}
    </motion.div>
  );
}

export default DashboardGrid;
