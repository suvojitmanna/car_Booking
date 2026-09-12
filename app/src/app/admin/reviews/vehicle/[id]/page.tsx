"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "motion/react";
import axios from "axios";
import {
  ArrowLeft,
  Bike,
  Car,
  CarTaxiFront,
  CheckCircle,
  CircleDashed,
  Clock,
  ImageIcon,
  Package,
  ShieldCheck,
  Truck,
  User,
  X,
  XCircle,
} from "lucide-react";
import { CgSpinner } from "react-icons/cg";
import AnimatedCard from "@/src/components/AnimatedCard";
import { IUser } from "@/src/models/user.model";
import { VehicleType } from "@/src/models/vehicle.model";

interface IVehicle {
  _id: string;
  owner: IUser;
  type: VehicleType;
  vehicleModel: string;
  number: string;
  imageUrl?: string;
  baseFare?: number;
  pricePerKM?: number;
  waitingCharge?: number;
  status: "approved" | "pending" | "rejected";
  rejectionReason?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const getVehicleIcon = (type?: string, size = 18) => {
  switch (type?.toLowerCase()) {
    case "bike":
      return <Bike size={size} />;
    case "truck":
      return <Truck size={size} />;
    case "loading":
      return <Package size={size} />;
    case "auto":
      return <CarTaxiFront size={size} />;
    case "car":
    default:
      return <Car size={size} />;
  }
};

const Page = () => {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState<IVehicle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [showApproved, setShowApproved] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const load = async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(false);
      const result = await axios.get(`/api/admin/reviews/vehicles/${id}`);
      const vehicleData = result.data.vehicle || result.data;
      setData(vehicleData);
      if (vehicleData?.rejectionReason) {
        setRejectionReason(vehicleData.rejectionReason);
      }
    } catch (err) {
      console.error("Error fetching vehicle details:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleApprove = async () => {
    setApprovedLoading(true);
    try {
      const res = await axios.get(`/api/admin/reviews/vehicles/${id}/approve`);
      if (res.status === 200 || res.data?.status === 200) {
        setShowApproved(false);
        load();
      }
    } catch (err) {
      console.error("Error approving vehicle:", err);
    } finally {
      setApprovedLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) return;
    setRejectLoading(true);
    try {
      const res = await axios.post(`/api/admin/reviews/vehicles/${id}/reject`, {
        reason: rejectionReason.trim(),
        rejectionReason: rejectionReason.trim(),
      });
      if (res.status === 200 || res.data?.status === 200) {
        setShowReject(false);
        load();
      }
    } catch (err) {
      console.error("Error rejecting vehicle:", err);
    } finally {
      setRejectLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-gray-500 bg-gray-50">
        <CgSpinner className="w-8 h-8 animate-spin text-gray-700" />
        <p className="text-sm font-medium">Loading vehicle details...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4 bg-gray-50">
        <p className="text-base font-semibold text-red-600">
          Failed to load vehicle review data.
        </p>
        <button
          onClick={() => router.back()}
          className="px-5 py-2.5 rounded-xl bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-all cursor-pointer shadow-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-50 to-gray-100 pb-16">
      {/* Top Navbar */}
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all cursor-pointer"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <div className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span>{data?.vehicleModel || "Vehicle Review"}</span>
                <span className="text-xs font-mono font-semibold uppercase bg-gray-900 text-white px-2.5 py-0.5 rounded-md">
                  {data?.number}
                </span>
              </div>
              <div className="text-xs text-gray-500">
                Owner: {data?.owner?.name || "Partner"} (
                {data?.owner?.email || "No email"})
              </div>
            </div>
          </div>

          {/* Status Badge */}
          {data?.status === "approved" ? (
            <div className="px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-green-100 text-green-700 border border-green-200">
              <CheckCircle size={14} />
              Approved
            </div>
          ) : data?.status === "rejected" ? (
            <div className="px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-red-100 text-red-700 border border-red-200">
              <XCircle size={14} />
              Rejected
            </div>
          ) : (
            <div className="px-4 py-1.5 rounded-full text-xs font-semibold inline-flex items-center gap-1.5 bg-amber-100 text-amber-700 border border-amber-200">
              <Clock size={14} />
              Pending Review
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-3xl overflow-hidden shadow-xl bg-white border border-gray-100 relative group"
          >
            {data?.imageUrl ? (
              <div className="relative w-full h-[420px] bg-neutral-900 overflow-hidden">
                <img
                  src={data.imageUrl}
                  alt={data.vehicleModel || "Vehicle Image"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                />
                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-black/20" />
                <div className="absolute bottom-5 left-6 text-white space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium backdrop-blur-md bg-white/20 border border-white/30 capitalize">
                    {getVehicleIcon(data.type, 14)}
                    {data.type}
                  </div>
                  <h1 className="text-2xl font-bold tracking-tight drop-shadow-md">
                    {data.vehicleModel}
                  </h1>
                  <p className="text-sm text-gray-200 font-mono drop-shadow">
                    Reg. No: {data.number}
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-[320px] flex flex-col items-center justify-center text-gray-400 bg-gray-50 border-b gap-2">
                <ImageIcon size={42} className="text-gray-300 stroke-1" />
                <p className="text-sm font-medium">No vehicle photo uploaded</p>
              </div>
            )}
          </motion.div>

          <AnimatedCard
            title="Vehicle Specifications & Fare Rates"
            icon={getVehicleIcon(data?.type)}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Type
                </span>
                <span className="text-sm font-semibold capitalize text-gray-900 flex items-center gap-1.5">
                  {getVehicleIcon(data?.type, 16)}
                  {data?.type || "Not Specified"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vehicle Model
                </span>
                <span className="text-sm font-semibold capitalize text-gray-900">
                  {data?.vehicleModel || "Not Specified"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Number Plate
                </span>
                <span className="text-sm font-mono font-bold uppercase text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
                  {data?.number || "Not Specified"}
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-gray-50 rounded-2xl border border-gray-100">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Active Status
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {data?.isActive ? (
                    <span className="text-green-600 font-medium">Active</span>
                  ) : (
                    <span className="text-gray-400 font-medium">Inactive</span>
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-amber-50/70 rounded-2xl border border-amber-100">
                <span className="text-xs font-medium text-amber-800 uppercase tracking-wider">
                  Base Fare
                </span>
                <span className="text-base font-bold text-amber-950">
                  ₹{data?.baseFare ?? 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-emerald-50/70 rounded-2xl border border-emerald-100">
                <span className="text-xs font-medium text-emerald-800 uppercase tracking-wider">
                  Price / KM
                </span>
                <span className="text-base font-bold text-emerald-950">
                  ₹{data?.pricePerKM ?? 0}
                </span>
              </div>

              <div className="flex justify-between items-center p-3.5 bg-blue-50/70 rounded-2xl border border-blue-100 sm:col-span-2">
                <span className="text-xs font-medium text-blue-800 uppercase tracking-wider">
                  Waiting Charge (per min)
                </span>
                <span className="text-base font-bold text-blue-950">
                  ₹{data?.waitingCharge ?? 0}
                </span>
              </div>
            </div>
          </AnimatedCard>
        </div>

        <div className="space-y-6">
          <AnimatedCard title="Partner Details" icon={<User size={18} />}>
            <div className="flex items-center gap-3.5 pb-4 border-b border-gray-100">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-900 text-white font-bold flex items-center justify-center text-base shadow-sm">
                {data?.owner?.profilePicture ? (
                  <img
                    src={data.owner.profilePicture}
                    alt={data.owner.name || "Partner"}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (data?.owner?.name?.[0] || "P").toUpperCase()
                )}
              </div>
              <div className="overflow-hidden">
                <div className="font-semibold text-gray-900 truncate">
                  {data?.owner?.name || "Unknown Partner"}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {data?.owner?.email}
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Mobile</span>
                <span className="font-medium text-gray-900">
                  {data?.owner?.mobileNumber || "Not Provided"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Partner Status</span>
                <span className="font-semibold capitalize text-gray-900">
                  {data?.owner?.partnerStatus || "Pending"}
                </span>
              </div>

              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Onboarding Step</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-0.5 rounded font-semibold text-gray-700">
                  Step {data?.owner?.partnerOnBoardingSteps ?? 0} of 7
                </span>
              </div>
            </div>
          </AnimatedCard>

          {data?.status === "pending" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -2 }}
              className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100 space-y-5"
            >
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <ShieldCheck size={20} className="text-gray-800" />
                Admin Verification
              </div>
              <p className="text-xs text-gray-500 leading-relaxed">
                Review vehicle specifications, registration number, and fare
                pricing carefully before approving this vehicle.
              </p>
              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => setShowApproved(true)}
                  className="w-full py-3 rounded-2xl bg-black hover:bg-neutral-800 text-white font-semibold text-sm transition-all shadow-md cursor-pointer"
                >
                  Approve Vehicle
                </button>

                <button
                  onClick={() => setShowReject(true)}
                  className="w-full py-3 rounded-2xl border border-red-200 bg-red-50/50 hover:bg-red-50 text-red-600 font-semibold text-sm transition-all cursor-pointer"
                >
                  Reject Vehicle
                </button>
              </div>
            </motion.div>
          )}

          {data?.status === "rejected" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50/90 border border-red-200 rounded-3xl p-6 shadow-xl space-y-4"
            >
              <div className="flex items-center gap-2 font-bold text-red-700 text-base">
                <XCircle size={20} />
                Vehicle Rejected
              </div>

              <div className="bg-white border border-red-100 rounded-2xl p-4 text-sm space-y-1">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                  Reason for Rejection:
                </p>
                <p className="font-medium text-gray-900 whitespace-pre-line">
                  {data?.rejectionReason ||
                    rejectionReason ||
                    "No specific reason provided."}
                </p>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  onClick={() => setShowReject(true)}
                  className="w-full py-2.5 rounded-xl border border-red-300 font-semibold text-red-700 bg-white hover:bg-red-50 text-xs transition cursor-pointer"
                >
                  Update Rejection Reason
                </button>
                <button
                  onClick={() => setShowApproved(true)}
                  className="w-full py-2.5 rounded-xl bg-black hover:bg-neutral-800 text-white font-semibold text-xs transition shadow-sm cursor-pointer"
                >
                  Re-review & Approve Vehicle
                </button>
              </div>
            </motion.div>
          )}

          {data?.status === "approved" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50/90 border border-green-200 rounded-3xl p-6 shadow-xl space-y-3"
            >
              <div className="flex items-center gap-2 font-bold text-green-800 text-base">
                <CheckCircle size={20} />
                Vehicle Approved
              </div>
              <p className="text-xs text-green-700 leading-relaxed">
                This vehicle has been verified and approved. It is now active
                for rides on the platform.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showApproved && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowApproved(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Approve Vehicle
                </h2>
                <button
                  className="rounded-full p-1.5 bg-gray-100 hover:bg-gray-200 cursor-pointer transition text-gray-600"
                  onClick={() => setShowApproved(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Are you sure you want to approve this vehicle? It will be marked
                as verified and ready for bookings.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-semibold text-sm text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => setShowApproved(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-black hover:bg-neutral-800 text-white font-semibold text-sm shadow cursor-pointer disabled:opacity-50"
                  onClick={handleApprove}
                  disabled={approvedLoading}
                >
                  {approvedLoading ? (
                    <CircleDashed className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    "Confirm Approve"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showReject && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowReject(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl border border-gray-100"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">
                  Reject Vehicle
                </h2>
                <button
                  className="rounded-full p-1.5 bg-gray-100 hover:bg-gray-200 cursor-pointer transition text-gray-600"
                  onClick={() => setShowReject(false)}
                >
                  <X size={16} />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Please provide a detailed reason for rejecting this vehicle. The
                partner will see this reason.
              </p>
              <textarea
                className="border border-gray-200 rounded-xl w-full mt-4 p-3 text-sm focus:outline-hidden focus:ring-2 focus:ring-black transition"
                rows={4}
                placeholder="e.g. Incorrect registration number or missing valid insurance."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-semibold text-sm text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => setShowReject(false)}
                >
                  Cancel
                </button>
                <button
                  className="flex-1 py-2.5 rounded-xl flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold text-sm shadow cursor-pointer disabled:opacity-50"
                  onClick={handleReject}
                  disabled={rejectLoading || !rejectionReason.trim()}
                >
                  {rejectLoading ? (
                    <CircleDashed className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    "Confirm Reject"
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Page;
