"use client";
import { motion } from "motion/react";
import React from "react";

const AnimatedCard = ({ title, icon, children }: any) => {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white rounded-3xl shadow-xl space-y-6 p-6 border border-gray-100"
    >
      <div className="flex items-center gap-2 font-semibold">
        {icon}
        {title}
      </div>
      {children}
    </motion.div>
  );
};

export default AnimatedCard;
