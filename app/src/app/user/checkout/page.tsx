"use client";

import React, { Suspense, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Bike,
  Car,
  Clock,
  CreditCard,
  IndianRupee,
  MapPin,
  Navigation,
  ShieldCheck,
  Truck,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

const VEHICLE_META: Record<
  string,
  { label: string; Icon: React.ElementType; emoji: string }
> = {
  bike: { label: "Bike", Icon: Bike, emoji: "🏍️" },
  auto: { label: "Auto", Icon: Car, emoji: "🛺" },
  car: { label: "Car", Icon: Car, emoji: "🚗" },
  loading: { label: "Loading", Icon: Truck, emoji: "🚚" },
  truck: { label: "Truck", Icon: Truck, emoji: "🚛" },
};

type Status =
  | "idle"
  | "requested"
  | "awaiting_payment"
  | "rejected"
  | "expired"
  | "cancelled"
  | "payment"
  | "confirmed";

const CheckoutContent = () => {
  const router = useRouter();
  const params = useSearchParams();
  const [pickup, setPickup] = useState(params?.get("pickup") || "");
  const [drop, setDrop] = useState(params?.get("drop") || "");
  const mobile = params?.get("mobile") || "";
  const driverId = params?.get("driverId") || "";
  const model = params?.get("model") || "";
  const pickUpLat = Number(
    params?.get("pickUpLat") || params?.get("pickuplat") || 0,
  );
  const pickUpLon = Number(
    params?.get("pickUpLon") || params?.get("pickuplon") || 0,
  );
  const dropLat = Number(params?.get("dropLat") || params?.get("droplat") || 0);
  const dropLon = Number(params?.get("dropLon") || params?.get("droplon") || 0);
  const vehicle = params?.get("vehicle") || "";
  const fare = params?.get("fare") || "0";

  const vehicleKey = (vehicle || "").toLowerCase();
  const meta = VEHICLE_META[vehicleKey] || {
    label: vehicle ? vehicle.toUpperCase() : "Car",
    Icon: Car,
    emoji: "🚗",
  };
  const { Icon, label, emoji } = meta;

  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  return (
    <div className="min-h-screen bg-zinc-100 px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.button
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              onClick={() => router.back()}
              className="w-11 h-11 rounded-2xl bg-white border border-zinc-200 shadow-xs flex items-center justify-center text-zinc-900 hover:bg-zinc-50 transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </motion.button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="h-px w-6 bg-zinc-900" />
                <span className="text-[10px] font-black uppercase tracking-[0.2rem] text-zinc-400">
                  Booking
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-zinc-900">
                Checkout
              </h1>
              <p className="text-zinc-500 text-sm font-medium ml-1">
                Review your ride and confirm
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: 0.08,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)]"
          >
            <div className="h-1 bg-zinc-900" />
            <div className="p-8 sm:p-10">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.18rem] text-zinc-400 mb-1">
                    SelectedVehicle
                  </div>
                  <div className="text-3xl font-black tracking-tight text-zinc-900">
                    {vehicle}
                  </div>
                </div>
                <div className="w-16 h-16 bg-zinc-900 rounded-2xl flex items-center justify-center shadow-lg">
                  <Icon size={28} className="text-white" />
                </div>
              </div>

              <div className="bg-zinc-50 border border-zinc-100 rounded-2xl overflow-hidden mb-4">
                <div className="flex gap-4 px-5 py-4 border-b border-zinc-100">
                  <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                    <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white ring ring-zinc-300" />
                    <div
                      className="w-px flex bg-zinc-300 my-1"
                      style={{ minHeight: 12 }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-black uppercase tracking-[0.18rem] text-zinc-400 mb-0.5">
                      Pickup Location
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 leading-snug truncate">
                      {pickup}
                    </div>
                  </div>
                  <MapPin
                    size={14}
                    className="text-zinc-400 flex-shrink-0 mt-1"
                  />
                </div>
                <div className="flex gap-4 px-5 py-4 border-b border-zinc-100">
                  <div className="flex flex-col items-center flex-shrink-0 pt-0.5">
                    <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white ring ring-zinc-300" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[9px] font-black uppercase tracking-[0.18rem] text-zinc-400 mb-0.5">
                      Drop Location
                    </div>
                    <div className="text-sm font-semibold text-zinc-900 leading-snug truncate">
                      {drop}
                    </div>
                  </div>
                  <Navigation
                    size={14}
                    className="text-zinc-400 flex-shrink-0 mt-1"
                  />
                </div>
              </div>

              <div className="flex items-end justify-between pt-6 border-t border-zinc-100">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18rem] text-zinc-400 mb-1">
                    Total Fare
                  </p>
                  <p className="text-zinc-400 text-xs font-medium">
                    Includes base + distance Charges
                  </p>
                </div>
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                  className="flex items-baseline gap-1"
                >
                  <span className="text-zinc-400 text-lg font-black">
                    <IndianRupee />
                  </span>
                  <span className="text-zinc-900 text-5xl font-black tracking-tight leading-none">
                    {fare}
                  </span>
                </motion.div>
              </div>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: 0.14,
              duration: 0.5,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-[0_4px_24px_rgba(0,0,0,0.07)] flex flex-col"
          >
            <div className="h-1 bg-zinc-900" />
            {status === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3 }}
                className="p-8 sm:p-10 flex flex-col flex-1 justify-between"
              >
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.18rem] text-zinc-400 mb-1">
                    Ready to go
                  </p>
                  <h3 className="text-2xl font-black text-zinc-900 mb-6">
                    Confirm Your Ride
                  </h3>
                  <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-5 space-y-3">
                    {[
                      {
                        icon: <Clock size={14} />,
                        text: "Driver will respond within 2 minutes",
                      },
                      {
                        icon: <ShieldCheck size={14} />,
                        text: "Verified & insured drivers only",
                      },
                      {
                        icon: <CreditCard size={14} />,
                        text: "Pay after driver accepts",
                      },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-xl bg-zinc-200 flex items-center justify-center text-zinc-600 flex-shrink-0">
                          {item.icon}
                        </div>
                        <p className="text-zinc-700 text-xs font-medium">
                          {item.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-8 space-y-3">
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
                      {error}
                    </div>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.97 }}
                    whileHover={{ scale: 1.02 }}
                    className="group w-full py-4 rounded-2xl bg-zinc-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/15 hover:bg-black transition-all cursor-pointer"
                  >
                    <Zap size={16} className="text-amber-400 fill-amber-400" />

                    <span>Confirm & Request Ride</span>

                    <ArrowRight
                      size={16}
                      className="transition-transform duration-300 group-hover:translate-x-1"
                    />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense fallback={<div className="min-h-screen bg-zinc-100" />}>
      <CheckoutContent />
    </Suspense>
  );
};

export default Page;
