"use client";
import axios from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  CreditCard,
  Landmark,
  Phone,
  CircleDashed, // Added this import for the loading spinner
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { RiSecurePaymentLine } from "react-icons/ri";

const Page = () => {
  const router = useRouter();
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upi, setUpi] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleBank = async () => {
    setError("");
    try {
      setLoading(true);
      const { data } = await axios.post("/api/partner/onboarding/bank", {
        accountHolder,
        accountNumber,
        ifsc,
        upi,
        mobileNumber,
      });
      setLoading(false);
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Something went wrong during upload",
      );
      setLoading(false);
    }
  };

  const isButtonDisabled =
    loading ||
    !accountHolder.trim() ||
    !accountNumber.trim() ||
    !ifsc.trim() ||
    !mobileNumber.trim();

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-4 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_20px_60px_rgba(0,0,0,0.12)] px-5 py-5 sm:px-7 sm:py-6"
      >
        <div className="relative text-center">
          <button
            type="button"
            onClick={() => router.back()}
            className="absolute left-0 top-0 w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition cursor-pointer"
          >
            <ArrowLeft size={16} />
          </button>

          <p className="text-[11px] text-gray-500 font-medium">Step 3 of 3</p>

          <h1 className="text-xl sm:text-2xl font-bold mt-1">
            Bank & Payout Setup
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Used for partner Layouts
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="accountHolder"
              className="text-[11px] sm:text-xs font-semibold text-gray-500"
            >
              Account holder name
            </label>

            <div className="flex items-center gap-2 mt-1 border-b border-gray-300 focus-within:border-black transition-colors">
              <BadgeCheck size={17} className="text-gray-400 shrink-0" />

              <input
                id="accountHolder"
                type="text"
                placeholder="As per bank records"
                className="flex-1 py-1.5 text-sm outline-none bg-transparent"
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="accountNumber"
              className="text-[11px] sm:text-xs font-semibold text-gray-500"
            >
              Bank account number
            </label>

            <div className="flex items-center gap-2 mt-1 border-b border-gray-300 focus-within:border-black transition-colors">
              <CreditCard size={17} className="text-gray-400 shrink-0" />

              <input
                id="accountNumber"
                type="text"
                placeholder="Enter account number"
                className="flex-1 py-1.5 text-sm outline-none bg-transparent"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="ifsc"
              className="text-[11px] sm:text-xs font-semibold text-gray-500"
            >
              IFSC code
            </label>

            <div className="flex items-center gap-2 mt-1 border-b border-gray-300 focus-within:border-black transition-colors">
              <Landmark size={17} className="text-gray-400 shrink-0" />

              <input
                id="ifsc"
                type="text"
                placeholder="HDFC0001234"
                className="flex-1 py-1.5 text-sm outline-none bg-transparent uppercase"
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="mobile"
              className="text-[11px] sm:text-xs font-semibold text-gray-500"
            >
              Mobile number
            </label>

            <div className="flex items-center gap-2 mt-1 border-b border-gray-300 focus-within:border-black transition-colors">
              <Phone size={17} className="text-gray-400 shrink-0" />

              <input
                id="mobile"
                type="tel"
                placeholder="10 digit mobile number"
                maxLength={10}
                className="flex-1 py-1.5 text-sm outline-none bg-transparent"
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="upi"
              className="text-[11px] sm:text-xs font-semibold text-gray-500"
            >
              UPI ID <span className="font-normal">(optional)</span>
            </label>

            <div className="flex items-center gap-2 mt-1 border-b border-gray-300 focus-within:border-black transition-colors">
              <RiSecurePaymentLine
                size={18}
                className="text-gray-400 shrink-0"
              />

              <input
                id="upi"
                type="text"
                placeholder="upi@gmail.com"
                className="flex-1 py-1.5 text-sm outline-none bg-transparent"
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2 text-[11px] sm:text-xs text-gray-500">
          <CheckCircle size={15} className="mt-0.5 shrink-0" />

          <p className="leading-4">
            Bank details are verified before your first payout. This usually
            takes 24–48 hours.
          </p>
        </div>

        {error && (
          <p className="mt-4 text-red-500 text-sm font-sans text-center">
            ***{error} !!!
          </p>
        )}

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleBank}
          disabled={isButtonDisabled}
          className="mt-5 w-full h-12 rounded-xl bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {loading ? (
            <CircleDashed className="text-white animate-spin" size={20} />
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Page;
