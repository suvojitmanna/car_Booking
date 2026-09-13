"use client";

import React, { Suspense, useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowLeft,
  ArrowRight,
  Banknote,
  Bike,
  Car,
  CheckCircle,
  Clock,
  CreditCard,
  IndianRupee,
  Loader2,
  MapPin,
  Navigation,
  ShieldCheck,
  Truck,
  Wallet,
  XCircle,
  Zap,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";

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
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "online">("cash");
  const mobile = params?.get("mobile") || "";
  const driverId = params?.get("driverId") || "";
  const vehicleId = params?.get("vehicleId") || "";
  const model = params?.get("model") || "";

  const pickUpLat = Number(
    params?.get("pickuplat") ||
      params?.get("pickupLat") ||
      params?.get("pickUpLat") ||
      0,
  );

  const pickUpLon = Number(
    params?.get("pickuplon") ||
      params?.get("pickupLon") ||
      params?.get("pickUpLon") ||
      0,
  );

  const dropLat = Number(
    params?.get("droplat") ||
      params?.get("dropLat") ||
      params?.get("drop_lat") ||
      0,
  );

  const dropLon = Number(
    params?.get("droplon") ||
      params?.get("dropLon") ||
      params?.get("drop_lon") ||
      0,
  );

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
  const [Booking, setBooking] = useState<any | null>(null);

  const handleBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await axios.post("/api/booking/create", {
        driver: driverId,
        vehicleId: vehicleId || model,
        pickUpAddress: pickup || "Pickup Location",
        dropAddress: drop || "Drop Location",
        pickupLocation: {
          type: "Point",
          coordinates: [
            pickUpLon && !isNaN(pickUpLon) ? pickUpLon : 88.3639,
            pickUpLat && !isNaN(pickUpLat) ? pickUpLat : 22.5726,
          ],
        },
        dropLocation: {
          type: "Point",
          coordinates: [
            dropLon && !isNaN(dropLon) ? dropLon : 88.3639,
            dropLat && !isNaN(dropLat) ? dropLat : 22.5726,
          ],
        },
        fare: Number(fare) || 0,
        userMobileNumber: mobile || "",
      });

      if (data?.bookingStatus) {
        setBooking(data?.booking || data);
        setStatus(data.bookingStatus as Status);
      } else {
        setBooking(data?.booking || data);
        setStatus("requested");
      }
    } catch (err: any) {
      console.error("Booking error:", err);
      const message =
        err?.response?.data?.message || "Failed to create booking request.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveBooking = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get("/api/booking/active");
      if (data.booking) {
        setBooking(data.booking);
        setStatus(data.booking.bookingStatus as Status);
      }
      setLoading(false);
    } catch (error) {
      console.log(error);
    }
  };

  const cancelBooking = async (id?: string) => {
    const targetId = id || Booking?._id;
    if (!targetId) {
      setStatus("idle");
      setBooking(null);
      return;
    }
    try {
      setLoading(true);
      await axios.get(`/api/booking/${targetId}/cancel`);
      setStatus("idle");
      setBooking(null);
    } catch (error) {
      console.log(error);
      setStatus("idle");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    try {
      setLoading(true);
      setError(null);
      if (Booking?._id) {
        try {
          await axios.post(`/api/booking/${Booking._id}/payment`, {
            paymentMethod,
          });
        } catch (e) {
          console.log("Payment update note:", e);
        }
      }
      setStatus("confirmed");
    } catch (err: any) {
      console.error("Payment error:", err);
      setError(err?.response?.data?.message || "Failed to confirm payment.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActiveBooking();
  }, []);

  useEffect(() => {
    if (status !== "awaiting_payment") return;
    const t = setTimeout(() => {
      setStatus("payment");
    }, 2000);
    return () => clearTimeout(t);
  }, [status]);

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
            <div className="p-6 sm:p-8 md:p-10">
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
            <AnimatePresence mode="wait">
              {status === "idle" && (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="p-6 sm:p-8 md:p-10 flex flex-col flex-1 justify-between min-h-[380px] sm:min-h-[420px]"
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
                      disabled={loading}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={handleBooking}
                      className="group w-full py-4 rounded-2xl bg-zinc-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/15 hover:bg-black transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2
                            size={16}
                            className="animate-spin text-white"
                          />
                          <span>Creating Request...</span>
                        </>
                      ) : (
                        <>
                          <Zap
                            size={16}
                            className="text-amber-400 fill-amber-400"
                          />
                          <span>Confirm & Request Ride</span>
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {status == "requested" && (
                <motion.div
                  key="requested"
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.35 }}
                  className="p-6 sm:p-8 md:p-10 flex flex-col flex-1 items-center justify-center gap-5 sm:gap-6 text-center min-h-[380px] sm:min-h-[420px] lg:min-h-full"
                >
                  <div className="relative flex items-center justify-center my-1 sm:my-2">
                    <motion.div
                      animate={{
                        scale: [1, 1.6, 2.1],
                        opacity: [0.35, 0.15, 0],
                      }}
                      transition={{
                        duration: 2.2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-zinc-900 pointer-events-none"
                    />
                    <motion.div
                      animate={{ scale: [1, 1.3, 1.6], opacity: [0.4, 0.2, 0] }}
                      transition={{
                        duration: 2.2,
                        delay: 0.5,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="absolute w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-zinc-900 pointer-events-none"
                    />
                    <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-zinc-100 border-2 border-zinc-200 flex items-center justify-center shadow-xs">
                      <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 text-zinc-900 animate-spin" />
                    </div>
                  </div>

                  <div className="space-y-2 max-w-[280px] sm:max-w-xs mx-auto">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 border border-zinc-200/80 text-[10px] sm:text-xs font-bold text-zinc-600 tracking-wider uppercase">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-zinc-900 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-zinc-900" />
                      </span>
                      <span>Broadcasting Request</span>
                    </div>
                    <h3 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
                      Finding Your Driver
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm font-medium leading-relaxed">
                      Waiting for nearby drivers to accept your ride request...
                    </p>
                  </div>

                  <div className="w-full max-w-[280px] sm:max-w-xs bg-zinc-50 border border-zinc-100 rounded-2xl p-3 sm:p-3.5 flex items-center justify-between text-left">
                    <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center flex-shrink-0">
                        <Icon size={16} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Vehicle
                        </div>
                        <div className="text-xs font-bold text-zinc-900 capitalize truncate">
                          {vehicle || "Ride"}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end flex-shrink-0">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Fare
                      </div>
                      <div className="text-xs font-black text-zinc-900">
                        ₹{fare}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    disabled={loading}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => cancelBooking()}
                    className="w-full max-w-[280px] sm:max-w-xs flex items-center justify-center gap-2 text-xs font-bold text-zinc-400 hover:text-zinc-900 transition-colors border border-zinc-200 hover:border-zinc-400 bg-white hover:bg-zinc-50 px-4 py-2.5 sm:py-3 rounded-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <Loader2
                        size={15}
                        className="animate-spin text-zinc-900"
                      />
                    ) : (
                      <XCircle size={15} />
                    )}
                    <span>{loading ? "Cancelling..." : "Cancel Booking"}</span>
                  </motion.button>
                </motion.div>
              )}

              {status == "awaiting_payment" && (
                <motion.div
                  key="awaiting_payment"
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.35 }}
                  className="p-6 sm:p-8 md:p-10 flex flex-col flex-1 items-center justify-center gap-6 text-center min-h-[380px] sm:min-h-[420px] lg:min-h-full"
                >
                  <div className="relative flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.5, 1.8], opacity: [0.3, 0.1, 0] }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeOut",
                      }}
                      className="absolute w-24 h-24 rounded-full bg-emerald-500/20 pointer-events-none"
                    />
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 18,
                      }}
                      className="relative w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 flex items-center justify-center shadow-md shadow-emerald-500/10"
                    >
                      <CheckCircle size={36} className="text-emerald-600" />
                    </motion.div>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[10px] sm:text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      <span>Driver Matched</span>
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
                      Driver Accepted!
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm font-medium mt-1">
                      Redirecting to payment options...
                    </p>
                  </div>
                  <div className="w-52 h-2 bg-zinc-100 rounded-full overflow-hidden border border-zinc-200/50">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2, ease: "easeInOut" }}
                      className="h-full bg-zinc-900 rounded-full"
                    />
                  </div>
                </motion.div>
              )}

              {status == "payment" && (
                <motion.div
                  key="payment"
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="p-6 sm:p-8 md:p-10 flex flex-col flex-1 justify-between min-h-[380px] sm:min-h-[420px] lg:min-h-full"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="h-px w-5 bg-zinc-900" />
                        <span className="text-[10px] font-black uppercase tracking-[0.18rem] text-zinc-400">
                          Almost There
                        </span>
                      </div>
                      <div className="text-xs font-bold text-zinc-600 bg-zinc-100 border border-zinc-200/80 px-2.5 py-0.5 rounded-full">
                        ₹{fare} Due
                      </div>
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
                      Select Payment Method
                    </h3>
                    <p className="text-zinc-400 text-xs font-medium mt-1">
                      Choose how you'd like to pay for your ride
                    </p>

                    <div className="space-y-3 my-5">
                      {[
                        {
                          id: "cash",
                          Icon: Banknote,
                          title: "Cash",
                          sub: "Pay driver directly after ride",
                          tag: "Pay Later",
                        },
                        {
                          id: "online",
                          Icon: Wallet,
                          title: "Online Payment",
                          sub: "UPI, Cards, Net-banking & Wallets",
                          tag: "Fast & Secure",
                        },
                      ].map((p) => {
                        const isActive = paymentMethod === p.id;
                        return (
                          <motion.div
                            key={p.id}
                            whileTap={{ scale: 0.98 }}
                            whileHover={{ scale: 1.01 }}
                            onClick={() => {
                              setPaymentMethod(p.id as "cash" | "online");
                              setError(null);
                            }}
                            className={`group w-full flex items-center gap-3.5 sm:gap-4 p-4 rounded-2xl border-2 text-left transition-all duration-200 cursor-pointer ${
                              isActive
                                ? "bg-zinc-900 border-zinc-900 text-white shadow-lg shadow-zinc-900/15"
                                : "bg-zinc-50 border-zinc-200/80 hover:border-zinc-300 hover:bg-zinc-100/70 text-zinc-900"
                            }`}
                          >
                            <div
                              className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors duration-200 ${
                                isActive
                                  ? "bg-white text-zinc-900 shadow-xs"
                                  : "bg-zinc-200 text-zinc-600 group-hover:bg-zinc-300/80"
                              }`}
                            >
                              <p.Icon size={20} />
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p
                                  className={`text-sm font-bold tracking-tight ${
                                    isActive ? "text-white" : "text-zinc-900"
                                  }`}
                                >
                                  {p.title}
                                </p>
                                <span
                                  className={`text-[9px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider ${
                                    isActive
                                      ? "bg-zinc-800 text-zinc-300 border border-zinc-700"
                                      : "bg-zinc-200/80 text-zinc-500 border border-zinc-200"
                                  }`}
                                >
                                  {p.tag}
                                </span>
                              </div>
                              <p
                                className={`text-xs font-medium leading-snug truncate ${
                                  isActive ? "text-zinc-300" : "text-zinc-400"
                                }`}
                              >
                                {p.sub}
                              </p>
                            </div>

                            <div className="flex-shrink-0">
                              <div
                                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isActive
                                    ? "border-white bg-white"
                                    : "border-zinc-300 bg-transparent"
                                }`}
                              >
                                {isActive && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-zinc-900" />
                                )}
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="bg-zinc-50 border border-zinc-100 rounded-2xl p-3.5 flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-zinc-200/80 flex items-center justify-center text-zinc-700 flex-shrink-0">
                          <ShieldCheck size={16} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                            Trip Fare
                          </div>
                          <div className="text-xs font-semibold text-zinc-700 truncate">
                            {paymentMethod === "cash"
                              ? "Pay exact cash to driver after trip"
                              : "Encrypted & secure online payment"}
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 pl-2">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                          Amount
                        </div>
                        <div className="text-sm font-black text-zinc-900">
                          ₹{fare}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-xs font-semibold rounded-xl">
                        {error}
                      </div>
                    )}

                    <motion.button
                      disabled={loading}
                      whileTap={{ scale: 0.97 }}
                      whileHover={{ scale: 1.02 }}
                      onClick={handleConfirmPayment}
                      className="group w-full py-4 rounded-2xl bg-zinc-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/15 hover:bg-black transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <>
                          <Loader2
                            size={16}
                            className="animate-spin text-white"
                          />
                          <span>Processing...</span>
                        </>
                      ) : paymentMethod === "cash" ? (
                        <>
                          <Banknote size={17} className="text-emerald-400" />
                          <span>Confirm Cash Booking (₹{fare})</span>
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </>
                      ) : (
                        <>
                          <Zap
                            size={16}
                            className="text-amber-400 fill-amber-400"
                          />
                          <span>Proceed to Pay ₹{fare}</span>
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </motion.button>

                    <div className="flex items-center justify-center gap-1.5 text-zinc-400 text-[11px] font-medium">
                      <ShieldCheck size={13} className="text-emerald-500" />
                      <span>100% verified & secure transaction</span>
                    </div>
                  </div>
                </motion.div>
              )}

              {status == "confirmed" && (
                <motion.div
                  key="confirmed"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.35 }}
                  className="p-6 sm:p-8 md:p-10 flex flex-col flex-1 items-center justify-center gap-6 text-center min-h-[380px] sm:min-h-[420px] lg:min-h-full"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 220, damping: 15 }}
                    className="w-20 h-20 rounded-full bg-emerald-50 border-2 border-emerald-200 text-emerald-600 flex items-center justify-center shadow-md shadow-emerald-500/10"
                  >
                    <CheckCircle size={38} />
                  </motion.div>

                  <div className="space-y-1.5 max-w-xs mx-auto">
                    <span className="text-[10px] font-black uppercase tracking-[0.18rem] text-emerald-600 bg-emerald-50 border border-emerald-200/80 px-3 py-1 rounded-full">
                      Booking Confirmed
                    </span>
                    <h3 className="text-2xl font-black text-zinc-900 tracking-tight pt-2">
                      Ride Confirmed!
                    </h3>
                    <p className="text-zinc-500 text-xs sm:text-sm font-medium leading-relaxed">
                      Your driver has been notified and is heading towards your
                      pickup location.
                    </p>
                  </div>

                  <div className="w-full max-w-xs bg-zinc-50 border border-zinc-100 rounded-2xl p-3.5 flex items-center justify-between text-left">
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Payment Method
                      </div>
                      <div className="text-xs font-bold text-zinc-900 capitalize">
                        {paymentMethod === "cash"
                          ? "Cash on Arrival"
                          : "Online Payment"}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                        Total Fare
                      </div>
                      <div className="text-xs font-black text-zinc-900">
                        ₹{fare}
                      </div>
                    </div>
                  </div>

                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => router.push("/user/book")}
                    className="w-full max-w-xs py-3.5 rounded-2xl bg-zinc-900 text-white font-bold text-xs flex items-center justify-center gap-2 hover:bg-black transition-colors cursor-pointer shadow-md shadow-zinc-900/10"
                  >
                    <span>Book Another Ride</span>
                    <ArrowRight size={14} />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>
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
