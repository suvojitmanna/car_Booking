"use client";
import React, { useEffect, useState } from "react";
import { IVehicle } from "../models/vehicle.model";
import { AnimatePresence, motion } from "motion/react";
import {
  ImagePlus,
  IndianRupee,
  X,
  Car,
  Trash2,
  Clock,
  Navigation,
  Sparkles,
  CircleDashed,
} from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";

type PropsType = {
  open: boolean;
  onClose: () => void;
  data?: IVehicle | null;
  onSuccess?: () => void;
};

const PricingMode = ({ open, onClose, data }: PropsType) => {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [baseFare, setBaseFare] = useState("");
  const [perKm, setPerKm] = useState("");
  const [waitingCharge, setWaitingCharge] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      if (data.baseFare !== undefined && data.baseFare !== null)
        setBaseFare(String(data.baseFare));
      const kmRate = data.pricePerKM ?? (data as any)?.perKm;
      if (kmRate !== undefined && kmRate !== null) setPerKm(String(kmRate));
      if (data.waitingCharge !== undefined && data.waitingCharge !== null)
        setWaitingCharge(String(data.waitingCharge));
      if (data.imageUrl) setPreview(data.imageUrl);
    }
  }, [data]);

  useEffect(() => {
    const fetchPricing = async () => {
      if (!open) return;
      try {
        const { data: res } = await axios.get(
          "/api/partner/onboarding/pricing",
        );
        if (res?.vehicle) {
          const v = res.vehicle;
          if (v.baseFare !== undefined && v.baseFare !== null)
            setBaseFare(String(v.baseFare));
          const kmRate = v.pricePerKM ?? v.perKm;
          if (kmRate !== undefined && kmRate !== null) setPerKm(String(kmRate));
          if (v.waitingCharge !== undefined && v.waitingCharge !== null)
            setWaitingCharge(String(v.waitingCharge));
          if (v.imageUrl) setPreview(v.imageUrl);
        }
      } catch (error) {
        console.log("Error fetching pricing:", error);
      }
    };
    fetchPricing();
  }, [open]);

  const handleImageChange = (file?: File) => {
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setImage(null);
    setPreview(null);
  };

  const handleSubmit = async () => {
    const formData = new FormData();
    try {
      setLoading(true);
      if (image) {
        formData.append("image", image);
      }
      formData.append("baseFare", baseFare);
      formData.append("perKm", perKm);
      formData.append("waitingCharge", waitingCharge);
      const res = await axios.post("/api/partner/onboarding/pricing", formData);
      if (res.status === 200 || res.data) {
        onClose();
      }
    } catch (error) {
      console.error("Error saving pricing:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-5 md:p-6"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 15 }}
            transition={{ type: "spring", duration: 0.35, bounce: 0.2 }}
            className="bg-white w-full max-w-lg md:max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[88vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-5 sm:px-6 py-4 sm:py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-neutral-100 flex items-center justify-center shrink-0">
                  <Sparkles size={18} className="text-black" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-gray-900 leading-tight truncate">
                    Pricing & Vehicle Photo
                  </h2>
                  <p className="text-xs text-gray-500 truncate">
                    Set your rates and upload vehicle photo
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full border border-gray-200 text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex items-center justify-center transition cursor-pointer shrink-0"
              >
                <X size={16} />
              </button>
            </div>

            <div className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
              {data && (
                <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-3 flex items-center gap-3 text-xs sm:text-sm">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center shrink-0">
                    <Car size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-gray-900 truncate">
                      {data.vehicleModel || "Registered Vehicle"}
                    </p>
                    <p className="text-gray-500 font-mono text-[11px] truncate uppercase">
                      {data.number} • {data.type}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-800 mb-1.5">
                  Vehicle Exterior Photo
                </label>
                <label
                  htmlFor="imagelabel"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    if (e.dataTransfer.files?.[0]) {
                      handleImageChange(e.dataTransfer.files[0]);
                    }
                  }}
                  className={`relative h-40 sm:h-48 w-full border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                    isDragging
                      ? "border-black bg-neutral-50 scale-[0.99]"
                      : preview
                        ? "border-neutral-200 bg-neutral-900"
                        : "border-gray-200 hover:border-gray-400 bg-gray-50/60 hover:bg-gray-50"
                  }`}
                >
                  {!preview ? (
                    <div className="flex flex-col items-center gap-2 p-4 text-center">
                      <div className="w-11 h-11 rounded-full bg-white border border-gray-200 shadow-xs flex items-center justify-center text-gray-600">
                        <ImagePlus size={22} />
                      </div>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-gray-800">
                          Upload vehicle photo
                        </p>
                        <p className="text-[11px] text-gray-400 mt-0.5">
                          Drag and drop or browse (PNG, JPG, WebP)
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <img
                        src={preview}
                        alt="Vehicle preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="bg-white/90 text-black text-xs font-semibold px-3 py-1.5 rounded-full shadow">
                          Change Photo
                        </span>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 transition"
                          title="Remove image"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </>
                  )}

                  <input
                    id="imagelabel"
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        handleImageChange(e.target.files[0]);
                      }
                    }}
                  />
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-3.5">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-700">
                      Base Fare
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">
                      Flat Rate
                    </span>
                  </div>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition shadow-2xs">
                    <IndianRupee size={15} className="text-gray-400 shrink-0" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 50"
                      value={baseFare}
                      onChange={(e) => setBaseFare(e.target.value)}
                      className="w-full outline-none text-sm text-gray-900 font-medium placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Navigation size={11} className="text-gray-400" />
                      Per KM
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">
                      / km
                    </span>
                  </div>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition shadow-2xs">
                    <IndianRupee size={15} className="text-gray-400 shrink-0" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 15"
                      value={perKm}
                      onChange={(e) => setPerKm(e.target.value)}
                      className="w-full outline-none text-sm text-gray-900 font-medium placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                      <Clock size={11} className="text-gray-400" />
                      Waiting
                    </label>
                    <span className="text-[10px] text-gray-400 font-medium">
                      / min
                    </span>
                  </div>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus-within:border-black focus-within:ring-2 focus-within:ring-black/10 transition shadow-2xs">
                    <IndianRupee size={15} className="text-gray-400 shrink-0" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      placeholder="e.g. 2"
                      value={waitingCharge}
                      onChange={(e) => setWaitingCharge(e.target.value)}
                      className="w-full outline-none text-sm text-gray-900 font-medium placeholder:text-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 sm:px-6 py-3.5 sm:py-4 border-t border-gray-100 flex items-center gap-3 bg-gray-50/70 shrink-0">
              <button
                type="button"
                className="flex-1 sm:flex-none sm:min-w-[110px] border border-gray-300 hover:bg-gray-100 active:scale-98 text-gray-700 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="button"
                className="flex-1 bg-black hover:bg-neutral-800 active:scale-98 text-white px-5 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition cursor-pointer shadow-sm flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-70"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <CircleDashed size={14} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save & Continue"
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PricingMode;
