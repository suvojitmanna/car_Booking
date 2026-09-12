"use client";
import axios from "axios";
import {
  ArrowLeft,
  BadgeCheck,
  CheckCircle,
  CreditCard,
  Landmark,
  Phone,
  CircleDashed,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { RiSecurePaymentLine } from "react-icons/ri";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { setUserData } from "@/src/redux/userSlice";

const IFSC_REGX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const UPI_REGX = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z0-9.\-_]{2,64}$/;

const Page = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => state.user);

  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [ifsc, setIfsc] = useState("");
  const [upi, setUpi] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const sanitizedIfsc = ifsc.trim().toUpperCase();
  const sanitizedUpi = upi.trim();

  const isNameValid =
    accountHolder.trim().length >= 3 || accountHolder.trim() === "";
  const isAccountValid =
    (accountNumber.trim().length >= 9 && accountNumber.trim().length <= 12) ||
    accountNumber.trim() === "";
  const isIfscValid = IFSC_REGX.test(sanitizedIfsc) || ifsc.trim() === "";
  const isMobileNumberValid =
    /^[0-9]{10}$/.test(mobileNumber.trim()) || mobileNumber.trim() === "";

  const isUpiValid = sanitizedUpi === "" || UPI_REGX.test(sanitizedUpi);

  const canSubmit =
    accountHolder.trim().length >= 3 &&
    accountNumber.trim().length >= 9 &&
    accountNumber.trim().length <= 12 &&
    IFSC_REGX.test(sanitizedIfsc) &&
    /^[0-9]{10}$/.test(mobileNumber.trim()) &&
    isUpiValid;

  const handleBank = async () => {
    setError("");
    try {
      setLoading(true);
      const { data } = await axios.post("/api/partner/onboarding/bank", {
        accountHolder,
        accountNumber,
        ifsc: sanitizedIfsc,
        upi: sanitizedUpi,
        mobileNumber,
      });
      setLoading(false);

      if (data?.user) {
        dispatch(setUserData(data.user));
      }

      router.push("/");
    } catch (error: any) {
      setError(
        error?.response?.data?.message || "Something went wrong during upload",
      );
      setLoading(false);
    }
  };

  useEffect(() => {
    const getBank = async () => {
      try {
        const { data } = await axios.get("/api/partner/onboarding/bank");
        if (data?.partnerBank) {
          setAccountHolder(data.partnerBank.accountHolder || "");
          setAccountNumber(data.partnerBank.accountNumber || "");
          setIfsc(data.partnerBank.ifsc || "");
          setUpi(data.partnerBank.upi || "");
          setMobileNumber(data.partnerBank.mobileNumber || "");
        }
      } catch (error) {
        console.error("Error fetching bank details:", error);
      }
    };
    getBank();
  }, []);

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

            <div className="flex items-center gap-2 mt-2">
              <BadgeCheck size={17} className="text-gray-400 shrink-0" />

              <input
                id="accountHolder"
                type="text"
                placeholder="As per bank records"
                className={`flex-1 py-1.5 text-sm border-b pb-2 outline-none bg-transparent ${
                  !isNameValid
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
              />
            </div>
            {!isNameValid && accountHolder.length > 0 && (
              <p className="mt-1 text-xs text-red-500">
                Minimum 3 characters required
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="accountNumber"
              className="text-[11px] sm:text-xs font-semibold text-gray-500"
            >
              Bank account number
            </label>

            <div className="flex items-center gap-2 mt-2">
              <CreditCard size={17} className="text-gray-400 shrink-0" />

              <input
                id="accountNumber"
                type="text"
                placeholder="Enter account number"
                className={`flex-1 py-1.5 text-sm border-b pb-2 outline-none bg-transparent ${
                  !isAccountValid
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            {!isAccountValid && accountNumber.length > 0 && (
              <p className="mt-1 text-xs text-red-500">
                Account number must be between 9 and 12 digits
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="ifsc"
              className="text-[11px] sm:text-xs font-semibold text-gray-500"
            >
              IFSC code
            </label>

            <div className="flex items-center gap-2 mt-1 ">
              <Landmark size={17} className="text-gray-400 shrink-0" />

              <input
                id="ifsc"
                type="text"
                placeholder="HDFC0001234"
                className={`flex-1 py-1.5 text-sm border-b pb-2 outline-none bg-transparent ${
                  !isIfscValid
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
                value={ifsc}
                onChange={(e) => setIfsc(e.target.value)}
              />
            </div>
            {!isIfscValid && ifsc.length > 0 && (
              <p className="mt-1 text-xs text-red-500">
                Enter a valid 11-character IFSC code
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="mobile"
              className="text-[11px] sm:text-xs font-semibold text-gray-500"
            >
              Mobile number
            </label>

            <div className="flex items-center gap-2 mt-2">
              <Phone size={17} className="text-gray-400 shrink-0" />

              <input
                id="mobile"
                type="tel"
                placeholder="10 digit mobile number"
                maxLength={10}
                className={`flex-1 py-1.5 text-sm border-b pb-2 outline-none bg-transparent ${
                  !isMobileNumberValid
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
              />
            </div>
            {!isMobileNumberValid && mobileNumber.length > 0 && (
              <p className="mt-1 text-xs text-red-500">
                Enter a valid 10-digit mobile number
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="upi"
              className="text-[11px] sm:text-xs font-semibold text-gray-500"
            >
              UPI ID <span className="font-normal">(optional)</span>
            </label>

            <div className="flex items-center gap-2 mt-2">
              <RiSecurePaymentLine
                size={18}
                className="text-gray-400 shrink-0"
              />

              <input
                id="upi"
                type="text"
                placeholder="upi@gmail.com"
                className={`flex-1 py-1.5 text-sm border-b pb-2 outline-none bg-transparent ${
                  !isUpiValid
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-300 focus:border-black"
                }`}
                value={upi}
                onChange={(e) => setUpi(e.target.value)}
              />
            </div>
            {!isUpiValid && upi.length > 0 && (
              <p className="mt-1 text-xs text-red-500">Enter a valid UPI ID</p>
            )}
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
          disabled={!canSubmit || loading}
          className="mt-5 w-full h-12 rounded-xl bg-black text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
        >
          {loading ? (
            <CircleDashed className="text-white animate-spin" size={20} />
          ) : (userData?.partnerOnBoardingSteps ?? 0) === 3 ? (
            "Update & Back to Review"
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Page;
