"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import { ArrowLeft, FileCheck, UploadCloud, CircleDashed } from "lucide-react";
import axios from "axios";

type DocsType = "aadhar" | "license" | "rc";

const Page = () => {
  const router = useRouter();
  const [docs, setDocs] = useState<Record<DocsType, File | null>>({
    aadhar: null,
    license: null,
    rc: null,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  const handleImage = (doc: DocsType, file: File | null) => {
    setError("");
    if (!file) return;
    if (file.size >= MAX_FILE_SIZE) {
      setError(`File size for ${doc.toUpperCase()} must be less than 5 MB`);
      return;
    }
    setDocs((prev) => ({ ...prev, [doc]: file }));
  };

  const handleDocs = async () => {
    setError("");

    if (!docs.aadhar || !docs.license || !docs.rc) {
      setError("Please upload all required documents");
      return;
    }

    try {
      setLoading(true);
      const formdata = new FormData();
      formdata.append("aadhar", docs.aadhar);
      formdata.append("license", docs.license);
      formdata.append("rc", docs.rc);

      const { data } = await axios.post(
        "/api/partner/onboarding/document",
        formdata,
      );
      setLoading(false);
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Something went wrong during upload",
      );
      setLoading(false);
    }
  };

  const isAllUploaded = docs.aadhar && docs.license && docs.rc;

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
            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
              docs.aadhar
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-black"
            }`}
          >
            <div>
              <p className="text-sm font-semibold">Aadhaar /ID proof</p>
              <p className="text-xs text-gray-500">Government issued</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium ${docs.aadhar ? "text-green-600" : "text-gray-400"}`}
              >
                {docs.aadhar ? "Uploaded ✓" : "Upload"}
              </span>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.aadhar ? "bg-green-600 text-white" : "bg-black text-white"}`}
              >
                <UploadCloud size={18} />
              </div>
            </div>
            <input
              type="file"
              hidden
              accept="image/*,.pdf"
              onChange={(e) =>
                handleImage("aadhar", e.target?.files?.[0] || null)
              }
            />
          </motion.label>

          <motion.label
            whileHover={{ scale: 1.02 }}
            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
              docs.license
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-black"
            }`}
          >
            <div>
              <p className="text-sm font-semibold">Driving License</p>
              <p className="text-xs text-gray-500">Valid driving license</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium ${docs.license ? "text-green-600" : "text-gray-400"}`}
              >
                {docs.license ? "Uploaded ✓" : "Upload"}
              </span>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.license ? "bg-green-600 text-white" : "bg-black text-white"}`}
              >
                <UploadCloud size={18} />
              </div>
            </div>
            <input
              type="file"
              hidden
              accept="image/*,.pdf"
              onChange={(e) =>
                handleImage("license", e.target?.files?.[0] || null)
              }
            />
          </motion.label>

          <motion.label
            whileHover={{ scale: 1.02 }}
            className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
              docs.rc
                ? "border-green-500 bg-green-50"
                : "border-gray-200 hover:border-black"
            }`}
          >
            <div>
              <p className="text-sm font-semibold">Vehicle RC</p>
              <p className="text-xs text-gray-500">Registration Certificate</p>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-medium ${docs.rc ? "text-green-600" : "text-gray-400"}`}
              >
                {docs.rc ? "Uploaded ✓" : "Upload"}
              </span>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${docs.rc ? "bg-green-600 text-white" : "bg-black text-white"}`}
              >
                <UploadCloud size={18} />
              </div>
            </div>
            <input
              type="file"
              hidden
              accept="image/*,.pdf"
              onChange={(e) => handleImage("rc", e.target?.files?.[0] || null)}
            />
          </motion.label>
        </div>

        <div className="mt-6 flex items-start gap-3 text-xs text-gray-500">
          <FileCheck size={16} className="mt-0.5 shrink-0" />
          <p>
            Documents are securely stored and manually verified by our team.
          </p>
        </div>

        {error && (
          <p className="mt-2 text-red-500 text-sm font-medium text-center">
            {error}
          </p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={!isAllUploaded || loading}
          className="mt-4 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition disabled:cursor-not-allowed cursor-pointer"
          onClick={handleDocs}
        >
          {loading ? (
            <>
              Submitting...
              <CircleDashed className="text-white animate-spin" />
            </>
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Page;
