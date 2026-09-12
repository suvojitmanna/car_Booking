"use client";

import { AnimatePresence, motion } from "motion/react";
import dynamic from "next/dynamic";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bike,
  Car,
  CheckCircle,
  Loader2,
  LocateFixed,
  MapPin,
  Navigation,
  Phone,
  Truck,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { VehicleType } from "@/src/models/vehicle.model";
import axios from "axios";

const MapPickerModal = dynamic(
  () => import("@/src/components/MapPickerModal"),
  { ssr: false },
);

const stepVarients = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const VEHICLES = [
  { id: "bike", label: "Bike", Icon: Bike, desc: "Quick & affordable" },
  { id: "auto", label: "Auto", Icon: Car, desc: "Everyday rides" },
  { id: "car", label: "Car", Icon: Car, desc: "Comfort rides" },
  { id: "loading", label: "Loading", Icon: Truck, desc: "Small Cargo" },
  { id: "truck", label: "Truck", Icon: Truck, desc: "Heavy Transport" },
];

type place = {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
  countryCode?: string;
  lat: number;
  lon: number;
};

const Page = () => {
  const router = useRouter();
  const [vehicle, setVehicle] = useState<VehicleType>();
  const [mobile, setMobile] = useState("");
  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [locating, setLocating] = useState<boolean>(false);
  const [searchingPickup, setSearchingPickup] = useState(false);
  const [searchingDrop, setSearchingDrop] = useState(false);
  const [pickUpCountry, setPickUpCountry] = useState("");
  const [pickUpLon, setPickUpLon] = useState<number>();
  const [pickUpLat, setPickUpLat] = useState<number>();
  const [pickUpSuggestion, setPickUpSuggestion] = useState<place[]>([]);
  const [dropCountry, setDropCountry] = useState("");
  const [dropLon, setDropLon] = useState<number>();
  const [dropLat, setDropLat] = useState<number>();
  const [dropSuggestion, setDropSuggestion] = useState<place[]>([]);
  const [mapModalOpen, setMapModalOpen] = useState(false);

  const progress = [
    !!vehicle,
    !!(mobile.length === 10),
    !!pickup,
    !!drop,
  ].filter(Boolean).length;
  const canContinue = !!(
    vehicle &&
    mobile.length === 10 &&
    pickup &&
    drop &&
    pickUpLon &&
    pickUpLat &&
    dropLat &&
    dropLon
  );

  const useCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const { data } = await axios.get(
            `https://photon.komoot.io/reverse?lon=${longitude}&lat=${latitude}`,
          );
          const feature = data?.features?.[0];
          if (feature) {
            const p = feature.properties;
            const address = [p.name, p.street, p.city, p.state]
              .filter(Boolean)
              .join(", ");
            setPickup(address || p.name || "");
            setPickUpCountry(p.country || "");
            setPickUpLon(longitude);
            setPickUpLat(latitude);
            setPickUpSuggestion([]);
          }
        } catch (error) {
          console.log(error);
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
      },
    );
  };

  const searchAddress = async (
    q: string,
    setResult: (r: place[]) => void,
    setLoading: (l: boolean) => void,
    restricted?: string | "",
  ) => {
    if (!q || q.trim().length < 3) {
      setResult([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data } = await axios.get(
        `https://photon.komoot.io/api/?q=${encodeURIComponent(q.trim())}&limit=8&lang=en`,
      );
      let result: place[] = (data.features ?? []).map((f: any, idx: number) => {
        const p = f.properties;
        const coords = f.geometry?.coordinates;
        return {
          id: String(
            p.osm_id || p.id || `${coords?.[1]}-${coords?.[0]}-${idx}`,
          ),
          name: p.name || p.street || p.city || "Location",
          city: p.city,
          state: p.state,
          country: p.country,
          countryCode: p.countrycode || p.countryCode,
          lat: coords?.[1],
          lon: coords?.[0],
        };
      });
      if (restricted) {
        result = result.filter((p) => p.country === restricted);
      }
      setResult(result);
    } catch (error) {
      console.log(error);
      setResult([]);
    } finally {
      setLoading(false);
    }
  };

  const suggestion = (p: place) => {
    const parts = [p.name, p.city, p.state, p.country].filter(Boolean);
    return parts.filter((val, i, arr) => arr.indexOf(val) === i).join(", ");
  };

  return (
    <div className="min-h-screen bg-zinc-100 flex justify-center items-start sm:items-center px-4 py-8 sm:py-12 overflow-x-hidden overflow-y-auto hide-scrollbar">
      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md space-y-6 my-auto"
      >
        <div className="flex items-center gap-4 px-1">
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.1 }}
            onClick={() => router.push("/")}
            className="w-11 h-11 rounded-2xl bg-white border border-zinc-200 shadow-sm flex items-center justify-center hover:bg-zinc-50 transition-colors flex-shrink-0 cursor-pointer"
          >
            <ArrowLeft size={16} className="text-zinc-900" />
          </motion.button>
          <div className="flex-1 min-w-0">
            <div className="text-zinc-900 text-xl font-black tracking-tighter">
              Book a Ride
            </div>
            <h1 className="text-zinc-400 text-xs mt-0.5">
              Fill in the details below
            </h1>
          </div>

          <div className="flex items-center gap-1.5 flex-shrink-0">
            {[0, 1, 2, 3].map((d, i) => (
              <motion.div
                key={i}
                animate={{
                  width: i < progress ? 20 : 8,
                  background: i < progress ? "#09090b" : "#d4d4d8",
                }}
                transition={{ duration: 0.3 }}
                className="h-2 rounded-full"
              />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-zinc-200 shadow-[0_8px_40px_rgba(0,0,0,0.08)] overflow-visible">
          <div className="h-1 bg-zinc-900 w-full" />
          <div className="p-6 space-y-7">
            <motion.div
              variants={stepVarients}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-black">1</span>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Select Vehicle
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                {VEHICLES.map((v, i) => {
                  const Icon = v.Icon;
                  const active = vehicle === v.id;
                  return (
                    <motion.div
                      key={v.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.07 + i * 0.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setVehicle(v.id as VehicleType)}
                      className={`relative p-3.5 rounded-2xl border flex items-center gap-3 text-left transition-all duration-200 cursor-pointer ${
                        active
                          ? "bg-zinc-900 border-zinc-900 shadow-lg text-white"
                          : "bg-zinc-50 border-zinc-200 hover:border-zinc-400 text-zinc-900"
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                          active
                            ? "bg-white text-zinc-900"
                            : "bg-white border border-zinc-200 text-zinc-700"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-xs font-bold leading-tight ${
                            active ? "text-white" : "text-zinc-900"
                          }`}
                        >
                          {v.label}
                        </div>
                        <div
                          className={`text-[10px] truncate mt-0.5 ${
                            active ? "text-zinc-400" : "text-zinc-500"
                          }`}
                        >
                          {v.desc}
                        </div>
                      </div>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: active ? 1 : 0 }}
                        className="absolute top-2.5 right-2.5"
                      >
                        <CheckCircle
                          size={13}
                          className="text-white fill-white/20"
                        />
                      </motion.div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>

            <div className="h-px bg-zinc-200" />

            <motion.div
              variants={stepVarients}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-[9px] font-black">2</span>
                </div>
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                  Mobile Number
                </p>
              </div>

              <div className="flex items-center gap-3 bg-zinc-50 border border-zinc-200 rounded-2xl px-4 py-3 focus-within:border-zinc-900 focus-within:bg-white transition-all">
                <div className="w-8 h-8 rounded-xl bg-zinc-200 flex items-center justify-center">
                  <Phone size={18} className="text-zinc-800" />
                </div>
                <input
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                  placeholder="Enter your mobile number"
                  inputMode="numeric"
                  maxLength={10}
                  className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                />
                <AnimatePresence>
                  {mobile.length === 10 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <CheckCircle
                        size={16}
                        className="text-emerald-500 fill-emerald-50 flex-shrink-0"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <p className="text-zinc-400 text-[10px] mt-1.5 ml-1">
                Ride update will be sent to this number
              </p>
            </motion.div>

            <div className="h-px bg-zinc-200" />

            <motion.div
              variants={stepVarients}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.05 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-zinc-900 flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[9px] font-black">3</span>
                  </div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                    Route
                  </p>
                </div>

                <motion.button
                  type="button"
                  whileTap={{ scale: 0.94 }}
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setMapModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-900 text-white text-[11px] font-bold shadow-xs hover:bg-black transition-all cursor-pointer"
                >
                  <MapPin size={13} className="text-emerald-400" />
                  <span>Choose on Map</span>
                </motion.button>
              </div>

              <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-2 overflow-visible space-y-1">
                {/* Pickup Field */}
                <div className="relative z-30">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl focus-within:bg-white focus-within:shadow-sm focus-within:ring-1 focus-within:ring-zinc-200 transition-all">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-3 h-3 rounded-full bg-zinc-900 border-2 border-white shadow" />
                      <div className="w-px h-5 bg-zinc-300 mt-1" />
                    </div>
                    <input
                      type="text"
                      value={pickup}
                      onChange={(e) => {
                        setPickup(e.target.value);
                        searchAddress(
                          e.target.value,
                          setPickUpSuggestion,
                          setSearchingPickup,
                        );
                      }}
                      placeholder="Pickup Location"
                      className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none"
                    />

                    {searchingPickup ? (
                      <Loader2
                        size={15}
                        className="animate-spin text-zinc-400 flex-shrink-0"
                      />
                    ) : pickup ? (
                      <button
                        type="button"
                        onClick={() => {
                          setPickup("");
                          setPickUpSuggestion([]);
                        }}
                        className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-md transition cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        disabled={locating}
                        onClick={useCurrentLocation}
                        title="Use current location"
                        className="w-8 h-8 rounded-xl bg-zinc-200/80 hover:bg-zinc-300/80 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <LocateFixed
                          size={15}
                          className={`text-zinc-700 ${locating ? "animate-spin" : ""}`}
                        />
                      </motion.button>
                    )}
                  </div>

                  <AnimatePresence>
                    {pickUpSuggestion.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] max-h-56 overflow-y-auto z-50 p-1.5 hide-scrollbar divide-y divide-zinc-100"
                      >
                        <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          <span>Pickup Suggestions</span>
                          <span>{pickUpSuggestion.length} found</span>
                        </div>
                        {pickUpSuggestion.map((p, i) => (
                          <motion.div
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            key={p.id || i}
                            onClick={() => {
                              setPickup(suggestion(p));
                              setPickUpCountry(p.country ?? "");
                              setPickUpLat(p.lat);
                              setPickUpLon(p.lon);
                              setPickUpSuggestion([]);
                            }}
                            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left hover:bg-zinc-100/70 transition-all cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0 text-zinc-600 shadow-xs">
                              <MapPin size={15} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-zinc-900 group-hover:text-zinc-950 truncate">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-zinc-400 group-hover:text-zinc-500 font-medium truncate mt-0.5">
                                {[p.city, p.state, p.country]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            </div>
                            <ArrowUpRight
                              size={14}
                              className="text-zinc-300 group-hover:text-zinc-800 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                <div className="h-px bg-zinc-200 mx-2" />

                <div className="relative z-20">
                  <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl focus-within:bg-white focus-within:shadow-sm focus-within:ring-1 focus-within:ring-zinc-200 transition-all">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className="w-3 h-3 rounded-sm bg-zinc-900 border-2 border-white shadow" />
                    </div>
                    <input
                      type="text"
                      value={drop}
                      onChange={(e) => {
                        setDrop(e.target.value);
                        searchAddress(
                          e.target.value,
                          setDropSuggestion,
                          setSearchingDrop,
                          pickUpCountry,
                        );
                      }}
                      disabled={!pickUpCountry}
                      placeholder={
                        !pickUpCountry
                          ? "Select Pickup Location First"
                          : "Drop Location"
                      }
                      className="flex-1 bg-transparent text-sm font-semibold text-zinc-900 placeholder:text-zinc-400 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                    />

                    {searchingDrop ? (
                      <Loader2
                        size={15}
                        className="animate-spin text-zinc-400 flex-shrink-0"
                      />
                    ) : drop ? (
                      <button
                        type="button"
                        onClick={() => {
                          setDrop("");
                          setDropSuggestion([]);
                        }}
                        className="p-1 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 rounded-md transition cursor-pointer"
                      >
                        <X size={14} />
                      </button>
                    ) : (
                      <motion.button
                        type="button"
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setMapModalOpen(true)}
                        title="Choose on Map"
                        className="w-8 h-8 rounded-xl bg-zinc-200/80 hover:bg-zinc-300/80 transition-colors flex items-center justify-center flex-shrink-0 cursor-pointer"
                      >
                        <Navigation size={15} className="text-zinc-700" />
                      </motion.button>
                    )}
                  </div>

                  <AnimatePresence>
                    {dropSuggestion.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: -6, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -6, scale: 0.98 }}
                        transition={{ duration: 0.18, ease: "easeOut" }}
                        className="absolute left-0 right-0 top-full mt-2 bg-white/95 backdrop-blur-md border border-zinc-200/80 rounded-2xl shadow-[0_16px_40px_rgba(0,0,0,0.12)] max-h-56 overflow-y-auto z-50 p-1.5 hide-scrollbar divide-y divide-zinc-100"
                      >
                        <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                          <span>Drop Suggestions</span>
                          <span>{dropSuggestion.length} found</span>
                        </div>
                        {dropSuggestion.map((p, i) => (
                          <motion.div
                            initial={{ opacity: 0, x: -4 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.02 }}
                            key={p.id || i}
                            onClick={() => {
                              setDrop(suggestion(p));
                              setDropCountry(p.country ?? "");
                              setDropLat(p.lat);
                              setDropLon(p.lon);
                              setDropSuggestion([]);
                            }}
                            className="group flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left hover:bg-zinc-100/70 transition-all cursor-pointer"
                          >
                            <div className="w-8 h-8 rounded-xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white transition-colors flex items-center justify-center flex-shrink-0 text-zinc-600 shadow-xs">
                              <Navigation size={15} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-bold text-zinc-900 group-hover:text-zinc-950 truncate">
                                {p.name}
                              </div>
                              <div className="text-[11px] text-zinc-400 group-hover:text-zinc-500 font-medium truncate mt-0.5">
                                {[p.city, p.state, p.country]
                                  .filter(Boolean)
                                  .join(", ")}
                              </div>
                            </div>
                            <ArrowUpRight
                              size={14}
                              className="text-zinc-300 group-hover:text-zinc-800 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0"
                            />
                          </motion.div>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>

            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              disabled={!canContinue}
              onClick={() => {
                const params = new URLSearchParams({
                  pickup: pickup.trim(),
                  drop: drop.trim(),
                  vehicle: vehicle || "",
                  mobile: mobile.trim(),
                  pickupLat: String(pickUpLat ?? ""),
                  pickupLon: String(pickUpLon ?? ""),
                  dropLat: String(dropLat ?? ""),
                  dropLon: String(dropLon ?? ""),
                });
                router.push(`/user/search?${params.toString()}`);
              }}
              className="w-full py-4 rounded-2xl bg-zinc-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10 hover:bg-black transition-all disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
            >
              <span>Continue Booking</span>
              <ArrowRight size={16} />
            </motion.button>
          </div>
        </div>
      </motion.div>

      <MapPickerModal
        open={mapModalOpen}
        onClose={() => setMapModalOpen(false)}
        initialPickup={pickup}
        initialPickupLat={pickUpLat}
        initialPickupLon={pickUpLon}
        initialDrop={drop}
        initialDropLat={dropLat}
        initialDropLon={dropLon}
        onSelect={(res) => {
          setPickup(res.pickup);
          setPickUpLat(res.pickupLat);
          setPickUpLon(res.pickupLon);
          setPickUpCountry(res.pickupCountry || "India");

          if (res.drop) {
            setDrop(res.drop);
            setDropLat(res.dropLat);
            setDropLon(res.dropLon);
            setDropCountry(res.dropCountry || res.pickupCountry || "India");
          }
        }}
      />
    </div>
  );
};

export default Page;
