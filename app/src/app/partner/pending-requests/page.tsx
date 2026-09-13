"use client";

import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import axios from "axios";
import type { IBooking } from "@/src/models/booking.model";
import { Clock, IndianRupee, Loader2, MapPin, Navigation } from "lucide-react";

interface BookingItem extends Omit<IBooking, "_id"> {
  _id: string;
  pickupAddress?: string;
}

const page = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [bookings, setBookings] = useState<BookingItem[]>([]);

  const fetchPendingRequest = async () => {
    setLoading(true);
    try {
      const { data } = await axios.get("/api/partner/bookings/pending");
      console.log("Pending bookings response:", data);
      setBookings(data?.bookings || []);
      setError(false);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleAccepted = async (id: string) => {
    try {
      const { data } = await axios.get(`/api/partner/bookings/${id}/accept`);
      console.log("Booking accepted response:", data);
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (error: any) {
      console.error(
        "Accept error:",
        error?.response?.data?.message || error?.message,
      );
    }
  };

  const handleRejected = async (id: string) => {
    try {
      const { data } = await axios.get(`/api/partner/bookings/${id}/reject`);
      console.log("Booking rejected response:", data);
      setBookings((prev) => prev.filter((b) => b._id !== id));
    } catch (error: any) {
      console.error(
        "Reject error:",
        error?.response?.data?.message || error?.message,
      );
    }
  };

  useEffect(() => {
    fetchPendingRequest();
  }, []);

  return (
    <div className="min-h-screen bg-[#f4f5f7]">
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <h1 className="text-4xl font-semibold text-gray-900">Ride Request</h1>
          <p className="mt-3 text-gray-500 text-lg">
            Manage incoming ride request and respond in real time
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin w-8 h-8 text-gray-700" />
          </div>
        ) : bookings.length == 0 ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-16 text-center shadow-sm">
            <p className="text-gray-500 text-lg">No pending ride request</p>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b, i) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.25 }}
                className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm hover:shadow-md transition"
                key={b._id}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div className="flex-1 space-y-6">
                    <div className="flex gap-4">
                      <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-center flex-shrink-0">
                        <MapPin size={18} />
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-400 mb-1">
                          Pickup Location
                        </p>
                        <p className="text-gray-900 font-medium">
                          {b.pickUpAddress || b.pickupAddress}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Navigation size={18} />
                      </div>

                      <div>
                        <p className="text-xs uppercase text-gray-400 mb-1">
                          Drop Location
                        </p>
                        <p className="text-gray-900 font-medium">
                          {b.dropAddress}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                      <Clock size={14} className="opacity-70" />

                      <span className="font-medium">
                        {b?.createdAt
                          ? new Date(b.createdAt).toLocaleString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })
                          : "Date unavailable"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-between lg:items-end gap-6 w-full lg:w-auto">
                    <div className="text-left lg:text-right">
                      <p className="text-xs tracking-wide text-gray-400 uppercase mb-1">
                        Estimated fare
                      </p>
                      <p className="flex items-center gap-2 text-3xl font-bold text-gray-900 lg:justify-end">
                        <IndianRupee size={20} />
                        {b.fare}
                      </p>
                    </div>
                    <div className="flex gap-4 w-full lg:w-auto ">
                      <button
                        className="flex-1 lg:flex-none px-6 py-3 rounded-xl border border-gray-300 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-100 transition-all duration-200 active:scale-[0.98] disabled:opacity-50 cursor-pointer"
                        onClick={() => handleRejected(b._id)}
                      >
                        Reject
                      </button>
                      <button
                        className="px-10 py-3 rounded-xl bg-black text-white text-sm font-semibold shadow-md hover:bg-gray-900 hover:shadow-lg transition-all duration-200 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center cursor-pointer"
                        onClick={() => handleAccepted(b._id)}
                      >
                        Accept Ride
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default page;
