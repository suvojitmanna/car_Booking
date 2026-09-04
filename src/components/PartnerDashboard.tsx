"use client";

import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { setUserData } from "../redux/userSlice";
import axios from "axios";
import { motion } from "motion/react";
import { Check, Lock, Clock, XCircle, Video } from "lucide-react";
import { useRouter } from "next/navigation";
import RejectionCard from "./RejectionCard";
import StatusCard from "./StatusCard";
import ActionCard from "./ActionCard";

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
  const dispatch = useDispatch();
  const [requestLoading,setRequestLoading] = useState(false)

  const { userData } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchLatestUser = async () => {
      try {
        const { data } = await axios.get(`/api/user/me?t=${Date.now()}`);
        if (data) {
          dispatch(setUserData(data));
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };
    fetchLatestUser();

    const interval = setInterval(fetchLatestUser, 3500);
    return () => clearInterval(interval);
  }, [dispatch]);

  useEffect(() => {
    if (!userData) return;

    if (userData.partnerStatus === "rejected") {
      setActiveStep(4);
    } else if (
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

  const handleRequestVideoKyc = async () => {
    try {
      setRequestLoading(true);
      const res = await axios.get("/api/partner/videokyc/request");
      if (res.status === 200) {
        const { data } = await axios.get(`/api/user/me?t=${Date.now()}`);
        if (data) {
          dispatch(setUserData(data));
        }
      }
    } catch (error) {
      console.error("Error requesting video KYC:", error);
    } finally {
      setRequestLoading(false);
    }
  };

  const progressPercentage = ((activeStep - 1) / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200 px-4 pt-28 pb-20">
      <div className="max-w-7xl mx-auto space-y-13">
        <div>
          <h1 className="text-4xl font-bold">Partner Onboarding</h1>

          <p className="text-gray-600 mt-1">
            Complete all the following steps to get your account activated
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

        {userData?.partnerStatus === "rejected" && (
          <RejectionCard
            title="Partner Application Rejected"
            reason={userData?.rejectionReason}
            actionLabel="Review and update Application"
            onAction={() => {
              router.push("/partner/onboarding/vehicle");
            }}
          />
        )}

        {activeStep == 4 && userData?.partnerStatus === "pending" && (
          <StatusCard
            icon={<Clock size={20} />}
            title="Application Pending"
            message="Your application is currently under review. We will notify you once it is approved."
          />
        )}

        {activeStep == 5 &&
          (userData?.videoKycStatus === "approved" ? (
            <StatusCard
              icon={<Check size={18} />}
              title={"Video KYC Approved"}
              message={"You can now proceed to pricing"}
            />
          ) : userData?.videoKycStatus === "rejected" ? (
            <RejectionCard
              title="Video KYC Rejected"
              reason={userData?.videoKycRejectionReason}
              actionLabel={requestLoading ? "Requesting..." : "Request Again"}
              onAction={handleRequestVideoKyc}
            />
          ) : userData?.videoKycStatus === "in_progress" &&
            userData.videoKycRoomId ? (
            <ActionCard
              icon={<Video size={18} />}
              title={"Admin started Video Kyc"}
              button={"Join Call"}
              onClick={() =>
                router.push(`/video-kyc/${userData.videoKycRoomId}`)
              }
            />
          ) : (
            <StatusCard
              icon={<Clock size={18} />}
              title={"Waiting for admin"}
              message={"Admin will initiate video KYC shortly."}
            />
          ))}
      </div>
    </div>
  );
};

export default PartnerDashboard;
