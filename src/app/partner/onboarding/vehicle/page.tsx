"use client";
import axios from "axios";
import {
  ArrowLeft,
  Bike,
  Car,
  CircleDashed,
  Package,
  Truck,
} from "lucide-react";
import { motion } from "motion/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/src/redux/store";
import { setUserData } from "@/src/redux/userSlice";

const Page = () => {
  const VEHICLES = [
    { id: "bike", label: "Bike", icon: Bike, desc: "2 wheeler" },
    { id: "auto", label: "Auto", icon: Car, desc: "3 wheeler ride" },
    { id: "car", label: "Car", icon: Car, desc: "4 wheeler ride" },
    { id: "loading", label: "Loading", icon: Package, desc: "Small goods" },
    { id: "truck", label: "Truck", icon: Truck, desc: "Heavy transport" },
  ];

  const router = useRouter();
  const dispatch = useDispatch();
  const { userData } = useSelector((state: RootState) => state.user);

  const [vehicleType, setVehicleType] = useState("");
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const VEHICLE_REGEX = /^[A-Z]{2}[0-9]{1,2}[A-Z]{0,2}[0-9]{4}$/;

  const handleVehicle = async () => {
    setError("");

    const number = vehicleNumber.trim().toUpperCase();
    if (!VEHICLE_REGEX.test(number)) {
      setError("Invalid vehicle number");
      return;
    }

    if (!vehicleType) {
      setError("Please select a vehicle type");
      return;
    }

    if (!vehicleModel.trim()) {
      setError("Please enter vehicle model");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post("/api/partner/onboarding/vehicle", {
        type: vehicleType,
        number,
        vehicleModel: vehicleModel.trim(),
      });
      setLoading(false);

      if (data?.user) {
        dispatch(setUserData(data.user));
      }

      const steps =
        data?.user?.partnerOnBoardingSteps ??
        userData?.partnerOnBoardingSteps ??
        0;

      if (steps === 3) {
        router.push("/");
      } else {
        router.push("/partner/onboarding/documents");
      }
    } catch (error: any) {
      setError(error?.response?.data?.message || "Something went wrong");
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleGetVehicle = async () => {
      try {
        const { data } = await axios.get("/api/partner/onboarding/vehicle");
        if (data?.vehicle) {
          setVehicleType(data.vehicle.type || "");
          setVehicleNumber(data.vehicle.number || "");
          setVehicleModel(data.vehicle.vehicleModel || "");
        }
      } catch (error) {
        console.log(error);
      }
    };
    handleGetVehicle();
  }, []);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-xl bg-white rounded-3xl border border-gray-200 shadow-[0_25px_70px_rgba(0,0,0,0.15)] p-6 sm:p-8"
      >
        <div className="relative text-center">
          <button
            type="button"
            className="absolute left-0 top-0 w-9 h-9 rounded-full border border-gray-300 flex items-center justify-center hover:bg-gray-100 transition cursor-pointer"
            onClick={() => router.back()}
          >
            <ArrowLeft size={18} />
          </button>

          <p className="text-xs text-gray-500 font-medium">Step 1 of 3</p>

          <h1 className="text-2xl font-bold mt-1">Vehicle Details</h1>

          <p className="text-sm text-gray-500 mt-2">
            Add your vehicle information
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <div>
            <p className="text-xs font-semibold text-gray-500 mb-3">
              Vehicle Type
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {VEHICLES.map((v, i) => {
                const Icon = v.icon;
                const active = vehicleType == v.id;
                return (
                  <motion.div
                    key={v.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setVehicleType(v.id)}
                    className={`rounded-2xl border p-4 flex flex-col items-center gap-2 transition ${active ? "bg-black text-white border-black" : "border-gray-200 hover:border-black cursor-pointer"}`}
                  >
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center ${active ? "bg-white text-black" : "bg-black text-white"}`}
                    >
                      <Icon />
                    </div>
                    <div className="text-sm font-semibold">{v.label}</div>
                    <p
                      className={`text-xs capitalize ${active ? "text-gray-300" : "text-gray-500"}`}
                    >
                      {v.desc}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="vn" className="text-xs font-semibold text-gray-500">
            Vehicle Number
          </label>
          <input
            type="text"
            onChange={(e) =>
              setVehicleNumber(e.target.value.toLocaleUpperCase())
            }
            value={vehicleNumber || ""}
            placeholder="MH12AB1234"
            id="vn"
            className="mt-2 w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition"
          />
        </div>
        <div>
          <label htmlFor="vm" className="text-xs font-semibold text-gray-500">
            Vehicle model
          </label>
          <input
            type="text"
            onChange={(e) => setVehicleModel(e.target.value)}
            value={vehicleModel || ""}
            placeholder="Tata Ace"
            id="vm"
            className="mt-2 w-full border-b border-gray-300 pb-2 text-sm focus:outline-none focus:border-black transition"
          />
        </div>
        {error && (
          <p className="mt-1 text-red-500 text-sm font-sans">***{error} !!!</p>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          disabled={
            loading ||
            !vehicleType ||
            !vehicleNumber.trim() ||
            !vehicleModel.trim()
          }
          className="mt-4 w-full h-14 rounded-2xl bg-black text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-40 transition disabled:cursor-not-allowed cursor-pointer"
          onClick={handleVehicle}
        >
          {loading ? (
            <>
              Submitting...
              <CircleDashed className="text-white animate-spin" />
            </>
          ) : (userData?.partnerOnBoardingSteps ?? 0) === 3 ? (
            "Update & Back to Review"
          ) : (
            "Continue"
          )}
        </motion.button>
      </motion.div>
    </div>
  );
};

export default Page;
