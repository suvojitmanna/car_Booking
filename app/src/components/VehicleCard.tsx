"use client";

import React from "react";
import Image from "next/image";
import {
  Bike,
  Car,
  Clock,
  Gauge,
  IndianRupee,
  Star,
  Tag,
  Truck,
  Zap,
} from "lucide-react";
import { IVehicle } from "@/src/models/vehicle.model";
import { motion } from "motion/react";

const TYPE_CONFIG: Record<
  string,
  { icon: React.ElementType; emoji: string; label: string; accent: string }
> = {
  bike: {
    icon: Bike,
    emoji: "🏍️",
    label: "Bike",
    accent: "from-amber-500/10 to-orange-500/5",
  },
  auto: {
    icon: Car,
    emoji: "🛺",
    label: "Auto",
    accent: "from-emerald-500/10 to-teal-500/5",
  },
  car: {
    icon: Car,
    emoji: "🚗",
    label: "Car",
    accent: "from-blue-500/10 to-indigo-500/5",
  },
  loading: {
    icon: Truck,
    emoji: "🚚",
    label: "Loading",
    accent: "from-purple-500/10 to-violet-500/5",
  },
  truck: {
    icon: Truck,
    emoji: "🚛",
    label: "Truck",
    accent: "from-rose-500/10 to-red-500/5",
  },
};

interface VehicleCardProps {
  vehicle: IVehicle;
  distance?: number;
  onBook?: (vehicle: IVehicle) => void;
  selected?: boolean;
}

const VehicleCard: React.FC<VehicleCardProps> = ({vehicle,distance,onBook,selected})=>{
  const config = TYPE_CONFIG[vehicle.type] || TYPE_CONFIG.car;
  const CategoryIcon = config.icon;
  const label = config.label;
  const owner: any = vehicle.owner;

  const baseFare = Number(vehicle.baseFare || 30);
  const pricePerKM = Number(vehicle.pricePerKM || 12);
  const totalKm = Number(distance && distance > 0 ? distance : 5);
  const calculatedFare = Math.round(baseFare + pricePerKM * totalKm);
  const estArrivalMins = Math.max(3, Math.round(totalKm * 1.5 + 2));

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -6 }}
      transition={{
        duration: 0.32,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`group relative bg-white rounded-3xl border overflow-hidden flex flex-col justify-between transition-all duration-300 cursor-default ${
        selected
          ? "border-zinc-900 ring-2 ring-zinc-900 shadow-xl"
          : "border-zinc-200/90 hover:border-zinc-400/80 shadow-[0_4px_24px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.12)]"
      }`}
    >
      <div className="relative h-48 bg-linear-to-b from-zinc-50 via-zinc-100/60 to-zinc-50 flex items-center justify-center overflow-hidden border-b border-zinc-100">
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />

        <div className="absolute w-36 h-36 bg-zinc-900/5 rounded-full blur-2xl -top-10 -right-10 pointer-events-none" />

        <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-1.5 bg-white/90 backdrop-blur-md border border-zinc-200/80 text-emerald-700 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Available Now</span>
        </div>

        <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1 bg-white/90 backdrop-blur-md border border-zinc-200/80 text-zinc-700 text-[10px] font-semibold px-2.5 py-1 rounded-full shadow-xs">
          <Clock size={11} className="text-zinc-400" />
          <span>~{estArrivalMins} mins</span>
        </div>

        {vehicle.imageUrl ? (
          <motion.img
            src={vehicle.imageUrl}
            alt={vehicle.vehicleModel}
            className="relative z-10 w-full h-36 object-contain p-2"
            style={{
              filter: "drop-shadow(0 10px 20px rgba(0,0,0,0.15))",
            }}
            whileHover={{
              scale: 1.07,
              filter: "drop-shadow(0 16px 28px rgba(0,0,0,0.22))",
            }}
            transition={{
              duration: 0.35,
              ease: "easeOut",
            }}
          />
        ) : (
          <div className="relative z-10 flex flex-col items-center justify-center">
            <div className="w-20 h-20 rounded-3xl bg-white border border-zinc-200/80 shadow-md flex items-center justify-center text-4xl select-none">
              <span>{config.emoji || "🚗"}</span>
            </div>
          </div>
        )}

        <div className="absolute bottom-3 left-3.5 z-20 flex items-center gap-1.5 bg-white/95 backdrop-blur-md border border-zinc-200 text-zinc-800 text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
          <Star size={10} className="fill-amber-400 text-amber-400" />
          <span>4.9</span>
          <span className="text-zinc-400 font-normal">• 120+ trips</span>
        </div>

        <div className="absolute bottom-3 right-3.5 z-20 flex items-center gap-1.5 bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
          <span className="text-xs leading-none">{config.emoji}</span>
          <span>{label}</span>
        </div>
      </div>

      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h3 className="text-base font-black text-zinc-900 tracking-tight leading-snug truncate">
              {vehicle.vehicleModel}
            </h3>
            <div className="mt-1.5 inline-flex items-center gap-1.5 bg-zinc-100/90 border border-zinc-200/90 px-2.5 py-0.5 rounded-md">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">
                IND
              </span>
              <span className="text-xs font-mono font-bold text-zinc-800 tracking-wider uppercase">
                {vehicle.number}
              </span>
            </div>
          </div>

          <div className="w-10 h-10 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center flex-shrink-0 text-zinc-700">
            <CategoryIcon size={18} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <div className="bg-zinc-50/80 border border-zinc-200/70 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              <Gauge size={12} className="text-zinc-400" />
              <span>Rate</span>
            </div>
            <div className="mt-1 flex items-baseline gap-0.5 text-zinc-900 font-black text-sm">
              <IndianRupee size={12} className="text-zinc-600" />
              <span>{pricePerKM}</span>
              <span className="text-[10px] font-semibold text-zinc-400 ml-0.5">
                / km
              </span>
            </div>
          </div>

          <div className="bg-zinc-50/80 border border-zinc-200/70 rounded-2xl p-3 flex flex-col justify-between">
            <div className="flex items-center gap-1.5 text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
              <Tag size={12} className="text-zinc-400" />
              <span>Waiting charge</span>
            </div>
            <div className="mt-1 flex items-baseline gap-0.5 text-zinc-900 font-black text-sm">
              <IndianRupee size={12} className="text-zinc-600" />
              <span>{vehicle.waitingCharge}</span>
              <span className="text-[10px] font-semibold text-zinc-400 ml-0.5">
                min
              </span>
            </div>
          </div>
        </div>

        <div className="pt-3.5 border-t border-zinc-100 flex items-center justify-between gap-3">
          <div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block leading-tight">
              Est. Total Fare
            </span>
            <div className="flex items-baseline gap-0.5 text-zinc-950 font-black text-xl leading-tight mt-0.5">
              <span>₹</span>
              <span>{calculatedFare}</span>
              <span className="text-[10px] font-normal text-zinc-400 ml-1">
                for {totalKm} km
              </span>
            </div>
          </div>

          <motion.button
            whileTap={{ scale: 0.94 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => onBook?.(vehicle)}
            className="px-4 py-2.5 rounded-2xl bg-zinc-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-zinc-900/10 hover:bg-black transition-all cursor-pointer"
          >
            <Zap size={13} className="text-amber-400 fill-amber-400" />
            <span>Book Ride</span>
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default VehicleCard;
