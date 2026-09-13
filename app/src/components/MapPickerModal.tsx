"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { AnimatePresence, motion } from "motion/react";
import L from "leaflet";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  useMapEvents,
} from "react-leaflet";
import {
  X,
  MapPin,
  Navigation,
  Search,
  LocateFixed,
  Clock,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Layers,
  AlertCircle,
} from "lucide-react";
import axios from "axios";
import FitBounds from "./FitBounds";
import {
  geoapifyReverseGeocode,
  geoapifyAutocomplete,
} from "@/src/lib/geoapify";

export type LocationPickerResult = {
  pickup: string;
  pickupLat: number;
  pickupLon: number;
  pickupCountry: string;
  drop: string;
  dropLat: number;
  dropLon: number;
  dropCountry: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
  initialPickup?: string;
  initialPickupLat?: number;
  initialPickupLon?: number;
  initialDrop?: string;
  initialDropLat?: number;
  initialDropLon?: number;
  onSelect: (result: LocationPickerResult) => void;
};

const createPickupIcon = () =>
  L.divIcon({
    className: "leaflet-custom-marker",
    html: `
      <div style="width: 36px; height: 36px; position: relative; display: flex; align-items: center; justify-content: center; cursor: grab;">
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(16, 185, 129, 0.35); transform: scale(1.2);"></div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #10b981; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; position: relative; z-index: 2;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

const createDropIcon = () =>
  L.divIcon({
    className: "leaflet-custom-marker",
    html: `
      <div style="width: 36px; height: 36px; position: relative; display: flex; align-items: center; justify-content: center; cursor: grab;">
        <div style="position: absolute; width: 36px; height: 36px; border-radius: 50%; background: rgba(239, 68, 68, 0.35); transform: scale(1.2);"></div>
        <div style="width: 28px; height: 28px; border-radius: 50%; background: #ef4444; border: 3px solid #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.35); display: flex; align-items: center; justify-content: center; position: relative; z-index: 2;">
          <div style="width: 8px; height: 8px; border-radius: 50%; background: #ffffff;"></div>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

function formatDuration(seconds: number): string {
  const totalMinutes = Math.round(seconds / 60);
  if (totalMinutes < 1) return "< 1 min";
  if (totalMinutes < 60) return `${totalMinutes} min`;
  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

function MapClickHandler({
  onMapClick,
}: {
  onMapClick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onMapClick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function MapCenterController({ center }: { center?: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    if (center && map) {
      map.setView(center, Math.max(map.getZoom(), 14), { animate: true });
    }
  }, [center, map]);
  return null;
}

const MapPickerModal = ({
  open,
  onClose,
  initialPickup = "",
  initialPickupLat,
  initialPickupLon,
  initialDrop = "",
  initialDropLat,
  initialDropLon,
  onSelect,
}: Props) => {
  const [activeTarget, setActiveTarget] = useState<"pickup" | "drop">("pickup");
  const [pickupAddr, setPickupAddr] = useState(initialPickup);
  const [pickupCountry, setPickupCountry] = useState("");
  const [p1, setP1] = useState<[number, number] | undefined>(
    initialPickupLat && initialPickupLon
      ? [initialPickupLat, initialPickupLon]
      : undefined,
  );

  const [dropAddr, setDropAddr] = useState(initialDrop);
  const [dropCountry, setDropCountry] = useState("");
  const [p2, setP2] = useState<[number, number] | undefined>(
    initialDropLat && initialDropLon
      ? [initialDropLat, initialDropLon]
      : undefined,
  );

  const [mapCenter, setMapCenter] = useState<[number, number] | undefined>(
    p1 || p2 || [22.5726, 88.3639],
  );

  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [distanceKm, setDistanceKm] = useState<number | null>(null);
  const [durationStr, setDurationStr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      if (initialPickupLat && initialPickupLon) {
        setP1([initialPickupLat, initialPickupLon]);
        setPickupAddr(initialPickup);
        setMapCenter([initialPickupLat, initialPickupLon]);
      } else {
        setP1(undefined);
        setPickupAddr("");
      }

      if (initialDropLat && initialDropLon) {
        setP2([initialDropLat, initialDropLon]);
        setDropAddr(initialDrop);
      } else {
        setP2(undefined);
        setDropAddr("");
      }

      if (!initialPickupLat && !initialDropLat) {
        setActiveTarget("pickup");
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const coords: [number, number] = [
                pos.coords.latitude,
                pos.coords.longitude,
              ];
              setMapCenter(coords);
            },
            () => {},
            { timeout: 5000 },
          );
        }
      }
    }
  }, [
    open,
    initialPickup,
    initialPickupLat,
    initialPickupLon,
    initialDrop,
    initialDropLat,
    initialDropLon,
  ]);

  const reverseGeocode = async (
    lat: number,
    lon: number,
  ): Promise<{ address: string; country: string }> => {
    return await geoapifyReverseGeocode(lat, lon);
  };

  const fetchRoute = useCallback(
    async (point1?: [number, number], point2?: [number, number]) => {
      if (!point1 || !point2) {
        setRouteCoords([]);
        setDistanceKm(null);
        setDurationStr(null);
        return;
      }

      try {
        const url = `https://router.project-osrm.org/route/v1/driving/${point1[1]},${point1[0]};${point2[1]},${point2[0]}?overview=full&geometries=geojson`;
        const res = await axios.get(url);

        if (res.data?.routes?.length > 0) {
          const route = res.data.routes[0];
          const coords: [number, number][] = route.geometry.coordinates.map(
            ([lon, lat]: [number, number]) => [lat, lon],
          );
          setRouteCoords(coords);
          const drivingKm = Number((route.distance / 1000).toFixed(1));
          const drivingDuration = formatDuration(route.duration);
          setDistanceKm(drivingKm);
          setDurationStr(drivingDuration);
        } else {
          setRouteCoords([point1, point2]);
          const fallbackKm = calculateDistance(
            point1[0],
            point1[1],
            point2[0],
            point2[1],
          );
          const estMins = Math.round((fallbackKm / 30) * 60);
          setDistanceKm(fallbackKm);
          setDurationStr(formatDuration(estMins * 60));
        }
      } catch {
        setRouteCoords([point1, point2]);
        const fallbackKm = calculateDistance(
          point1[0],
          point1[1],
          point2[0],
          point2[1],
        );
        const estMins = Math.round((fallbackKm / 30) * 60);
        setDistanceKm(fallbackKm);
        setDurationStr(formatDuration(estMins * 60));
      }
    },
    [],
  );

  useEffect(() => {
    if (p1 && p2) {
      fetchRoute(p1, p2);
    } else {
      setRouteCoords([]);
      setDistanceKm(null);
      setDurationStr(null);
    }
  }, [p1, p2, fetchRoute]);

  const handleMapClick = async (lat: number, lng: number) => {
    const coords: [number, number] = [lat, lng];
    if (activeTarget === "pickup") {
      setP1(coords);
      const res = await reverseGeocode(lat, lng);
      setPickupAddr(res.address);
      setPickupCountry(res.country);
      if (!p2) {
        setActiveTarget("drop");
      }
    } else {
      setP2(coords);
      const res = await reverseGeocode(lat, lng);
      setDropAddr(res.address);
      setDropCountry(res.country);
    }
  };

  const pickupEventHandlers = useMemo(
    () => ({
      async dragend(e: any) {
        const marker = e.target;
        const pos = marker.getLatLng();
        const coords: [number, number] = [pos.lat, pos.lng];
        setP1(coords);
        const res = await reverseGeocode(pos.lat, pos.lng);
        setPickupAddr(res.address);
        setPickupCountry(res.country);
      },
    }),
    [],
  );

  const dropEventHandlers = useMemo(
    () => ({
      async dragend(e: any) {
        const marker = e.target;
        const pos = marker.getLatLng();
        const coords: [number, number] = [pos.lat, pos.lng];
        setP2(coords);
        const res = await reverseGeocode(pos.lat, pos.lng);
        setDropAddr(res.address);
        setDropCountry(res.country);
      },
    }),
    [],
  );

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }
    setIsSearching(true);
    try {
      const features = await geoapifyAutocomplete(query.trim(), 6);
      setSuggestions(features || []);
    } catch {
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSuggestion = async (feature: any) => {
    const [lon, lat] = feature.geometry.coordinates;
    const p = feature.properties;
    const address =
      p.formatted ||
      [p.name, p.street, p.city, p.state, p.country]
        .filter(Boolean)
        .filter((v: any, i: any, a: any) => a.indexOf(v) === i)
        .join(", ");
    const coords: [number, number] = [lat, lon];

    setMapCenter(coords);
    setSearchQuery("");
    setSuggestions([]);

    if (activeTarget === "pickup") {
      setP1(coords);
      setPickupAddr(
        address || p.name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`,
      );
      setPickupCountry(p.country || "");
      if (!p2) setActiveTarget("drop");
    } else {
      setP2(coords);
      setDropAddr(address || p.name || `${lat.toFixed(5)}, ${lon.toFixed(5)}`);
      setDropCountry(p.country || "");
    }
  };

  const handleCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coords: [number, number] = [latitude, longitude];
        setMapCenter(coords);
        if (activeTarget === "pickup") {
          setP1(coords);
          const res = await reverseGeocode(latitude, longitude);
          setPickupAddr(res.address);
          setPickupCountry(res.country);
          if (!p2) setActiveTarget("drop");
        } else {
          setP2(coords);
          const res = await reverseGeocode(latitude, longitude);
          setDropAddr(res.address);
          setDropCountry(res.country);
        }
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  const isBothSelected = !!(p1 && p2);

  const handleConfirm = () => {
    if (!p1 || !p2) return;
    onSelect({
      pickup: pickupAddr || `${p1[0].toFixed(5)}, ${p1[1].toFixed(5)}`,
      pickupLat: p1[0],
      pickupLon: p1[1],
      pickupCountry: pickupCountry,
      drop: dropAddr || `${p2[0].toFixed(5)}, ${p2[1].toFixed(5)}`,
      dropLat: p2[0],
      dropLon: p2[1],
      dropCountry: dropCountry || pickupCountry,
    });
    onClose();
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 20 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full h-full sm:h-[90vh] sm:max-w-4xl bg-white sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-zinc-200"
        >
          <div className="relative z-30 bg-white/95 backdrop-blur-md px-4 py-3 border-b border-zinc-200 flex flex-wrap items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
                <Layers size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900 leading-tight">
                  Interactive Route Map
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Select both Pickup and Drop locations on the map
                </p>
              </div>
            </div>

            <div className="flex items-center bg-zinc-100 p-1 rounded-xl border border-zinc-200">
              <button
                type="button"
                onClick={() => setActiveTarget("pickup")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTarget === "pickup"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white" />
                <span>1. Pickup Pin {p1 ? "✓" : ""}</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTarget("drop")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  activeTarget === "drop"
                    ? "bg-red-600 text-white shadow-xs"
                    : "text-zinc-600 hover:text-zinc-900"
                }`}
              >
                <div className="w-2 h-2 rounded-full bg-white" />
                <span>2. Drop Pin {p2 ? "✓" : ""}</span>
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X size={16} />
            </button>
          </div>

          <div className="relative flex-1 w-full bg-zinc-100 min-h-[350px]">
            <div className="absolute top-3 left-3 right-3 sm:left-4 sm:w-80 z-[1000]">
              <div className="relative">
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-zinc-200 shadow-lg shadow-black/5">
                  <Search size={15} className="text-zinc-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder={`Search address for ${activeTarget === "pickup" ? "Pickup" : "Drop"}...`}
                    className="w-full text-xs font-semibold bg-transparent outline-none text-zinc-900 placeholder:text-zinc-400"
                  />
                  {isSearching && (
                    <Loader2
                      size={14}
                      className="animate-spin text-zinc-400 shrink-0"
                    />
                  )}
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setSuggestions([]);
                      }}
                      className="p-1 text-zinc-400 hover:text-zinc-600"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>

                {suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-full mt-1.5 bg-white/95 backdrop-blur-md rounded-2xl border border-zinc-200 shadow-xl max-h-52 overflow-y-auto divide-y divide-zinc-100 p-1">
                    {suggestions.map((item, idx) => (
                      <div
                        key={idx}
                        onClick={() => handleSelectSuggestion(item)}
                        className="px-3 py-2 text-xs hover:bg-zinc-100 rounded-xl cursor-pointer flex items-center gap-2 transition"
                      >
                        <MapPin size={13} className="text-zinc-400 shrink-0" />
                        <div className="min-w-0 flex-1 truncate">
                          <span className="font-bold text-zinc-900 block truncate">
                            {item.properties.name}
                          </span>
                          <span className="text-[10px] text-zinc-500 block truncate">
                            {[
                              item.properties.city,
                              item.properties.state,
                              item.properties.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleCurrentLocation}
              title="Use Current Location"
              className="absolute top-3 right-3 sm:right-4 z-[1000] w-10 h-10 rounded-2xl bg-white/95 backdrop-blur-md border border-zinc-200 shadow-lg text-zinc-800 flex items-center justify-center hover:bg-zinc-100 transition cursor-pointer"
            >
              <LocateFixed
                size={18}
                className={
                  isLocating ? "animate-spin text-emerald-600" : "text-zinc-800"
                }
              />
            </button>

            {distanceKm !== null && durationStr !== null && (
              <div className="absolute top-16 left-3 sm:left-4 z-[1000] bg-white/95 backdrop-blur-md border border-zinc-200 shadow-lg rounded-2xl px-3 py-2 flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <Navigation size={13} className="text-zinc-900" />
                  <span className="text-xs font-extrabold text-zinc-900">
                    {distanceKm} km
                  </span>
                </div>
                <div className="h-4 w-px bg-zinc-200" />
                <div className="flex items-center gap-1.5 text-emerald-600">
                  <Clock size={13} />
                  <span className="text-xs font-bold">{durationStr}</span>
                </div>
              </div>
            )}

            <MapContainer
              style={{ width: "100%", height: "100%" }}
              center={mapCenter || [22.5726, 88.3639]}
              zoom={13}
              scrollWheelZoom={true}
              zoomControl={false}
              attributionControl={false}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              <MapClickHandler onMapClick={handleMapClick} />
              <MapCenterController center={mapCenter} />

              {routeCoords.length > 0 && (
                <>
                  <Polyline
                    positions={routeCoords}
                    color="#0f172a"
                    weight={6}
                    opacity={0.7}
                    lineCap="round"
                    lineJoin="round"
                  />
                  <Polyline
                    positions={routeCoords}
                    color="#2563eb"
                    weight={4}
                    opacity={0.95}
                    lineCap="round"
                    lineJoin="round"
                  />
                </>
              )}

              {p1 && (
                <Marker
                  position={p1}
                  icon={createPickupIcon()}
                  draggable={true}
                  eventHandlers={pickupEventHandlers}
                >
                  <Popup>
                    <div className="text-xs font-bold text-zinc-900">
                      <span className="text-emerald-600">Pickup:</span>{" "}
                      {pickupAddr}
                    </div>
                  </Popup>
                </Marker>
              )}

              {p2 && (
                <Marker
                  position={p2}
                  icon={createDropIcon()}
                  draggable={true}
                  eventHandlers={dropEventHandlers}
                >
                  <Popup>
                    <div className="text-xs font-bold text-zinc-900">
                      <span className="text-red-600">Drop:</span> {dropAddr}
                    </div>
                  </Popup>
                </Marker>
              )}

              {p1 && p2 && <FitBounds p1={p1} p2={p2} />}
            </MapContainer>
          </div>

          <div className="relative z-30 bg-white border-t border-zinc-200 p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div
                onClick={() => setActiveTarget("pickup")}
                className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-start gap-2.5 ${
                  activeTarget === "pickup"
                    ? "bg-emerald-50/70 border-emerald-300 ring-1 ring-emerald-300"
                    : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg ${p1 ? "bg-emerald-500" : "bg-zinc-300"} text-white flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <MapPin size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Pickup Location {p1 ? "✓" : "(Not selected)"}
                    </span>
                    {activeTarget === "pickup" && (
                      <span className="text-[9px] bg-emerald-200/60 text-emerald-800 px-1.5 py-0.5 rounded font-bold">
                        Editing
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-zinc-900 truncate mt-0.5">
                    {pickupAddr || "Click on map to choose pickup"}
                  </p>
                </div>
              </div>

              <div
                onClick={() => setActiveTarget("drop")}
                className={`p-2.5 rounded-2xl border transition cursor-pointer flex items-start gap-2.5 ${
                  activeTarget === "drop"
                    ? "bg-red-50/70 border-red-300 ring-1 ring-red-300"
                    : "bg-zinc-50 border-zinc-200 hover:border-zinc-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-lg ${p2 ? "bg-red-500" : "bg-zinc-300"} text-white flex items-center justify-center shrink-0 mt-0.5`}
                >
                  <Navigation size={13} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-red-700">
                      Drop Location {p2 ? "✓" : "(Not selected)"}
                    </span>
                    {activeTarget === "drop" && (
                      <span className="text-[9px] bg-red-200/60 text-red-800 px-1.5 py-0.5 rounded font-bold">
                        Editing
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-zinc-900 truncate mt-0.5">
                    {dropAddr || "Click on map to choose drop"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-3 rounded-2xl border border-zinc-200 text-xs font-bold text-zinc-700 hover:bg-zinc-100 transition cursor-pointer"
              >
                Cancel
              </button>

              {!isBothSelected ? (
                <div className="flex-1 py-3 px-4 rounded-2xl bg-zinc-100 border border-zinc-200 text-zinc-500 text-xs font-bold flex items-center justify-center gap-2 select-none">
                  <AlertCircle
                    size={15}
                    className={!p1 ? "text-emerald-500" : "text-red-500"}
                  />
                  <span>
                    {!p1
                      ? "Please select Pickup Location on map"
                      : "Please select Drop Destination on map"}
                  </span>
                </div>
              ) : (
                <motion.button
                  type="button"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleConfirm}
                  className="flex-1 py-3 rounded-2xl bg-zinc-900 hover:bg-black text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-zinc-900/10 transition cursor-pointer"
                >
                  <CheckCircle2 size={15} className="text-emerald-400" />
                  <span>Confirm & Apply Location</span>
                  <ArrowRight size={14} />
                </motion.button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default MapPickerModal;
