"use client";
import React from "react";
import { motion } from "motion/react";

type propType = {
  open: boolean;
  onClose: () => void;
};
const AuthModel = ({ open, onClose }: propType) => {
  return (
    <>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/80 backdrop-blur-md"
          >
            
          </motion.div>
        </>
      )}
    </>
  );
};

export default AuthModel;
