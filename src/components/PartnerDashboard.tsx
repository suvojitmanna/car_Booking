"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { motion } from "motion/react";
import { Check, Lock, Clock, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

type Step = {
  id: number;
  title: string;
  route?: string;
};

const STEPS: Step[] = [
  { id: 1, title: "Vehicle", route: "/partner/onboarding/vehicle" },
  { id: 2, title: "Document", route: "/partner/onboarding/documents" },
  { id: 3, title: "Bank", route: "/partner/onboarding/bank" },
  { id: 4, title: "Review" },
  { id: 5, title: "Video KYC" },
  { id: 6, title: "Pricing" },
  { id: 7, title: "Final Review" },
  { id: 8, title: "Live" },
];

const TOTAL_STEPS = STEPS.length;

const PartnerDashboard = () => {
  const [activeStep, setActiveStep] = useState(1);
  const router = useRouter();

  const { userData } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    if (!userData) return;

    if (
      userData.partnerStatus === "approved" &&
      (userData.partnerOnBoardingSteps ?? 0) >= 4
    ) {
      setActiveStep(userData.partnerOnBoardingSteps + 1);
    } else if ((userData.partnerOnBoardingSteps ?? 0) >= 3) {
      setActiveStep(4);
    } else if (userData.partnerOnBoardingSteps) {
      setActiveStep(userData.partnerOnBoardingSteps + 1);
    } else {
      setActiveStep(1);
    }
  }, [userData?.partnerOnBoardingSteps, userData?.partnerStatus]);

  const goToStep = (step: Step) => {
    if (step.route && step.id <= activeStep) {
      router.push(step.route);
    }
  };

  const progressPercentage = ((activeStep - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 px-4 pt-28 pb-20">
      <div className="max-w-7xl mx-auto space-y-16">
        <div>
          <h1 className="text-4xl font-bold">Partner Onboarding</h1>

          <p className="text-gray-600 mt-3">
            Complete all steps to activate your account
          </p>
        </div>

        <div className="bg-white rounded-3xl p-10 shadow-xl border overflow-x-auto">
          <div className="relative min-w-[800px]">
            <div className="absolute top-7 left-0 w-full h-[3px] bg-gray-200 rounded-full">
              <motion.div
                animate={{
                  width: `${progressPercentage}%`,
                }}
                transition={{ duration: 0.6 }}
                className="absolute top-0 left-0 h-[3px] bg-black rounded-full"
              />
            </div>

            <div className="relative flex justify-between">
              {STEPS.map((s) => {
                const completed = s.id < activeStep;
                const active = s.id === activeStep;
                const locked = s.id > activeStep;

                return (
                  <motion.div
                    key={s.id}
                    whileHover={!locked ? { scale: 1.1 } : {}}
                    onClick={() => goToStep(s)}
                    className="flex flex-col items-center z-10 cursor-pointer"
                  >
                    <div
                      className={`w-14 h-14 rounded-full flex items-center justify-center border-2 transition-all 
                        ${
                          completed
                            ? "bg-black text-white border-black"
                            : active
                              ? "border-black bg-white"
                              : "border-gray-300 text-gray-300 bg-white"
                        }`}
                    >
                      {completed ? (
                        <Check size={20} strokeWidth={3} />
                      ) : locked ? (
                        <Lock size={20} strokeWidth={3} />
                      ) : (
                        s.id
                      )}
                    </div>
                    <span
                      className={`text-sm mt-2 font-medium 
                        ${
                          completed
                            ? "text-black"
                            : active
                              ? "text-black"
                              : "text-gray-400"
                        }`}
                    >
                      {s.title}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {activeStep === 4 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-3xl p-8 shadow-xl border flex flex-col md:flex-row items-center justify-between gap-6 ${
              userData?.partnerStatus === "rejected"
                ? "bg-red-50/60 border-red-200"
                : "bg-white border-gray-100"
            }`}
          >
            <div className="flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 ${
                  userData?.partnerStatus === "rejected"
                    ? "bg-red-100 text-red-600"
                    : "bg-amber-50 text-amber-600"
                }`}
              >
                {userData?.partnerStatus === "rejected" ? (
                  <XCircle size={28} />
                ) : (
                  <Clock size={28} />
                )}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-gray-900">
                    {userData?.partnerStatus === "rejected"
                      ? "Application Rejected"
                      : "Application Under Review"}
                  </h2>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      userData?.partnerStatus === "rejected"
                        ? "bg-red-100 text-red-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {userData?.partnerStatus === "rejected"
                      ? "Rejected"
                      : "Pending Approval"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {userData?.partnerStatus === "rejected"
                    ? userData?.rejectionReason ||
                      "Your application was rejected. Please review and update your details above."
                    : "Your vehicle details, documents, and bank account have been submitted and are currently under review."}
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-400 text-center md:text-right shrink-0">
              Need changes? Click any completed step above to update.
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PartnerDashboard;
