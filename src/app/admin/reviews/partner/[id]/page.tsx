"use client";
import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import axios from "axios";
import {
  ArrowLeft,
  Bike,
  Car,
  CarTaxiFront,
  CheckCircle,
  CircleDashed,
  Clock,
  FileText,
  Landmark,
  Package,
  ShieldCheck,
  Truck,
  X,
  XCircle,
} from "lucide-react";
import { IVehicle } from "@/src/models/vehicle.model";
import AnimatedCard from "@/src/components/AnimatedCard";
import { IUser } from "@/src/models/user.model";
import { CgSpinner } from "react-icons/cg";
import DocPreview from "@/src/components/DocPreview";
import { IPartnerDocs } from "@/src/models/partnerDocs.model";
import { IPartnerBank } from "@/src/models/partnerBank.model";

interface PartnerReviewData {
  partner: IUser;
  vehicle: IVehicle;
  document: IPartnerDocs;
  bank: IPartnerBank;
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
  const [data, setData] = useState<PartnerReviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [vehicleDetails, setVehicleDetails] = useState<IVehicle | null>(null);
  const [partnerDocs, setPartnerDocs] = useState<IPartnerDocs | null>(null);
  const [partnerBank, setPartnerBank] = useState<IPartnerBank | null>(null);
  const [showApproved, setShowApproved] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvedLoading, setApprovedLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  const handleGetPartner = async () => {
    try {
      setLoading(true);
      setError(false);
      const res = await axios.get(`/api/admin/reviews/partner/${id}`);
      setData(res.data);
      setVehicleDetails(res.data.vehicle);
      setPartnerDocs(res.data.document);
      setPartnerBank(res.data.bank);
      if (res.data?.partner?.rejectionReason) {
        setRejectionReason(res.data.partner.rejectionReason);
      }
      console.log("Fetched partner review data:", res.data);
    } catch (err) {
      console.error("Error fetching partner review:", err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      handleGetPartner();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-3 text-gray-500">
        <CgSpinner className="w-8 h-8 animate-spin text-gray-700" />
        <p className="text-sm font-medium">Loading partner data...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <p className="text-base font-semibold text-red-600">
          Failed to load partner review data.
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-xl bg-black text-white text-sm font-medium hover:bg-neutral-800 transition-all cursor-pointer"
        >
          Go Back
        </button>
      </div>
    );
  }

  const handleApprove = async () => {
    setApprovedLoading(true);
    try {
      const { data } = await axios.get(
        `/api/admin/reviews/partner/${id}/approve`,
      );
      console.log(data);
      setApprovedLoading(false);
      if (data.status === 200) {
        setShowApproved(false);
        handleGetPartner();
      }
    } catch (error) {
      setApprovedLoading(false);
      console.log(error);
    }
  };

  const handleReject = async () => {
    setRejectLoading(true);
    try {
      const { data } = await axios.post(
        `/api/admin/reviews/partner/${id}/reject`,
        { rejectionReason },
      );
      console.log(data);
      setRejectLoading(false);
      if (data.status === 200) {
        setShowReject(false);
        handleGetPartner();
      }
    } catch (error) {
      setRejectLoading(false);
      console.log(error);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-gray-100 to-gray-200">
      <div className="sticky top-0 z-40 backdrop-blur-xl bg-white/70 border-b">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="flex-1">
            <div className="text-lg font-semibold text-gray-900">
              {data?.partner?.name
                ? data.partner.name.split(" ")[0]
                : "Partner"}
            </div>
            <div className="text-xs text-gray-500">
              {data?.partner?.email || "No email available"}
            </div>
          </div>
          {data?.partner?.partnerStatus === "approved" ? (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-green-100 text-green-700">
              <CheckCircle size={14} />
              Approved
            </div>
          ) : data?.partner?.partnerStatus === "rejected" ? (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-red-100 text-red-700">
              <XCircle size={14} />
              Rejected
            </div>
          ) : (
            <div className="px-4 py-2 rounded-full text-xs font-semibold inline-flex items-center gap-2 bg-yellow-100 text-yellow-700">
              <Clock size={14} />
              Pending
            </div>
          )}
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-8">
          <AnimatedCard
            title="Vehicle Details"
            icon={getVehicleIcon(data?.vehicle?.type)}
          >
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vehicle Type</span>
              <span className="font-semibold capitalize text-gray-900">
                {data?.vehicle?.type || "Not Added"}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Vehicle Model</span>
              <span className="font-semibold capitalize text-gray-900">
                {data?.vehicle?.vehicleModel || "Not Added"}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Registration Number</span>
              <span className="font-semibold capitalize text-gray-900">
                {data?.vehicle?.number || "Not Added"}
              </span>
            </div>
          </AnimatedCard>

          <AnimatedCard title="Documents" icon={<FileText size={18} />}>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              <DocPreview label="Aadhaar Front" url={partnerDocs?.aadharUrl} />
              <DocPreview
                label="Registration Certificate"
                url={partnerDocs?.rcUrl}
              />
              <DocPreview
                label="Driving License"
                url={partnerDocs?.licenseUrl}
              />
            </div>
          </AnimatedCard>
        </div>

        <div className="space-y-8">
          <AnimatedCard title="Bank Details" icon={<Landmark size={18} />}>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Account holder</span>
              <span className="font-semibold capitalize">
                {partnerBank?.accountHolder || "Not Added"}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Account number</span>
              <span className="font-semibold">
                {partnerBank?.accountNumber || "Not Added"}
              </span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-500">IFSC Code</span>
              <span className="font-semibold capitalize">
                {partnerBank?.ifsc || "Not Added"}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">UPI ID</span>
              <span className="font-semibold capitalize">
                {partnerBank?.upi || "Not Added"}
              </span>
            </div>
          </AnimatedCard>

          {data?.partner?.partnerStatus === "pending" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-white rounded-[32px] p-8 shadow-xl space-y-6"
            >
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck size={18} />
                Admin Check
              </div>
              <p className="text-sm text-gray-500">
                Verify documents Carefully before approving.
              </p>
              <div className="flex gap-4 flex-col">
                <button
                  className="py-3 rounded-2xl bg-linear-to-r from-black to-gray-800 text-white font-semibold hover:opacity-90 transition cursor-pointer"
                  onClick={() => setShowApproved(true)}
                >
                  Approve Partner
                </button>

                <button
                  className="py-3 rounded-2xl border font-semibold hover:bg-gray-100 transition cursor-pointer"
                  onClick={() => setShowReject(true)}
                >
                  Reject Partner
                </button>
              </div>
            </motion.div>
          )}

          {data?.partner?.partnerStatus === "rejected" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-red-50/80 border border-red-200 rounded-[32px] p-8 shadow-xl space-y-5"
            >
              <div className="flex items-center gap-2 font-semibold text-red-600 text-base">
                <XCircle size={20} />
                Partner Rejected
              </div>

              <div className="bg-white border border-red-100 rounded-2xl p-4 text-sm text-gray-800 space-y-1">
                <p className="text-xs uppercase tracking-wider font-semibold text-gray-500">
                  Reason for Rejection:
                </p>
                <p className="font-medium text-gray-900 whitespace-pre-line">
                  {data?.partner?.rejectionReason ||
                    rejectionReason ||
                    "No specific reason provided."}
                </p>
              </div>

              <div className="flex gap-3 flex-col pt-2">
                <button
                  className="py-3 rounded-2xl border border-red-300 font-semibold text-red-700 bg-white hover:bg-red-50 transition cursor-pointer text-sm"
                  onClick={() => setShowReject(true)}
                >
                  Update Rejection Reason
                </button>

                <button
                  className="py-3 rounded-2xl bg-linear-to-r from-black to-gray-800 text-white font-semibold hover:opacity-90 transition cursor-pointer text-sm"
                  onClick={() => setShowApproved(true)}
                >
                  Re-review & Approve Partner
                </button>
              </div>
            </motion.div>
          )}

          {data?.partner?.partnerStatus === "approved" && (
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -4 }}
              className="bg-green-50/80 border border-green-200 rounded-[32px] p-8 shadow-xl space-y-4"
            >
              <div className="flex items-center gap-2 font-semibold text-green-700 text-base">
                <CheckCircle size={20} />
                Partner Approved
              </div>
              <p className="text-sm text-gray-600">
                This partner has been verified and approved.
              </p>
            </motion.div>
          )}
        </div>
      </main>

      <AnimatePresence>
        {showApproved && (
          <motion.div
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Approved Partner</h2>
                <button
                  className="border rounded-full p-1 border-gray-400 bg-gray-100 hover:bg-gray-200 cursor-pointer transition"
                  onClick={() => setShowApproved(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                Confirm all information has been verified.
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 py-2 rounded-2xl border cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => setShowApproved(false)}
                >
                  cancel
                </button>
                <button
                  className="flex-1 py-2 rounded-2xl flex items-center justify-center gap-2 bg-linear-to-r from-black to-gray-800 text-white font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleApprove}
                  disabled={approvedLoading}
                >
                  {approvedLoading ? (
                    <CircleDashed className="w-5 h-5 animate-spin text-white" />
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
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl px-6 py-4 w-full max-w-sm shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Reject Partner</h2>
                <button
                  className="border border-gray-400 rounded-full p-1 bg-gray-100 hover:bg-gray-200 cursor-pointer transition"
                  onClick={() => setShowReject(false)}
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                <textarea
                  className="border rounded-xl w-full mt-3 p-3"
                  placeholder="Enter reason for rejection"
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </p>
              <div className="flex gap-3 mt-6">
                <button
                  className="flex-1 py-2 rounded-2xl border cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => setShowReject(false)}
                >
                  cancel
                </button>
                <button
                  className="flex-1 py-2 rounded-2xl flex items-center justify-center gap-2 bg-linear-to-r from-black to-gray-800 text-white font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={handleReject}
                  disabled={rejectLoading || !rejectionReason.trim()}
                >
                  {rejectLoading ? (
                    <CircleDashed className="w-5 h-5 animate-spin text-white" />
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
