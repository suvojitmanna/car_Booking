"use client";
import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import axios from "axios";
import Image from "next/image";
import { CheckCircle2, Clock, Truck, User, Video, XCircle } from "lucide-react";
import Kpi from "./Kpi";
import TabButton from "./TabButton";
import { AnimatePresence } from "motion/react";
import ContainList from "./ContainList";

type Stats = {
  totalPartners: number;
  totalApprovePartners: number;
  totalPendingPartners: number;
  totalRejectPartners: number;
};
type Tab = "partner" | "kyc" | "vehicle";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState<Tab>("partner");
  const [partnerReview, setPartnerReview] = useState<any>([]);
  const [pendingKycReview, setPendingKycReview] = useState<any>([]);
  const [vehicleReview, setVehicleReview] = useState<any>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const handleGetData = async () => {
    try {
      const { data } = await axios.get("/api/admin/dashboard");
      setStats(data.stats);
      setPartnerReview(data.pendingPartnersReviews);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    handleGetData();
  }, []);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-100 to-gray-200">
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b z-40">
        <div className="max-w-7xl mx-auto h-16 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={"/logo.jpeg"}
              alt={"logo"}
              width={40}
              height={40}
              priority
            />
          </div>
          <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-black text-white">
            <User size={14} />
            Admin Dashboard
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-16">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Kpi
            label="Total Partners"
            value={stats?.totalPartners}
            icon={<User />}
            variant={"totalPartners"}
          />
          <Kpi
            label="Total Approved Partners"
            value={stats?.totalApprovePartners}
            icon={<CheckCircle2 />}
            variant={"approved"}
          />
          <Kpi
            label="Total Pending Partners"
            value={stats?.totalPendingPartners}
            icon={<Clock />}
            variant={"pending"}
          />
          <Kpi
            label="Total Reject Partners"
            value={stats?.totalRejectPartners}
            icon={<XCircle />}
            variant={"rejected"}
          />
        </div>

        <div className="bg-white rounded-2xl p-2 shadow-lg border border-gray-100 flex flex-wrap gap-2">
          <TabButton
            active={activeTab === "partner"}
            count={partnerReview?.length || 0}
            icon={<User size={15} />}
            onClick={() => {
              setActiveTab("partner");
            }}
          >
            partner Reviews
          </TabButton>
          <TabButton
            active={activeTab === "kyc"}
            count={pendingKycReview?.length || 0}
            icon={<Video size={15} />}
            onClick={() => {
              setActiveTab("kyc");
            }}
          >
            Pending Video kyc
          </TabButton>
          <TabButton
            active={activeTab === "vehicle"}
            count={vehicleReview?.length || 0}
            icon={<Truck size={15} />}
            onClick={() => {
              setActiveTab("vehicle");
            }}
          >
            vehicle Reviews
          </TabButton>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            className="space-y-3"
          >
            {activeTab === "partner" && (
              <ContainList data={partnerReview ?? []} type={"partner"} />
            )}
            {activeTab === "kyc" && (
              <ContainList data={pendingKycReview ?? []} type={"kyc"} />
            )}
            {activeTab === "vehicle" && (
              <ContainList data={vehicleReview ?? []} type={"vehicle"} />
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

export default AdminDashboard;
