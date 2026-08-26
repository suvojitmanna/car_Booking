"use client";
import React from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileCheck, UploadCloud } from "lucide-react";

const page = () => {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
      >
        <div className="relative text-center">
          <button
            type="button"
            className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>

          <p className="text-xs text-gray-500 font-medium">Step 2 of 3</p>

          <h1 className="text-2xl font-bold mt-1">Upload Documents</h1>

          <p className="text-sm text-gray-500 mt-2 capitalize">
            Required for verification
          </p>

          <p className="text-xs text-gray-400 mt-1">
            Each document must be less than 5 MB
          </p>
        </div>

        <div className="mt-8 space-y-5">
          <motion.label
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition"
          >
            <div className="">
              <p className="text-sm font-semibold">Aadhaar /ID proof</p>
              <p className="text-xs text-gray-500">Government issued</p>
            </div>
            <div className="">
              <span className="text-xs text-gray-400">Upload</span>
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                <UploadCloud size={18} />
              </div>
            </div>
          </motion.label>

          <motion.label
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition"
          >
            <div className="">
              <p className="text-sm font-semibold">Driving License</p>
              <p className="text-xs text-gray-500">Valid driving license</p>
            </div>
            <div className="">
              <span className="text-xs text-gray-400">Upload</span>
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                <UploadCloud size={18} />
              </div>
            </div>
          </motion.label>

          <motion.label
            whileHover={{ scale: 1.02 }}
            className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 cursor-pointer hover:border-black transition"
          >
            <div className="">
              <p className="text-sm font-semibold">Vehicle RC</p>
              <p className="text-xs text-gray-500">Registration Certificate</p>
            </div>
            <div className="">
              <span className="text-xs text-gray-400">Upload</span>
              <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
                <UploadCloud size={18} />
              </div>
            </div>
          </motion.label>
        </div>

        <div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
          <FileCheck size={16} className="mt-0.5" />
          <p>
            Documents are securely stored and manually verified by our team.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          className="mt-8 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition cursor-pointer"
        >
          Continue
        </motion.button>
      </motion.div>
    </div>
  );
};

export default page;
