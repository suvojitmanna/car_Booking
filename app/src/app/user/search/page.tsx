"use client";

import dynamic from "next/dynamic";
import {
  ArrowLeft,
  Loader2,
  Navigation,
  MapPin,
  Bike,
  Car,
  Truck,
  Zap,
  ArrowUpRight,
  Search,
  RefreshCw,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useState, Suspense, useEffect } from "react";
import axios from "axios";
import { IVehicle, VehicleType } from "@/src/models/vehicle.model";
import VehicleCard from "@/src/components/VehicleCard";

const SearchMap = dynamic(() => import("@/src/components/SearchMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full bg-zinc-200 animate-pulse flex items-center justify-center text-zinc-400 gap-2 text-sm font-medium">
      <Loader2 className="animate-spin" size={18} />
      <span>Loading Map...</span>
    </div>
  ),
});

const VEHICLE_meta: any = {
  bike: { label: "Bike", Icon: Bike, emoji: "🏍️" },
  auto: { label: "Auto", Icon: Car, emoji: "🛺" },
  car: { label: "Car", Icon: Car, emoji: "🚗" },
  loading: { label: "Loading", Icon: Truck, emoji: "🚚" },
  truck: { label: "Truck", Icon: Truck, emoji: "🚛" },
};

const SearchContent = () => {
  const router = useRouter();
  const params = useSearchParams();

  const getParam = (key: string): string => {
    if (!params) return "";
    const exact = params.get(key);
    if (exact !== null) return exact.trim();

    const lower = params.get(key.toLowerCase());
    if (lower !== null) return lower.trim();

    for (const [k, v] of params.entries()) {
      if (k.trim().toLowerCase() === key.toLowerCase()) {
        return v.trim();
      }
    }
    return "";
  };

  const [pickUp, setPickup] = useState(getParam("pickup"));
  const [drop, setDrop] = useState(getParam("drop"));
  const mobile = getParam("mobile");
  const pickupLat = Number(getParam("pickupLat") || getParam("pickuplat") || 0);
  const pickupLon = Number(getParam("pickupLon") || getParam("pickuplon") || 0);
  const dropLat = Number(getParam("dropLat") || getParam("droplat") || 0);
  const dropLon = Number(getParam("dropLon") || getParam("droplon") || 0);
  const vehicle = getParam("vehicle");
  const [km, setKm] = useState<number>(0);
  const [time, setTime] = useState<string>();
  const [vehicleData, setVehicleData] = useState<IVehicle[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const meta = VEHICLE_meta[vehicle];

  const getNearByVehicles = async (
    latitude: number,
    longitude: number,
    vehicleType: string,
  ) => {
    try {
      setLoading(true);
      const { data } = await axios.post("/api/vehicles/near-by", {
        latitude,
        longitude,
        vehicleType,
      });
      console.log("Nearby vehicles response:", data);
      const vehiclesList = Array.isArray(data) ? data : data?.vehicle || [];
      setVehicleData(vehiclesList);
    } catch (error) {
      console.error("Get nearby vehicles error:", error);
      setVehicleData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pickupLat && pickupLon && vehicle) {
      getNearByVehicles(pickupLat, pickupLon, vehicle);
    }
  }, [pickupLat, pickupLon, vehicle]);

  return (
    <div className="min-h-screen bg-zinc-100 text-zinc-900 overflow-x-hidden flex flex-col">
      <div className="absolute top-5 left-5 z-50">
        <motion.button
          whileTap={{ scale: 0.88 }}
          onClick={() => router.back()}
          className="w-11 h-11 rounded-full bg-white border border-zinc-200 shadow-md flex items-center justify-center hover:bg-zinc-50 transition-colors cursor-pointer"
        >
          <ArrowLeft size={17} className="text-zinc-900" />
        </motion.button>
      </div>

      <div className="relative w-full h-[54vh] z-0">
        <SearchMap
          pickUp={pickUp}
          drop={drop}
          pickupLat={pickupLat}
          pickupLon={pickupLon}
          dropLat={dropLat}
          dropLon={dropLon}
          vehicles={vehicleData}
          onChange={(p, d) => {
            setPickup(p);
            setDrop(d);
          }}
          onDistance={setKm}
          onDuration={setTime}
        />
      </div>

      <div className="flex-1 p-4 mt-3 max-w-5xl w-full mx-auto -mt-4 relative z-10 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-200 rounded-3xl p-5 border border-zinc-200/90 shadow-zinc-900/5 space-y-4"
        >
          <div className="relative pl-6 space-y-4">
            <div className="absolute left-[7px] top-[14px] bottom-[14px] w-[2px] border-l-2 border-dashed border-zinc-300" />

            <div className="relative">
              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-white shadow-sm flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                  Pickup Location
                </span>
                <div className="flex items-center gap-1">
                  <MapPin size={12} className="text-emerald-600" />
                  <span className="text-[10px] text-emerald-600">
                    Drag green pin
                  </span>
                </div>
              </div>
              <p className="text-sm font-bold text-zinc-900 mt-1 leading-snug break-words">
                {pickUp || "Locating pickup point..."}
              </p>
            </div>

            <div className="relative">
              <div className="absolute -left-6 top-1 w-3.5 h-3.5 rounded-full bg-red-500 border-2 border-white shadow-sm flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-white" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                  Drop Destination
                </span>
                <div className="flex items-center gap-1">
                  <Navigation size={12} className="text-red-600" />
                  <span className="text-[10px] text-red-600">Drag red pin</span>
                </div>
              </div>
              <p className="text-sm font-bold text-zinc-900 mt-1 leading-snug break-words">
                {drop || "Locating drop point..."}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex items-center justify-between mb-2"
        >
          <div>
            <h2 className="text-zinc-900 text-lg font-black tracking-tight">
              {loading
                ? "Finding Vehicles..."
                : vehicleData.length > 0
                  ? "Available Vehicles"
                  : "No Vehicles Available"}
            </h2>
            {meta && (
              <div className="text-zinc-500 text-xs mt-0.5 flex items-center gap-1.5 font-medium">
                <span>{meta.emoji}</span>
                <span>{meta.label} drivers near your pickup location</span>
              </div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="searching"
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="flex items-center gap-2 text-sm bg-zinc-100 border border-zinc-200 px-3 py-2 rounded-full"
              >
                <Loader2 size={14} className="animate-spin text-zinc-600" />
                <span className="text-zinc-500 text-xs font-semibold">
                  Searching...
                </span>
              </motion.div>
            ) : vehicleData.length > 0 ? (
              <motion.div
                key="live"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full"
              >
                <Zap size={14} className="text-emerald-600" />
                <span className="text-emerald-700 text-xs font-bold uppercase tracking-wider">
                  Live Tracking
                </span>
                <ArrowUpRight size={14} className="text-emerald-600" />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.div>

        <AnimatePresence>
          {!loading && vehicleData.length === 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-12 text-center rounded-3xl p-8 shadow-xs"
            >
              <div className="w-16 h-16 rounded-full bg-zinc-100 border border-zinc-200 flex items-center justify-center mb-3">
                <Search size={24} className="text-zinc-400" />
              </div>
              <h3 className="text-zinc-900 font-bold text-sm">
                No {meta?.label || "Vehicle"}s Available Nearby
              </h3>
              <p className="text-zinc-500 text-xs max-w-xs mt-1 leading-relaxed">
                No {meta?.label?.toLowerCase() || "vehicle"} drivers are active
                near your pickup location right now. Please try again in a few
                moments.
              </p>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => getNearByVehicles(pickupLat, pickupLon, vehicle)}
                className="mt-5 flex items-center gap-2 bg-zinc-900 text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <RefreshCw size={14} />
                <span>Try Again</span>
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {vehicleData.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {vehicleData.map((v, i) => (
              <motion.div
                key={v._id?.toString() || i}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: i * 0.06,
                  duration: 0.38,
                  ease: [0.22, 1, 0.36, 1],
                }}
              >
                <VehicleCard
                  vehicle={v}
                  distance={km}
                  onBook={() => {
                    const driverId =
                      typeof v.owner === "object" && v.owner !== null
                        ? (v.owner as any)._id?.toString() || ""
                        : String(v.owner || "");

                    const baseFare = Number(v.baseFare || 30);
                    const pricePerKM = Number(v.pricePerKM || 12);
                    const totalKm = Number(km && km > 0 ? km : 5);
                    const totalFare = Math.round(
                      baseFare + pricePerKM * totalKm,
                    );

                    const url = new URLSearchParams({
                      pickup: pickUp || "",
                      drop: drop || "",
                      driverId: driverId,
                      vehicle: v.type || "",
                      fare: String(totalFare),
                      pickuplat: String(pickupLat || ""),
                      pickuplon: String(pickupLon || ""),
                      dropLat: String(dropLat || ""),
                      dropLon: String(dropLon || ""),
                      mobile: String(mobile || ""),
                      model: v.vehicleModel || "",
                    });
                    router.push(`/user/checkout?${url.toString()}`);
                  }}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Page = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-zinc-100">
          <Loader2 className="animate-spin text-zinc-500" size={28} />
        </div>
      }
    >
      <SearchContent />
    </Suspense>
  );
};

export default Page;
