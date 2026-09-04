"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "motion/react";
import React from "react";

const RejectionCard = ({ title, reason, actionLabel, onAction }: any) => {
  return (
    <div className="bg-red-50 border border-red-200 rounded-2xl md:rounded-3xl p-5 sm:p-6 md:p-8 space-y-4">
      <div className="flex items-center gap-2 text-red-600 font-semibold text-sm sm:text-base">
        <AlertTriangle size={18} />
        {title}
      </div>

      <div className="bg-white border border-red-100 rounded-xl p-4 text-sm sm:text-base text-gray-700 whitespace-pre-line">
        <span className="font-semibold text-gray-900 block mb-1 text-xs uppercase tracking-wider">
          Reason for rejection:
        </span>
        {reason && String(reason).trim().length > 0 ? (
          reason
        ) : (
          <span className="text-gray-400 italic">
            No specific reason was provided by the admin. Please review and update your details.
          </span>
        )}
      </div>

      {onAction && (
        <motion.button
          whileTap={{
            scale: 0.97,
            opacity: 0.9,
          }}
          className="w-full px-6 sm:w-auto py-2.5 bg-black text-white rounded-xl text-sm sm:text-base font-medium hover:bg-gray-800 transition cursor-pointer"
          onClick={onAction}
        >
          {actionLabel || "Retry"} →
        </motion.button>
      )}
    </div>
  );
};

export default RejectionCard;